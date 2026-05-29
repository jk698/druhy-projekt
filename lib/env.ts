/**
 * Běží web na hostingu s read-only filesystem (Vercel)?
 *
 * Generování článků i úprava pokynů zapisují soubory — to jde jen lokálně
 * přes Claude Code. Na Vercelu (kde je `VERCEL=1`) tyhle akce schováme /
 * odmítneme, ať nikdo nepálí Anthropic kredit a nedostává ošklivé chyby.
 */
export function isReadOnlyHosting(): boolean {
  return !!process.env.VERCEL;
}
