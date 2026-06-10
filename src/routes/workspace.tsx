import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { useEffect, useRef, useState } from "react";

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

type WsNode = {
  id: string;
  x: number;
  y: number;
  kind: string;
  title: string;
  body: string;
  variant: "a" | "b" | "c" | "d" | "e";
};

const INITIAL_NODES: WsNode[] = [
  { id: "n1", x: 80, y: 120, kind: "NEURON", title: "Aktionspotential", body: "Na⁺ in, K⁺ ut. Tröskel ≈ −55 mV.", variant: "a" },
  { id: "n2", x: 480, y: 280, kind: "SYSTEM", title: "Limbiska systemet", body: "Amygdala, hippocampus, hypothalamus.", variant: "b" },
  { id: "n3", x: 880, y: 100, kind: "TRANSMITTOR", title: "Dopamin", body: "Belöning, motivation, motorik.", variant: "c" },
  { id: "n4", x: 140, y: 480, kind: "ANTECKNING", title: "Synaps", body: "Pre → klyfta → post. Vesiklar släpper signalsubstans.", variant: "d" },
  { id: "n5", x: 820, y: 460, kind: "FRÅGA", title: "Plasticitet?", body: "Hur formar LTP långtidsminnet i hippocampus?", variant: "e" },
];

function WorkspacePage() {
  const [active, setActive] = useState<SectionId>("overview");
  const [zoom, setZoom] = useState(100);
  const [tool, setTool] = useState<string>("select");
  const [pan, setPan] = useState({ x: 40, y: 40 });
  const [nodes, setNodes] = useState<WsNode[]>(INITIAL_NODES);
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<
    | { type: "pan"; startX: number; startY: number; origPan: { x: number; y: number } }
    | { type: "node"; startX: number; startY: number; nodeId: string; origNode: { x: number; y: number }; scale: number }
    | null
  >(null);
  const scale = zoom / 100;
  const clampZoom = (z: number) => Math.max(25, Math.min(250, z));
  const zoomIn = () => setZoom((z) => clampZoom(z + 10));
  const zoomOut = () => setZoom((z) => clampZoom(z - 10));
  const zoomFit = () => { setZoom(100); setPan({ x: 40, y: 40 }); };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const d = dragRef.current;
      if (!d) return;
      const dx = e.clientX - d.startX;
      const dy = e.clientY - d.startY;
      if (d.type === "pan") {
        setPan({ x: d.origPan.x + dx, y: d.origPan.y + dy });
      } else {
        const id = d.nodeId;
        const s = d.scale;
        setNodes((ns) => ns.map((n) => n.id === id ? { ...n, x: d.origNode.x + dx / s, y: d.origNode.y + dy / s } : n));
      }
    };
    const onUp = () => { dragRef.current = null; document.body.style.cursor = ""; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  const onCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if (tool === "node") {
      const rect = viewportRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = (e.clientX - rect.left - pan.x) / scale - 110;
      const y = (e.clientY - rect.top - pan.y) / scale - 30;
      const id = `n${Date.now()}`;
      setNodes((ns) => [...ns, { id, x, y, kind: "NY NOD", title: "Ny nod", body: "Dubbelklicka för att redigera.", variant: "d" }]);
      setTool("select");
      return;
    }
    dragRef.current = { type: "pan", startX: e.clientX, startY: e.clientY, origPan: { ...pan } };
    document.body.style.cursor = "grabbing";
  };

  const onNodeMouseDown = (e: React.MouseEvent, id: string) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    const n = nodes.find((n) => n.id === id);
    if (!n) return;
    dragRef.current = { type: "node", startX: e.clientX, startY: e.clientY, nodeId: id, origNode: { x: n.x, y: n.y }, scale };
    document.body.style.cursor = "grabbing";
  };

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const factor = e.deltaY > 0 ? 0.92 : 1.08;
      setZoom((z) => {
        const next = clampZoom(z * factor);
        const oldScale = z / 100;
        const newScale = next / 100;
        setPan((p) => ({
          x: mx - ((mx - p.x) / oldScale) * newScale,
          y: my - ((my - p.y) / oldScale) * newScale,
        }));
        return next;
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);


  const TOOLS: { id: string; label: string; icon: React.ReactNode }[] = [
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
          <div
            ref={viewportRef}
            className={`ws-viewport ${tool === "node" ? "is-adding" : ""}`}
            onMouseDown={onCanvasMouseDown}
            onWheel={onWheel}
          >
            <div
              className="ws-grid"
              aria-hidden="true"
              style={{
                backgroundSize: `${22 * scale}px ${22 * scale}px`,
                backgroundPosition: `${pan.x}px ${pan.y}px`,
              }}
            />
            <div
              className="ws-world"
              style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})` }}
            >
              <svg className="ws-edges" aria-hidden="true" width="2000" height="1400">
                {nodes.length >= 2 && nodes.slice(1).map((n, i) => {
                  const a = nodes[0];
                  const ax = a.x + 110, ay = a.y + 40;
                  const bx = n.x + 110, by = n.y + 40;
                  const cx = (ax + bx) / 2;
                  return <path key={`e-${n.id}-${i}`} d={`M ${ax} ${ay} C ${cx} ${ay}, ${cx} ${by}, ${bx} ${by}`} className="ws-edge" />;
                })}
              </svg>
              {nodes.map((n) => (
                <article
                  key={n.id}
                  className={`ws-node ws-node-${n.variant}`}
                  style={{ left: n.x, top: n.y }}
                  onMouseDown={(e) => onNodeMouseDown(e, n.id)}
                >
                  <span className="ws-node-tag">{n.kind}</span>
                  <h3>{n.title}</h3>
                  <p>{n.body}</p>
                </article>
              ))}
            </div>
          </div>

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

          <div className="ws-zoom" role="group" aria-label="Zoom">
            <button type="button" className="ws-zoom-btn" onClick={zoomIn} aria-label="Zooma in">+</button>
            <span className="ws-zoom-val">{zoom}%</span>
            <button type="button" className="ws-zoom-btn" onClick={zoomOut} aria-label="Zooma ut">−</button>
            <button type="button" className="ws-zoom-fit" onClick={zoomFit}>FIT</button>
          </div>
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
  position: relative;
  display: block;
  padding: 0;
  flex: 1;
  min-height: 0;
}

.ws-sidebar {
  position: absolute;
  top: 24px;
  left: 24px;
  width: 280px;
  z-index: 4;
  background: var(--cream);
  border: 2px solid var(--ink);
  border-radius: 14px;
  box-shadow: 4px 4px 0 var(--ink);
  padding: 22px 18px;
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
  background: transparent;
  overflow: hidden;
  min-height: calc(100vh - 140px);
  padding: 28px 0 28px calc(280px + 24px + 72px);
}
.ws-viewport {
  position: absolute; inset: 0;
  overflow: hidden;
  cursor: grab;
  user-select: none;
}
.ws-viewport.is-adding { cursor: crosshair; }
.ws-grid {
  position: absolute; inset: 0;
  background-image: radial-gradient(rgba(26,26,26,0.22) 1.2px, transparent 1.2px);
  pointer-events: none;
}
.ws-world {
  position: absolute;
  left: 0; top: 0;
  width: 1px; height: 1px;
  transform-origin: 0 0;
  will-change: transform;
}
.ws-canvas-head { position: relative; max-width: 560px; margin: 0 0 32px 0; }
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
  position: absolute; left: 0; top: 0;
  overflow: visible;
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
.ws-node:hover { box-shadow: 6px 6px 0 var(--ink); }
.ws-node:active { cursor: grabbing; }
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

.ws-toolbar {
  position: absolute; left: calc(24px + 280px + 16px); top: 24px;
  display: flex; flex-direction: column; gap: 6px;
  padding: 8px 6px;
  background: var(--cream); border: 2px solid var(--ink); border-radius: 14px;
  box-shadow: 4px 4px 0 var(--ink);
  z-index: 3;
}
.ws-tool {
  width: 36px; height: 36px;
  display: grid; place-items: center;
  border: 1px solid transparent; border-radius: 10px;
  background: transparent; color: var(--ink); cursor: pointer;
  transition: background 0.1s ease, color 0.1s ease;
}
.ws-tool:hover { background: rgba(26,26,26,0.08); }
.ws-tool.is-active { background: var(--ink); color: var(--cream); border-color: var(--ink); }
.ws-tool-sep { height: 1px; background: rgba(26,26,26,0.18); margin: 4px 4px; }

.ws-zoom {
  position: absolute; right: 24px; bottom: 24px;
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  padding: 10px 8px;
  background: var(--cream);
  border: 2px solid var(--ink); border-radius: 14px;
  box-shadow: 4px 4px 0 var(--ink);
  z-index: 3;
}
.ws-zoom-btn {
  width: 34px; height: 30px;
  border: 1px solid var(--ink); border-radius: 8px;
  background: var(--cream); cursor: pointer;
  font-family: 'Space Mono', monospace; font-size: 16px; line-height: 1;
  color: var(--ink);
}
.ws-zoom-btn:hover { background: var(--ink); color: var(--cream); }
.ws-zoom-val {
  font-family: 'Space Mono', monospace; font-size: 11px;
  letter-spacing: 0.1em; color: var(--ink);
}
.ws-zoom-fit {
  margin-top: 4px;
  padding: 6px 10px;
  border: 1px solid var(--ink); border-radius: 8px;
  background: var(--cream); cursor: pointer;
  font-family: 'Space Mono', monospace; font-size: 11px;
  letter-spacing: 0.15em; color: var(--ink);
}
.ws-zoom-fit:hover { background: var(--ink); color: var(--cream); }

@media (max-width: 880px) {
  .ws-sidebar { position: relative; left: auto; top: auto; width: auto; margin: 16px clamp(16px,4vw,24px) 0; }
  .ws-canvas { min-height: 560px; }
}
`;