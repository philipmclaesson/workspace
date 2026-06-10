import { createFileRoute } from "@tanstack/react-router";
import favoLogo from "@/assets/favo-logo.png.asset.json";

export const Route = createFileRoute("/landing")({
  head: () => ({
    meta: [
      { title: "Bracket — Landing" },
      { name: "description", content: "Build better March Madness predictions." },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <main className="lp-root">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;500;700;900&family=Bebas+Neue&family=Space+Mono:wght@400;700&display=swap"
        rel="stylesheet"
      />
      <style>{css}</style>

      <header className="lp-header">
        <a href="/landing" className="lp-logo" aria-label="FAVO">
          <img src={favoLogo.url} alt="FAVO" className="lp-logo-img" />
        </a>
        <nav className="lp-nav">
          <a href="/">Bracket</a>
          <a href="/workspace">Workspace</a>
          <a href="#login" className="lp-nav-login">Login</a>
        </nav>
      </header>

      <section className="lp-hero">
        <span className="lp-eyebrow">March Madness 2026</span>
        <h1 className="lp-title">
          BUILD BETTER
          <br />
          <span className="accent">MARCH MADNESS</span>
          <br />
          PREDICTIONS
        </h1>
        <p className="lp-sub">
          Create your perfect bracket, join groups with friends, and compete
          for bracket supremacy!
        </p>
        <div className="lp-cta">
          <button type="button" className="lp-btn lp-btn-primary">
            <BoltIcon /> SIGN UP
          </button>
        </div>
      </section>
    </main>
  );
}

function BoltIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" />
    </svg>
  );
}

const css = `
.lp-root {
  --cream: #f5f1e8;
  --ink: #1a1a1a;
  --coral: #cc3a1e;
  --green: #226633;
  background: var(--cream);
  color: var(--ink);
  height: 100vh;
  width: 100%;
  overflow: hidden;
  font-family: 'Barlow Condensed', sans-serif;
  padding: 0 clamp(20px, 5vw, 64px);
  display: flex;
  flex-direction: column;
}
.lp-root * { box-sizing: border-box; }

.lp-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22px 0 6px;
  border-bottom: 2px solid var(--ink);
  flex-shrink: 0;
}
.lp-logo {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  line-height: 0;
  padding-bottom: 14px;
}
.lp-logo-img {
  height: clamp(30px, 3.8vw, 44px);
  width: auto;
  display: block;
}
.lp-nav { display: flex; gap: clamp(14px, 2.4vw, 28px); align-items: center; }
.lp-nav a {
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  font-size: 14px;
  color: var(--coral);
  text-decoration: none;
}
.lp-nav a:hover { color: var(--ink); }
.lp-nav-login {
  padding: 6px 14px;
  border: 2px solid var(--ink);
  border-radius: 999px;
  color: var(--ink) !important;
  background: var(--cream);
  box-shadow: 3px 3px 0 var(--ink);
}

.lp-hero {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: clamp(16px, 2.5vh, 28px);
  max-width: 980px;
  padding-bottom: 4vh;
  min-height: 0;
}
.lp-eyebrow {
  font-family: 'Space Mono', monospace;
  font-size: 12px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--coral);
}
.lp-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(48px, 11vw, 150px);
  line-height: 0.86;
  letter-spacing: 0.005em;
  margin: 0;
  color: var(--ink);
}
.lp-title .accent { color: var(--coral); }
.lp-sub {
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 500;
  font-size: clamp(16px, 1.7vw, 22px);
  line-height: 1.4;
  color: #3a3a3a;
  max-width: 56ch;
  margin: 0;
}
.lp-cta { display: flex; gap: 16px; }
.lp-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 18px;
  padding: 16px 34px;
  border: 2px solid var(--ink);
  border-radius: 999px;
  cursor: pointer;
  box-shadow: 5px 5px 0 var(--ink);
  transition: transform 0.12s ease, box-shadow 0.12s ease;
}
.lp-btn:hover { transform: translate(-1px, -1px); box-shadow: 6px 6px 0 var(--ink); }
.lp-btn:active { transform: translate(2px, 2px); box-shadow: 2px 2px 0 var(--ink); }
.lp-btn-primary { background: #4ec07a; color: #0a2a14; }

@media (max-width: 640px) {
  .lp-header { flex-direction: row; }
  .lp-nav { gap: 12px; }
}
`;