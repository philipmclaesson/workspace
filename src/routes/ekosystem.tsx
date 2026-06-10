import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";

export const Route = createFileRoute("/ekosystem")({
  component: EkosystemPage,
});

type Edge = 0 | 1 | -1;

function piecePath(x: number, y: number, s: number, edges: [Edge, Edge, Edge, Edge]) {
  const k = s * 0.13;
  const c = s * 0.2;
  const half = s / 2;
  const p: string[] = [];
  p.push(`M ${x} ${y}`);
  // TOP
  const t = edges[0];
  if (t === 0) p.push(`L ${x + s} ${y}`);
  else {
    const o = -t;
    p.push(`L ${x + half - k} ${y}`);
    p.push(`C ${x + half - k} ${y + o * c * 1.7}, ${x + half + k} ${y + o * c * 1.7}, ${x + half + k} ${y}`);
    p.push(`L ${x + s} ${y}`);
  }
  // RIGHT
  const r = edges[1];
  if (r === 0) p.push(`L ${x + s} ${y + s}`);
  else {
    const o = r;
    p.push(`L ${x + s} ${y + half - k}`);
    p.push(`C ${x + s + o * c * 1.7} ${y + half - k}, ${x + s + o * c * 1.7} ${y + half + k}, ${x + s} ${y + half + k}`);
    p.push(`L ${x + s} ${y + s}`);
  }
  // BOTTOM
  const b = edges[2];
  if (b === 0) p.push(`L ${x} ${y + s}`);
  else {
    const o = b;
    p.push(`L ${x + half + k} ${y + s}`);
    p.push(`C ${x + half + k} ${y + s + o * c * 1.7}, ${x + half - k} ${y + s + o * c * 1.7}, ${x + half - k} ${y + s}`);
    p.push(`L ${x} ${y + s}`);
  }
  // LEFT
  const l = edges[3];
  if (l === 0) p.push(`L ${x} ${y}`);
  else {
    const o = -l;
    p.push(`L ${x} ${y + half + k}`);
    p.push(`C ${x + o * c * 1.7} ${y + half + k}, ${x + o * c * 1.7} ${y + half - k}, ${x} ${y + half - k}`);
    p.push(`L ${x} ${y}`);
  }
  p.push("Z");
  return p.join(" ");
}

type Piece = {
  id: string;
  x: number;
  y: number;
  s: number;
  edges: [Edge, Edge, Edge, Edge];
  color: string;
  label: string;
  rotate?: number;
};

const PIECES: Piece[] = [
  // Three connected pieces
  { id: "lilac",  x: 360, y: 300, s: 150, edges: [0, 1, 0, 0],  color: "#7a5fc7", label: "LOG" },
  { id: "yellow", x: 510, y: 300, s: 150, edges: [0, 1, 0, -1], color: "#e0b94a", label: "ERP" },
  { id: "green",  x: 660, y: 300, s: 150, edges: [0, 0, 0, -1], color: "#4a9d5f", label: "WMS" },
  // Separate piece
  { id: "pink",   x: 920, y: 320, s: 150, edges: [0, 0, 1, 0],  color: "#cc4a6a", label: "TMS", rotate: 12 },
];

function PuzzlePiece({ piece }: { piece: Piece }) {
  const d = piecePath(piece.x, piece.y, piece.s, piece.edges);
  const cx = piece.x + piece.s / 2;
  const cy = piece.y + piece.s / 2;
  const transform = piece.rotate ? `rotate(${piece.rotate} ${cx} ${cy})` : undefined;
  return (
    <g transform={transform}>
      {/* hard shadow */}
      <path d={d} fill="#1a1a1a" transform={`translate(6 6)`} />
      <path d={d} fill={piece.color} stroke="#1a1a1a" strokeWidth={2.5} strokeLinejoin="round" />
      <text
        x={cx}
        y={cy + 6}
        textAnchor="middle"
        fontFamily="'Space Mono', monospace"
        fontWeight={700}
        fontSize={18}
        fill="#1a1a1a"
        opacity={0.7}
      >
        {piece.label}
      </text>
    </g>
  );
}

function EkosystemPage() {
  return (
    <main className="ek-root">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
      <style>{css}</style>

      <header className="ek-header">
        <a href="/landing" className="ek-logo" aria-label="FAVO">
          <img
            src="/__l5e/assets-v1/ac7e7e14-74c2-45d0-91ec-e344a34cd64d/favo-logo.png"
            alt="FAVO"
            className="ek-logo-img"
          />
        </a>
        <nav className="ek-nav">
          <a href="/">Bracket</a>
          <a href="/workspace">Workspace</a>
          <a href="/ekosystem" className="ek-nav-active">Ekosystem</a>
          <a href="#login" className="ek-nav-login">Login</a>
        </nav>
      </header>

      <div className="ek-canvas">
        <div className="ek-grid" aria-hidden="true" />
        <svg
          className="ek-puzzle"
          viewBox="0 0 1280 720"
          preserveAspectRatio="xMidYMid meet"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="Ekosystem-pussel"
        >
          {PIECES.map((p) => (
            <PuzzlePiece key={p.id} piece={p} />
          ))}
        </svg>
      </div>
    </main>
  );
}

const css = `
.ek-root {
  --cream: #f5f1e8;
  --ink: #1a1a1a;
  --coral: #cc3a1e;
  position: fixed; inset: 0;
  background: var(--cream);
  color: var(--ink);
  font-family: 'Space Mono', monospace;
  overflow: hidden;
}
.ek-header {
  position: absolute; top: 0; left: 0; right: 0;
  display: flex; align-items: center; justify-content: space-between;
  padding: 22px clamp(24px, 4vw, 56px);
  z-index: 10;
}
.ek-logo-img { height: 28px; display: block; }
.ek-nav { display: flex; gap: clamp(14px, 2vw, 24px); align-items: center; }
.ek-nav a {
  font-family: 'Space Mono', monospace; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.08em;
  font-size: 14px; color: var(--coral); text-decoration: none;
}
.ek-nav a:hover { color: var(--ink); }
.ek-nav-active { color: var(--ink) !important; text-decoration: underline; text-underline-offset: 4px; }
.ek-nav-login {
  padding: 6px 14px; border: 2px solid var(--ink); border-radius: 999px;
  color: var(--ink) !important; background: var(--cream);
  box-shadow: 3px 3px 0 var(--ink);
}
.ek-canvas {
  position: absolute; inset: 0;
  padding-top: 84px;
}
.ek-grid {
  position: absolute; inset: 0;
  background-image: radial-gradient(rgba(26,26,26,0.22) 1.2px, transparent 1.2px);
  background-size: 22px 22px;
  background-position: 0 0;
  pointer-events: none;
}
.ek-puzzle {
  position: absolute; inset: 84px 0 0 0;
  width: 100%; height: calc(100% - 84px);
}
`;
