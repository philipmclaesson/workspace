import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { useEffect, useRef } from "react";

export const Route = createFileRoute("/paverkansmatrisen")({
  head: () => ({
    meta: [
      { title: "Påverkansmatrisen — FAVO" },
      { name: "description", content: "Interaktiv modell över beslutsfattare, intresse, minne och beteende." },
    ],
  }),
  component: PaverkansmatrisenPage,
});

type CellDef = { row: string; col: string; tag: string; title: string; cx: number; ty: number; items: string[] };

const CELLS: Record<string, CellDef> = {
  r1c1: { row: "Utvärderaren", col: "Intresse", tag: "Stimulerande", title: "Bearbetning",   cx: 460,  ty: 200, items: ["Bearbetning", "Interaktion"] },
  r1c2: { row: "Utvärderaren", col: "Minne",    tag: "Anledningar",  title: "Resonemang",    cx: 950,  ty: 200, items: ["Förståelse", "Acceptans", "Emotionell bias", "Normer", "Självbiografi", "Jämförelse", "Kunskap"] },
  r1c3: { row: "Utvärderaren", col: "Beteende", tag: "Värde",        title: "Utvärdering",   cx: 1480, ty: 200, items: ["Utvärdering", "Infosök", "Intention"] },
  r2c1: { row: "Snabbtänkaren", col: "Intresse", tag: "Nyskapande",  title: "Uppmärksamhet", cx: 460,  ty: 505, items: ["Uppmärksamhet"] },
  r2c2: { row: "Snabbtänkaren", col: "Minne",    tag: "Distinkt",    title: "Kännedom",      cx: 950,  ty: 505, items: ["Framing", "Antaganden", "Kännedom", "Problem & lösning", "Kategorisering"] },
  r2c3: { row: "Snabbtänkaren", col: "Beteende", tag: "Underlätta",  title: "Val",           cx: 1480, ty: 505, items: ["Urval", "Problem", "Tumregler", "Köp"] },
  r3c1: { row: "Känslomänniskan", col: "Intresse", tag: "Karaktär",    title: "Intuition",  cx: 460,  ty: 797, items: ["Perception", "Konceptualisering"] },
  r3c2: { row: "Känslomänniskan", col: "Minne",    tag: "Känslor",     title: "Motivation", cx: 950,  ty: 797, items: ["Emotionell reaktion", "Relationer", "Social status", "Självuppfattning", "Associationer"] },
  r3c3: { row: "Känslomänniskan", col: "Beteende", tag: "Drivkrafter", title: "Begär",      cx: 1480, ty: 797, items: ["Gillande", "Familjaritet", "Behov", "Känslosök"] },
};
const CELL_RECTS = [
  { id: "r1c1", x: 260, y: 156 }, { id: "r1c2", x: 710, y: 156 }, { id: "r1c3", x: 1240, y: 156 },
  { id: "r2c1", x: 260, y: 460 }, { id: "r2c2", x: 710, y: 460 }, { id: "r2c3", x: 1240, y: 460 },
  { id: "r3c1", x: 260, y: 752 }, { id: "r3c2", x: 710, y: 752 }, { id: "r3c3", x: 1240, y: 752 },
];
const CELL_W: Record<string, number> = { c1: 400, c2: 480, c3: 480 };
const CELL_H: Record<string, number> = { r1: 274, r2: 262, r3: 248 };

type WordDef = { x: number; y: number; a: string; t: string; item: string; cell: string; ul?: [number, number]; small?: boolean };
const WORDS: WordDef[] = [
  { x: 600, y: 295, a: "end", t: "Interaktion", item: "Interaktion", cell: "r1c1", ul: [476, 600] },
  { x: 600, y: 350, a: "end", t: "Bearbetning", item: "Bearbetning", cell: "r1c1" },
  { x: 752, y: 322, a: "start", t: "Förståelse",      item: "Förståelse",      cell: "r1c2" },
  { x: 752, y: 350, a: "start", t: "Acceptans",       item: "Acceptans",       cell: "r1c2" },
  { x: 752, y: 378, a: "start", t: "Emotionell bias", item: "Emotionell bias", cell: "r1c2" },
  { x: 1140, y: 295, a: "end", t: "Normer",        item: "Normer",        cell: "r1c2" },
  { x: 1140, y: 322, a: "end", t: "Självbiografi", item: "Självbiografi", cell: "r1c2" },
  { x: 1140, y: 350, a: "end", t: "Jämförelse",    item: "Jämförelse",    cell: "r1c2" },
  { x: 1140, y: 378, a: "end", t: "Kunskap",       item: "Kunskap",       cell: "r1c2" },
  { x: 1260, y: 350, a: "start", t: "Utvärdering", item: "Utvärdering", cell: "r1c3" },
  { x: 1600, y: 295, a: "end", t: "Infosök",   item: "Infosök",   cell: "r1c3", ul: [1505, 1600] },
  { x: 1604, y: 400, a: "end", t: "Intention", item: "Intention", cell: "r1c3" },
  { x: 600, y: 600, a: "end", t: "Uppmärksamhet", item: "Uppmärksamhet", cell: "r2c1" },
  { x: 758, y: 600, a: "start", t: "Framing", item: "Framing", cell: "r2c2" },
  { x: 1140, y: 566, a: "end", t: "Antaganden",        item: "Antaganden",        cell: "r2c2" },
  { x: 1140, y: 600, a: "end", t: "Kännedom",          item: "Kännedom",          cell: "r2c2" },
  { x: 1140, y: 624, a: "end", t: "Problem & lösning", item: "Problem & lösning", cell: "r2c2", small: true },
  { x: 1140, y: 658, a: "end", t: "Kategorisering",    item: "Kategorisering",    cell: "r2c2" },
  { x: 1260, y: 585, a: "start", t: "Urval",     item: "Urval",     cell: "r2c3" },
  { x: 1380, y: 585, a: "start", t: "Tumregler", item: "Tumregler", cell: "r2c3" },
  { x: 1385, y: 612, a: "start", t: "Vana",        item: "Tumregler", cell: "r2c3", small: true },
  { x: 1385, y: 634, a: "start", t: "Attribut",    item: "Tumregler", cell: "r2c3", small: true },
  { x: 1385, y: 656, a: "start", t: "Normativt",   item: "Tumregler", cell: "r2c3", small: true },
  { x: 1385, y: 678, a: "start", t: "Igenkänning", item: "Tumregler", cell: "r2c3", small: true },
  { x: 1385, y: 700, a: "start", t: "Billigast",   item: "Tumregler", cell: "r2c3", small: true },
  { x: 1260, y: 658, a: "start", t: "Problem", item: "Problem", cell: "r2c3" },
  { x: 1582, y: 658, a: "middle", t: "Köp", item: "Köp", cell: "r2c3", ul: [1550, 1614] },
  { x: 600, y: 852, a: "end", t: "Konceptualisering", item: "Konceptualisering", cell: "r3c1" },
  { x: 386, y: 945, a: "start", t: "Perception", item: "Perception", cell: "r3c1" },
  { x: 730, y: 852, a: "start", t: "Emotionell", item: "Emotionell reaktion", cell: "r3c2" },
  { x: 730, y: 884, a: "start", t: "Reaktion",   item: "Emotionell reaktion", cell: "r3c2" },
  { x: 1140, y: 852, a: "end", t: "Relationer",       item: "Relationer",       cell: "r3c2" },
  { x: 1140, y: 884, a: "end", t: "Social status",    item: "Social status",    cell: "r3c2" },
  { x: 1140, y: 916, a: "end", t: "Självuppfattning", item: "Självuppfattning", cell: "r3c2" },
  { x: 1140, y: 948, a: "end", t: "Associationer",    item: "Associationer",    cell: "r3c2" },
  { x: 1588, y: 852, a: "end", t: "Gillande",     item: "Gillande",     cell: "r3c3" },
  { x: 1588, y: 884, a: "end", t: "Familjaritet", item: "Familjaritet", cell: "r3c3" },
  { x: 1588, y: 916, a: "end", t: "Behov",        item: "Behov",        cell: "r3c3" },
  { x: 1650, y: 948, a: "end", t: "Känslosök",    item: "Känslosök",    cell: "r3c3", ul: [1500, 1650] },
];

const LINES = [
  "M608 350 H707", "M616 338 V316", "M616 280 V132", "M616 585 V370",
  "M608 600 H707", "M616 855 V618", "M616 868 H707", "M508 945 H616 V896",
  "M865 350 H947",
  "M1145 295 H1155 M1145 322 H1155 M1145 350 H1155 M1145 378 H1155 M1155 295 V378",
  "M1155 350 H1237",
  "M840 578 V412", "M861 600 H947",
  "M1145 566 H1155 M1145 600 H1155 M1145 658 H1155 M1155 566 V658",
  "M1155 658 H1237",
  "M857 852 H939",
  "M1145 852 H1155 M1145 884 H1155 M1145 916 H1155 M1145 948 H1155 M1155 852 V948",
  "M1155 852 H1448",
  "M1412 350 H1560", "M1490 350 V321", "M1545 312 V326", "M1560 350 V374",
  "M1585 274 V132", "M1604 412 V624",
  "M1300 564 V370", "M1300 637 V607", "M1338 585 H1360", "M1522 585 H1560 V624",
  "M1620 658 H1690",
  "M1593 852 H1604 M1593 884 H1604 M1593 916 H1604 M1604 916 V690",
  "M1510 916 H1300 V679", "M1656 948 H1690",
];
const HEADS: [number, number, string][] = [
  [716, 350, "r"], [616, 312, "u"], [616, 128, "u"], [616, 366, "u"],
  [716, 600, "r"], [616, 614, "u"], [716, 868, "r"], [616, 892, "u"],
  [956, 350, "r"], [1246, 350, "r"],
  [840, 408, "u"], [956, 600, "r"], [1246, 658, "r"],
  [948, 852, "r"], [1457, 852, "r"],
  [1490, 317, "u"], [1545, 330, "d"], [1560, 378, "d"], [1585, 128, "u"], [1604, 628, "d"],
  [1300, 366, "u"], [1300, 603, "u"], [1369, 585, "r"], [1560, 628, "d"], [1699, 658, "r"],
  [1604, 686, "u"], [1300, 675, "u"], [1699, 948, "r"],
];
const DOTLINES = ["M290 312 V893", "M734 284 V556", "M748 829 V836", "M748 894 V918"];
const DOTS: [number, number, string][] = [
  [290, 300, "#4ec07a"], [290, 590, "#f5d76e"], [290, 905, "#f1a7b0"],
  [734, 272, "#4ec07a"], [734, 568, "#f5d76e"],
  [748, 822, "#cc3a1e"], [748, 928, "#cc3a1e"],
];
const MARKERS: { x: number; y: number; t: string; a?: string }[] = [
  { x: 304, y: 304, t: "Högt" },  { x: 304, y: 320, t: "intresse" },
  { x: 304, y: 594, t: "Lågt" },  { x: 304, y: 610, t: "intresse" },
  { x: 304, y: 902, t: "Inget" }, { x: 304, y: 918, t: "intresse" },
  { x: 748, y: 276, t: "Högt" },  { x: 748, y: 292, t: "engagemang" },
  { x: 748, y: 560, t: "Lågt" },  { x: 748, y: 576, t: "engagemang" },
  { x: 748, y: 806, t: "Stark", a: "middle" }, { x: 748, y: 946, t: "Svag", a: "middle" },
];
const COL_BADGES = [
  { id: "Intresse", cx: 460,  w: 118, ang: -2.5 },
  { id: "Minne",    cx: 950,  w: 88,  ang: 1.8 },
  { id: "Beteende", cx: 1480, w: 118, ang: -2 },
];
const ROW_BADGES = [
  { id: "Utvärderaren",    y: 210, w: 160, ang: -2,   meta: ["Tankar", "Långsam", "Mycket energi"] },
  { id: "Snabbtänkaren",   y: 514, w: 170, ang: 1.6,  meta: ["Tankar", "Snabb", "Lite energi"] },
  { id: "Känslomänniskan", y: 806, w: 192, ang: -2.4, meta: ["Känslor", "Snabb", "Omedveten"] },
];
const CHEVRONS_R: [number, number][] = [[668, 237], [668, 542], [668, 834], [1198, 237], [1198, 542], [1198, 834]];
const CHEVRONS_V = [
  { cx: 460, gap: 1, dir: "u" }, { cx: 950, gap: 1, dir: "u" }, { cx: 1480, gap: 1, dir: "d" },
  { cx: 460, gap: 2, dir: "u" }, { cx: 950, gap: 2, dir: "u" }, { cx: 1480, gap: 2, dir: "u" },
];
const SUBS: Record<string, string[]> = {
  "Tumregler": ["Vana", "Attribut", "Normativt", "Igenkänning", "Billigast"],
  "Kännedom": ["Problem & lösning"],
};

function PaverkansmatrisenPage() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const panelRef = useRef<HTMLElement | null>(null);
  const panelLabelRef = useRef<HTMLDivElement | null>(null);
  const panelTitleRef = useRef<HTMLHeadingElement | null>(null);
  const panelExtraRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const svg = svgRef.current;
    const panel = panelRef.current;
    if (!svg || !panel) return;
    svg.innerHTML = "";

    const NS = "http://www.w3.org/2000/svg";
    const el = (tag: string, attrs: Record<string, string | number>, cls?: string) => {
      const e = document.createElementNS(NS, tag);
      for (const k in attrs) e.setAttribute(k, String(attrs[k]));
      if (cls) e.setAttribute("class", cls);
      return e;
    };
    const headPath = (x: number, y: number, d: string) =>
      d === "u" ? `M${x - 7} ${y + 9} L${x} ${y} L${x + 7} ${y + 9}` :
      d === "d" ? `M${x - 7} ${y - 9} L${x} ${y} L${x + 7} ${y - 9}` :
                  `M${x - 9} ${y - 7} L${x} ${y} L${x - 9} ${y + 7}`;
    const vchevPath = (c: { cx: number; gap: number; dir: string }) => {
      const top = c.gap === 1 ? 428 : 720;
      const bot = c.gap === 1 ? 462 : 754;
      return c.dir === "u"
        ? `M${c.cx - 24} ${bot} L${c.cx + 24} ${bot} L${c.cx} ${top} Z`
        : `M${c.cx - 24} ${top} L${c.cx + 24} ${top} L${c.cx} ${bot} Z`;
    };

    let activeG: Element | null = null;
    function openPanel(g: Element, label: string, title: string, chips: string[] | null, chipLabel: string) {
      if (activeG) activeG.classList.remove("is-active");
      activeG = g; g.classList.add("is-active");
      if (panelLabelRef.current) panelLabelRef.current.textContent = label;
      if (panelTitleRef.current) panelTitleRef.current.textContent = title;
      const ex = panelExtraRef.current;
      if (ex) {
        ex.innerHTML = "";
        if (chips && chips.length) {
          ex.innerHTML = '<div class="pm-panel-sublabel">' + chipLabel + '</div><div class="pm-panel-chips">'
            + chips.map(s => '<span class="pm-panel-chip">' + s + '</span>').join("") + "</div>";
        }
      }
      panel!.classList.add("is-open");
      panel!.setAttribute("aria-hidden", "false");
    }
    const closePanel = () => {
      panel.classList.remove("is-open");
      panel.setAttribute("aria-hidden", "true");
      if (activeG) { activeG.classList.remove("is-active"); activeG = null; }
    };
    const closeBtn = closeRef.current;
    closeBtn?.addEventListener("click", closePanel);

    const hit = (g: Element, fn: () => void) => {
      g.setAttribute("tabindex", "0"); g.setAttribute("role", "button");
      g.classList.add("pm-hit");
      g.addEventListener("click", fn);
      g.addEventListener("keydown", (e) => {
        const ke = e as KeyboardEvent;
        if (ke.key === "Enter" || ke.key === " ") { ke.preventDefault(); fn(); }
      });
    };

    // Celler + skuggor
    CELL_RECTS.forEach(c => {
      const w = CELL_W[c.id.slice(2)], h = CELL_H[c.id.slice(0, 2)];
      svg.appendChild(el("rect", { x: c.x + 5, y: c.y + 5, width: w, height: h, rx: 14, fill: "#1a1a1a" }));
      svg.appendChild(el("rect", { x: c.x, y: c.y, width: w, height: h, rx: 14, fill: "#fffdf6", stroke: "#1a1a1a", "stroke-width": 2.5 }));
    });

    // Vinjettpilar (höger + upp/ner) + stora utgångspilen — svarta
    CHEVRONS_R.forEach(([x, y]) => svg.appendChild(el("path", { d: `M${x} ${y - 24} L${x + 34} ${y} L${x} ${y + 24} Z`, fill: "#1a1a1a" })));
    CHEVRONS_V.forEach(c => svg.appendChild(el("path", { d: vchevPath(c), fill: "#1a1a1a" })));
    svg.appendChild(el("path", { d: "M1724 506 L1786 542 L1724 578 Z", fill: "#1a1a1a" }));

    // Badge-byggare
    function addBadge(cx: number, cy: number, w: number, ang: number, label: string, onPick: (g: Element) => void) {
      const g = el("g", { transform: `rotate(${ang} ${cx} ${cy})` });
      const x = cx - w / 2, y = cy - 17;
      g.appendChild(el("rect", { x: x + 3.5, y: y + 3.5, width: w, height: 34, rx: 10 }, "pm-badge-shadow"));
      g.appendChild(el("rect", { x, y, width: w, height: 34, rx: 10 }, "pm-badge-rect"));
      const t = el("text", { x: cx, y: cy + 5, "text-anchor": "middle" }, "pm-badge-text");
      t.textContent = label; g.appendChild(t);
      hit(g, () => onPick(g));
      svg!.appendChild(g);
    }

    // Kolumnetiketter
    COL_BADGES.forEach(b => {
      addBadge(b.cx, 121, b.w, b.ang, b.id, g =>
        openPanel(g, "Steg i påverkan", b.id, CELL_RECTS.filter(c => CELLS[c.id].col === b.id).map(c => CELLS[c.id].title), "Delar"));
    });

    // Radetiketter + meta
    ROW_BADGES.forEach(b => {
      addBadge(24 + b.w / 2, b.y - 12, b.w, b.ang, b.id, g =>
        openPanel(g, "Beslutsfattare", b.id, CELL_RECTS.filter(c => CELLS[c.id].row === b.id).map(c => CELLS[c.id].title), "Delar"));
      b.meta.forEach((m, i) => {
        const mt = el("text", { x: 24, y: b.y + 36 + i * 22 }, "pm-meta");
        const x = document.createElementNS(NS, "tspan"); x.setAttribute("fill", "#cc3a1e"); x.textContent = "× ";
        mt.appendChild(x); mt.appendChild(document.createTextNode(m));
        svg.appendChild(mt);
      });
    });

    // Stimuli
    const stim = el("g", {});
    stim.appendChild(el("polygon", { points: "190,928 318,928 336,950 318,972 190,972 208,950" }, "pm-stimuli"));
    const stimT = el("text", { x: 254, y: 958, "text-anchor": "middle" }, "pm-stimuli-text");
    stimT.textContent = "Stimuli"; stim.appendChild(stimT);
    hit(stim, () => openPanel(stim, "Ingång i modellen", "Stimuli", null, ""));
    svg.appendChild(stim);

    // Prickade nivålinjer + prickar + markörer
    DOTLINES.forEach(d => svg.appendChild(el("path", { d, stroke: "#cc3a1e", "stroke-width": 3, "stroke-linecap": "round", "stroke-dasharray": "0.1 9", fill: "none" })));
    DOTS.forEach(([x, y, c]) => svg.appendChild(el("circle", { cx: x, cy: y, r: 5, fill: c, stroke: "#1a1a1a", "stroke-width": 1.5 })));
    MARKERS.forEach(m => {
      const t = el("text", { x: m.x, y: m.y, "text-anchor": m.a || "start" }, "pm-marker");
      t.textContent = m.t; svg.appendChild(t);
    });

    // Pilar
    LINES.forEach(d => svg.appendChild(el("path", { d }, "pm-line")));
    HEADS.forEach(([x, y, dir]) => svg.appendChild(el("path", { d: headPath(x, y, dir) }, "pm-line")));

    // Cellrubriker
    Object.entries(CELLS).forEach(([, c]) => {
      const g = el("g", {});
      g.appendChild(el("rect", { x: c.cx - 160, y: c.ty - 18, width: 320, height: 62, fill: "transparent", "pointer-events": "all" }));
      const tag = el("text", { x: c.cx, y: c.ty, "text-anchor": "middle" }, "pm-tag"); tag.textContent = c.tag; g.appendChild(tag);
      const ti = el("text", { x: c.cx, y: c.ty + 38, "text-anchor": "middle" }, "pm-title"); ti.textContent = c.title; g.appendChild(ti);
      hit(g, () => openPanel(g, c.row + " × " + c.col, c.title, c.items, "Delar"));
      svg.appendChild(g);
    });

    // Begrepp
    WORDS.forEach(w => {
      const g = el("g", {});
      const t = el("text", { x: w.x, y: w.y, "text-anchor": w.a }, w.small ? "pm-word-sm" : "pm-word");
      t.textContent = w.t; g.appendChild(t);
      if (w.ul) g.appendChild(el("line", { x1: w.ul[0], x2: w.ul[1], y1: w.y + 9, y2: w.y + 9 }, "pm-ul"));
      const c = CELLS[w.cell];
      hit(g, () => openPanel(g, c.title + " · " + c.row + " × " + c.col, w.item, SUBS[w.item] || null, "Innehåller"));
      svg.appendChild(g);
    });

    return () => {
      closeBtn?.removeEventListener("click", closePanel);
      svg.innerHTML = "";
    };
  }, []);

  return (
    <main className="pm-root">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;500;700;900&family=Bebas+Neue&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
      <style>{css}</style>

      {/* Header — identisk med /workspace */}
      <header className="ws-header">
        <a href="/landing" className="ws-logo" aria-label="FAVO">
          <img src="/__l5e/assets-v1/592bf185-1cf0-4683-9f8b-f26fb63cc764/favo-wordmark-green.png" alt="FAVO" className="ws-logo-img" />
        </a>
        <nav className="ws-nav">
          <a href="/">Bracket</a>
          <a href="/workspace">Workspace</a>
          <a href="/ekosystem">Ekosystem</a>
          <a href="/brand-position">Brand Radar</a>
          <a href="/paverkansmatrisen" className="ws-nav-active">Påverkansmatrisen</a>
          <a href="#login" className="ws-nav-login">Login</a>
        </nav>
      </header>

      <section className="pm-stage" aria-label="Påverkansmatrisen">
        <svg ref={svgRef} viewBox="-7 44 1820 1016" className="pm-svg" role="img" aria-label="Påverkansmatrisen" />
      </section>

      <aside className="pm-panel" ref={panelRef as React.RefObject<HTMLElement>} aria-hidden="true">
        <header className="pm-panel-head">
          <div>
            <div className="pm-panel-label" ref={panelLabelRef} />
            <h2 className="pm-panel-title" ref={panelTitleRef} />
          </div>
          <button type="button" className="pm-panel-close" ref={closeRef} aria-label="Stäng">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </header>
        <div className="pm-panel-body">
          <div ref={panelExtraRef} />
          <p className="pm-panel-placeholder">
            Beskrivning kommer här — i nästa steg kopplar vi innehåll, exempel
            och taktiker till varje del av modellen.
          </p>
        </div>
      </aside>
    </main>
  );
}

const css = `
.pm-root {
  --cream: #f5f1e8; --ink: #1a1a1a; --coral: #cc3a1e; --green: #4ec07a;
  --teal: #3f8f81; --blue: #2255cc; --lilac: #b6a8e8; --yellow: #f5d76e;
  --pink: #f1a7b0; --paper: #fffdf6;
  background: var(--cream); color: var(--ink);
  height: 100vh; width: 100%; overflow: hidden;
  font-family: 'Barlow Condensed', sans-serif;
  display: flex; flex-direction: column;
  padding: 0 clamp(20px, 4vw, 48px);
}
.pm-root * { box-sizing: border-box; margin: 0; }

.ws-header { display: flex; align-items: center; justify-content: space-between; padding: 22px 0 10px; }
.ws-logo { display: inline-flex; align-items: center; text-decoration: none; line-height: 0; padding-bottom: 12px; color: var(--ink); }
.ws-logo-img { height: clamp(26px, 3.2vw, 38px); width: auto; display: block; }
.ws-nav { display: flex; gap: clamp(14px, 2vw, 24px); align-items: center; }
.ws-nav a { font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; font-size: 14px; color: var(--coral); text-decoration: none; }
.ws-nav a:hover { color: var(--ink); }
.ws-nav-active { color: var(--ink) !important; text-decoration: underline; text-underline-offset: 4px; }
.ws-nav-login { padding: 6px 14px; border: 2px solid var(--ink); border-radius: 999px; color: var(--ink) !important; background: var(--cream); box-shadow: 3px 3px 0 var(--ink); }

.pm-stage {
  flex: 1; min-height: 0;
  display: flex; align-items: center; justify-content: center;
  background-image: radial-gradient(rgba(26,26,26,0.13) 1.5px, transparent 1.5px);
  background-size: 26px 26px;
  border-radius: 14px;
  margin-bottom: 14px;
}
.pm-svg { width: 100%; height: 100%; }

.pm-badge-shadow { fill: var(--ink); }
.pm-badge-rect { fill: var(--yellow); stroke: var(--ink); stroke-width: 2.5; transition: fill 0.12s ease; }
.pm-badge-text { fill: var(--ink); font-family: 'Space Mono', monospace; font-weight: 700; font-size: 14px; letter-spacing: 0.14em; text-transform: uppercase; transition: fill 0.12s ease; }
.pm-meta { font-family: 'Space Mono', monospace; font-size: 12.5px; letter-spacing: 0.06em; text-transform: uppercase; fill: var(--ink); opacity: 0.8; }
.pm-tag { font-family: 'Space Mono', monospace; font-weight: 700; font-size: 13px; letter-spacing: 0.22em; text-transform: uppercase; fill: var(--yellow); }
.pm-title { font-family: 'Bebas Neue', sans-serif; font-size: 36px; letter-spacing: 0.03em; fill: var(--ink); }
.pm-word { font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 21px; letter-spacing: 0.04em; text-transform: uppercase; fill: var(--green); }
.pm-word-sm { font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 14px; letter-spacing: 0.05em; text-transform: uppercase; fill: var(--green); }
.pm-ul { stroke: var(--green); stroke-width: 2.5; }
.pm-line { stroke: var(--ink); stroke-width: 2.5; fill: none; stroke-linecap: round; stroke-linejoin: round; }
.pm-marker { font-family: 'Space Mono', monospace; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; fill: var(--ink); opacity: 0.75; }
.pm-stimuli { fill: var(--coral); transition: fill 0.12s ease; }
.pm-stimuli-text { fill: var(--cream); font-family: 'Bebas Neue', sans-serif; font-size: 24px; letter-spacing: 0.08em; }

.pm-hit { cursor: pointer; outline: none; }
.pm-hit text { transition: fill 0.12s ease; }
.pm-hit:hover .pm-word, .pm-hit.is-active .pm-word,
.pm-hit:hover .pm-word-sm, .pm-hit.is-active .pm-word-sm,
.pm-hit:hover .pm-title, .pm-hit.is-active .pm-title { fill: var(--coral); }
.pm-hit:hover .pm-badge-rect, .pm-hit.is-active .pm-badge-rect { fill: var(--coral); }
.pm-hit:hover .pm-badge-text, .pm-hit.is-active .pm-badge-text { fill: var(--cream); }
.pm-hit:hover .pm-stimuli, .pm-hit.is-active .pm-stimuli { fill: var(--ink); }

.pm-panel {
  position: fixed; top: 96px; right: clamp(20px, 4vw, 48px);
  width: min(380px, 92vw); max-height: calc(100vh - 140px);
  background: var(--cream);
  border: 2px solid var(--ink); border-radius: 14px;
  box-shadow: 4px 4px 0 var(--ink);
  display: flex; flex-direction: column;
  z-index: 6;
  transform: translateX(calc(100% + 60px));
  opacity: 0; pointer-events: none;
  transition: transform 0.22s ease, opacity 0.18s ease;
}
.pm-panel.is-open { transform: translateX(0); opacity: 1; pointer-events: auto; }
@media (prefers-reduced-motion: reduce) { .pm-panel { transition: none; } }
.pm-panel-head { display: flex; align-items: flex-start; justify-content: space-between; padding: 16px 18px 12px; border-bottom: 2px solid var(--ink); }
.pm-panel-label { font-family: 'Space Mono', monospace; font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--coral); }
.pm-panel-title { font-family: 'Bebas Neue', sans-serif; font-size: 28px; line-height: 1; margin: 4px 0 0; letter-spacing: 0.02em; }
.pm-panel-close {
  width: 26px; height: 26px; display: grid; place-items: center;
  border: 2px solid var(--ink); border-radius: 999px;
  background: var(--cream); color: var(--ink); cursor: pointer;
  box-shadow: 2px 2px 0 var(--ink); flex: 0 0 auto;
}
.pm-panel-close:hover { background: var(--ink); color: var(--cream); }
.pm-panel-body { padding: 16px 18px; overflow-y: auto; }
.pm-panel-sublabel { font-family: 'Space Mono', monospace; font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; opacity: 0.6; margin-bottom: 8px; }
.pm-panel-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px; }
.pm-panel-chip {
  padding: 4px 10px; border: 1.5px solid var(--ink); border-radius: 999px;
  background: var(--paper);
  font-family: 'Barlow Condensed', sans-serif; font-weight: 700;
  font-size: 12px; letter-spacing: 0.05em; text-transform: uppercase;
}
.pm-panel-placeholder { font-size: 15px; line-height: 1.45; opacity: 0.7; border-left: 3px solid var(--yellow); padding-left: 10px; }

@media (max-width: 880px) {
  .pm-root { height: auto; overflow: visible; }
  .pm-svg { height: auto; }
  .pm-panel { top: auto; bottom: 16px; right: 16px; left: 16px; width: auto; max-height: 60vh; }
}
`;