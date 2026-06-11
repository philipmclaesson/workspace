import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { FavoFooter } from "@/components/FavoFooter";

export const Route = createFileRoute("/ekosystem")({
  component: EkosystemPage,
});

const INK = "#1a1a1a";
const CREAM = "#f5f1e8";

type Edges = [number, number, number, number];

function piecePath(x0: number, y0: number, w: number, h: number, edges: Edges, R = 14): string {
  const K = 0.30;
  const maps: { len: number; fn: (t: number, n: number) => [number, number] }[] = [
    { len: w, fn: (t, n) => [x0 + t, y0 - n] },
    { len: h, fn: (t, n) => [x0 + w + n, y0 + t] },
    { len: w, fn: (t, n) => [x0 + w - t, y0 + h + n] },
    { len: h, fn: (t, n) => [x0 - n, y0 + h - t] },
  ];
  const r = (v: number) => Math.round(v * 10) / 10;
  const pt = ([px, py]: [number, number]) => `${r(px)} ${r(py)}`;

  let d = `M ${pt(maps[0].fn(R, 0))}`;
  edges.forEach((tab, i) => {
    const { len, fn } = maps[i];
    const k = Math.min(len, 110) * K * tab;
    const segs: number[][] =
      tab === 0
        ? [[0, len - R, 0]]
        : [
            [0, 0.40 * len, 0],
            [1, 0.26 * len, k, 0.74 * len, k, 0.60 * len, 0],
            [0, len - R, 0],
          ];
    segs.forEach((s) => {
      if (s[0] === 0) {
        d += ` L ${pt(fn(s[1], s[2]))}`;
      } else {
        d += ` C ${pt(fn(s[1], s[2]))} ${pt(fn(s[3], s[4]))} ${pt(fn(s[5], s[6]))}`;
      }
    });
    const next = maps[(i + 1) % 4];
    d += ` Q ${pt(fn(len, 0))} ${pt(next.fn(R, 0))}`;
  });
  return d + " Z";
}

type PuzzlePieceNodeProps = {
  tag?: string;
  title?: string;
  body?: string;
  fill?: string;
  edges?: Edges;
};

function PuzzlePieceNode({
  tag = "KOPPLING",
  title = "Synapsen",
  body = "Presynaps → klyfta → postsynaps.",
  fill = "#b6a8e8",
  edges = [1, 1, 0, -1],
}: PuzzlePieceNodeProps) {
  const W = 170, H = 170;
  const PAD = 46;
  const d = piecePath(PAD, PAD, W, H, edges);
  const cx = PAD + W / 2;
  const pillW = tag.length * 7.6 + 22;

  return (
    <svg
      viewBox={`0 0 ${W + PAD * 2} ${H + PAD * 2}`}
      width={W + PAD * 2}
      role="img"
      aria-label={`${tag}: ${title}`}
      style={{ display: "block", overflow: "visible" }}
    >
      <path d={d} transform="translate(4 4)" fill={INK} />
      <path d={d} fill={fill} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <g>
        <rect x={cx - pillW / 2} y={PAD + 42} width={pillW} height={20} rx="10" fill={CREAM} stroke={INK} strokeWidth="1.5" />
        <text x={cx} y={PAD + 56} textAnchor="middle" fontFamily="'Space Mono', monospace" fontSize="10" letterSpacing="0.18em" fill={INK}>{tag}</text>
      </g>
      <text x={cx} y={PAD + 100} textAnchor="middle" fontFamily="'Bebas Neue', sans-serif" fontSize="27" letterSpacing="0.02em" fill={INK}>{title.toUpperCase()}</text>
      <text x={cx} y={PAD + 124} textAnchor="middle" fontFamily="'Barlow Condensed', sans-serif" fontSize="13" fill={INK} opacity={0.75}>{body}</text>
    </svg>
  );
}

function PuzzleCluster() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", position: "relative" }}>
      <div style={{ position: "absolute", left: 248, top: -16, transform: "rotate(14deg)", zIndex: 1 }}>
        <PuzzlePieceNode tag="STRUKTUR" title="Amygdala" body="Rädsla & emotionellt minne." fill="#f1a7b0" edges={[1, 0, -1, -1]} />
      </div>
      <div style={{ marginBottom: -52 }}>
        <PuzzlePieceNode tag="MINNE" title="LTP" body="Långtidspotentiering i hippocampus." fill="#f5d76e" edges={[1, 1, -1, 0]} />
      </div>
      <div style={{ display: "flex", alignItems: "center" }}>
        <PuzzlePieceNode tag="SIGNAL" title="Glutamat" body="Excitatorisk signalsubstans." fill="#a4d9a8" edges={[1, 1, 0, 0]} />
        <PuzzlePieceNode />
      </div>
    </div>
  );
}

function EkosystemPage() {
  return (
    <main className="ek-root">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;500;700;900&family=Bebas+Neue&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
      <style>{css}</style>

      <header className="ek-header">
        <a href="/landing" className="ek-logo" aria-label="FAVO">
          <img
            src="/__l5e/assets-v1/592bf185-1cf0-4683-9f8b-f26fb63cc764/favo-wordmark-green.png"
            alt="FAVO"
            className="ek-logo-img"
          />
        </a>
        <nav className="ek-nav">
          <a href="/">Bracket</a>
          <a href="/workspace">Workspace</a>
          <a href="/ekosystem" className="ek-nav-active">Ekosystem</a>
          <a href="/brand-position">Brand Radar</a>
          <a href="#login" className="ek-nav-login">Login</a>
        </nav>
      </header>

      <div className="ek-canvas">
        <div className="ek-grid" aria-hidden="true" />
        <div className="ek-hero">
          <h1 className="ek-title">
            BUILD BETTER
            <br />
            <span className="accent">MARCH MADNESS</span>
            <br />
            PREDICTIONS
          </h1>
          <p className="ek-sub">
            Create your perfect bracket, join groups with friends, and compete
            for bracket supremacy!
          </p>
        </div>
        <div className="ek-puzzle-wrap">
          <PuzzleCluster />
        </div>
      </div>

      <div className="ek-footer-bleed">
        <FavoFooter />
      </div>
    </main>
  );
}

const css = `
.ek-root {
  --cream: #f5f1e8;
  --ink: #1a1a1a;
  --coral: #cc3a1e;
  background: var(--cream);
  color: var(--ink);
  min-height: 100vh;
  width: 100%;
  font-family: 'Barlow Condensed', sans-serif;
  display: flex;
  flex-direction: column;
  padding: 0 clamp(20px, 4vw, 48px);
}
.ek-root * { box-sizing: border-box; }
.ek-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 22px 0 10px;
}
.ek-logo {
  display: inline-flex; align-items: center; text-decoration: none;
  line-height: 0; padding-bottom: 12px;
}
.ek-logo-img {
  height: clamp(26px, 3.2vw, 38px);
  width: auto; display: block;
}
.ek-nav { display: flex; gap: clamp(14px, 2vw, 24px); align-items: center; }
.ek-nav a {
  font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
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
  position: relative;
  flex: 1;
  min-height: calc(100vh - 120px);
  margin-bottom: 24px;
  overflow: hidden;
  background: var(--cream);
}
.ek-footer-bleed {
  margin: 0 calc(clamp(20px, 4vw, 48px) * -1);
}
.ek-grid {
  position: absolute; inset: 0;
  background-image: radial-gradient(rgba(26,26,26,0.22) 1.2px, transparent 1.2px);
  background-size: 22px 22px;
  background-position: 0 0;
  pointer-events: none;
}
.ek-puzzle-wrap {
  position: absolute;
  top: 50%; right: clamp(24px, 6vw, 96px);
  transform: translateY(-50%);
}
.ek-hero {
  position: absolute;
  top: calc(50% - 230px);
  left: clamp(24px, 5vw, 72px);
  max-width: 52%;
  display: flex;
  flex-direction: column;
  gap: clamp(14px, 2vh, 24px);
}
.ek-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(44px, 8vw, 120px);
  line-height: 0.86;
  letter-spacing: 0.005em;
  margin: 0;
  color: var(--ink);
}
.ek-title .accent { color: var(--coral); }
.ek-sub {
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 500;
  font-size: clamp(16px, 1.5vw, 20px);
  line-height: 1.4;
  color: #3a3a3a;
  max-width: 50ch;
  margin: 0;
}
`;
