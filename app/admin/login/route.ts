import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  COOKIE_MAX_AGE,
  adminConfigured,
  checkPassword,
  issueToken,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!adminConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Admin není nastavený. Doplň ADMIN_PASSWORD do .env.local a restartuj server.",
      },
      { status: 503 }
    );
  }

  let password = "";
  try {
    const body = (await req.json()) as unknown;
    if (body && typeof body === "object" && "password" in body) {
      const value = (body as Record<string, unknown>).password;
      if (typeof value === "string") password = value;
    }
  } catch {
    return NextResponse.json(
      { ok: false, error: "Neplatný požadavek." },
      { status: 400 }
    );
  }

  if (!checkPassword(password)) {
    return NextResponse.json(
      { ok: false, error: "Špatné heslo." },
      { status: 401 }
    );
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, issueToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
  return res;
}
