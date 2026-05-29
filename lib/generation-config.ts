/**
 * Konfigurace pro generování článků. Slouží jako vstup do promptu
 * pro `/api/generate` i pro naplánovaný agent (skill denni-prilezitosti).
 *
 * Hodnoty se dají měnit v zabezpečené sekci /admin — uloží se do
 * `content/generation-config.json`. Když soubor chybí, použijí se DEFAULT_*.
 */
import fs from "node:fs";
import path from "node:path";

export type GenerationLimits = {
  /** Cílová minimální hodinová sazba pro aktivní práci, v Kč */
  minHourlyRateCzk: number;
  /** Maximální vstupní investice, v Kč */
  maxEntryInvestmentCzk: number;
  /** Maximální doba návratnosti, v letech */
  maxPaybackYears: number;
};

export type GenerationConfig = {
  limits: GenerationLimits;
  /** Společné zadání a podmínky pro A i B (dříve text na homepage). */
  commonInstructions: string;
  /** Pokyny pro TYP A — na míru profilu. */
  typeAInstructions: string;
  /** Pokyny pro TYP B — volné světové trendy přenositelné do ČR. */
  typeBInstructions: string;
};

const CONFIG_PATH = path.join(
  process.cwd(),
  "content",
  "generation-config.json"
);

export const DEFAULT_LIMITS: GenerationLimits = {
  minHourlyRateCzk: 1500,
  maxEntryInvestmentCzk: 5_000_000,
  maxPaybackYears: 5,
};

export const DEFAULT_COMMON_INSTRUCTIONS = `Najdi dvě nové business příležitosti pro českého podnikatele: jednu na míru jeho profilu (TYP A) a jednu z volných světových trendů přenositelných do ČR (TYP B).

Společné podmínky pro obě příležitosti:
- Pasivní příjem NEBO aktivní práce s hodinovou sazbou od 1 500 Kč/hod.
- Vstupní investice do 5 mil. Kč.
- Návratnost ideálně do 5 let.
- Cílový trh: Česká republika (provoz může být v zahraničí, ale klient i výnos cílí na ČR).`;

export const DEFAULT_TYPE_A_INSTRUCTIONS = `Příležitost musí navazovat alespoň na jednu z těchto domén (lépe jejich průniky):
- nemovitosti (rekonstrukce, pronájem)
- stavebnictví
- vaření a gastronomie
- Itálie
- Španělsko
- cestování a slow travel
- online marketing
- business obecně
- včelaření
- drony (komerční využití, služby, fotogrammetrie, inspekce)
- 3D tisk (prototypování, malosériová výroba, stavební 3D tisk)
- glamping a alternativní ubytování

Zvaž průniky mezi doménami — často je tam nejzajímavější příležitost (např. drony + nemovitosti, 3D tisk + stavebnictví, glamping v Itálii).`;

export const DEFAULT_TYPE_B_INSTRUCTIONS = `Volné téma — globální trend nebo model, který funguje v zahraničí a má v ČR prostor (regulace, nový tržní segment, technologický posun). Hledej trendy s reálnou trakcí, ne obecné rady.

Inspirace (ne striktně, klidně jdi mimo):
- AI a automatizace pro SME
- compliance a regulace (AI Act, NIS2, GDPR)
- energetika a baterie
- udržitelnost a circular economy
- remote work + nové formáty pobytů
- creator economy v B2B
- robotika a automatizace ve službách
- stříbrná ekonomika (50+ klienti)`;

export const DEFAULT_CONFIG: GenerationConfig = {
  limits: DEFAULT_LIMITS,
  commonInstructions: DEFAULT_COMMON_INSTRUCTIONS,
  typeAInstructions: DEFAULT_TYPE_A_INSTRUCTIONS,
  typeBInstructions: DEFAULT_TYPE_B_INSTRUCTIONS,
};

function numOr(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : fallback;
}

function strOr(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
}

/** Načte aktuální konfiguraci z JSON (s fallbackem na DEFAULT_CONFIG). */
export function getGenerationConfig(): GenerationConfig {
  try {
    const raw = fs.readFileSync(CONFIG_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<GenerationConfig>;
    const limits: Partial<GenerationLimits> = parsed.limits ?? {};
    return {
      limits: {
        minHourlyRateCzk: numOr(
          limits.minHourlyRateCzk,
          DEFAULT_LIMITS.minHourlyRateCzk
        ),
        maxEntryInvestmentCzk: numOr(
          limits.maxEntryInvestmentCzk,
          DEFAULT_LIMITS.maxEntryInvestmentCzk
        ),
        maxPaybackYears: numOr(
          limits.maxPaybackYears,
          DEFAULT_LIMITS.maxPaybackYears
        ),
      },
      commonInstructions: strOr(
        parsed.commonInstructions,
        DEFAULT_COMMON_INSTRUCTIONS
      ),
      typeAInstructions: strOr(
        parsed.typeAInstructions,
        DEFAULT_TYPE_A_INSTRUCTIONS
      ),
      typeBInstructions: strOr(
        parsed.typeBInstructions,
        DEFAULT_TYPE_B_INSTRUCTIONS
      ),
    };
  } catch {
    return DEFAULT_CONFIG;
  }
}

/** Uloží konfiguraci do JSON. Vyhodí chybu, když je filesystem read-only. */
export function saveGenerationConfig(config: GenerationConfig): void {
  fs.mkdirSync(path.dirname(CONFIG_PATH), { recursive: true });
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2) + "\n", "utf8");
}
