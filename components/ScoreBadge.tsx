import type { ArticleScores } from "@/lib/types";

const LABELS: Record<keyof ArticleScores, { short: string; full: string }> = {
  pasivita: { short: "Pas.", full: "Pasivita" },
  navratnost: { short: "ROI", full: "Návratnost ≤ 5 let" },
  realisticnost: { short: "Reál.", full: "Realističnost ≤ 5M Kč" },
};

function toneFor(value: number): string {
  if (value >= 8) return "bg-emerald-100 text-emerald-900 border-emerald-300";
  if (value >= 6) return "bg-amber-100 text-amber-900 border-amber-300";
  return "bg-rose-100 text-rose-900 border-rose-300";
}

export function ScoreBadges({
  scores,
  size = "sm",
}: {
  scores: ArticleScores;
  size?: "sm" | "md";
}) {
  const dim = size === "md" ? "text-sm px-2.5 py-1" : "text-xs px-2 py-0.5";
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {(Object.keys(LABELS) as (keyof ArticleScores)[]).map((k) => (
        <span
          key={k}
          title={`${LABELS[k].full}: ${scores[k]} / 10`}
          className={`inline-flex items-center gap-1 rounded-md border font-medium tabular-nums ${dim} ${toneFor(scores[k])}`}
        >
          <span className="opacity-70">{LABELS[k].short}</span>
          <span>{scores[k]}</span>
        </span>
      ))}
    </div>
  );
}
