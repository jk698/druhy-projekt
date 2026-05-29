# Business příležitosti — denní výběr

Lokální Next.js web. Každý den **1× typ A** (na míru profilu) + **1× typ B** (světové trendy přenositelné do ČR).

## Spuštění

```bash
npm install
npm run dev
```

Otevři http://localhost:3000

## Generování dvojice článků

Tlačítko **„Vygenerovat další dvojici"** v pravém horním rohu výpisu zavolá Claude API a přidá nový pár (jeden A + jeden B). Vyžaduje API klíč.

```bash
# .env.local v rootu projektu
ANTHROPIC_API_KEY=sk-ant-...
```

Pak restartni dev server. Klíč si vygeneruj na <https://console.anthropic.com>.

## Zabezpečená sekce `/admin`

Pokyny pro generování (společné podmínky, TYP A, TYP B) a tvrdé limity se upravují
přes přihlášenou sekci na `/admin`. Změny se ukládají do
`content/generation-config.json` a použijí se u dalšího generování (ruční tlačítko
i ranní běh skillu). Soubor je v `.gitignore`, takže pokyny nejdou do repozitáře.

Nastav heslo do `.env.local` a restartuj server:

```bash
ANTHROPIC_API_KEY=sk-ant-...
ADMIN_PASSWORD=zvol-si-silne-heslo
```

Bez `ADMIN_PASSWORD` se do `/admin` nedá přihlásit. Když config soubor neexistuje,
použijí se defaulty z [lib/generation-config.ts](lib/generation-config.ts).

## Struktura

```
app/
  page.tsx                 # výpis článků
  clanky/[slug]/page.tsx   # detail článku
  api/hero/[slug]/         # generovaný SVG hero
  rss.xml/                 # RSS feed
components/                # UI (karta, filtry, deep dive, save, score)
content/
  articles/                # MDX soubory: YYYY-MM-DD-{a|b}-slug.mdx
  topics-log.json          # rejstřík témat (anti-duplicita)
lib/                       # parser článků, typy, SVG generátor
```

## Nový článek (formát MDX frontmatteru)

```yaml
---
title: "..."
hook: "Dva řádky úderného popisku."
type: A          # nebo B
date: 2026-05-28
tags: ["nemovitosti", "Itálie"]
scores:
  pasivita: 5
  navratnost: 7
  realisticnost: 8
trend: "Krátké 'why now' s konkrétním signálem."
---
```

V těle MDX můžeš použít komponentu `<DeepDive>...</DeepDive>` pro rozkliknutelnou hlubokou analýzu.

## Co dál

- Až bude design OK → deploy na Vercel
- Po deployi → nastavit `/schedule` v Claude Code na 05:00 daily,
  který vygeneruje dva články, commitne je a Vercel přebuilduje
