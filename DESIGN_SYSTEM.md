# Design System

**Lekfullt & varmt.** Grön energi, varm gul, tegelröd accent mot en gräddvit bakgrund,
karaktärsfull display-typografi och ett prickrutnät som påminner om ett gammalt ritblock.

Detta dokument är riktningen — de faktiska värdena bor som kod i `src/styles.css`
(färger i oklch, vilket projektet kräver). Använd alltid tokens i komponenter, aldrig
hårdkodade hex/oklch-värden.

> **Så här använder du detta med AI (Claude Code / Codex):** peka agenten mot den här filen.
> *"Följ DESIGN_SYSTEM.md. Använd tokens (bg-primary, text-foreground osv.), aldrig hårdkodade
> färger. Rubriker i font-display, brödtext i font-sans. Respektera knapphierarkin och
> 'max en framträdande per vy'-regeln."* Det håller Lovable, Claude Code och Codex på samma linje.

---

## 1. Färger

Definieras som CSS-variabler i `styles.css` och nås via Tailwind-klasser (`bg-primary`,
`text-highlight` osv.).

| Roll | Token | HEX | oklch | Används till |
|------|-------|-----|-------|--------------|
| Primary | `primary` | `#4ec07a` | `0.725 0.146 153.561` | Sidans huvudhandling, primärknappar, fokusringar |
| Secondary | `secondary` | `#f5d76e` | `0.884 0.129 93.666` | Sekundära knappar, badges, mjuka framhävningar |
| Highlight | `highlight` | `#cc3a1e` | `0.564 0.187 32.819` | **Avsiktlig** accent: aktiv länk/flik, viktig tagg, blickfång |
| Bakgrund | `background` | `#f5f1e8` | `0.959 0.013 86.83` | Sidans grundyta |
| Text | `foreground` | (varm mörk) | `0.27 0.03 70` | All brödtext och rubriker |

### Textfärg på färgade ytor (kontrollerad för kontrast)

Grönt och gult är ljusa färger — vit text faller under godkänd kontrast på dem.

- På **grön** (`primary`) -> MÖRK text: `text-primary-foreground`
- På **gul** (`secondary`) -> MÖRK text: `text-secondary-foreground`
- På **tegelröd** (`highlight`) -> VIT text: `text-highlight-foreground`

### Neutraler

Neutralerna (border, muted, accent-hover, card) är *varma* — de delar bakgrundens ton
(hue ~70-86) så ytan känns sammanhållen. Använd aldrig kyliga blågrå neutraler.

### Viktig regel: `highlight` vs `accent`

- `accent` = subtil, varm hover-yta (shadcn använder den internt för t.ex. ghost-hover). Håll den lugn.
- `highlight` (tegelröd) = din egen accent för att medvetet dra blicken. Använd sparsamt.

Tegelrödan fick en **egen token** just för att den inte skulle kapa shadcns hover-färg.

---

## 2. Typografi

Tre typsnitt, tre tydliga roller. Laddas via `<link>` i `src/routes/__root.tsx`
(inte via `@import` i CSS — lightningcss stödjer inte externa @import-URL:er i detta bygge).

| Roll | Typsnitt | Klass | Regel |
|------|----------|-------|-------|
| Rubriker / stora titlar | **Bebas Neue** | `font-display` (auto på h1-h4) | Hög och smal. Lyser i stor grad. Vikt 400. |
| Brödtext / nav / knappar | **Barlow Condensed** | `font-sans` (default på body) | Allt löpande innehåll. |
| Etiketter / taggar | **Space Mono** | `font-mono uppercase tracking-wider` | VERSALER, små. Sparsamt, för detalj. |

Exempel på en etikett/tagg:

```jsx
<span className="font-mono uppercase tracking-wider text-xs text-highlight">
  Nyhet
</span>
```

---

## 3. Form

- **Hörnradie:** `--radius: 0.625rem` (~10px) — lätt rundat. Vänligt utan att bli barnsligt.
- Håll en konsekvent radie inom samma vy. Undantaget är `cta`-knappen (se nedan), som
  medvetet är helt rund för att bryta av.

---

## 4. Bakgrund: prickrutnät

Sidans signaturbakgrund — påminner om ett gammalt ritblock, kärnan i den lekfulla identiteten.
Använd klassen på sidans yttersta ytelement. **Aldrig inline `radial-gradient`.**

| Klass | Styrka | Används till |
|-------|--------|--------------|
| `.bg-dot-grid` | Subtil (opacitet 0.12) | Standard på de flesta sidor |
| `.bg-dot-grid-strong` | Tydligare (0.22) | Sidor som tål mer struktur (fristående klass, fungerar ensam) |

Prickfärg, storlek och avstånd styrs av `--dot-grid-*` i `:root`. Ändra på ett ställe ->
ändras överallt. Prickfärgen är knuten till `--foreground` så den alltid matchar den varma paletten.

> **Undantag — canvas-ytor:** sidor med ett *zoombart* rutnät (Miro-liknande, t.ex. `workspace.tsx`)
> använder INTE dessa klasser. Där måste prickarna skala med zoom-nivån, vilket kräver en
> egen, dynamisk lösning. Lämna deras rutnät orört.

---

## 5. Knappar

Komponenten finns i `src/components/ui/button.tsx`. Två avsiktliga knapptyper plus stödvarianter.

### Knapphierarki

| Variant | Form & känsla | Används till |
|---------|---------------|--------------|
| `default` | Kantig, lätt rundad (grön). Ekar sidans modul/cell-formspråk. | Handlingar *inom* gränssnittet — tabeller, kort, formulär. Arbetshästen. |
| `cta` | Rund pill, hård förskjuten skugga, fysisk hover/active-rörelse. | Sidans primära call-to-action. Bryter medvetet mot modulrutnätet för att dra blicken. |
| `secondary` | Gul, dämpad. | Näst viktigaste handling. |
| `outline` | Kant istället för fyllning. | Lågmäld handling. |
| `ghost` | Minimal, ingen fyllning. | Tät UI, ikonknappar. |
| `link` | Ser ut som en länk. | Textlänk-handlingar. |
| `destructive` | Röd. | Endast radera/farligt. |

Storlekar: `sm`, `default`, `lg`, `icon`.

> **OBS — kod att uppdatera:** shadcns standardvarianter (`default`, `secondary`,
> `destructive`, `outline`, `ghost`) levereras med inbyggt färg-hover (t.ex.
> `hover:bg-primary/90`). Dessa ska bytas ut mot en liten rörelse enligt regeln nedan,
> så att hela sajten följer samma hover-språk. Tills det är gjort avviker dessa varianter
> från systemet.

### Regler

- **Max en framträdande knapp per vy.** En tydlig primär (grön `default`) eller *en* `cta`.
  Den starka knappen tappar sin kraft om den är överallt.
- **Hover ändrar aldrig färg — den signaleras med rörelse.** Alla knappar behåller sin
  färg helt oförändrad vid hover. Interaktivitet visas i stället genom en liten fysisk
  rörelse (lyft/förskjutning, eventuellt med skugga), samma hover-språk för hela sajten.
  Ingen knapp mörknar, ljusnar eller byter färg vid hover. (`cta`-knappen följer redan
  detta — dess hover är en rörelse + skugga.)
- **Rörelse respekterar `prefers-reduced-motion`.** Använd `motion-safe:` på själva
  förflyttningen, så att den spärras för användare som valt bort rörelse.
- `cta`-varianten är byggd med tokens (`bg-primary`, `text-primary-foreground`,
  skugga i `var(--foreground)`), inte hårdkodade färger.
- `cta`-rörelsen respekterar `prefers-reduced-motion` (`motion-safe:`) — själva
  förflyttningen spärras för användare som valt bort rörelse, medan skugga och färg
  finns kvar.

---

## Genomgående princip

De starka elementen — grön primärknapp, `cta`-knappen, `highlight`-färgen — ska vara
**sällsynta** för att behålla sin kraft. Max en framträdande av varje per vy. Lugna,
varma neutraler bär resten.

---

## Att städa vidare (känd drift)

Enskilda sidor (t.ex. `ekosystem.tsx`) har fortfarande lokala, hårdkodade färger
(`--cream`, `--ink`, `--coral`) i egna `css`-block. De matchar paletten men kringgår
systemet. Nästa naturliga uppstädning: byt dem mot `var(--background)`, `var(--foreground)`,
`var(--highlight)` så att alla sidor följer tokens.
