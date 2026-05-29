/**
 * Openverse — vyhledání volně licencované fotky bez API klíče.
 * Docs: https://api.openverse.org/v1/  (anonymní přístup je rate-limited, ale stačí.)
 */

export type HeroImage = {
  url: string;
  credit: string;
  source: string;
};

type OpenverseResult = {
  url?: string;
  title?: string;
  creator?: string;
  license?: string;
  license_version?: string;
  foreign_landing_url?: string;
};

const ENDPOINT = "https://api.openverse.org/v1/images/";

function buildCredit(r: OpenverseResult): string {
  const author = r.creator?.trim() || "neznámý autor";
  const lic = r.license
    ? `CC ${r.license.toUpperCase()}${r.license_version ? " " + r.license_version : ""}`
    : "volná licence";
  return `Foto: ${author} (${lic}) — Openverse`;
}

function usable(r: OpenverseResult): boolean {
  return (
    typeof r.url === "string" &&
    r.url.startsWith("https://") &&
    /\.(jpe?g|png|webp)(\?|$)/i.test(r.url)
  );
}

/**
 * Najde tematickou fotku podle klíčových slov. Vrací null, když nic nenajde
 * nebo API selže — volající si pak nechá SVG fallback.
 */
export async function findHeroImage(query: string): Promise<HeroImage | null> {
  const params = new URLSearchParams({
    q: query,
    license_type: "commercial,modification",
    page_size: "12",
    mature: "false",
    fields: "url,title,creator,license,license_version,foreign_landing_url",
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(`${ENDPOINT}?${params.toString()}`, {
      headers: {
        Accept: "application/json",
        "User-Agent": "prilezitosti.cz (osobní projekt)",
      },
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { results?: OpenverseResult[] };
    const hit = (data.results ?? []).find(usable);
    if (!hit || !hit.url) return null;
    return {
      url: hit.url,
      credit: buildCredit(hit),
      source: hit.foreign_landing_url ?? "",
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
