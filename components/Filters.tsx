"use client";

import { useEffect, useMemo, useState } from "react";

type Sort = "newest" | "pasivita" | "navratnost" | "realisticnost";
type TypeFilter = "all" | "A" | "B";
type SavedFilter = "all" | "saved" | "unread";

const SORTS: { value: Sort; label: string }[] = [
  { value: "newest", label: "Nejnovější" },
  { value: "pasivita", label: "Nejpasivnější" },
  { value: "navratnost", label: "Nejrychlejší ROI" },
  { value: "realisticnost", label: "Nejrealističtější" },
];

export function Filters({ allTags }: { allTags: string[] }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<TypeFilter>("all");
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<Sort>("newest");
  const [savedFilter, setSavedFilter] = useState<SavedFilter>("all");
  const [savedSet, setSavedSet] = useState<Set<string>>(new Set());
  const [readSet, setReadSet] = useState<Set<string>>(new Set());

  useEffect(() => {
    const refresh = () => {
      try {
        const s = JSON.parse(localStorage.getItem("biz.saved") ?? "[]");
        const r = JSON.parse(localStorage.getItem("biz.read") ?? "[]");
        setSavedSet(new Set(Array.isArray(s) ? s : []));
        setReadSet(new Set(Array.isArray(r) ? r : []));
      } catch {
        /* ignore */
      }
    };
    refresh();
    window.addEventListener("biz:saved-changed", refresh);
    window.addEventListener("biz:read-changed", refresh);
    return () => {
      window.removeEventListener("biz:saved-changed", refresh);
      window.removeEventListener("biz:read-changed", refresh);
    };
  }, []);

  // Aplikace filtrů na DOM (server-rendered karty)
  useEffect(() => {
    const cards = Array.from(
      document.querySelectorAll<HTMLElement>("[data-article-id]")
    );

    const visible: HTMLElement[] = [];
    for (const card of cards) {
      const t = card.dataset.articleType as "A" | "B";
      const tags = (card.dataset.articleTags ?? "").split(",").filter(Boolean);
      const id = card.dataset.articleId ?? "";
      let show = true;
      if (type !== "all" && t !== type) show = false;
      if (activeTags.size > 0 && !tags.some((tg) => activeTags.has(tg)))
        show = false;
      if (savedFilter === "saved" && !savedSet.has(id)) show = false;
      if (savedFilter === "unread" && readSet.has(id)) show = false;
      card.style.display = show ? "" : "none";
      if (show) visible.push(card);
    }

    // Řazení — manipulujeme order ve flex/grid přes CSS `order`
    const score = (c: HTMLElement): number => {
      switch (sort) {
        case "pasivita":
          return Number(c.dataset.articleScorePasivita ?? "0");
        case "navratnost":
          return Number(c.dataset.articleScoreNavratnost ?? "0");
        case "realisticnost":
          return Number(c.dataset.articleScoreRealisticnost ?? "0");
        default:
          return 0;
      }
    };

    if (sort === "newest") {
      cards.forEach((c) => (c.style.order = ""));
    } else {
      const sorted = [...visible].sort((a, b) => score(b) - score(a));
      sorted.forEach((c, i) => (c.style.order = String(i)));
    }

    const empty = document.querySelector<HTMLElement>("[data-empty-state]");
    if (empty) empty.style.display = visible.length === 0 ? "" : "none";
  }, [type, activeTags, sort, savedFilter, savedSet, readSet]);

  const toggleTag = (t: string) => {
    setActiveTags((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  };

  const savedCount = savedSet.size;

  const typeButtons = useMemo(
    () => [
      { v: "all" as const, label: "Vše" },
      { v: "A" as const, label: "A · na míru" },
      { v: "B" as const, label: "B · trendy" },
    ],
    []
  );

  const activeCount =
    (type !== "all" ? 1 : 0) +
    activeTags.size +
    (savedFilter !== "all" ? 1 : 0) +
    (sort !== "newest" ? 1 : 0);

  return (
    <div className="mb-9 border-b border-ink/[0.07] pb-5">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="-ml-1 flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium text-ink/60 transition-colors hover:bg-paper-soft hover:text-ink"
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden
        >
          <line x1="4" y1="7" x2="20" y2="7" />
          <line x1="4" y1="12" x2="14" y2="12" />
          <line x1="4" y1="17" x2="9" y2="17" />
        </svg>
        Filtry a řazení
        {activeCount > 0 && (
          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1.5 text-[11px] font-semibold text-white">
            {activeCount}
          </span>
        )}
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <div className={`${open ? "mt-4 flex" : "hidden"} flex-col gap-3`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="-ml-1 flex flex-wrap items-center gap-1">
          {typeButtons.map((b) => (
            <button
              key={b.v}
              type="button"
              onClick={() => setType(b.v)}
              className={`pill ${type === b.v ? "pill-active" : ""}`}
            >
              {b.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <label className="text-ink/50">Řadit:</label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="rounded-full border border-ink/10 bg-paper-soft px-3 py-1 text-sm font-medium text-ink/80 focus:outline-none focus:ring-2 focus:ring-brand/30"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {allTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs uppercase tracking-wider text-ink/50">
            Tagy:
          </span>
          {allTags.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => toggleTag(t)}
              className={`pill ${activeTags.has(t) ? "pill-active" : ""}`}
            >
              {t}
            </button>
          ))}
          {activeTags.size > 0 && (
            <button
              type="button"
              onClick={() => setActiveTags(new Set())}
              className="ml-2 text-xs text-ink/60 underline hover:text-ink"
            >
              vyčistit
            </button>
          )}
        </div>
      )}

      <div className="-ml-1 flex flex-wrap items-center gap-1 border-t border-ink/[0.07] pt-3">
        {(
          [
            { v: "all", label: "Vše" },
            { v: "saved", label: `Uloženo (${savedCount})` },
            { v: "unread", label: "Nepřečtené" },
          ] as const
        ).map((b) => (
          <button
            key={b.v}
            type="button"
            onClick={() => setSavedFilter(b.v)}
            className={`pill ${savedFilter === b.v ? "pill-active" : ""}`}
          >
            {b.label}
          </button>
        ))}
      </div>
      </div>
    </div>
  );
}
