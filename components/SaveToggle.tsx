"use client";

import { useEffect, useState } from "react";

const KEY = "biz.saved";

function readSaved(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr);
  } catch {
    return new Set();
  }
}

function writeSaved(set: Set<string>) {
  window.localStorage.setItem(KEY, JSON.stringify(Array.from(set)));
  window.dispatchEvent(new CustomEvent("biz:saved-changed"));
}

export function SaveToggle({ slug }: { slug: string }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const apply = () => setSaved(readSaved().has(slug));
    apply();
    window.addEventListener("biz:saved-changed", apply);
    return () => window.removeEventListener("biz:saved-changed", apply);
  }, [slug]);

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const set = readSaved();
    if (set.has(slug)) set.delete(slug);
    else set.add(slug);
    writeSaved(set);
    setSaved(set.has(slug));
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={saved}
      title={saved ? "Uloženo" : "Uložit"}
      className={`inline-flex h-7 w-7 items-center justify-center rounded-full border text-ink/70 transition-colors ${
        saved
          ? "border-ink bg-ink text-paper hover:bg-ink-soft"
          : "border-ink/20 bg-white hover:border-ink/60 hover:text-ink"
      }`}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill={saved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    </button>
  );
}
