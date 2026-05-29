"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Status =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "success"; written: { slug: string; type: "A" | "B"; title: string }[] }
  | { kind: "error"; message: string };

export function GenerateButton() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const run = async () => {
    setStatus({ kind: "loading" });
    try {
      const res = await fetch("/api/generate", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setStatus({ kind: "error", message: data.error ?? "Generování selhalo." });
        return;
      }
      setStatus({ kind: "success", written: data.written });
      router.refresh();
    } catch (e) {
      setStatus({
        kind: "error",
        message: e instanceof Error ? e.message : "Neznámá chyba",
      });
    }
  };

  return (
    <div className="flex flex-col items-start gap-2 sm:items-end">
      <button
        type="button"
        onClick={run}
        disabled={status.kind === "loading"}
        className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status.kind === "loading" ? (
          <>
            <Spinner /> Generuji dvojici…
          </>
        ) : (
          <>
            <Plus /> Vygenerovat další dvojici
          </>
        )}
      </button>
      {status.kind === "success" && (
        <div className="max-w-sm text-xs text-emerald-700">
          ✓ Přidáno:
          <ul className="mt-1 list-disc pl-4">
            {status.written.map((w) => (
              <li key={w.slug}>
                [{w.type}] {w.title}
              </li>
            ))}
          </ul>
        </div>
      )}
      {status.kind === "error" && (
        <div className="max-w-sm rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-900">
          {status.message}
        </div>
      )}
    </div>
  );
}

function Plus() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="animate-spin">
      <circle cx="12" cy="12" r="9" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" />
    </svg>
  );
}
