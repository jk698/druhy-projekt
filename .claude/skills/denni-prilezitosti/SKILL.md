---
name: denni-prilezitosti
description: Vygeneruj denní dvojici business příležitostí pro Jirku (typ A na míru profilu, typ B světové trendy přenositelné do ČR). Provede webový průzkum aktuálních trendů a uloží články jako MDX do projektu. Spouštěj, když uživatel řekne "vygeneruj dnešní dvojici", "denní příležitosti", "/denni-prilezitosti" nebo když to chce naplánovat.
---

# Denní dvojice business příležitostí

Tento skill spouští jeden plný cyklus: průzkum → 2 články → uložení.

## Zadání

Najdi DVĚ nové business příležitosti pro českého podnikatele (Jirku):

- **TYP A — na míru profilu** (musí navazovat na alespoň jednu z domén níže, lépe průnik)
- **TYP B — volné téma** (globální trend funkční v zahraničí, prostor v ČR)

### Tvrdé limity (společné pro A i B)

| Parametr | Hodnota |
|---|---|
| Vstupní investice | ≤ **5 mil. Kč** |
| Hodinová sazba (pokud aktivní práce) | ≥ **1 500 Kč** |
| Návratnost | ideálně **≤ 5 let** |
| Cílový trh | Česká republika (provoz může být v zahraničí, ale klient / výnos cílí na ČR) |

### Profil Jirky (pro TYP A)

- nemovitosti — rekonstrukce, pronájem
- stavebnictví
- vaření a gastronomie
- Itálie, Španělsko
- cestování a slow travel
- online marketing
- business obecně
- včelaření
- drony — komerční využití, fotogrammetrie, inspekce
- 3D tisk — prototypování, malosériová výroba, stavební 3D tisk
- glamping a alternativní ubytování

**Zvaž průniky** mezi doménami — často je tam nejzajímavější příležitost
(např. drony + nemovitosti, 3D tisk + stavebnictví, glamping v Itálii).

## Krok za krokem

### 1) Načti stav projektu

- Přečti `content/topics-log.json` — vyber **témata posledních 90 dnů** podle `date`. K nim se nesmíš vracet, ledaže by se zásadně změnil trh a měl bys nový úhel (v takovém případě to napiš v reportu).
- **Přečti `content/generation-config.json`** (pokud existuje) — to je **autoritativní zdroj** limitů a pokynů pro TYP A i TYP B. Uživatel ho edituje v zabezpečené sekci `/admin`. Pokud se liší od tabulky/profilu níže v tomto SKILL.md, **řiď se configem**. Když soubor neexistuje, použij defaulty z `lib/generation-config.ts` (resp. hodnoty níže).
  - `limits` → vstupní investice, min. hodinová sazba, max. návratnost
  - `commonInstructions` → společné zadání a podmínky pro A i B
  - `typeAInstructions` → pokyny pro TYP A
  - `typeBInstructions` → pokyny pro TYP B

### 2) Webový průzkum (důležitý krok — bez něj to bude generika)

- Použij **WebSearch** pro hledání čerstvých trendů a regulačních změn (CZ i svět). Hledej v češtině i anglicky.
- Pro TYP A: hledej zprávy / data k jeho doménám z posledních 6 měsíců.
- Pro TYP B: globální trendy s reálnou trakcí (regulace, nový tržní segment, technologický posun).
- **WebFetch** konkrétní zdroje, ze kterých budeš čerpat čísla nebo „proč teď". Ověř si datum.
- Cílem je: každý článek má v sekci „Proč teď" konkrétní signál s datem nebo měřitelným ukazatelem.

### 3) Napiš oba články

Každý článek je krátká verze (~500 slov) + rozkliknutelná hluboká analýza (~500–700 slov).

**Pravidla obsahu:**
- Žádné generické rady. Vždy konkrétní čísla (Kč, EUR, %, hodiny), regiony, jména platforem / nástrojů.
- Tón: česky, tykání, věcný „business strateg u kafe".
- Skóre 1–10 pro `pasivita`, `navratnost` (do 5 let), `realisticnost` (při ≤ 5M Kč) — buď upřímný, ne všechno je 9/9/9.
- 4–6 tagů, malá písmena, krátké.
- Hook = 2 řádky, max ~200 znaků, ať z toho čtenář pozná podstatu.

**Struktura MDX těla:**

<!-- pozn.: ilustrační fotku z Openverse doplníš v kroku 3b níže -->


```
## Co to je
...

## Trh v ČR
...

## Ekonomika (vstup ≤ 5 mil. Kč)
- konkrétní položky: vstup, provoz, ...
- konzervativní příjem
- čistý cashflow
- návratnost

## Match s tvým profilem        <!-- JEN U TYP A -->
- jak to sedí na konkrétní Jirkovy domény

## První 3 kroky tento týden
1. ...
2. ...
3. ...

## Rizika
- ...

<DeepDive>

## Detailní analýza modelu

### Cenové úrovně / varianty
### Alternativní akviziční kanály
### Kdy NE
### Cesta k vyšší pasivitě
### Exit strategie

</DeepDive>
```

**Frontmatter pro MDX:**

```yaml
---
title: "..."
hook: "Dva řádky úderného popisku."
type: A          # nebo B
date: YYYY-MM-DD    # dnešní datum
tags: ["tag1", "tag2", ...]
image: "https://...jpg"        # z Openverse (krok 3b); když nic, řádek vynech (použije se SVG)
imageCredit: "Foto: Autor (CC BY 2.0) — Openverse"
scores:
  pasivita: N
  navratnost: N
  realisticnost: N
trend: "Krátké proč teď s konkrétním signálem (datum / statistika / regulace)."
---
```

### 3b) Najdi ilustrační fotku (Openverse, bez API klíče)

Pro každý článek vyber 2–4 **anglická** vizuální klíčová slova (např. `glamping forest tent`, `battery energy storage`, `italian countryside house`) a zavolej Openverse API. Nejjednodušší přes Bash:

```bash
node scripts/find-images.mjs "tvůj anglický dotaz"
```

Skript vrátí `url`, `creator`, `license`, `license_version`, `source` první použitelné fotky (filtruje jen komerčně použitelné JPG/PNG/WEBP). Hodnoty zapiš do frontmatteru jako `image` a `imageCredit` (formát `Foto: {creator} (CC {LICENSE} {version}) — Openverse`).

- Když dotaz nic nevrátí, zkus obecnější (např. místo „abruzzo stone farmhouse" → „italy village house").
- Když ani tak nic, řádky `image`/`imageCredit` **vynech** — web použije generované SVG.
- Ověř, že URL končí na `.jpg/.png/.webp` a je `https://`.

### 4) Ulož soubory

- Cesta: `content/articles/YYYY-MM-DD-{a|b}-{slug}.mdx`
- Slug = lowercase, bez diakritiky, slovo-slovo (max ~60 znaků).
- Pokud už pro dnešek existuje soubor stejného typu, použij sufix: `2026-05-28-a2-...`, `2026-05-28-a3-...`
- Pak otevři `content/topics-log.json`, **přidej dvě nové entries** do pole `entries`:

```json
{
  "date": "<ISO timestamp>",
  "type": "A" | "B",
  "slug": "<slug bez .mdx>",
  "title": "<title>",
  "key_topics": ["téma 1", "téma 2", "téma 3"]
}
```

## Závěrečný report

Po dokončení vrať uživateli stručné shrnutí (max 10 řádků):

```
✓ Vytvořeno
  [A] {titulek} — {pas}/{roi}/{real}
      content/articles/{slug A}.mdx
  [B] {titulek} — {pas}/{roi}/{real}
      content/articles/{slug B}.mdx

✓ Topics-log aktualizován (+2 entries)

Pokud chceš pustit web a podívat se: `npm run dev`
```

## Edge cases

- **Nenajdeš dost čerstvých trendů** → zkus jiné WebSearch dotazy, ne výmysl. Když fakt nic, řekni to a navrhni jeden článek + jeden „backlog" s méně silným signálem.
- **Téma se kryje s posledními 90 dny** → vyhni se. Pokud máš opravdu nový úhel, můžeš jít, ale poznamenej to v reportu.
- **Datum** vždy ber dnešní (UTC → CET). Nikdy nepoužívej staré datum.

## Naplánování (volitelně pro uživatele)

Pokud chce uživatel skill spouštět automaticky, ať použije `/schedule` (Claude Code) — cron `0 5 * * *` (každý den v 5:00 CET) s promptem `Spusť skill denni-prilezitosti`.
