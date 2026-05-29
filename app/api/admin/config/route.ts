import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, verifyToken } from "@/lib/auth";
import {
  getGenerationConfig,
  saveGenerationConfig,
  type GenerationConfig,
} from "@/lib/generation-config";
import { isReadOnlyHosting } from "@/lib/env";

export const dynamic = "force-dynamic";

async function isAuthed(): Promise<boolean> {
  const store = await cookies();
  return verifyToken(store.get(ADMIN_COOKIE)?.value);
}

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function clampNum(value: unknown, fallback: number): number {
  const n = typeof value === "string" ? Number(value) : value;
  return typeof n === "number" && Number.isFinite(n) && n > 0 ? n : fallback;
}

function clampStr(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed.length === 0 ? fallback : trimmed.slice(0, 20000);
}

export async function POST(req: NextRequest) {
  if (!(await isAuthed())) {
    return NextResponse.json(
      { ok: false, error: "Nepřihlášeno." },
      { status: 401 }
    );
  }

  if (isReadOnlyHosting()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Pokyny se ukládají jen lokálně (read-only filesystem na produkci). Uprav je v lokálním běhu přes Claude Code a pushni do gitu.",
      },
      { status: 403 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Neplatný JSON." },
      { status: 400 }
    );
  }

  const current = getGenerationConfig();
  const obj = asObject(body);
  const limits = asObject(obj.limits);

  const next: GenerationConfig = {
    limits: {
      minHourlyRateCzk: clampNum(
        limits.minHourlyRateCzk,
        current.limits.minHourlyRateCzk
      ),
      maxEntryInvestmentCzk: clampNum(
        limits.maxEntryInvestmentCzk,
        current.limits.maxEntryInvestmentCzk
      ),
      maxPaybackYears: clampNum(
        limits.maxPaybackYears,
        current.limits.maxPaybackYears
      ),
    },
    commonInstructions: clampStr(
      obj.commonInstructions,
      current.commonInstructions
    ),
    typeAInstructions: clampStr(
      obj.typeAInstructions,
      current.typeAInstructions
    ),
    typeBInstructions: clampStr(
      obj.typeBInstructions,
      current.typeBInstructions
    ),
  };

  try {
    saveGenerationConfig(next);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      {
        ok: false,
        error: `Uložení selhalo (read-only filesystem na hostingu?): ${msg}`,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, config: next });
}
