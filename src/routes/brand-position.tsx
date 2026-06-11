import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/brand-position")({
  head: () => ({
    meta: [
      { title: "Brand Radar — Varumärkesposition" },
      { name: "description", content: "Jämför vilka attribut ditt varumärke associeras med mot en konkurrent och hitta vit yta att positionera dig i." },
    ],
  }),
  component: BrandPositionPage,
});

// ---------------------------------------------------------------
// Attribut — samma sex id:n som i edge-funktionen brand-radar
// ---------------------------------------------------------------
type AttrId = "prestige" | "modern" | "inspirerande" | "personal" | "forskning" | "prisvard";
type Scores = Record<AttrId, number>;

const ATTRIBUTES: { id: AttrId; label: string[] }[] = [
  { id: "prestige",     label: ["Prestige"] },
  { id: "modern",       label: ["Modern &", "innovativ"] },
  { id: "inspirerande", label: ["Inspirerande"] },
  { id: "personal",     label: ["Kunnig", "personal"] },
  { id: "forskning",    label: ["Forsknings-", "orienterad"] },
  { id: "prisvard",     label: ["Prisvärd"] },
];

const DEMO_YOU:  Scores = { prestige: 88, modern: 55, inspirerande: 82, personal: 70, forskning: 60, prisvard: 62 };
const DEMO_COMP: Scores = { prestige: 70, modern: 60, inspirerande: 68, personal: 58, forskning: 55, prisvard: 65 };

type BrandResult = { brand: string; scores: Scores; sourceCount: number; summary: string };
type SideState = { loading: boolean; error: string | null; result: BrandResult | null };
const idleSide = (): SideState => ({ loading: false, error: null, result: null });

// ---------------------------------------------------------------
// Radar-diagram (SVG) i FAVO-stil
// ---------------------------------------------------------------
type RadarDatum = { label: string[]; value: number };

function RadarChart({ data, stroke, fill }: { data: RadarDatum[]; stroke: string; fill: string }) {
  const W = 420, H = 360;
  const cx = W / 2, cy = H / 2 + 4;
  const R = 112;
  const n = data.length;

  const angle = (i: number) => (-90 + (360 / n) * i) * (Math.PI / 180);
  const pt = (i: number, r: number) => ({
    x: cx + Math.cos(angle(i)) * r,
    y: cy + Math.sin(angle(i)) * r,
  });

  const polygon = data.map((d, i) => {
    const p = pt(i, (d.value / 100) * R);
    return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
  }).join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Radardiagram över varumärkesattribut">
      {/* Koncentriska prickade ringar — ekar prickrastret i workspace */}
      {[0.25, 0.5, 0.75, 1].map(f => (
        <circle key={f} cx={cx} cy={cy} r={R * f} fill="none"
          stroke="rgba(26,26,26,0.35)" strokeWidth="1" strokeDasharray="1.5 5" strokeLinecap="round" />
      ))}
      {/* Axlar */}
      {data.map((_, i) => {
        const p = pt(i, R);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(26,26,26,0.14)" strokeWidth="1" />;
      })}
      {/* Datapolygon */}
      <polygon className="bp-poly" points={polygon} fill={fill} fillOpacity="0.32" stroke={stroke} strokeWidth="2.5" strokeLinejoin="round" />
      {/* Vertex-noder + värden */}
      {data.map((d, i) => {
        const p = pt(i, (d.value / 100) * R);
        const out = pt(i, (d.value / 100) * R + 17);
        return (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4.5" fill={stroke} stroke="#1a1a1a" strokeWidth="1.4" />
            <text x={out.x} y={out.y + 4} textAnchor="middle"
              fontFamily="'Space Mono', monospace" fontSize="12" fontWeight="700" fill="#1a1a1a">
              {d.value}%
            </text>
          </g>
        );
      })}
      {/* Attributetiketter */}
      {data.map((d, i) => {
        const a = angle(i);
        const cos = Math.cos(a), sin = Math.sin(a);
        const p = pt(i, R + 26);
        const anchor = cos > 0.35 ? "start" : cos < -0.35 ? "end" : "middle";
        const baseY = p.y + (sin > 0.35 ? 12 : sin < -0.35 ? -4 : 4);
        return (
          <text key={`l${i}`} x={p.x} y={baseY} textAnchor={anchor}
            fontFamily="'Barlow Condensed', sans-serif" fontSize="15" fontWeight="700"
            letterSpacing="0.04em" fill="#1a1a1a" style={{ textTransform: "uppercase" }}>
            {d.label.map((line, j) => (
              <tspan key={j} x={p.x} dy={j === 0 ? 0 : 15}>{line}</tspan>
            ))}
          </text>
        );
      })}
    </svg>
  );
}

// ---------------------------------------------------------------
// Kort för ett varumärke (delas av båda sidorna)
// ---------------------------------------------------------------
function BrandCard({ tag, tagClass, title, side, demoScores, stroke }: {
  tag: string; tagClass: string; title: string;
  side: SideState; demoScores: Scores; stroke: string;
}) {
  const live = side.result;
  const scores = live ? live.scores : demoScores;
  const data = ATTRIBUTES.map(a => ({ label: a.label, value: scores[a.id] }));

  return (
    <article className="bp-card">
      {live
        ? <span className="bp-demo-badge is-live">Live</span>
        : <span className="bp-demo-badge" title="Demodata tills analysmotorn kopplas in">Demodata</span>}
      <header className="bp-card-head">
        <span className={`bp-card-tag ${tagClass}`}>{tag}</span>
        <h2 className="bp-card-title">{live ? live.brand : title}</h2>
      </header>
      <div className="bp-chart">
        {side.loading ? (
          <div className="bp-loading" role="status">
            <span>Söker källor</span>
            <span className="bp-loading-dots" aria-hidden="true"><i /><i /><i /></span>
          </div>
        ) : side.error ? (
          <p className="bp-error">{side.error}</p>
        ) : (
          <RadarChart data={data} stroke={stroke} fill={stroke} />
        )}
      </div>
      {live?.summary && !side.loading && <p className="bp-card-summary">{live.summary}</p>}
      <footer className="bp-card-foot">
        <span>Styrka i association enligt webbkällor (0–100)</span>
        <span className="bp-base">
          {live ? `BAS: ${live.sourceCount} KÄLLOR` : "BAS: DEMODATA"}
        </span>
      </footer>
    </article>
  );
}

// ---------------------------------------------------------------
// Sidan
// ---------------------------------------------------------------
function BrandPositionPage() {
  const [brandInput, setBrandInput] = useState("");
  const [compInput, setCompInput] = useState("");
  const [hint, setHint] = useState<string | null>(null);
  const [you, setYou] = useState<SideState>(idleSide());
  const [comp, setComp] = useState<SideState>(idleSide());
  const busy = you.loading || comp.loading;

  const analyzeBrand = async (brand: string, setSide: React.Dispatch<React.SetStateAction<SideState>>) => {
    setSide({ loading: true, error: null, result: null });
    try {
      const { data, error } = await supabase.functions.invoke("brand-radar", { body: { brand } });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      setSide({ loading: false, error: null, result: data as BrandResult });
    } catch (e) {
      setSide({
        loading: false,
        result: null,
        error: e instanceof Error ? e.message : "Analysen misslyckades. Försök igen.",
      });
    }
  };

  const runAnalysis = () => {
    const b = brandInput.trim();
    const c = compInput.trim();
    if (!b || !c) {
      setHint("Fyll i båda varumärkena för att kunna jämföra.");
      return;
    }
    setHint(null);
    // Kör båda parallellt — varje analys tar ca 20–60 sekunder
    void analyzeBrand(b, setYou);
    void analyzeBrand(c, setComp);
  };
  const onKey = (e: React.KeyboardEvent) => { if (e.key === "Enter" && !busy) runAnalysis(); };

  const isLiveComparison = !!(you.result && comp.result);
  const deltas = useMemo(() => {
    const yScores = you.result?.scores ?? DEMO_YOU;
    const cScores = comp.result?.scores ?? DEMO_COMP;
    return ATTRIBUTES
      .map(a => ({ id: a.id, label: a.label.join(" ").replace("- ", ""), delta: yScores[a.id] - cScores[a.id] }))
      .sort((a, b) => b.delta - a.delta);
  }, [you.result, comp.result]);

  return (
    <main className="bp-root">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;500;700;900&family=Bebas+Neue&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
      <style>{css}</style>

      {/* Header — identisk position och markup som /workspace */}
      <header className="ws-header">
        <a href="/landing" className="ws-logo" aria-label="FAVO">
          <img src="/__l5e/assets-v1/592bf185-1cf0-4683-9f8b-f26fb63cc764/favo-wordmark-green.png" alt="FAVO" className="ws-logo-img" />
        </a>
        <nav className="ws-nav">
          <a href="/">Bracket</a>
          <a href="/workspace">Workspace</a>
          <a href="/ekosystem">Ekosystem</a>
          <a href="/brand-position" className="ws-nav-active">Brand Radar</a>
          <a href="#login" className="ws-nav-login">Login</a>
        </nav>
      </header>

      {/* Hero */}
      <section className="bp-hero">
        <div className="bp-eyebrow">Brand Radar</div>
        <h1 className="bp-title">Varumärkesposition</h1>
        <p className="bp-sub">
          Vilka attribut associeras ditt varumärke med — och var finns den vita ytan
          som konkurrenterna ännu inte äger?
        </p>
      </section>

      {/* Kontroller */}
      <section className="bp-controls" aria-label="Välj varumärken att jämföra">
        <div className="bp-field">
          <label className="bp-field-label" htmlFor="bp-brand">Ditt varumärke</label>
          <input id="bp-brand" className="bp-input" type="text" placeholder="t.ex. FAVO"
            value={brandInput} onChange={e => setBrandInput(e.target.value)} onKeyDown={onKey} disabled={busy} />
        </div>
        <div className="bp-vs" aria-hidden="true">VS</div>
        <div className="bp-field">
          <label className="bp-field-label" htmlFor="bp-comp">Konkurrent</label>
          <input id="bp-comp" className="bp-input" type="text" placeholder="t.ex. Konkurrent AB"
            value={compInput} onChange={e => setCompInput(e.target.value)} onKeyDown={onKey} disabled={busy} />
        </div>
        <button type="button" className="bp-run" onClick={runAnalysis} disabled={busy}>
          {busy ? "Analyserar…" : <>Analysera <span aria-hidden="true">→</span></>}
        </button>
        {hint && <p className="bp-hint">{hint}</p>}
      </section>

      {/* Två radar-kort sida vid sida */}
      <section className="bp-grid">
        <BrandCard tag="Ditt varumärke" tagClass="bp-tag-you" title="Ditt varumärke"
          side={you} demoScores={DEMO_YOU} stroke="#cc3a1e" />
        <BrandCard tag="Konkurrent" tagClass="bp-tag-comp" title="Konkurrent 1"
          side={comp} demoScores={DEMO_COMP} stroke="#2255cc" />
      </section>

      {/* Differentiering */}
      <section className="bp-diff">
        <div className="bp-diff-head">
          <span className="bp-diff-tag">
            {isLiveComparison ? "Differentiering · Live" : "Differentiering · Demodata"}
          </span>
          <h3 className="bp-diff-title">Var äger du associationen?</h3>
          <p className="bp-diff-sub">Skillnad i procentenheter mot konkurrenten. Grönt = du leder, rosa = konkurrenten leder.</p>
        </div>
        <ul className="bp-chips">
          {deltas.map(d => (
            <li key={d.id} className={`bp-chip ${d.delta >= 0 ? "is-lead" : "is-behind"}`}>
              <span className="bp-chip-delta">{d.delta >= 0 ? `+${d.delta}` : d.delta}</span>
              <span className="bp-chip-label">{d.label}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

const css = `
.bp-root {
  --cream: #f5f1e8;
  --ink: #1a1a1a;
  --coral: #cc3a1e;
  --green: #4ec07a;
  --teal: #3f8f81;
  --blue: #2255cc;
  --lilac: #b6a8e8;
  --yellow: #f5d76e;
  --pink: #f1a7b0;
  --paper: #fffdf6;
  background: var(--cream);
  color: var(--ink);
  min-height: 100vh;
  width: 100%;
  font-family: 'Barlow Condensed', sans-serif;
  display: flex;
  flex-direction: column;
  padding: 0 clamp(20px, 4vw, 48px);
}
.bp-root * { box-sizing: border-box; }

/* ---- Header: kopierad verbatim från /workspace för exakt samma position ---- */
.ws-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 22px 0 10px;
}
.ws-logo {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  line-height: 0;
  padding-bottom: 12px;
}
.ws-logo-img {
  height: clamp(26px, 3.2vw, 38px);
  width: auto;
  display: block;
}
.ws-nav { display: flex; gap: clamp(14px, 2vw, 24px); align-items: center; }
.ws-nav a {
  font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
  font-size: 14px; color: var(--coral); text-decoration: none;
}
.ws-nav a:hover { color: var(--ink); }
.ws-nav-active { color: var(--ink) !important; text-decoration: underline; text-underline-offset: 4px; }
.ws-nav-login {
  padding: 6px 14px; border: 2px solid var(--ink); border-radius: 999px;
  color: var(--ink) !important; background: var(--cream);
  box-shadow: 3px 3px 0 var(--ink);
}

/* ---- Hero ---- */
.bp-hero { padding: clamp(28px, 5vh, 56px) 0 8px; max-width: 760px; }
.bp-eyebrow {
  font-family: 'Space Mono', monospace; font-size: 11px;
  letter-spacing: 0.25em; text-transform: uppercase; color: var(--coral);
}
.bp-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(44px, 7vw, 84px);
  line-height: 0.92; letter-spacing: 0.01em;
  margin: 10px 0 12px;
}
.bp-sub {
  font-size: clamp(16px, 1.6vw, 19px); line-height: 1.4;
  max-width: 560px; margin: 0; opacity: 0.78;
}

/* ---- Kontroller ---- */
.bp-controls {
  display: flex; align-items: flex-end; gap: 16px; flex-wrap: wrap;
  margin: 28px 0 8px;
  padding: 18px 20px;
  background: var(--paper);
  border: 2px solid var(--ink); border-radius: 14px;
  box-shadow: 4px 4px 0 var(--ink);
  max-width: 880px;
}
.bp-field { display: flex; flex-direction: column; gap: 6px; flex: 1 1 220px; min-width: 200px; }
.bp-field-label {
  font-family: 'Space Mono', monospace; font-size: 10px;
  letter-spacing: 0.2em; text-transform: uppercase; color: var(--coral);
}
.bp-input {
  border: 2px solid var(--ink); border-radius: 12px;
  background: var(--cream); padding: 10px 14px;
  font-family: 'Barlow Condensed', sans-serif; font-size: 16px; font-weight: 500;
  color: var(--ink); outline: none;
  box-shadow: 2px 2px 0 var(--ink);
  transition: box-shadow 0.1s ease, transform 0.1s ease;
}
.bp-input::placeholder { color: rgba(26,26,26,0.4); }
.bp-input:focus-visible { box-shadow: 3px 3px 0 var(--ink); transform: translate(-1px,-1px); }
.bp-input:disabled { opacity: 0.5; cursor: wait; }
.bp-vs {
  align-self: center;
  width: 40px; height: 40px; flex: 0 0 auto;
  display: grid; place-items: center;
  border: 2px solid var(--ink); border-radius: 999px;
  background: var(--yellow);
  font-family: 'Space Mono', monospace; font-size: 12px; font-weight: 700;
  box-shadow: 2px 2px 0 var(--ink);
  margin-top: 18px;
}
.bp-run {
  flex: 0 0 auto;
  padding: 11px 22px;
  border: 2px solid var(--ink); border-radius: 12px;
  background: var(--green); color: #0a2a14; cursor: pointer;
  font-family: 'Barlow Condensed', sans-serif; font-weight: 700;
  font-size: 16px; letter-spacing: 0.08em; text-transform: uppercase;
  box-shadow: 3px 3px 0 var(--ink);
  transition: transform 0.1s ease, box-shadow 0.1s ease;
}
.bp-run:hover:not(:disabled) { transform: translate(-1px,-1px); box-shadow: 4px 4px 0 var(--ink); }
.bp-run:focus-visible { outline: 2px solid var(--coral); outline-offset: 3px; }
.bp-run:active:not(:disabled) { transform: translate(1px,1px); box-shadow: 1px 1px 0 var(--ink); }
.bp-run:disabled { opacity: 0.55; cursor: wait; }
.bp-hint {
  flex-basis: 100%; margin: 0;
  font-family: 'Space Mono', monospace; font-size: 11px;
  letter-spacing: 0.08em; color: var(--coral);
}

/* ---- Radar-kort ---- */
.bp-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: clamp(16px, 2.5vw, 28px);
  margin: 28px 0 12px;
}
.bp-card {
  position: relative;
  background: var(--paper);
  border: 2px solid var(--ink); border-radius: 14px;
  box-shadow: 4px 4px 0 var(--ink);
  padding: 20px 22px 14px;
  display: flex; flex-direction: column;
}
.bp-demo-badge {
  position: absolute; top: -12px; right: 18px;
  padding: 4px 10px;
  background: var(--yellow);
  border: 2px solid var(--ink); border-radius: 4px;
  box-shadow: 2px 2px 0 var(--ink);
  font-family: 'Space Mono', monospace; font-size: 9px;
  letter-spacing: 0.18em; text-transform: uppercase;
  transform: rotate(2deg);
}
.bp-demo-badge.is-live { background: var(--green); color: #0a2a14; }
.bp-card-head { margin-bottom: 4px; }
.bp-card-tag {
  font-family: 'Space Mono', monospace; font-size: 10px;
  letter-spacing: 0.22em; text-transform: uppercase;
}
.bp-tag-you { color: var(--coral); }
.bp-tag-comp { color: var(--blue); }
.bp-card-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(26px, 3vw, 34px); line-height: 1;
  margin: 4px 0 0; letter-spacing: 0.02em;
}
.bp-chart {
  flex: 1;
  margin: 6px -6px 4px;
  background-image: radial-gradient(rgba(26,26,26,0.07) 1.2px, transparent 1.2px);
  background-size: 22px 22px;
  border-radius: 10px;
  min-height: 280px;
  display: flex; align-items: center; justify-content: center;
}
.bp-chart svg { display: block; }
.bp-poly { animation: bp-pop 0.45s ease both; transform-origin: center; }
@keyframes bp-pop {
  from { opacity: 0; transform: scale(0.92); }
  to   { opacity: 1; transform: scale(1); }
}
@media (prefers-reduced-motion: reduce) {
  .bp-poly { animation: none; }
  .bp-loading-dots i { animation: none !important; }
}
.bp-loading {
  display: flex; align-items: center; gap: 10px;
  font-family: 'Space Mono', monospace; font-size: 12px;
  letter-spacing: 0.2em; text-transform: uppercase;
}
.bp-loading-dots { display: inline-flex; gap: 5px; }
.bp-loading-dots i {
  width: 7px; height: 7px; border-radius: 999px;
  background: var(--ink); display: inline-block;
  animation: bp-blink 1.1s infinite ease-in-out;
}
.bp-loading-dots i:nth-child(2) { animation-delay: 0.18s; }
.bp-loading-dots i:nth-child(3) { animation-delay: 0.36s; }
@keyframes bp-blink {
  0%, 70%, 100% { opacity: 0.25; transform: translateY(0); }
  35% { opacity: 1; transform: translateY(-3px); }
}
.bp-error {
  font-family: 'Space Mono', monospace; font-size: 12px;
  color: var(--coral); padding: 16px; text-align: center; max-width: 320px;
}
.bp-card-summary {
  margin: 0 0 8px; font-size: 14px; line-height: 1.4; opacity: 0.85;
  border-left: 3px solid var(--yellow); padding-left: 10px;
}
.bp-card-foot {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  border-top: 1px solid rgba(26,26,26,0.18);
  padding-top: 10px; margin-top: 4px;
  font-size: 13px; opacity: 0.75;
}
.bp-base {
  font-family: 'Space Mono', monospace; font-size: 10px;
  letter-spacing: 0.15em; white-space: nowrap; opacity: 1;
}

/* ---- Differentiering ---- */
.bp-diff {
  margin: 20px 0 56px;
  padding: 20px 22px;
  border: 2px solid var(--ink); border-radius: 14px;
  background: var(--cream);
  box-shadow: 4px 4px 0 var(--ink);
}
.bp-diff-tag {
  font-family: 'Space Mono', monospace; font-size: 10px;
  letter-spacing: 0.22em; text-transform: uppercase; color: var(--coral);
}
.bp-diff-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(24px, 2.6vw, 32px); line-height: 1;
  margin: 4px 0 4px; letter-spacing: 0.02em;
}
.bp-diff-sub { margin: 0 0 14px; font-size: 14px; opacity: 0.7; max-width: 520px; }
.bp-chips { list-style: none; display: flex; flex-wrap: wrap; gap: 10px; padding: 0; margin: 0; }
.bp-chip {
  display: inline-flex; align-items: center; gap: 10px;
  padding: 8px 14px;
  border: 2px solid var(--ink); border-radius: 999px;
  box-shadow: 2px 2px 0 var(--ink);
  font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; font-size: 14px;
}
.bp-chip.is-lead { background: var(--green); color: #0a2a14; }
.bp-chip.is-behind { background: var(--pink); color: var(--ink); }
.bp-chip-delta {
  font-family: 'Space Mono', monospace; font-size: 12px; font-weight: 700;
  font-variant-numeric: tabular-nums;
}

/* ---- Responsivt ---- */
@media (max-width: 880px) {
  .bp-grid { grid-template-columns: 1fr; }
  .bp-vs { display: none; }
  .bp-run { width: 100%; }
}
`;