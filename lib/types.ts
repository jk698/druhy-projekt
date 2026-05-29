export type ArticleType = "A" | "B";

export type ArticleScores = {
  /** Jak pasivní (1 = aktivní práce, 10 = plně pasivní) */
  pasivita: number;
  /** Návratnost ≤ 5 let (1 = nereálné, 10 = velmi rychlé) */
  navratnost: number;
  /** Realističnost při ≤ 5M Kč vstupu (1 = nereálné, 10 = úplně reálné) */
  realisticnost: number;
};

export type ArticleFrontmatter = {
  title: string;
  hook: string;
  type: ArticleType;
  date: string;
  tags: string[];
  scores: ArticleScores;
  /** Krátký „why now" — 1 věta, citovatelný trend nebo signál */
  trend?: string;
  /** URL reálné fotky (Openverse / jiný zdroj). Pokud chybí, použije se SVG hero. */
  image?: string;
  /** Kredit k fotce, např. „Foto: Autor (CC BY) — Openverse" */
  imageCredit?: string;
  /** Hex barva pro SVG hero (auto z typu, pokud neuvedeno) */
  color?: string;
};

export type Article = ArticleFrontmatter & {
  slug: string;
  content: string;
  readingMinutes: number;
};
