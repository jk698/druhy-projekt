"use client";

import { useState } from "react";
import type { GenerationConfig } from "@/lib/generation-config";

type Status = { ok: boolean; msg: string } | null;

export function AdminSettings({ config }: { config: GenerationConfig }) {
  const [form, setForm] = useState<GenerationConfig>(config);
  const [status, setStatus] = useState<Status>(null);
  const [saving, setSaving] = useState(false);

  function setLimit(key: keyof GenerationConfig["limits"], value: number) {
    setForm((f) => ({ ...f, limits: { ...f.limits, [key]: value } }));
  }

  function setText(key: keyof GenerationConfig, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.ok) {
        setForm(data.config);
        setStatus({
          ok: true,
          msg: "Uloženo. Použije se u všech dalších generovaných článků.",
        });
      } else {
        setStatus({ ok: false, msg: data.error ?? "Uložení selhalo." });
      }
    } catch {
      setStatus({ ok: false, msg: "Chyba sítě." });
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    await fetch("/admin/logout", { method: "POST" });
    window.location.reload();
  }

  const investMil = form.limits.maxEntryInvestmentCzk / 1_000_000;

  return (
    <form onSubmit={save} className="mt-8 flex flex-col gap-8">
      {/* Limity */}
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-bold tracking-tight">Tvrdé limity</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Min. sazba (Kč/hod)">
            <input
              type="number"
              min={0}
              step={100}
              value={form.limits.minHourlyRateCzk}
              onChange={(e) =>
                setLimit("minHourlyRateCzk", Number(e.target.value))
              }
              className={inputCls}
            />
          </Field>
          <Field label="Max. vstup (mil. Kč)">
            <input
              type="number"
              min={0}
              step={0.5}
              value={investMil}
              onChange={(e) =>
                setLimit(
                  "maxEntryInvestmentCzk",
                  Math.round(Number(e.target.value) * 1_000_000)
                )
              }
              className={inputCls}
            />
          </Field>
          <Field label="Max. návratnost (roky)">
            <input
              type="number"
              min={0}
              step={1}
              value={form.limits.maxPaybackYears}
              onChange={(e) =>
                setLimit("maxPaybackYears", Number(e.target.value))
              }
              className={inputCls}
            />
          </Field>
        </div>
      </section>

      {/* Společné zadání */}
      <Block
        title="Společné zadání a podmínky"
        hint="Platí pro A i B. Tohle je dřívější text z homepage — teď to jsou reálné instrukce pro generování."
        value={form.commonInstructions}
        onChange={(v) => setText("commonInstructions", v)}
        rows={7}
      />

      {/* TYP A */}
      <Block
        title="Pokyny pro TYP A — na míru profilu"
        hint="Domény a jejich průniky, na které se má příležitost vázat."
        value={form.typeAInstructions}
        onChange={(v) => setText("typeAInstructions", v)}
        rows={12}
      />

      {/* TYP B */}
      <Block
        title="Pokyny pro TYP B — světové trendy"
        hint="Volné téma s trakcí v zahraničí a prostorem v ČR."
        value={form.typeBInstructions}
        onChange={(v) => setText("typeBInstructions", v)}
        rows={10}
      />

      {status && (
        <p
          className={`text-sm ${
            status.ok ? "text-brand-dark" : "text-rose-600"
          }`}
        >
          {status.msg}
        </p>
      )}

      <div className="flex items-center gap-3 border-t border-ink/[0.07] pt-5">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-dark disabled:opacity-50"
        >
          {saving ? "Ukládám…" : "Uložit změny"}
        </button>
        <button
          type="button"
          onClick={logout}
          className="inline-flex items-center rounded-full px-4 py-2.5 text-sm font-medium text-ink/50 transition-colors hover:text-ink"
        >
          Odhlásit
        </button>
      </div>
    </form>
  );
}

const inputCls =
  "w-full rounded-xl border border-ink/15 bg-paper-soft px-3 py-2 text-sm outline-none transition focus:border-brand/40 focus:ring-2 focus:ring-brand/30";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-ink/70">{label}</span>
      {children}
    </label>
  );
}

function Block({
  title,
  hint,
  value,
  onChange,
  rows,
}: {
  title: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
  rows: number;
}) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-lg font-bold tracking-tight">{title}</h2>
      <p className="text-[13px] leading-relaxed text-ink/50">{hint}</p>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="mt-1 w-full resize-y rounded-xl border border-ink/15 bg-paper-soft px-4 py-3 font-mono text-[13px] leading-relaxed outline-none transition focus:border-brand/40 focus:ring-2 focus:ring-brand/30"
      />
    </section>
  );
}
