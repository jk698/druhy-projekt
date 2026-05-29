import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllArticles, getArticleBySlug } from "@/lib/articles";
import { ScoreBadges } from "@/components/ScoreBadge";
import { DeepDive } from "@/components/DeepDive";
import { SaveToggle } from "@/components/SaveToggle";
import { ReadMark } from "@/components/ReadMark";
import { HeroImage } from "@/components/HeroImage";
import { formatDateCs } from "@/lib/format";

export function generateStaticParams() {
  return getAllArticles().map((a) => ({ slug: a.slug }));
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const isA = article.type === "A";

  return (
    <article className="pb-24">
      <ReadMark slug={article.slug} />

      <div className="container-read pt-8 sm:pt-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-ink/50 transition-colors hover:text-ink"
        >
          ← Zpět na výpis
        </Link>

        <div className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink/45">
          <span
            className={`cat-label ${isA ? "text-brand-dark" : "text-accent-b"}`}
          >
            {isA ? "Na míru" : "Trendy"}
          </span>
          <span aria-hidden>·</span>
          <time dateTime={article.date}>{formatDateCs(article.date)}</time>
          <span aria-hidden>·</span>
          <span>{article.readingMinutes} min čtení</span>
          <span className="ml-auto">
            <SaveToggle slug={article.slug} />
          </span>
        </div>

        <h1 className="mt-3 text-3xl font-extrabold leading-[1.12] tracking-tight sm:text-[40px]">
          {article.title}
        </h1>

        <p className="mt-4 text-lg leading-relaxed text-ink/60 sm:text-xl">
          {article.hook}
        </p>

        <figure className="mt-8">
          <div className="overflow-hidden rounded-2xl bg-paper-soft">
            <HeroImage
              slug={article.slug}
              src={article.image}
              className="aspect-[16/9] w-full object-cover"
            />
          </div>
          {article.imageCredit && (
            <figcaption className="mt-2 text-xs text-ink/40">
              {article.imageCredit}
            </figcaption>
          )}
        </figure>

        {article.trend && (
          <div className="mt-8 rounded-2xl bg-brand-soft px-4 py-3 text-sm">
            <span className="font-semibold text-brand-dark">Proč teď: </span>
            <span className="text-ink/75">{article.trend}</span>
          </div>
        )}

        <div className="mt-6">
          <ScoreBadges scores={article.scores} size="md" />
        </div>

        {article.tags.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-1.5">
            {article.tags.map((t) => (
              <span key={t} className="pill !px-2.5 !py-0.5 !text-xs">
                {t}
              </span>
            ))}
          </div>
        )}

        <div className="mt-10 prose-article">
          <MDXRemote
            source={article.content}
            components={{
              DeepDive,
            }}
          />
        </div>

        <div className="mt-16 border-t border-ink/10 pt-6">
          <Link
            href="/"
            className="text-sm text-ink/50 underline underline-offset-2 hover:text-ink"
          >
            ← Zpět na výpis
          </Link>
        </div>
      </div>
    </article>
  );
}
