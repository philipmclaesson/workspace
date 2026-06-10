## Mål

Återskapa "Bracket / March Madness Predictions"-sidan från den bifogade skärmbilden, men byt ut den ursprungliga visuella stilen mot temat från sidan `Marknadsstrategi` i projektet [Opter Motion Replica](/projects/e1c5fc6f-24ef-4cc8-b4d5-7dee85118129). Behåll de mjuka, rundade kanterna från den uppladdade `Interaktiv hjärna`-HTML-filen så att resultatet kombinerar Oatly-tonen med en mjukare, mer organisk känsla.

## Visuell referens — vad som lånas

**Från Marknadsstrategi (tema):**
- Bakgrund: cream `#f5f1e8`
- Typsnitt: `Bebas Neue` (stora rubriker), `Barlow Condensed` (UI/knappar/nav), `Space Mono` (små etiketter, taggar, UPPERCASE)
- Färgaccenter: korall/röd `#cc3a1e`, mörk `#1a1a1a`, blå `#2255cc`, grön `#226633`
- Kortmönster: färgblock med svart 2px-ram + offset svart skugga (`4px 4px 0 #1a1a1a`)
- Små "tag"-knappar med Space Mono, versaler, 1px ram i accentfärg
- Header: röd nav i Barlow Condensed (matchar Marknadsstrategi-overrides)

**Från `Interaktiv hjärna`-HTML (mjuka kanter):**
- Generös `border-radius` på alla kort, knappar, video- och tag-element (≈ 14–22px på kort, full pill på knappar)
- Mjuka rundade hörn även på svart offset-skugga
- En sekundär accentfärg i teal `#3f8f81` / `#2f8576` från HTML-temat används för delar av "Dual Scoring"-grafiken så referensen syns

## Sidstruktur (matchar skärmdumpen)

1. **Header** — logotyp "BRACKET" i Bebas Neue grönt (`#226633`) över cream bakgrund, högerjusterad nav i röd Barlow Condensed.
2. **Hero**
   - Stor rubrik "BUILD BETTER MARCH MADNESS PREDICTIONS" i Bebas Neue, "MARCH MADNESS" som accent i korall/röd.
   - Underrubrik i Barlow Condensed: "Create your perfect bracket, join groups with friends, and compete for bracket supremacy!"
   - Två CTA-knappar (mjuka pill-former med svart 2px ram + offset skugga):
     - Primär grön "⚡ SIGN UP"
     - Sekundär vit "✓ LOGIN"
3. **"EXCLUSIVE DUAL SCORING SYSTEM"-sektion** — cream-kort med rundade hörn, svart ram, offset skugga; rubrik i Bebas Neue, beskrivning i Barlow Condensed, två kolumner som visar de två poängsystemen (en med korall accent, en med teal `#3f8f81`).
4. **Feature-grid (3 kort)** — Marknadsstrategi-stil "modul"-kort med rundade hörn:
   - "ADVANCED ANALYTICS" (mörkt kort, vit text, korall taggar)
   - "GROUP COMPETITIONS" (grönt kort)
   - "LIVE PREDICTIONS" (cream-kort med teal accent från HTML-temat)
   Varje kort har Space Mono-etikett + tag-knapp i footern, precis som Marknadsstrategi-modulerna.
5. **Footer** — minimal, Space Mono uppercase, cream bakgrund.

## Teknisk implementation

- Ny route: `src/routes/bracket.tsx` (eller ersätt `src/routes/index.tsx` om användaren vill ha det som startsida — bekräftas vid behov; default = ny route + uppdaterad startsida som länkar dit).
- Ny komponent: `src/components/bracket/BracketLandingPage.tsx`, fristående med lokalt `<style>`-block efter samma mönster som `MarknadsstrategiPage` — scopar typografi och kort-CSS utan att påverka resten av appen.
- Google Fonts laddas i komponenten: Bebas Neue, Barlow Condensed, Space Mono (samma set som Marknadsstrategi).
- All CSS skriven inline i en `moduleCss`-konstant; alla `border-radius` höjda till mjuka värden (`18px` kort, `999px` knappar/taggar).
- Inga backend-anrop, inga nya beroenden. Knapparna är icke-funktionella (samma som referensen).
- Ikoner: enkla inline SVG (blixt, check, pil) — inga nya bibliotek.

## Avgränsningar

- Bara denna landningssida byggs; inga andra delar av appen ändras utöver eventuell länk i navigationen.
- Inga assets kopieras från Opter-projektet — temat återskapas via CSS-tokens.
- Inga riktiga bracket-data, formulär eller auth — rent visuell sida.
