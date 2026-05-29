import Link from "next/link";
import type { Article } from "@/lib/types";
import { ScoreBadges } from "./ScoreBadge";
import { formatDateCs } from "@/lib/format";
import { SaveToggle } from "./SaveToggle";
import { HeroImage } from "./HeroImage";

export function ArticleCard({ article }: { article: Article }) {
  const isA = article.type === "A";
  const href = `/clanky/${article.slug}`;
  return (
    <article
      data-article-id={article.slug}
      data-article-type={article.type}
      data-article-tags={article.tags.join(",")}
      data-article-score-pasivita={article.scores.pasivita}
      data-article-score-navratnost={article.scores.navratnost}
      data-article-score-realisticnost={article.scores.realisticnost}
      className="group flex flex-col gap-4 sm:flex-row sm:gap-5"
    >
      <div className="relative sm:w-[240px] sm:flex-shrink-0 lg:w-[280px]">
        <Link
          href={href}
          className="block overflow-hidden rounded-2xl bg-paper-soft"
        >
          <HeroImage
            slug={article.slug}
            src={article.image}
            className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </Link>
        <div className="absolute right-3 top-3">
          <SaveToggle slug={article.slug} />
        </div>
      </div>

      <div className="flex flex-1 flex-col">
        <Link href={href} className="block">
          <h2 className="text-xl font-bold leading-snug tracking-tight text-ink transition-colors group-hover:text-brand-dark sm:text-[22px]">
            {article.title}
          </h2>
        </Link>

        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-ink/45">
          <span className={`cat-label ${isA ? "text-brand-dark" : "text-accent-b"}`}>
            {isA ? "Na míru" : "Trendy"}
          </span>
          <span aria-hidden>·</span>
          <time dateTime={article.date}>{formatDateCs(article.date)}</time>
          <span aria-hidden>·</span>
          <span>{article.readingMinutes} min čtení</span>
        </div>

        <p className="mt-2.5 line-clamp-3 text-[15px] leading-relaxed text-ink/65">
          {article.hook}
        </p>

        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-2 pt-4">
          <ScoreBadges scores={article.scores} />
          {article.tags.length > 0 && (
            <div className="hidden flex-wrap gap-1 md:flex">
              {article.tags.slice(0, 3).map((t) => (
                <span key={t} className="pill !px-2 !py-0.5 !text-xs">
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
