"use client";

import { useState } from "react";

export function AdminLogin({ configured }: { configured: boolean }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.ok) {
        window.location.reload();
      } else {
        setError(data.error ?? "Přihlášení selhalo.");
      }
    } catch {
      setError("Chyba sítě.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-8 max-w-sm">
      {!configured && (
        <div className="mb-5 rounded-xl bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-800">
          Admin zatím není nastavený. Přidej{" "}
          <code className="rounded bg-amber-100 px-1">ADMIN_PASSWORD=…</code> do{" "}
          <code className="rounded bg-amber-100 px-1">.env.local</code> a
          restartuj dev server.
        </div>
      )}
      <form onSubmit={submit} className="flex flex-col gap-3">
        <label className="text-sm font-medium text-ink/70" htmlFor="pw">
          Heslo
        </label>
        <input
          id="pw"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          autoComplete="current-password"
          className="rounded-full border border-ink/15 bg-paper-soft px-4 py-2.5 text-sm outline-none transition focus:border-brand/40 focus:ring-2 focus:ring-brand/30"
        />
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <button
          type="submit"
          disabled={loading || !configured}
          className="mt-1 inline-flex w-fit items-center rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Přihlašuji…" : "Přihlásit"}
        </button>
      </form>
    </div>
  );
}
