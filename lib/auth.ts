/**
 * Jednoduchá ochrana sekce /admin heslem.
 *
 * - Heslo se nastavuje přes env proměnnou ADMIN_PASSWORD (nikdy ne v kódu).
 * - Po přihlášení se vystaví podepsaný (HMAC-SHA256) cookie token s expirací.
 * - Podpisový klíč se odvozuje z hesla, takže změna hesla zneplatní staré tokeny.
 *
 * Bez ADMIN_PASSWORD se do adminu nedá přihlásit (fail-closed).
 */
import crypto from "node:crypto";

export const ADMIN_COOKIE = "biz_admin";
/** Platnost přihlášení v sekundách (30 dní). */
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

function signingKey(): string | null {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return null;
  return crypto
    .createHash("sha256")
    .update(`biz-admin::${password}`)
    .digest("hex");
}

/** Je admin vůbec nakonfigurovaný (existuje ADMIN_PASSWORD)? */
export function adminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}

/** Porovná zadané heslo s ADMIN_PASSWORD v konstantním čase. */
export function checkPassword(input: string): boolean {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false;
  const a = Buffer.from(String(input));
  const b = Buffer.from(password);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/** Vystaví podepsaný token s expirací. */
export function issueToken(): string {
  const key = signingKey();
  if (!key) throw new Error("ADMIN_PASSWORD není nastavené.");
  const payload = Buffer.from(
    JSON.stringify({ exp: Date.now() + COOKIE_MAX_AGE * 1000 })
  ).toString("base64url");
  const sig = crypto
    .createHmac("sha256", key)
    .update(payload)
    .digest("base64url");
  return `${payload}.${sig}`;
}

/** Ověří token z cookie: podpis i expiraci. */
export function verifyToken(token: string | undefined | null): boolean {
  const key = signingKey();
  if (!key || !token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [payload, sig] = parts;
  const expected = crypto
    .createHmac("sha256", key)
    .update(payload)
    .digest("base64url");
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length) return false;
  if (!crypto.timingSafeEqual(sigBuf, expBuf)) return false;
  try {
    const data = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    ) as { exp?: unknown };
    return typeof data.exp === "number" && data.exp > Date.now();
  } catch {
    return false;
  }
}
