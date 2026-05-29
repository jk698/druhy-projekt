import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { Article, ArticleFrontmatter } from "./types";

const CONTENT_DIR = path.join(process.cwd(), "content", "articles");

function estimateReadingMinutes(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

function parseFile(filename: string): Article | null {
  const full = path.join(CONTENT_DIR, filename);
  if (!fs.statSync(full).isFile()) return null;
  if (!filename.endsWith(".mdx") && !filename.endsWith(".md")) return null;
  const raw = fs.readFileSync(full, "utf8");
  const { data, content } = matter(raw);
  const fm = data as Partial<ArticleFrontmatter>;
  if (!fm.title || !fm.hook || !fm.type || !fm.date) {
    console.warn(`[articles] missing frontmatter in ${filename}`);
    return null;
  }
  const slug = filename.replace(/\.(mdx|md)$/, "");
  const rawDate: unknown = fm.date;
  const dateStr =
    rawDate instanceof Date
      ? rawDate.toISOString().slice(0, 10)
      : String(rawDate);
  return {
    title: fm.title,
    hook: fm.hook,
    type: fm.type,
    date: dateStr,
    tags: fm.tags ?? [],
    scores: fm.scores ?? { pasivita: 5, navratnost: 5, realisticnost: 5 },
    trend: fm.trend,
    image: fm.image,
    imageCredit: fm.imageCredit,
    color: fm.color,
    slug,
    content,
    readingMinutes: estimateReadingMinutes(content),
  };
}

export function getAllArticles(): Article[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  const entries = fs.readdirSync(CONTENT_DIR);
  const articles = entries
    .map((f) => parseFile(f))
    .filter((a): a is Article => a !== null);
  articles.sort((a, b) => (a.date < b.date ? 1 : -1));
  return articles;
}

export function getArticleBySlug(slug: string): Article | null {
  const candidates = [`${slug}.mdx`, `${slug}.md`];
  for (const name of candidates) {
    const full = path.join(CONTENT_DIR, name);
    if (fs.existsSync(full)) {
      return parseFile(name);
    }
  }
  return null;
}

export function getAllTags(articles: Article[]): string[] {
  const set = new Set<string>();
  for (const a of articles) {
    for (const t of a.tags) set.add(t);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b, "cs"));
}
