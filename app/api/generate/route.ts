import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import Anthropic from "@anthropic-ai/sdk";
import { getGenerationConfig } from "@/lib/generation-config";
import { findHeroImage } from "@/lib/openverse";
import { isReadOnlyHosting } from "@/lib/env";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const CONTENT_DIR = path.join(process.cwd(), "content", "articles");
const TOPICS_LOG_PATH = path.join(process.cwd(), "content", "topics-log.json");

type TopicEntry = {
  date: string;
  type: "A" | "B";
  slug: string;
  title: string;
  key_topics: string[];
};

type TopicsLog = { entries: TopicEntry[] };

type ArticlePayload = {
  title: string;
  hook: string;
  tags: string[];
  scores: { pasivita: number; navratnost: number; realisticnost: number };
  trend: string;
  key_topics: string[];
  body_mdx: string;
  image_query?: string;
};

type GenerationResult = { type_a: ArticlePayload; type_b: ArticlePayload };

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function readTopicsLog(): TopicsLog {
  try {
    const raw = fs.readFileSync(TOPICS_LOG_PATH, "utf8");
    const parsed = JSON.parse(raw);
    return { entries: Array.isArray(parsed.entries) ? parsed.entries : [] };
  } catch {
    return { entries: [] };
  }
}

function writeTopicsLog(data: TopicsLog) {
  fs.writeFileSync(TOPICS_LOG_PATH, JSON.stringify(data, null, 2));
}

function recentTopicsSummary(log: TopicsLog): string {
  if (log.entries.length === 0) return "(žádné předchozí články)";
  const sorted = [...log.entries].sort((a, b) => (a.date < b.date ? 1 : -1));
  return sorted
    .slice(0, 30)
    .map(
      (e) =>
        `- ${e.date.slice(0, 10)} [${e.type}] ${e.title} — klíčová témata: ${(e.key_topics ?? []).join(", ")}`
    )
    .join("\n");
}

function buildSystemPrompt(): string {
  const cfg = getGenerationConfig();
  const maxInvestmentMil = cfg.limits.maxEntryInvestmentCzk / 1_000_000;
  return `Jsi business strateg, vizionář a copywriter. Píšeš česky, tykáš, věcný tón.

Tvým úkolem je najít DVĚ nové business příležitosti — jednu na míru profilu (TYP A) a jednu volnou trendovou (TYP B).

ZADÁNÍ A SPOLEČNÉ PODMÍNKY:
${cfg.commonInstructions}

TVRDÉ LIMITY:
- Vstupní investice ≤ ${maxInvestmentMil} mil. Kč
- Pasivní příjem NEBO aktivní práce s hodinovou sazbou ≥ ${cfg.limits.minHourlyRateCzk.toLocaleString("cs-CZ")} Kč
- Návratnost ideálně do ${cfg.limits.maxPaybackYears} let

TYP A — na míru profilu:
${cfg.typeAInstructions}

TYP B — volné téma:
${cfg.typeBInstructions}

PRAVIDLA OBSAHU:
- Žádné generické rady. Vždy konkrétní čísla, regiony, jména platforem, konkrétní kroky.
- "Proč teď" musí obsahovat konkrétní signál (regulace, trend, statistika, datum).
- Skóre 1–10 buď upřímný — ne všechno je 9/9/9. Pasivita 9 znamená skoro pasivní příjem.
- 4–6 tagů, malá písmena, krátké (jedno slovo nebo krátká fráze).
- image_query = 2–4 anglická vizuální klíčová slova pro ilustrační fotku (použijí se k vyhledání na Openverse).
- Hook = dva řádky úderného popisku, max 200 znaků, ať z toho čtenář pozná podstatu.
- Body je v MDX. Použij sekce: "## Co to je", "## Trh v ČR", "## Ekonomika (vstup ≤ ${maxInvestmentMil} mil. Kč)", "## Match s tvým profilem" (jen u TYP A), "## První 3 kroky tento týden", "## Rizika"
- Na konci přidej rozkliknutelnou hloubku jako:

  <DeepDive>

  ## Detailní analýza modelu

  ... (alternativy, cenové úrovně, kdy NE, cesta k vyšší pasivitě, exit strategie)

  </DeepDive>

Nesmíš opakovat témata z posledních 90 dnů (seznam ti pošlu). Pokud si nejsi jistý, zvol jinou variantu.`;
}

function buildUserPrompt(log: TopicsLog): string {
  return `Dnešní datum: ${todayIso()}.

Témata z předchozích článků (vyhni se opakování, hlavně z posledních 90 dnů):
${recentTopicsSummary(log)}

Vygeneruj dnešní dvojici (jeden TYP A a jeden TYP B). Použij nástroj 'publish_pair'.`;
}

const articleSchema = (typeLabel: string) => ({
  type: "object" as const,
  required: ["title", "hook", "tags", "scores", "trend", "body_mdx", "key_topics", "image_query"],
  properties: {
    title: { type: "string", description: `Titulek pro TYP ${typeLabel}` },
    hook: { type: "string", description: "Dva řádky úderného popisku, max 200 znaků." },
    tags: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 6 },
    scores: {
      type: "object",
      required: ["pasivita", "navratnost", "realisticnost"],
      properties: {
        pasivita: { type: "integer", minimum: 1, maximum: 10 },
        navratnost: { type: "integer", minimum: 1, maximum: 10 },
        realisticnost: { type: "integer", minimum: 1, maximum: 10 },
      },
    },
    trend: { type: "string", description: "Krátké 'proč teď' s konkrétním signálem (1–2 věty)." },
    key_topics: {
      type: "array",
      items: { type: "string" },
      minItems: 2,
      maxItems: 5,
      description: "Klíčová témata pro anti-duplicitu (např. 'pronájem v Itálii', 'AI compliance').",
    },
    body_mdx: {
      type: "string",
      description:
        "Tělo článku v MDX. BEZ frontmatteru (ten doplníme sami). Použij sekce dle promptu a uzavři rozbalovacím <DeepDive>...</DeepDive>.",
    },
    image_query: {
      type: "string",
      description:
        "2–4 ANGLICKÁ klíčová slova pro vyhledání ilustrační fotky (např. 'glamping forest tent', 'battery energy storage', 'italian countryside house'). Konkrétní, vizuální.",
    },
  },
});

const TOOL_INPUT_SCHEMA = {
  type: "object" as const,
  required: ["type_a", "type_b"],
  properties: {
    type_a: articleSchema("A"),
    type_b: articleSchema("B"),
  },
};

function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

function buildFilename(type: "A" | "B", title: string): string {
  const date = todayIso();
  const base = slugify(title) || "clanek";
  const t = type.toLowerCase();
  let counter = 0;
  while (true) {
    const suffix = counter === 0 ? "" : `${counter + 1}`;
    const filename = `${date}-${t}${suffix}-${base}.mdx`;
    if (!fs.existsSync(path.join(CONTENT_DIR, filename))) return filename;
    counter++;
    if (counter > 20) throw new Error("Příliš mnoho článků na jeden den.");
  }
}

function escapeYaml(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function toFrontmatter(
  article: ArticlePayload,
  type: "A" | "B",
  image?: { url: string; credit: string } | null
): string {
  const tagsArr = article.tags.map((t) => JSON.stringify(t)).join(", ");
  const imageLines = image
    ? `image: "${escapeYaml(image.url)}"\nimageCredit: "${escapeYaml(image.credit)}"\n`
    : "";
  return `---
title: "${escapeYaml(article.title)}"
hook: "${escapeYaml(article.hook)}"
type: ${type}
date: ${todayIso()}
tags: [${tagsArr}]
${imageLines}scores:
  pasivita: ${article.scores.pasivita}
  navratnost: ${article.scores.navratnost}
  realisticnost: ${article.scores.realisticnost}
trend: "${escapeYaml(article.trend)}"
---
`;
}

export async function POST() {
  if (isReadOnlyHosting()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Generování běží jen lokálně přes Claude Code. Na produkci je vypnuté (read-only filesystem).",
      },
      { status: 403 }
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Chybí ANTHROPIC_API_KEY. Vytvoř .env.local v rootu projektu, vlož 'ANTHROPIC_API_KEY=sk-ant-...' a restartni dev server.",
      },
      { status: 500 }
    );
  }

  const log = readTopicsLog();
  const client = new Anthropic({ apiKey });

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 16000,
      system: buildSystemPrompt(),
      tools: [
        {
          name: "publish_pair",
          description: "Publikuj dnešní dvojici článků (TYP A a TYP B).",
          input_schema: TOOL_INPUT_SCHEMA as never,
        },
      ],
      tool_choice: { type: "tool", name: "publish_pair" },
      messages: [{ role: "user", content: buildUserPrompt(log) }],
    });

    const toolUse = response.content.find((c) => c.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") {
      throw new Error("Claude nevrátil tool_use blok.");
    }
    const data = toolUse.input as GenerationResult;

    fs.mkdirSync(CONTENT_DIR, { recursive: true });

    const written: { slug: string; type: "A" | "B"; title: string }[] = [];
    for (const [key, type] of [
      ["type_a", "A"],
      ["type_b", "B"],
    ] as const) {
      const article = data[key];
      if (!article || !article.title || !article.body_mdx) {
        throw new Error(`Neplatný výstup pro ${key}`);
      }
      const filename = buildFilename(type, article.title);
      const slug = filename.replace(/\.mdx$/, "");
      const imageQuery =
        article.image_query?.trim() || article.tags.join(" ");
      const image = await findHeroImage(imageQuery);
      const content =
        toFrontmatter(article, type, image) + "\n" + article.body_mdx;
      fs.writeFileSync(path.join(CONTENT_DIR, filename), content);
      written.push({ slug, type, title: article.title });
      log.entries.push({
        date: new Date().toISOString(),
        type,
        slug,
        title: article.title,
        key_topics: article.key_topics ?? [],
      });
    }
    writeTopicsLog(log);

    return NextResponse.json({ ok: true, written });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
