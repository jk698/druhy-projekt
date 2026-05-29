import { getAllArticles, getAllTags } from "@/lib/articles";
import { ArticleCard } from "@/components/ArticleCard";
import { Filters } from "@/components/Filters";
import { GenerateButton } from "@/components/GenerateButton";
import { formatDateCs } from "@/lib/format";
import { isReadOnlyHosting } from "@/lib/env";

export default function HomePage() {
  const articles = getAllArticles();
  const tags = getAllTags(articles);
  const todayIso = new Date().toISOString().slice(0, 10);

  return (
    <div className="container-tight py-10">
      <section className="mb-9 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-dark">
            {formatDateCs(todayIso)} · denní výběr
          </p>
          <h1 className="mt-2.5 text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-[42px]">
            Dvě příležitosti denně.
          </h1>
        </div>
        {!isReadOnlyHosting() && <GenerateButton />}
      </section>

      <Filters allTags={tags} />

      {articles.length === 0 ? (
        <div
          data-empty-state
          className="rounded-2xl border border-dashed border-ink/20 p-10 text-center text-ink/60"
        >
          Zatím tu nejsou žádné články. Po prvním ranním běhu se tu objeví.
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-9">
            {articles.map((a) => (
              <ArticleCard key={a.slug} article={a} />
            ))}
          </div>
          <div
            data-empty-state
            style={{ display: "none" }}
            className="mt-6 rounded-2xl border border-dashed border-ink/20 p-10 text-center text-ink/60"
          >
            Žádný článek neodpovídá zvoleným filtrům.
          </div>
        </>
      )}
    </div>
  );
}
