"use client";

import { useState, type ReactNode } from "react";

export function DeepDive({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="my-10 overflow-hidden rounded-2xl border border-ink/15 bg-paper-soft">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-ink/5"
      >
        <div>
          <div className="text-xs uppercase tracking-wider text-ink/50">
            Hluboká analýza
          </div>
          <div className="text-base font-semibold text-ink">
            {open ? "Skrýt detail" : "Rozkliknout, pokud tě to zaujalo"}
          </div>
        </div>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div className="border-t border-ink/10 bg-white px-5 py-6 prose-article">
          {children}
        </div>
      )}
    </div>
  );
}
