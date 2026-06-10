import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/workspace")({
  head: () => ({
    meta: [
      { title: "Workspace — Biologisk psykologi" },
      { name: "description", content: "Workspace för anteckningar och kunskap inom biologisk psykologi." },
    ],
  }),
  component: WorkspacePage,
});

type SectionId = "overview" | "notes" | "concepts" | "neurons" | "sources" | "questions";

const SECTIONS: { id: SectionId; label: string; hint: string }[] = [
  { id: "overview", label: "Översikt", hint: "01" },
  { id: "notes", label: "Anteckningar", hint: "02" },
  { id: "concepts", label: "Begrepp", hint: "03" },
  { id: "neurons", label: "Nervsystem", hint: "04" },
  { id: "sources", label: "Källor", hint: "05" },
  { id: "questions", label: "Frågor", hint: "06" },
];

function WorkspacePage() {
  const [active, setActive] = useState<SectionId>("overview");
  const [zoom, setZoom] = useState(100);
  const [tool, setTool] = useState<string>("select");
  const zoomIn = () => setZoom((z) => Math.min(200, z + 10));
  const zoomOut = () => setZoom((z) => Math.max(30, z - 10));
  const zoomFit = () => setZoom(100);
  const TOOLS: { id: string; label: string; icon: JSX.Element }[] = [
    { id: "select", label: "Välj", icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 3l14 8-6 2-2 6-6-16z"/></svg>
    )},
    { id: "node", label: "Lägg till nod", icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/></svg>
    )},
    { id: "note", label: "Anteckning", icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 3h9l4 4v14H6z"/><path d="M15 3v5h4"/></svg>
    )},
    { id: "text", label: "Text", icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 5h14M12 5v14"/></svg>
    )},
    { id: "edge", label: "Koppling", icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="5" cy="12" r="2.5"/><circle cx="19" cy="12" r="2.5"/><path d="M7.5 12h9"/></svg>
    )},
    { id: "group", label: "Grupp", icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>
    )},
  ];
  return (
    <main className="ws-root">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;500;700;900&family=Bebas+Neue&family=Space+Mono:wght@400;700&display=swap"
        rel="stylesheet"
      />
      <style>{css}</style>

      <header className="ws-header">
        <a href="/" className="ws-logo">BRACKET</a>
        <nav className="ws-nav">
          <a href="/">Bracket</a>
          <a href="/hjarna">Hjärna</a>
          <a href="/workspace" className="ws-nav-active">Workspace</a>
          <a href="#login" className="ws-nav-login">Login</a>
        </nav>
      </header>

      <div className="ws-shell">
        <aside className="ws-sidebar">
          <div className="ws-side-label">KURS</div>
          <h2 className="ws-side-title">Biologisk<br/>Psykologi</h2>
          <ul className="ws-side-list">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  className={`ws-side-item ${active === s.id ? "is-active" : ""}`}
                  onClick={() => setActive(s.id)}
                >
                  <span className="ws-side-hint">{s.hint}</span>
                  <span className="ws-side-name">{s.label}</span>
                </button>
              </li>
            ))}
          </ul>
          <button type="button" className="ws-side-add">+ NY SEKTION</button>
        </aside>

        <section className="ws-canvas">
          <div className="ws-grid" aria-hidden="true" />

          <div className="ws-toolbar" role="toolbar" aria-label="Verktyg">
            {TOOLS.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`ws-tool ${tool === t.id ? "is-active" : ""}`}
                onClick={() => setTool(t.id)}
                title={t.label}
                aria-label={t.label}
              >
                {t.icon}
              </button>
            ))}
            <div className="ws-tool-sep" />
            <button type="button" className="ws-tool" title="Ångra" aria-label="Ångra">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 14l-5-5 5-5"/><path d="M4 9h11a5 5 0 010 10h-3"/></svg>
            </button>
            <button type="button" className="ws-tool" title="Gör om" aria-label="Gör om">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 14l5-5-5-5"/><path d="M20 9H9a5 5 0 000 10h3"/></svg>
            </button>
          </div>

          <div className="ws-canvas-head">
            <span className="ws-eyebrow">WORKSPACE · {SECTIONS.find(s => s.id === active)?.hint}</span>
            <h1 className="ws-title">{SECTIONS.find(s => s.id === active)?.label.toUpperCase()}</h1>
            <p className="ws-sub">
              Samla allt på ett ställe. Koppla ihop noder, anteckningar och
              begrepp till ett växande nätverk.
            </p>
          </div>

          <svg className="ws-edges" aria-hidden="true">
            <defs>
              <pattern id="dot" width="6" height="6" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="1" fill="#1a1a1a" opacity="0.25" />
              </pattern>
            </defs>
            <path d="M 180 220 C 320 220, 360 360, 520 360" className="ws-edge" />
            <path d="M 520 360 C 680 360, 720 220, 880 220" className="ws-edge" />
            <path d="M 520 360 C 520 480, 280 520, 220 560" className="ws-edge" />
            <path d="M 520 360 C 700 480, 820 520, 880 560" className="ws-edge" />
          </svg>

          <article className="ws-node ws-node-a" style={{ left: "6%", top: "20%" }}>
            <span className="ws-node-tag">NEURON</span>
            <h3>Aktionspotential</h3>
            <p>Na⁺ in, K⁺ ut. Tröskel ≈ −55 mV.</p>
          </article>

          <article className="ws-node ws-node-b" style={{ left: "40%", top: "40%" }}>
            <span className="ws-node-tag">SYSTEM</span>
            <h3>Limbiska systemet</h3>
            <p>Amygdala, hippocampus, hypothalamus.</p>
          </article>

          <article className="ws-node ws-node-c" style={{ left: "70%", top: "18%" }}>
            <span className="ws-node-tag">TRANSMITTOR</span>
            <h3>Dopamin</h3>
            <p>Belöning, motivation, motorik.</p>
          </article>

          <article className="ws-node ws-node-d" style={{ left: "10%", top: "62%" }}>
            <span className="ws-node-tag">ANTECKNING</span>
            <h3>Synaps</h3>
            <p>Pre → klyfta → post. Vesiklar släpper signalsubstans.</p>
          </article>

          <article className="ws-node ws-node-e" style={{ left: "68%", top: "60%" }}>
            <span className="ws-node-tag">FRÅGA</span>
            <h3>Plasticitet?</h3>
            <p>Hur formar LTP långtidsminnet i hippocampus?</p>
          </article>

          <button type="button" className="ws-add-node">+ LÄGG TILL NOD</button>
        </section>
      </div>
    </main>
  );
}

const css = `
.ws-root {
  --cream: #f5f1e8;
  --ink: #1a1a1a;
  --coral: #cc3a1e;
  --green: #226633;
  --teal: #3f8f81;
  --blue: #2255cc;
  --lilac: #b6a8e8;
  background: var(--cream);
  color: var(--ink);
  min-height: 100vh;
  width: 100%;
  font-family: 'Barlow Condensed', sans-serif;
  display: flex;
  flex-direction: column;
  padding: 0 clamp(20px, 4vw, 48px);
}
.ws-root * { box-sizing: border-box; }

.ws-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 22px 0 10px;
  border-bottom: 2px solid var(--ink);
}
.ws-logo {
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(30px, 4vw, 46px);
  letter-spacing: 0.04em;
  color: var(--green);
  text-decoration: none;
  text-shadow: 2px 2px 0 rgba(26,26,26,0.12);
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

.ws-shell {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 24px;
  padding: 24px 0 48px;
  flex: 1;
  min-height: 0;
}

.ws-sidebar {
  background: #ffffff;
  border: 2px solid var(--ink);
  border-radius: 22px;
  box-shadow: 6px 6px 0 var(--ink);
  padding: 22px 18px;
  height: fit-content;
  position: sticky;
  top: 24px;
}
.ws-side-label {
  font-family: 'Space Mono', monospace;
  font-size: 11px; letter-spacing: 0.2em; color: var(--coral);
}
.ws-side-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 34px; line-height: 0.95; margin: 6px 0 22px; letter-spacing: 0.02em;
}
.ws-side-list { list-style: none; padding: 0; margin: 0 0 18px; display: flex; flex-direction: column; gap: 8px; }
.ws-side-item {
  width: 100%;
  display: flex; align-items: center; gap: 12px;
  padding: 10px 14px;
  border: 2px solid var(--ink);
  border-radius: 14px;
  background: var(--cream);
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em;
  font-size: 15px;
  cursor: pointer;
  transition: transform 0.1s ease, box-shadow 0.1s ease, background 0.1s ease;
  box-shadow: 3px 3px 0 var(--ink);
}
.ws-side-item:hover { transform: translate(-1px,-1px); box-shadow: 4px 4px 0 var(--ink); }
.ws-side-item.is-active { background: var(--green); color: #f5f1e8; }
.ws-side-hint {
  font-family: 'Space Mono', monospace; font-size: 11px; opacity: 0.7;
}
.ws-side-add {
  width: 100%; padding: 10px; border: 2px dashed var(--ink); border-radius: 14px;
  background: transparent; cursor: pointer;
  font-family: 'Space Mono', monospace; font-size: 12px; letter-spacing: 0.15em;
}
.ws-side-add:hover { background: var(--ink); color: var(--cream); }

.ws-canvas {
  position: relative;
  background: #ffffff;
  border: 2px solid var(--ink);
  border-radius: 22px;
  box-shadow: 6px 6px 0 var(--ink);
  overflow: hidden;
  min-height: 720px;
  padding: 32px 36px;
}
.ws-grid {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(to right, rgba(26,26,26,0.07) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(26,26,26,0.07) 1px, transparent 1px);
  background-size: 32px 32px;
  pointer-events: none;
}
.ws-canvas-head { position: relative; max-width: 560px; margin-bottom: 32px; }
.ws-eyebrow {
  font-family: 'Space Mono', monospace; font-size: 11px;
  letter-spacing: 0.2em; color: var(--coral); text-transform: uppercase;
}
.ws-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(40px, 6vw, 76px);
  line-height: 0.9; margin: 6px 0 10px;
}
.ws-sub { font-size: 16px; color: #3a3a3a; max-width: 48ch; margin: 0; }

.ws-edges {
  position: absolute; inset: 0; width: 100%; height: 100%;
  pointer-events: none;
}
.ws-edge {
  fill: none; stroke: var(--ink); stroke-width: 1.5;
  stroke-dasharray: 4 5; opacity: 0.5;
}

.ws-node {
  position: absolute;
  width: 220px;
  background: var(--cream);
  border: 2px solid var(--ink);
  border-radius: 18px;
  box-shadow: 4px 4px 0 var(--ink);
  padding: 14px 16px;
  cursor: grab;
  transition: transform 0.12s ease, box-shadow 0.12s ease;
}
.ws-node:hover { transform: translate(-2px,-2px); box-shadow: 6px 6px 0 var(--ink); }
.ws-node h3 {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 22px; margin: 6px 0 4px; letter-spacing: 0.03em;
}
.ws-node p { margin: 0; font-size: 14px; color: #2a2a2a; line-height: 1.3; }
.ws-node-tag {
  display: inline-block; font-family: 'Space Mono', monospace;
  font-size: 10px; letter-spacing: 0.18em;
  padding: 3px 8px; border: 1px solid var(--ink); border-radius: 999px;
}
.ws-node-a { background: #f1e1da; }
.ws-node-a .ws-node-tag { color: var(--coral); border-color: var(--coral); }
.ws-node-b { background: var(--green); color: var(--cream); }
.ws-node-b p { color: rgba(245,241,232,0.85); }
.ws-node-b .ws-node-tag { color: var(--cream); border-color: var(--cream); }
.ws-node-c { background: #e6dffa; }
.ws-node-c .ws-node-tag { color: var(--blue); border-color: var(--blue); }
.ws-node-d { background: var(--cream); }
.ws-node-d .ws-node-tag { color: var(--teal); border-color: var(--teal); }
.ws-node-e { background: var(--ink); color: var(--cream); }
.ws-node-e p { color: rgba(245,241,232,0.8); }
.ws-node-e .ws-node-tag { color: var(--cream); border-color: var(--cream); }

.ws-add-node {
  position: absolute; right: 24px; bottom: 24px;
  display: inline-flex; align-items: center; gap: 8px;
  padding: 14px 22px;
  border: 2px solid var(--ink); border-radius: 999px;
  background: #4ec07a; color: #0a2a14;
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; font-size: 14px;
  cursor: pointer;
  box-shadow: 5px 5px 0 var(--ink);
}
.ws-add-node:hover { transform: translate(-1px,-1px); box-shadow: 6px 6px 0 var(--ink); }

@media (max-width: 880px) {
  .ws-shell { grid-template-columns: 1fr; }
  .ws-sidebar { position: static; }
  .ws-canvas { min-height: 560px; }
}
`;