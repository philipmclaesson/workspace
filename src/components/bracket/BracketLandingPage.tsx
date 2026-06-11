import type { ReactNode } from "react";
import favoLogo from "@/assets/favo-wordmark-green.png.asset.json";

/**
 * Site logo. Swap this single constant (or replace the asset JSON file
 * at src/assets/favo-logo.png.asset.json) to change the header brand
 * across the whole site.
 */
const SITE_LOGO = {
  src: favoLogo.url,
  alt: "FAVO",
};

/**
 * Bracket — March Madness predictions landing page.
 *
 * Visual language borrowed from the "Marknadsstrategi" page in the
 * Opter Motion Replica project (Oatly-inspired: cream background,
 * Bebas Neue / Barlow Condensed / Space Mono, color-blocked modules
 * with hard 2px borders and offset shadow). Edges and corners are
 * softened with generous border-radius taken from the uploaded
 * "Interaktiv hjärna" HTML theme, and the teal accent (#3f8f81) from
 * that file is reused on one feature card so the cross-pollination
 * shows through.
 */
export function BracketLandingPage() {
  return (
    <main className="bracket-root">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;500;700;900&family=Bebas+Neue&family=Space+Mono:wght@400;700&display=swap"
        rel="stylesheet"
      />
      <style>{moduleCss}</style>

      <header className="brk-header">
        <a href="/landing" className="brk-logo" aria-label={SITE_LOGO.alt}>
          <img src={SITE_LOGO.src} alt={SITE_LOGO.alt} className="brk-logo-img" />
        </a>
        <nav className="brk-nav">
          <a href="#scoring">Scoring</a>
          <a href="#features">Features</a>
          <a href="#groups">Groups</a>
          <a href="#login" className="brk-nav-login">Login</a>
        </nav>
      </header>

      <section className="brk-hero">
        <h1 className="brk-hero-title">
          BUILD BETTER
          <br />
          <span className="accent">MARCH MADNESS</span>
          <br />
          PREDICTIONS
        </h1>
        <p className="brk-hero-sub">
          Create your perfect bracket, join groups with friends, and compete
          for bracket supremacy!
        </p>
        <div className="brk-cta-row">
          <button type="button" className="brk-btn brk-btn-primary">
            <BoltIcon /> SIGN UP
          </button>
          <button type="button" className="brk-btn brk-btn-ghost">
            <CheckIcon /> LOGIN
          </button>
        </div>
      </section>

      <section id="scoring" className="brk-scoring card-shell">
        <div className="brk-scoring-header">
          <span className="brk-eyebrow">Exclusive</span>
          <h2 className="brk-section-title">
            DUAL <span className="accent-teal">SCORING</span> SYSTEM
          </h2>
          <p className="brk-section-sub">
            Get double the excitement with our innovative scoring approach —
            classic points for picks, plus upset bonuses that reward bold
            calls.
          </p>
        </div>
        <div className="brk-scoring-grid">
          <ScoreCard
            tone="coral"
            tag="Classic"
            title="STANDARD POINTS"
            copy="Earn points for every correct pick. Round-by-round multipliers reward bracket discipline."
            points={["1pt First round", "2pt Second", "4pt Sweet 16", "8pt Elite 8"]}
          />
          <ScoreCard
            tone="teal"
            tag="Upset"
            title="UNDERDOG BONUS"
            copy="Seed-based bonuses for picking upsets. The bigger the upset, the bigger the reward."
            points={["+seed# bonus", "Stacks on wins", "Tracks live", "Resets weekly"]}
          />
        </div>
      </section>

      <section id="features" className="brk-features">
        <FeatureCard
          tone="dark"
          label="Analytics"
          tag="Insights"
          tagTone="coral"
        >
          <span className="feat-title">ADVANCED ANALYTICS</span>
          <p className="feat-sub">
            Bracket heatmaps, win-probability curves and seed-trend graphs
            built from 20 years of tournament data.
          </p>
        </FeatureCard>

        <FeatureCard
          tone="green"
          label="Groups"
          tag="Compete"
          tagTone="black"
        >
          <span className="feat-title light">GROUP COMPETITIONS</span>
          <p className="feat-sub light">
            Private pools with friends, live leaderboards and weekly trash
            talk built right in.
          </p>
        </FeatureCard>

        <FeatureCard
          tone="cream"
          label="Live"
          tag="Realtime"
          tagTone="teal"
        >
          <span className="feat-title">LIVE PREDICTIONS</span>
          <p className="feat-sub">
            Update your picks as games unfold. Watch your score shift in
            real-time with every buzzer.
          </p>
        </FeatureCard>
      </section>

      <footer className="brk-footer">
        <span>© 2026 BRACKET — A march madness companion</span>
        <span className="brk-footer-dot">●</span>
        <span>Built with bold picks</span>
      </footer>
    </main>
  );
}

/* ------------------------------------------------------------------ */

function ScoreCard({
  tone,
  tag,
  title,
  copy,
  points,
}: {
  tone: "coral" | "teal";
  tag: string;
  title: string;
  copy: string;
  points: string[];
}) {
  return (
    <div className={`brk-score brk-score-${tone}`}>
      <div className="brk-score-top">
        <span className="brk-score-tag">{tag}</span>
        <h3 className="brk-score-title">{title}</h3>
        <p className="brk-score-copy">{copy}</p>
      </div>
      <ul className="brk-score-list">
        {points.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
    </div>
  );
}

function FeatureCard({
  tone,
  label,
  tag,
  tagTone,
  children,
}: {
  tone: "dark" | "green" | "cream";
  label: string;
  tag: string;
  tagTone: "coral" | "black" | "teal";
  children: ReactNode;
}) {
  return (
    <article className={`brk-feature brk-feature-${tone}`}>
      <div className="brk-feature-body">{children}</div>
      <div className="brk-feature-footer">
        <span className="brk-feature-label">{label}</span>
        <span className={`brk-tag brk-tag-${tagTone}`}>{tag}</span>
      </div>
    </article>
  );
}

function BoltIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12 3 3 5-6" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */

const moduleCss = `
.bracket-root {
  --cream: #f5f1e8;
  --cream-2: #ebe6d9;
  --ink: #1a1a1a;
  --coral: #cc3a1e;
  --green: #226633;
  --green-bg: #3a6b3a;
  --teal: #3f8f81;
  --teal-deep: #2f8576;
  background: var(--cream);
  color: var(--ink);
  min-height: 100vh;
  font-family: 'Barlow Condensed', sans-serif;
  padding: 0 clamp(20px, 5vw, 64px) 64px;
  display: flex;
  flex-direction: column;
  gap: clamp(32px, 5vw, 56px);
}

.bracket-root * { box-sizing: border-box; }

/* ---------- Header ---------- */
.brk-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22px 0 6px;
}
.brk-logo {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  line-height: 0;
  padding-bottom: 14px;
}
.brk-logo-img {
  height: clamp(30px, 3.8vw, 44px);
  width: auto;
  display: block;
}
.brk-nav {
  display: flex;
  gap: clamp(14px, 2.4vw, 28px);
  align-items: center;
}
.brk-nav a {
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  font-size: 14px;
  color: var(--coral);
  text-decoration: none;
}
.brk-nav a:hover { color: var(--ink); }
.brk-nav-login {
  padding: 6px 14px;
  border: 2px solid var(--ink);
  border-radius: 999px;
  color: var(--ink) !important;
  background: var(--cream);
  box-shadow: 3px 3px 0 var(--ink);
}

/* ---------- Hero ---------- */
.brk-hero {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 22px;
  padding: clamp(24px, 4vw, 48px) 0 0;
  max-width: 880px;
}
.brk-hero-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(56px, 10vw, 132px);
  line-height: 0.88;
  letter-spacing: 0.005em;
  margin: 0;
  color: var(--ink);
}
.brk-hero-title .accent { color: var(--coral); }
.brk-hero-sub {
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 500;
  font-size: clamp(18px, 1.7vw, 22px);
  line-height: 1.45;
  color: #3a3a3a;
  max-width: 56ch;
  margin: 0;
}
.brk-cta-row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: 8px;
}
.brk-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 16px;
  padding: 14px 28px;
  border: 2px solid var(--ink);
  border-radius: 999px;
  cursor: pointer;
  box-shadow: 5px 5px 0 var(--ink);
  transition: transform 0.12s ease, box-shadow 0.12s ease;
}
.brk-btn:hover {
  transform: translate(-1px, -1px);
  box-shadow: 6px 6px 0 var(--ink);
}
.brk-btn:active {
  transform: translate(2px, 2px);
  box-shadow: 2px 2px 0 var(--ink);
}
.brk-btn-primary { background: #4ec07a; color: #0a2a14; }
.brk-btn-ghost   { background: #fff; color: var(--ink); }

/* ---------- Card shell shared ---------- */
.card-shell {
  border: 2px solid var(--ink);
  border-radius: 22px;
  box-shadow: 6px 6px 0 var(--ink);
  background: var(--cream);
  overflow: hidden;
}

/* ---------- Scoring section ---------- */
.brk-scoring {
  padding: clamp(28px, 4vw, 44px);
  display: flex;
  flex-direction: column;
  gap: clamp(20px, 3vw, 32px);
}
.brk-scoring-header { max-width: 720px; }
.brk-eyebrow {
  font-family: 'Space Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--coral);
}
.brk-section-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(36px, 5.4vw, 68px);
  line-height: 0.92;
  margin: 6px 0 12px;
  letter-spacing: 0.01em;
}
.brk-section-title .accent-teal { color: var(--teal-deep); }
.brk-section-sub {
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 500;
  font-size: 18px;
  line-height: 1.5;
  color: #4a4a4a;
  margin: 0;
}
.brk-scoring-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 18px;
}
.brk-score {
  border: 2px solid var(--ink);
  border-radius: 18px;
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  box-shadow: 4px 4px 0 var(--ink);
  min-height: 280px;
}
.brk-score-coral { background: #fbe2d9; }
.brk-score-teal  { background: #d8ece6; }
.brk-score-tag {
  font-family: 'Space Mono', monospace;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  padding: 4px 10px;
  border: 1.5px solid var(--ink);
  border-radius: 999px;
  background: var(--cream);
  align-self: flex-start;
}
.brk-score-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(26px, 2.6vw, 34px);
  line-height: 0.95;
  margin: 6px 0 4px;
  letter-spacing: 0.02em;
}
.brk-score-copy {
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 500;
  font-size: 16px;
  line-height: 1.4;
  margin: 0;
  color: #2a2a2a;
}
.brk-score-list {
  list-style: none;
  margin: 0;
  padding: 14px 0 0;
  border-top: 1.5px dashed rgba(26,26,26,0.3);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 16px;
  font-family: 'Space Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--ink);
}

/* ---------- Features ---------- */
.brk-features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 18px;
}
.brk-feature {
  border: 2px solid var(--ink);
  border-radius: 22px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 5px 5px 0 var(--ink);
  min-height: 260px;
}
.brk-feature-dark   { background: var(--ink); }
.brk-feature-green  { background: var(--green-bg); }
.brk-feature-cream  { background: var(--cream-2); }
.brk-feature-body {
  flex: 1;
  padding: 26px 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 14px;
}
.feat-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(28px, 2.8vw, 38px);
  line-height: 0.95;
  letter-spacing: 0.02em;
  color: var(--ink);
}
.feat-title.light { color: var(--cream); }
.brk-feature-dark .feat-title { color: var(--cream); }
.feat-sub {
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 500;
  font-size: 16px;
  line-height: 1.4;
  margin: 0;
  color: #2a2a2a;
}
.feat-sub.light { color: rgba(245,241,232,0.85); }
.brk-feature-dark .feat-sub { color: rgba(245,241,232,0.85); }

.brk-feature-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 18px;
  background: var(--cream);
  border-top: 2px solid var(--ink);
}
.brk-feature-label {
  font-family: 'Space Mono', monospace;
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink);
}
.brk-tag {
  font-family: 'Space Mono', monospace;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 4px 10px;
  border: 1.5px solid currentColor;
  border-radius: 999px;
}
.brk-tag-coral { color: var(--coral); }
.brk-tag-black { color: var(--ink); }
.brk-tag-teal  { color: var(--teal-deep); }

/* ---------- Footer ---------- */
.brk-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-family: 'Space Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #5a5650;
  padding-top: 24px;
  border-top: 1.5px dashed rgba(26,26,26,0.25);
}
.brk-footer-dot { color: var(--coral); }

@media (max-width: 640px) {
  .brk-header { flex-direction: column; gap: 14px; align-items: flex-start; }
  .brk-nav { flex-wrap: wrap; }
  .brk-cta-row .brk-btn { flex: 1; justify-content: center; }
}
`;