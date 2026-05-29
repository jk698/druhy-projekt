// Jednorázový/utility skript: najde fotky na Openverse pro zadané dotazy.
// Použití: node scripts/find-images.mjs "dotaz jedna" "dotaz dva" ...
const queries = process.argv.slice(2);
if (queries.length === 0) {
  console.error("Zadej aspoň jeden dotaz.");
  process.exit(1);
}

const usable = (x) =>
  x.url &&
  x.url.startsWith("https://") &&
  /\.(jpe?g|png|webp)(\?|$)/i.test(x.url);

for (const q of queries) {
  const u = new URL("https://api.openverse.org/v1/images/");
  u.searchParams.set("q", q);
  u.searchParams.set("license_type", "commercial,modification");
  u.searchParams.set("page_size", "20");
  u.searchParams.set("mature", "false");
  try {
    const r = await fetch(u, {
      headers: { "User-Agent": "prilezitosti.cz (osobni projekt)" },
    });
    const d = await r.json();
    const hit = (d.results || []).find(usable);
    console.log("=== " + q);
    console.log(
      hit
        ? JSON.stringify(
            {
              url: hit.url,
              creator: hit.creator,
              license: hit.license,
              license_version: hit.license_version,
              source: hit.foreign_landing_url,
            },
            null,
            2
          )
        : "NONE"
    );
  } catch (e) {
    console.log("=== " + q + " -> ERROR " + e.message);
  }
}
