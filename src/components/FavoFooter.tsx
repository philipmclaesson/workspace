import * as React from "react";

const css = `
.favo-footer {
  --favo-cream:#f5f1e8; --favo-ink:#1a1a1a;
  --favo-green:#4ec07a; --favo-green-d:#1f6b42; --favo-yellow:#f5d76e;
  position:relative;
  margin-top:64px;
  background:var(--favo-cream);
  color:var(--favo-ink);
  padding:84px clamp(20px,5vw,72px) 28px;
  font-family:'Barlow Condensed',sans-serif;
}
.favo-footer * { box-sizing:border-box; }
.favo-footer .favo-shelfline {
  position:absolute; top:0; left:0; right:0; height:4px;
  background:var(--favo-ink); border-radius:2px;
}
.favo-footer .favo-books {
  position:absolute; top:-64px; left:0; right:0; height:64px;
  overflow:hidden; pointer-events:none;
}
.favo-footer .favo-books .favo-book {
  position:absolute; bottom:0;
  background:var(--favo-green);
  border-radius:3px 3px 0 0;
  transform-origin:bottom center; transform:scaleY(0);
}
.favo-footer .favo-books .favo-book.y { background:var(--favo-yellow); }
.favo-footer .favo-books .favo-book.d { background:var(--favo-green-d); }
.favo-footer .favo-books .favo-book.in { animation:favoPop .42s cubic-bezier(.2,1.4,.4,1) forwards; }
.favo-footer .favo-books .favo-book.out { animation:favoPull .55s ease-in forwards; }
@keyframes favoPop {
  0% { transform:scaleY(0); opacity:0; }
  70% { transform:scaleY(1.06); opacity:1; }
  100% { transform:scaleY(1); opacity:1; }
}
@keyframes favoPull {
  30% { transform:translateY(-12px) scaleY(1); opacity:1; }
  100% { transform:translateY(-70px) scaleY(1); opacity:0; }
}
.favo-footer .favo-status {
  position:absolute; top:16px; left:clamp(20px,5vw,72px);
  font-family:'Space Mono',monospace; font-size:11px; letter-spacing:.18em;
  color:var(--favo-ink);
  display:flex; align-items:center; gap:8px;
  opacity:0; transition:opacity .6s ease .4s;
}
.favo-footer .favo-status.show { opacity:1; }
.favo-footer .favo-status .favo-dot {
  width:7px; height:7px; border-radius:999px; background:var(--favo-green);
  animation:favoPulse 2.4s ease-in-out infinite;
}
@keyframes favoPulse { 0%,100% { opacity:.35; } 50% { opacity:1; } }
.favo-footer .favo-row {
  display:flex; justify-content:space-between; align-items:flex-end;
  flex-wrap:wrap; gap:18px; margin-top:24px;
}
.favo-footer .favo-mark { font-weight:700; font-size:44px; letter-spacing:.02em; line-height:1; }
.favo-footer .favo-links {
  font-family:'Space Mono',monospace; font-size:11px; letter-spacing:.18em;
  display:flex; gap:22px; flex-wrap:wrap;
}
.favo-footer .favo-links a { color:inherit; text-decoration:none; opacity:.7; }
.favo-footer .favo-links a:hover { opacity:1; text-decoration:underline; text-underline-offset:4px; }
.favo-footer .favo-note {
  font-family:'Space Mono',monospace; font-size:10px; letter-spacing:.15em;
  opacity:.5; margin-top:26px;
}
@media (prefers-reduced-motion: reduce) {
  .favo-footer .favo-book,
  .favo-footer .favo-book.in,
  .favo-footer .favo-book.out { animation:none !important; transform:scaleY(1); opacity:1; }
  .favo-footer .favo-status .favo-dot { animation:none; opacity:1; }
}
`;

export function FavoFooter() {
  const footerRef = React.useRef<HTMLElement>(null);
  const shelfRef = React.useRef<HTMLDivElement>(null);
  const statusRef = React.useRef<HTMLDivElement>(null);
  const stextRef = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    const footer = footerRef.current;
    const shelf = shelfRef.current;
    const status = statusRef.current;
    const stext = stextRef.current;
    if (!footer || !shelf || !status || !stext) return;

    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const rnd = (a: number, b: number) => a + Math.random() * (b - a);

    type Book = { el: HTMLSpanElement; x: number; w: number };

    function makeBook(x: number): Book {
      const w = rnd(10, 24);
      const h = rnd(26, 58);
      const el = document.createElement("span");
      const r = Math.random();
      el.className = "favo-book" + (r < 0.18 ? " y" : r < 0.4 ? " d" : "");
      el.style.left = x + "px";
      el.style.width = w + "px";
      el.style.height = h + "px";
      return { el, x, w };
    }

    let books: Book[] = [];
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    function build() {
      shelf!.innerHTML = "";
      books = [];
      const W = shelf!.clientWidth;
      let x = 0;
      while (x < W) {
        const b = makeBook(x);
        shelf!.appendChild(b.el);
        books.push(b);
        x += b.w + rnd(3, 7);
      }
      if (reduced) books.forEach((b) => b.el.classList.add("in"));
    }

    function reveal() {
      if (!reduced)
        books.forEach((b, i) =>
          timeouts.push(setTimeout(() => b.el.classList.add("in"), i * 45 + rnd(0, 30)))
        );
      status!.classList.add("show");
    }

    let statusTimer: ReturnType<typeof setTimeout> | null = null;
    function sortOnce() {
      if (reduced || !books.length) return;
      stext!.textContent = "SORTERAR HYLLAN…";
      if (statusTimer) clearTimeout(statusTimer);
      statusTimer = setTimeout(() => {
        stext!.textContent = "HÄMTAR KUNSKAP…";
      }, 2600);

      const i = Math.floor(Math.random() * books.length);
      const old = books[i];
      old.el.classList.remove("in");
      old.el.classList.add("out");
      timeouts.push(
        setTimeout(() => {
          old.el.remove();
          const nb = makeBook(old.x + rnd(-4, 4));
          shelf!.appendChild(nb.el);
          requestAnimationFrame(() => nb.el.classList.add("in"));
          books[i] = nb;
        }, 600)
      );
    }

    let sortTimer: ReturnType<typeof setTimeout> | null = null;
    function scheduleSort() {
      if (sortTimer) clearTimeout(sortTimer);
      sortTimer = setTimeout(() => {
        sortOnce();
        scheduleSort();
      }, rnd(25000, 32000));
    }

    build();
    let revealed = false;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !revealed) {
            revealed = true;
            reveal();
            scheduleSort();
            io.disconnect();
          }
        });
      },
      { threshold: 0.25 }
    );
    io.observe(footer);

    const onResize = () => {
      build();
      if (revealed && !reduced) books.forEach((b) => b.el.classList.add("in"));
    };
    addEventListener("resize", onResize);

    (window as unknown as Record<string, unknown>).__favoSort = sortOnce;

    return () => {
      io.disconnect();
      removeEventListener("resize", onResize);
      timeouts.forEach(clearTimeout);
      if (statusTimer) clearTimeout(statusTimer);
      if (sortTimer) clearTimeout(sortTimer);
      delete (window as unknown as Record<string, unknown>).__favoSort;
    };
  }, []);

  return (
    <footer className="favo-footer" ref={footerRef}>
      <style>{css}</style>
      <div className="favo-shelfline" />
      <div className="favo-books" ref={shelfRef} />
      <div className="favo-status" ref={statusRef}>
        <span className="favo-dot" />
        <span ref={stextRef}>HÄMTAR KUNSKAP…</span>
      </div>
      <div className="favo-row">
        <div className="favo-mark">FAVO</div>
        <nav className="favo-links">
          <a href="#">MODULER</a>
          <a href="#">KÄLLOR</a>
          <a href="#">OM</a>
          <a href="#">KONTAKT</a>
        </nav>
      </div>
      <div className="favo-note">© FAVO — EN KUNSKAPSBANK. HYLLAN FYLLS PÅ VARJE VECKA.</div>
    </footer>
  );
}