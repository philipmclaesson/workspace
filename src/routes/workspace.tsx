import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { WorkspaceChat } from "@/components/WorkspaceChat";
import LoberBrain from "@/components/LoberBrain";

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

const MODULES: { id: string; label: string; hint: string }[] = [
  { id: "biologisk", label: "Biologisk psykologi", hint: "01" },
  { id: "kognitiv", label: "Kognitiv psykologi", hint: "02" },
  { id: "utveckling", label: "Utvecklingspsykologi", hint: "03" },
  { id: "personlighet", label: "Personlighetspsykologi", hint: "04" },
  { id: "social", label: "Socialpsykologi", hint: "05" },
  { id: "metod", label: "Metod & statistik", hint: "06" },
];

type Color = "yellow" | "pink" | "blue" | "green" | "lilac" | "cream" | "ink";
const COLORS: Color[] = ["yellow", "pink", "blue", "green", "lilac", "cream", "ink"];
const COLOR_HEX: Record<Color, string> = {
  yellow: "#f5d76e",
  pink: "#f1a7b0",
  blue: "#a7c4f1",
  green: "#a4d9a8",
  lilac: "#b6a8e8",
  cream: "#f5f1e8",
  ink: "#1a1a1a",
};

type Base = { id: string; x: number; y: number; w: number; h: number; color: Color };
type StickyItem = Base & { type: "sticky"; text: string };
type TextItem = Base & { type: "text"; text: string };
type NodeItem = Base & { type: "node"; tag: string; title: string; body: string };
type RectItem = Base & { type: "rect" };
type EllipseItem = Base & { type: "ellipse" };
type ConnectorItem = { id: string; type: "connector"; from: string; to: string; color: Color };
type ProfileStat = { label: string; value: string; color: Color };
type ProfileItem = Base & { type: "profile"; name: string; role: string; stats: ProfileStat[] };
type BrainItem = Base & { type: "brain"; title: string; subtitle: string; highlights: { id: string; label: string; color: Color }[] };
type PdfItem = Base & { type: "pdf"; name: string; dataUrl: string };
type LobesItem = Base & { type: "lobes" };
type Item = StickyItem | TextItem | NodeItem | RectItem | EllipseItem | ConnectorItem | ProfileItem | BrainItem | PdfItem | LobesItem;

const INITIAL_ITEMS: Item[] = [
  { id: "n1", type: "node", x: 60, y: 80, w: 220, h: 100, color: "pink", tag: "NEURON", title: "Aktionspotential", body: "Na⁺ in, K⁺ ut. Tröskel ≈ −55 mV." },
  { id: "n2", type: "node", x: 460, y: 240, w: 220, h: 100, color: "green", tag: "SYSTEM", title: "Limbiska systemet", body: "Amygdala, hippocampus, hypothalamus." },
  { id: "n3", type: "node", x: 860, y: 80, w: 220, h: 100, color: "blue", tag: "TRANSMITTOR", title: "Dopamin", body: "Belöning, motivation, motorik." },
  { id: "s1", type: "sticky", x: 120, y: 420, w: 180, h: 140, color: "yellow", text: "LTP → långtidsminne i hippocampus" },
  { id: "t1", type: "text", x: 480, y: 60, w: 260, h: 36, color: "ink", text: "Översikt — nervsystemet" },
  { id: "c1", type: "connector", from: "n1", to: "n2", color: "ink" },
  { id: "c2", type: "connector", from: "n2", to: "n3", color: "ink" },
];

const uid = () => Math.random().toString(36).slice(2, 10);
const isShape = (it: Item): it is StickyItem | TextItem | NodeItem | RectItem | EllipseItem | ProfileItem | BrainItem | PdfItem | LobesItem => it.type !== "connector";

// ---- Brain hemisphere illustration (Salvia theme) ----
const SALVIA = "#3f8f81";
const SALVIA_DEEP = "#2f8576";
const HL_HEX: Record<Color, string> = {
  yellow: "#e0b94a", pink: "#cc4a6a", blue: "#2255cc",
  green: "#226633", lilac: "#7a5fc7", cream: "#1a1a1a", ink: "#1a1a1a",
};
function BrainSvg({ highlights }: { highlights: { id: string; label: string; color: Color }[] }) {
  // Deterministic pseudo-random nodes per hemisphere
  const rand = (s: number) => {
    let x = Math.sin(s) * 10000; return x - Math.floor(x);
  };
  const makeHemi = (side: 1 | -1, seed: number) => {
    const pts: { x: number; y: number; r: number }[] = [];
    for (let i = 0; i < 38; i++) {
      const a = rand(seed + i) * Math.PI - Math.PI / 2;
      const r = 60 + rand(seed + i + 100) * 30;
      const px = side * (10 + Math.cos(a) * r * (0.6 + rand(seed + i + 7) * 0.5));
      const py = Math.sin(a) * r * 1.1 + (rand(seed + i + 33) - 0.5) * 20;
      pts.push({ x: px, y: py, r: 2.2 + rand(seed + i + 9) * 3 });
    }
    return pts;
  };
  const left = makeHemi(-1, 11);
  const right = makeHemi(1, 23);
  // Edges: nearest neighbours within hemisphere
  const edges = (pts: { x: number; y: number; r: number }[]) => {
    const lines: [number, number][] = [];
    pts.forEach((p, i) => {
      const dists = pts.map((q, j) => ({ j, d: (q.x - p.x) ** 2 + (q.y - p.y) ** 2 })).filter(o => o.j !== i).sort((a, b) => a.d - b.d).slice(0, 3);
      dists.forEach(({ j }) => { if (j > i) lines.push([i, j]); });
    });
    return lines;
  };
  const le = edges(left); const re = edges(right);
  // Highlight positions on left hemisphere
  const hlPos = [
    { x: -50, y: -30 }, { x:  50, y: -30 }, { x: -30, y:  35 },
    { x:  35, y:  35 }, { x:   2, y:  10 },
  ];
  return (
    <svg viewBox="-130 -90 260 180" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
      <g stroke={SALVIA} strokeWidth="1" strokeLinecap="round" opacity="0.85">
        {le.map(([a, b], i) => <line key={`le${i}`} x1={left[a].x} y1={left[a].y} x2={left[b].x} y2={left[b].y} />)}
        {re.map(([a, b], i) => <line key={`re${i}`} x1={right[a].x} y1={right[a].y} x2={right[b].x} y2={right[b].y} />)}
      </g>
      <g fill={SALVIA_DEEP} opacity="0.9">
        {left.map((p, i) => <circle key={`ln${i}`} cx={p.x} cy={p.y} r={p.r} />)}
        {right.map((p, i) => <circle key={`rn${i}`} cx={p.x} cy={p.y} r={p.r} />)}
      </g>
      {/* Outline silhouette hint */}
      <g fill="none" stroke={SALVIA} strokeWidth="2.5" opacity="0.55" strokeLinejoin="round" strokeLinecap="round">
        <path d="M -5 -78 C -50 -78 -100 -55 -110 -10 C -118 30 -100 70 -55 78 C -30 82 -15 70 -8 60" />
        <path d="M  5 -78 C  50 -78  100 -55  110 -10 C  118 30  100 70   55 78 C  30 82   15 70   8 60" />
      </g>
      {/* Highlights */}
      {highlights.slice(0, hlPos.length).map((h, i) => (
        <g key={h.id}>
          <circle cx={hlPos[i].x} cy={hlPos[i].y} r="8" fill={HL_HEX[h.color]} opacity="0.18" />
          <circle cx={hlPos[i].x} cy={hlPos[i].y} r="4" fill={HL_HEX[h.color]} stroke="#1a1a1a" strokeWidth="1.2" />
        </g>
      ))}
    </svg>
  );
}

type DragState =
  | { type: "pan"; startX: number; startY: number; origPan: { x: number; y: number } }
  | { type: "move"; startX: number; startY: number; ids: string[]; origs: Record<string, { x: number; y: number }>; scale: number; snapshot: Item[] }
  | { type: "rewire"; connId: string; end: "from" | "to"; snapshot: Item[] }
  | { type: "link"; fromId: string; snapshot: Item[] }
  | null;

function WorkspacePage() {
  const ITEMS_KEY = "ws:itemsByModule:v1";
  const NOTES_KEY = "ws:notesByModule:v1";
  const loadItems = (): Record<string, Item[]> => {
    const base = Object.fromEntries(MODULES.map(m => [m.id, m.id === "biologisk" ? INITIAL_ITEMS : []]));
    if (typeof window === "undefined") return base;
    try {
      const raw = window.localStorage.getItem(ITEMS_KEY);
      if (!raw) return base;
      const parsed = JSON.parse(raw) as Record<string, Item[]>;
      return { ...base, ...parsed };
    } catch { return base; }
  };
  const loadNotes = (): Record<string, Record<SectionId, string>> => {
    const base = Object.fromEntries(MODULES.map(m => [m.id, { overview: "", notes: "", concepts: "", neurons: "", sources: "", questions: "" } as Record<SectionId, string>]));
    if (typeof window === "undefined") return base;
    try {
      const raw = window.localStorage.getItem(NOTES_KEY);
      if (!raw) return base;
      const parsed = JSON.parse(raw) as Record<string, Record<SectionId, string>>;
      return { ...base, ...parsed };
    } catch { return base; }
  };
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [itemsByModule, setItemsByModule] = useState<Record<string, Item[]>>(loadItems);
  const histRef = useRef<Record<string, { past: Item[][]; future: Item[][] }>>({});
  const activeModuleRef = useRef<string | null>(null);
  useEffect(() => { activeModuleRef.current = activeModule; }, [activeModule]);
  const itemsByModuleRef = useRef<Record<string, Item[]>>({});
  useEffect(() => { itemsByModuleRef.current = itemsByModule; }, [itemsByModule]);
  const rewireGhostRef = useRef<{ x: number; y: number; hoverId: string | null } | null>(null);
  const getHist = (mod: string) => {
    if (!histRef.current[mod]) histRef.current[mod] = { past: [], future: [] };
    return histRef.current[mod];
  };

  const items = activeModule ? (itemsByModule[activeModule] ?? []) : [];

  const setItemsRaw = (next: Item[] | ((prev: Item[]) => Item[])) => {
    if (!activeModule) return;
    setItemsByModule(prev => {
      const cur = prev[activeModule] ?? [];
      const value = typeof next === "function" ? (next as (p: Item[]) => Item[])(cur) : next;
      return { ...prev, [activeModule]: value };
    });
  };

  const commit = (next: Item[] | ((prev: Item[]) => Item[])) => {
    if (!activeModule) return;
    const mod = activeModule;
    setItemsByModule(prev => {
      const cur = prev[mod] ?? [];
      const value = typeof next === "function" ? (next as (p: Item[]) => Item[])(cur) : next;
      const h = getHist(mod);
      h.past.push(cur);
      if (h.past.length > 80) h.past.shift();
      h.future = [];
      return { ...prev, [mod]: value };
    });
  };

  const undo = () => {
    if (!activeModule) return;
    const mod = activeModule;
    const h = getHist(mod);
    if (!h.past.length) return;
    setItemsByModule(prev => {
      const cur = prev[mod] ?? [];
      h.future.unshift(cur);
      return { ...prev, [mod]: h.past.pop()! };
    });
  };
  const redo = () => {
    if (!activeModule) return;
    const mod = activeModule;
    const h = getHist(mod);
    if (!h.future.length) return;
    setItemsByModule(prev => {
      const cur = prev[mod] ?? [];
      h.past.push(cur);
      return { ...prev, [mod]: h.future.shift()! };
    });
  };

  const [active, setActive] = useState<SectionId>("overview");
  const emptyNotes = (): Record<SectionId, string> => ({ overview: "", notes: "", concepts: "", neurons: "", sources: "", questions: "" });
  const [notesByModule, setNotesByModule] = useState<Record<string, Record<SectionId, string>>>(loadNotes);
  useEffect(() => {
    try { window.localStorage.setItem(ITEMS_KEY, JSON.stringify(itemsByModule)); } catch {}
  }, [itemsByModule]);
  useEffect(() => {
    try { window.localStorage.setItem(NOTES_KEY, JSON.stringify(notesByModule)); } catch {}
  }, [notesByModule]);
  const notes = activeModule ? (notesByModule[activeModule] ?? emptyNotes()) : emptyNotes();
  const setNotes = (updater: (n: Record<SectionId, string>) => Record<SectionId, string>) => {
    if (!activeModule) return;
    const mod = activeModule;
    setNotesByModule(prev => ({ ...prev, [mod]: updater(prev[mod] ?? emptyNotes()) }));
  };
  const [zoom, setZoom] = useState(100);
  const [tool, setTool] = useState<string>("select");
  const [pan, setPan] = useState({ x: 40, y: 40 });
  const [sideCollapsed, setSideCollapsed] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [pdfOpenId, setPdfOpenId] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingFrom, setPendingFrom] = useState<string | null>(null);
  const [rewireGhost, setRewireGhost] = useState<{ x: number; y: number; hoverId: string | null } | null>(null);
  useEffect(() => { rewireGhostRef.current = rewireGhost; }, [rewireGhost]);
  const [linkGhost, setLinkGhost] = useState<{ x: number; y: number; hoverId: string | null } | null>(null);
  const linkGhostRef = useRef<{ x: number; y: number; hoverId: string | null } | null>(null);
  useEffect(() => { linkGhostRef.current = linkGhost; }, [linkGhost]);

  const viewportRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState>(null);
  const scale = zoom / 100;
  const clampZoom = (z: number) => Math.max(25, Math.min(250, z));

  const itemsMap = useMemo(() => {
    const m = new Map<string, Item>();
    items.forEach(it => m.set(it.id, it));
    return m;
  }, [items]);

  const toWorld = (cx: number, cy: number) => {
    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return { x: (cx - rect.left - pan.x) / scale, y: (cy - rect.top - pan.y) / scale };
  };

  const addItemAt = (w: { x: number; y: number }): Item | null => {
    if (tool === "sticky") return { id: uid(), type: "sticky", x: w.x - 90, y: w.y - 70, w: 180, h: 140, color: "yellow", text: "" };
    if (tool === "text") return { id: uid(), type: "text", x: w.x - 60, y: w.y - 14, w: 200, h: 32, color: "ink", text: "Text" };
    if (tool === "node") return { id: uid(), type: "node", x: w.x - 110, y: w.y - 50, w: 220, h: 100, color: "cream", tag: "MODUL", title: "Ny modul", body: "Dubbelklicka för att redigera" };
    if (tool === "rect") return { id: uid(), type: "rect", x: w.x - 80, y: w.y - 50, w: 160, h: 100, color: "blue" };
    if (tool === "ellipse") return { id: uid(), type: "ellipse", x: w.x - 80, y: w.y - 50, w: 160, h: 100, color: "pink" };
    if (tool === "pdf") return { id: uid(), type: "pdf", x: w.x - 110, y: w.y - 70, w: 220, h: 140, color: "cream", name: "", dataUrl: "" };
    if (tool === "lobes") return { id: uid(), type: "lobes", x: w.x - 260, y: w.y - 200, w: 520, h: 404, color: "cream" };
    return null;
  };

  const onCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if (!activeModule) return;
    if (tool === "select" || tool === "hand") {
      setSelected([]);
      setEditingId(null);
      dragRef.current = { type: "pan", startX: e.clientX, startY: e.clientY, origPan: { ...pan } };
      document.body.style.cursor = "grabbing";
      return;
    }
    if (tool === "connector") { setPendingFrom(null); return; }
    const item = addItemAt(toWorld(e.clientX, e.clientY));
    if (item) {
      commit(its => [...its, item]);
      setSelected([item.id]);
      setTool("select");
      if (item.type === "sticky" || item.type === "text" || item.type === "node") setEditingId(item.id);
    }
  };

  const onItemMouseDown = (e: React.MouseEvent, id: string) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    const item = itemsMap.get(id);
    if (!item) return;

    if (tool === "connector" && item.type !== "connector") {
      if (!pendingFrom) {
        setPendingFrom(id);
      } else if (pendingFrom !== id) {
        const newConn: ConnectorItem = { id: uid(), type: "connector", from: pendingFrom, to: id, color: "ink" };
        commit(its => [...its, newConn]);
        setPendingFrom(null);
        setTool("select");
      } else {
        setPendingFrom(null);
      }
      return;
    }

    let nextSelected = selected;
    if (e.shiftKey) {
      nextSelected = selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id];
    } else if (!selected.includes(id)) {
      nextSelected = [id];
    }
    setSelected(nextSelected);
    setEditingId(null);

    if (item.type === "connector") return;
    const movingIds = nextSelected.length ? nextSelected : [id];
    const origs: Record<string, { x: number; y: number }> = {};
    movingIds.forEach(mid => {
      const it = itemsMap.get(mid);
      if (it && it.type !== "connector") origs[mid] = { x: it.x, y: it.y };
    });
    dragRef.current = {
      type: "move",
      startX: e.clientX,
      startY: e.clientY,
      ids: Object.keys(origs),
      origs,
      scale,
      snapshot: items,
    };
    document.body.style.cursor = "grabbing";
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const d = dragRef.current;
      if (!d) return;
      if (d.type === "pan") {
        const dx = e.clientX - d.startX;
        const dy = e.clientY - d.startY;
        setPan({ x: d.origPan.x + dx, y: d.origPan.y + dy });
      } else if (d.type === "move") {
        const dx = e.clientX - d.startX;
        const dy = e.clientY - d.startY;
        const s = d.scale;
        const mod = activeModuleRef.current;
        if (!mod) return;
        setItemsByModule(prev => {
          const cur = prev[mod] ?? [];
          return {
            ...prev,
            [mod]: cur.map(it => {
              if (it.type === "connector" || !d.origs[it.id]) return it;
              return { ...it, x: d.origs[it.id].x + dx / s, y: d.origs[it.id].y + dy / s };
            }),
          };
        });
      } else if (d.type === "rewire") {
        const rect = viewportRef.current?.getBoundingClientRect();
        if (!rect) return;
        const wx = (e.clientX - rect.left - pan.x) / scale;
        const wy = (e.clientY - rect.top - pan.y) / scale;
        const mod = activeModuleRef.current;
        const cur = mod ? (itemsByModuleRef.current[mod] ?? []) : [];
        const conn = cur.find(it => it.id === d.connId);
        const otherEnd = conn && conn.type === "connector" ? (d.end === "from" ? conn.to : conn.from) : null;
        let hover: string | null = null;
        for (let i = cur.length - 1; i >= 0; i--) {
          const it = cur[i];
          if (it.type === "connector") continue;
          if (it.id === otherEnd) continue;
          if (wx >= it.x && wx <= it.x + it.w && wy >= it.y && wy <= it.y + it.h) { hover = it.id; break; }
        }
        setRewireGhost({ x: wx, y: wy, hoverId: hover });
      } else if (d.type === "link") {
        const rect = viewportRef.current?.getBoundingClientRect();
        if (!rect) return;
        const wx = (e.clientX - rect.left - pan.x) / scale;
        const wy = (e.clientY - rect.top - pan.y) / scale;
        const mod = activeModuleRef.current;
        const cur = mod ? (itemsByModuleRef.current[mod] ?? []) : [];
        let hover: string | null = null;
        for (let i = cur.length - 1; i >= 0; i--) {
          const it = cur[i];
          if (it.type === "connector") continue;
          if (it.id === d.fromId) continue;
          if (wx >= it.x && wx <= it.x + it.w && wy >= it.y && wy <= it.y + it.h) { hover = it.id; break; }
        }
        setLinkGhost({ x: wx, y: wy, hoverId: hover });
      }
    };
    const onUp = () => {
      const d = dragRef.current;
      if (d?.type === "move") {
        const mod = activeModuleRef.current;
        if (mod) {
          const h = getHist(mod);
          h.past.push(d.snapshot);
          if (h.past.length > 80) h.past.shift();
          h.future = [];
        }
      }
      if (d?.type === "rewire") {
        const ghost = rewireGhostRef.current;
        const mod = activeModuleRef.current;
        if (mod && ghost && ghost.hoverId) {
          const target = ghost.hoverId;
          const end = d.end;
          setItemsByModule(prev => {
            const cur = prev[mod] ?? [];
            const next = cur.map(it => {
              if (it.id !== d.connId || it.type !== "connector") return it;
              return end === "from" ? { ...it, from: target } : { ...it, to: target };
            });
            const h = getHist(mod);
            h.past.push(d.snapshot);
            if (h.past.length > 80) h.past.shift();
            h.future = [];
            return { ...prev, [mod]: next };
          });
        }
        setRewireGhost(null);
      }
      if (d?.type === "link") {
        const ghost = linkGhostRef.current;
        const mod = activeModuleRef.current;
        if (mod && ghost && ghost.hoverId && ghost.hoverId !== d.fromId) {
          const target = ghost.hoverId;
          const fromId = d.fromId;
          setItemsByModule(prev => {
            const cur = prev[mod] ?? [];
            const exists = cur.some(it => it.type === "connector" && ((it.from === fromId && it.to === target) || (it.from === target && it.to === fromId)));
            if (exists) return prev;
            const newConn: ConnectorItem = { id: uid(), type: "connector", from: fromId, to: target, color: "ink" };
            const h = getHist(mod);
            h.past.push(d.snapshot);
            if (h.past.length > 80) h.past.shift();
            h.future = [];
            return { ...prev, [mod]: [...cur, newConn] };
          });
        }
        setLinkGhost(null);
      }
      dragRef.current = null;
      document.body.style.cursor = "";
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pan.x, pan.y, scale]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const factor = e.deltaY > 0 ? 0.92 : 1.08;
      setZoom(z => {
        const next = clampZoom(z * factor);
        const oldScale = z / 100;
        const newScale = next / 100;
        setPan(p => ({ x: mx - ((mx - p.x) / oldScale) * newScale, y: my - ((my - p.y) / oldScale) * newScale }));
        return next;
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const deleteSelected = () => {
    if (!selected.length) return;
    commit(its => its.filter(it => !selected.includes(it.id) && !(it.type === "connector" && (selected.includes(it.from) || selected.includes(it.to)))));
    setSelected([]);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (editingId) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if ((e.key === "Delete" || e.key === "Backspace") && selected.length) {
        e.preventDefault();
        deleteSelected();
      } else if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault(); undo();
      } else if ((e.metaKey || e.ctrlKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault(); redo();
      } else if (e.key === "Escape") {
        setSelected([]); setTool("select"); setPendingFrom(null); setEditingId(null);
      } else if (e.key === "v") setTool("select");
      else if (e.key === "n") setTool("sticky");
      else if (e.key === "t") setTool("text");
      else if (e.key === "m") setTool("node");
      else if (e.key === "r") setTool("rect");
      else if (e.key === "o") setTool("ellipse");
      else if (e.key === "c") setTool("connector");
      else if (e.key === "b") setTool("lobes");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingId, selected]);

  const updateItem = (id: string, patch: Partial<Item>) => {
    commit(its => its.map(it => it.id === id ? ({ ...it, ...patch } as Item) : it));
  };
  const setItemColor = (id: string, color: Color) => {
    commit(its => its.map(it => it.id === id ? ({ ...it, color } as Item) : it));
  };

  const zoomIn = () => setZoom(z => clampZoom(z + 10));
  const zoomOut = () => setZoom(z => clampZoom(z - 10));
  const zoomFit = () => { setZoom(100); setPan({ x: 40, y: 40 }); };

  const insertProfileTemplate = () => {
    const rect = viewportRef.current?.getBoundingClientRect();
    const center = rect
      ? toWorld(rect.left + rect.width / 2, rect.top + rect.height / 2)
      : { x: 400, y: 300 };
    const profileId = uid();
    const cx = Math.round(center.x);
    const cy = Math.round(center.y);
    const profile: ProfileItem = {
      id: profileId,
      type: "profile",
      x: cx - 130, y: cy - 150,
      w: 260, h: 320,
      color: "cream",
      name: "Emma Karlsson",
      role: "TOP CUSTOMER",
      stats: [
        { label: "LTV", value: "1 258 €", color: "green" },
        { label: "Churn risk", value: "22%", color: "pink" },
        { label: "Last visit", value: "3 days ago", color: "yellow" },
        { label: "Last purchase", value: "10 days ago", color: "blue" },
      ],
    };
    const attrs: { tag: string; title: string; body: string; color: Color; dx: number; dy: number }[] = [
      { tag: "ADS",      title: "Ads",       body: "Senast exponerad: 2 dagar sedan",     color: "lilac", dx: -420, dy: -180 },
      { tag: "SALES",    title: "Sales",     body: "Tilldelad rep: Johan Berg",            color: "blue",  dx:  300, dy: -180 },
      { tag: "ENGAGE",   title: "Engagement", body: "NPS 8 · Öppnar 64% av mail",          color: "green", dx: -420, dy:  220 },
      { tag: "SUPPORT",  title: "Support",   body: "0 öppna ärenden · CSAT 4.8",           color: "yellow", dx:  300, dy:  220 },
    ];
    const nodes: NodeItem[] = attrs.map(a => ({
      id: uid(),
      type: "node",
      x: cx + a.dx, y: cy + a.dy,
      w: 200, h: 90,
      color: a.color,
      tag: a.tag, title: a.title, body: a.body,
    }));
    const connectors: ConnectorItem[] = nodes.map(n => ({
      id: uid(), type: "connector", from: n.id, to: profileId, color: "ink",
    }));
    commit(its => [...its, profile, ...nodes, ...connectors]);
    setSelected([profileId]);
    setTool("select");
  };

  const insertBrainTemplate = () => {
    const rect = viewportRef.current?.getBoundingClientRect();
    const center = rect
      ? toWorld(rect.left + rect.width / 2, rect.top + rect.height / 2)
      : { x: 400, y: 300 };
    const cx = Math.round(center.x);
    const cy = Math.round(center.y);
    const brainId = uid();
    const highlights = [
      { id: "amyg", label: "Amygdala", color: "pink" as Color },
      { id: "hipp", label: "Hippocampus", color: "green" as Color },
      { id: "pfc",  label: "Prefrontal kortex", color: "blue" as Color },
      { id: "cere", label: "Cerebellum", color: "yellow" as Color },
      { id: "thal", label: "Thalamus", color: "lilac" as Color },
    ];
    const brain: BrainItem = {
      id: brainId,
      type: "brain",
      x: cx - 200, y: cy - 180,
      w: 400, h: 360,
      color: "cream",
      title: "HJÄRNKARTA",
      subtitle: "Noder & nätverk",
      highlights,
    };
    const attrs: { tag: string; title: string; body: string; color: Color; dx: number; dy: number }[] = [
      { tag: "EMOTION",    title: "Amygdala",          body: "Rädsla, hot- och belöningsbearbetning.",            color: "pink",   dx: -460, dy: -240 },
      { tag: "MINNE",      title: "Hippocampus",       body: "Konsolidering av långtidsminnen, LTP.",             color: "green",  dx:  340, dy: -240 },
      { tag: "EXEKUTIV",   title: "Prefrontal kortex", body: "Beslut, planering, impulskontroll.",                color: "blue",   dx: -460, dy:  240 },
      { tag: "MOTORIK",    title: "Cerebellum",        body: "Finmotorik, balans, motorisk inlärning.",            color: "yellow", dx:  340, dy:  240 },
      { tag: "RELÄ",       title: "Thalamus",          body: "Sensorisk relästation till cortex.",                 color: "lilac",  dx:  -60, dy:  340 },
    ];
    const nodes: NodeItem[] = attrs.map(a => ({
      id: uid(),
      type: "node",
      x: cx + a.dx, y: cy + a.dy,
      w: 220, h: 96,
      color: a.color,
      tag: a.tag, title: a.title, body: a.body,
    }));
    const connectors: ConnectorItem[] = nodes.map(n => ({
      id: uid(), type: "connector", from: n.id, to: brainId, color: "ink",
    }));
    commit(its => [...its, brain, ...nodes, ...connectors]);
    setSelected([brainId]);
    setTool("select");
  };

  const TEMPLATES = [
    { id: "profile", label: "Profil", hint: "PR", insert: insertProfileTemplate },
    { id: "brain", label: "Hjärna", hint: "BR", insert: insertBrainTemplate },
  ];

  const TOOLS = [
    { id: "select", label: "Markera (V)" },
    { id: "sticky", label: "Post-it (N)" },
    { id: "text", label: "Text (T)" },
    { id: "node", label: "Modul (M)" },
    { id: "rect", label: "Rektangel (R)" },
    { id: "ellipse", label: "Ellips (O)" },
    { id: "connector", label: "Koppling (C)" },
    { id: "pdf", label: "Ladda upp PDF (P)" },
    { id: "lobes", label: "Hjärna – lober (B)" },
  ];
  const TOOL_ICONS: Record<string, React.ReactNode> = {
    select: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 3l14 8-6 2-2 6-6-16z"/></svg>,
    sticky: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h12l4 4v12H4z"/><path d="M16 4v4h4"/></svg>,
    text: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 5h14M12 5v14"/></svg>,
    node: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="6" width="18" height="12" rx="2"/></svg>,
    rect: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="6" width="16" height="12" rx="1"/></svg>,
    ellipse: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><ellipse cx="12" cy="12" rx="8" ry="6"/></svg>,
    connector: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="5" cy="12" r="2.5"/><circle cx="19" cy="12" r="2.5"/><path d="M7.5 12h9"/></svg>,
    pdf: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9z"/><path d="M14 3v6h6"/><path d="M9 14h6M9 17h4"/></svg>,
    lobes: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 4c-2.5 0-4 1.8-4 3.8 0 .6-.7 1-.7 2.2 0 1 .7 1.4.7 2.2 0 .8-.7 1.2-.7 2.2 0 2 1.7 3.6 4 3.6"/><path d="M15 4c2.5 0 4 1.8 4 3.8 0 .6.7 1 .7 2.2 0 1-.7 1.4-.7 2.2 0 .8.7 1.2.7 2.2 0 2-1.7 3.6-4 3.6"/><path d="M12 4v16"/></svg>,
  };

  const selectedItem = selected.length === 1 ? itemsMap.get(selected[0]) ?? null : null;

  return (
    <main className="ws-root">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;500;700;900&family=Bebas+Neue&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
      <style>{css}</style>

      <header className="ws-header">
        <a href="/landing" className="ws-logo" aria-label="FAVO">
          <img src="/__l5e/assets-v1/ac7e7e14-74c2-45d0-91ec-e344a34cd64d/favo-logo.png" alt="FAVO" className="ws-logo-img" />
        </a>
        <nav className="ws-nav">
          <a href="/">Bracket</a>
          <a href="/workspace" className="ws-nav-active">Workspace</a>
          <a href="/ekosystem">Ekosystem</a>
          <a href="#login" className="ws-nav-login">Login</a>
        </nav>
      </header>

      <div className={`ws-shell ${sideCollapsed ? "is-collapsed" : ""}`}>
        <aside className={`ws-sidebar ${sideCollapsed ? "is-collapsed" : ""}`}>
          <button type="button" className="ws-side-toggle" onClick={() => setSideCollapsed(v => !v)} aria-label={sideCollapsed ? "Fäll ut" : "Fäll in"} title={sideCollapsed ? "Fäll ut" : "Fäll in"}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">{sideCollapsed ? <path d="M9 6l6 6-6 6"/> : <path d="M15 6l-6 6 6 6"/>}</svg>
          </button>
          {!sideCollapsed && <div className="ws-side-label">KURS</div>}
          {!sideCollapsed && <h2 className="ws-side-title">Psykologi</h2>}
          {activeModule === null ? (
            <>
              <ul className="ws-side-list">
                {MODULES.map(m => (
                  <li key={m.id}>
                    <button type="button" className="ws-side-item" onClick={() => setActiveModule(m.id)} title={m.label}>
                      <span className="ws-side-hint">{m.hint}</span>
                      {!sideCollapsed && <span className="ws-side-name">{m.label}</span>}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <>
              {!sideCollapsed && (
                <button type="button" className="ws-side-back" onClick={() => setActiveModule(null)} title="Tillbaka till delkurser">
                  ← {MODULES.find(m => m.id === activeModule)?.label}
                </button>
              )}
              <ul className="ws-side-list">
                {SECTIONS.map(s => (
                  <li key={s.id}>
                    <button type="button" className={`ws-side-item ${active === s.id ? "is-active" : ""}`} onClick={() => setActive(s.id)} title={s.label}>
                      <span className="ws-side-hint">{s.hint}</span>
                      {!sideCollapsed && <span className="ws-side-name">{s.label}</span>}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </aside>

        <section className="ws-canvas">
          <div
            ref={viewportRef}
            className={`ws-viewport tool-${tool} ${pendingFrom ? "is-linking" : ""}`}
            onMouseDown={onCanvasMouseDown}
          >
            <div className="ws-grid" aria-hidden="true" style={{ backgroundSize: `${22 * scale}px ${22 * scale}px`, backgroundPosition: `${pan.x}px ${pan.y}px` }} />
            <div className="ws-world" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})` }}>
              <svg className="ws-edges" aria-hidden="true" width="6000" height="4000" style={{ left: -2000, top: -2000 }}>
                {items.filter((it): it is ConnectorItem => it.type === "connector").map(c => {
                  const a = itemsMap.get(c.from);
                  const b = itemsMap.get(c.to);
                  if (!a || !b || a.type === "connector" || b.type === "connector") return null;
                  const ghost = rewireGhost && dragRef.current?.type === "rewire" && dragRef.current.connId === c.id ? dragRef.current : null;
                  let ax = a.x + a.w / 2 + 2000, ay = a.y + a.h / 2 + 2000;
                  let bx = b.x + b.w / 2 + 2000, by = b.y + b.h / 2 + 2000;
                  if (ghost && rewireGhost) {
                    if (ghost.end === "from") { ax = rewireGhost.x + 2000; ay = rewireGhost.y + 2000; }
                    else { bx = rewireGhost.x + 2000; by = rewireGhost.y + 2000; }
                  }
                  const cx = (ax + bx) / 2;
                  const mx = (ax + bx) / 2, my = (ay + by) / 2;
                  const sel = selected.includes(c.id);
                  return (
                    <g key={c.id}>
                      {/* Wide invisible hit area */}
                      <path
                        d={`M ${ax} ${ay} C ${cx} ${ay}, ${cx} ${by}, ${bx} ${by}`}
                        fill="none" stroke="transparent" strokeWidth={18}
                        style={{ pointerEvents: "stroke", cursor: "pointer" }}
                        onMouseDown={(e) => { e.stopPropagation(); setSelected([c.id]); setEditingId(null); }}
                      />
                      <path
                        d={`M ${ax} ${ay} C ${cx} ${ay}, ${cx} ${by}, ${bx} ${by}`}
                        fill="none" stroke={COLOR_HEX[c.color]} strokeWidth={sel ? 3 : 2}
                        strokeDasharray={sel ? "0" : "4 5"} opacity={sel ? 1 : 0.7}
                        style={{ pointerEvents: "none" }}
                      />
                      <circle cx={bx} cy={by} r={5} fill={COLOR_HEX[c.color]} style={{ pointerEvents: "none" }} />
                      {sel && (
                        <>
                          {/* Endpoint handles — drag to re-route */}
                          <circle
                            cx={ax} cy={ay} r={8}
                            fill="#fff" stroke={COLOR_HEX[c.color]} strokeWidth={2}
                            style={{ pointerEvents: "all", cursor: "grab" }}
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              dragRef.current = { type: "rewire", connId: c.id, end: "from", snapshot: items };
                              setRewireGhost({ x: ax - 2000, y: ay - 2000, hoverId: null });
                              document.body.style.cursor = "grabbing";
                            }}
                          />
                          <circle
                            cx={bx} cy={by} r={8}
                            fill="#fff" stroke={COLOR_HEX[c.color]} strokeWidth={2}
                            style={{ pointerEvents: "all", cursor: "grab" }}
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              dragRef.current = { type: "rewire", connId: c.id, end: "to", snapshot: items };
                              setRewireGhost({ x: bx - 2000, y: by - 2000, hoverId: null });
                              document.body.style.cursor = "grabbing";
                            }}
                          />
                          {/* Delete button at midpoint */}
                          <g
                            style={{ pointerEvents: "all", cursor: "pointer" }}
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              commit(its => its.filter(it => it.id !== c.id));
                              setSelected([]);
                            }}
                          >
                            <circle cx={mx} cy={my} r={11} fill="#fff" stroke="#cc4a6a" strokeWidth={2} />
                            <path d={`M ${mx - 4} ${my - 4} L ${mx + 4} ${my + 4} M ${mx + 4} ${my - 4} L ${mx - 4} ${my + 4}`} stroke="#cc4a6a" strokeWidth={2} strokeLinecap="round" />
                          </g>
                        </>
                      )}
                      {ghost && rewireGhost && rewireGhost.hoverId && (
                        <circle cx={ghost.end === "from" ? ax : bx} cy={ghost.end === "from" ? ay : by} r={12} fill="none" stroke="#3f8f81" strokeWidth={2} strokeDasharray="3 3" style={{ pointerEvents: "none" }} />
                      )}
                    </g>
                  );
                })}
                {/* Link handles on selected non-connector item */}
                {(() => {
                  if (!selectedItem || selectedItem.type === "connector") return null;
                  const it = selectedItem;
                  const cxX = it.x + it.w / 2 + 2000;
                  const cxY = it.y + it.h / 2 + 2000;
                  const handles: { x: number; y: number; key: string }[] = [
                    { key: "t", x: cxX, y: it.y + 2000 - 2 },
                    { key: "r", x: it.x + it.w + 2000 + 2, y: cxY },
                    { key: "b", x: cxX, y: it.y + it.h + 2000 + 2 },
                    { key: "l", x: it.x + 2000 - 2, y: cxY },
                  ];
                  const startLink = (e: React.MouseEvent, hx: number, hy: number) => {
                    e.stopPropagation();
                    dragRef.current = { type: "link", fromId: it.id, snapshot: items };
                    setLinkGhost({ x: hx - 2000, y: hy - 2000, hoverId: null });
                    document.body.style.cursor = "grabbing";
                  };
                  return (
                    <g>
                      {handles.map(h => (
                        <g key={h.key} style={{ pointerEvents: "all", cursor: "crosshair" }} onMouseDown={(e) => startLink(e, h.x, h.y)}>
                          <circle cx={h.x} cy={h.y} r={9} fill="#fff" stroke="#3f8f81" strokeWidth={2} />
                          <path d={`M ${h.x - 3} ${h.y} L ${h.x + 3} ${h.y} M ${h.x} ${h.y - 3} L ${h.x} ${h.y + 3}`} stroke="#3f8f81" strokeWidth={2} strokeLinecap="round" />
                        </g>
                      ))}
                    </g>
                  );
                })()}
                {/* Ghost link line during link drag */}
                {linkGhost && dragRef.current?.type === "link" && (() => {
                  const from = itemsMap.get(dragRef.current.fromId);
                  if (!from || from.type === "connector") return null;
                  const ax = from.x + from.w / 2 + 2000;
                  const ay = from.y + from.h / 2 + 2000;
                  const bx = linkGhost.x + 2000;
                  const by = linkGhost.y + 2000;
                  const cx = (ax + bx) / 2;
                  return (
                    <g style={{ pointerEvents: "none" }}>
                      <path d={`M ${ax} ${ay} C ${cx} ${ay}, ${cx} ${by}, ${bx} ${by}`} fill="none" stroke="#3f8f81" strokeWidth={2} strokeDasharray="5 4" />
                      {linkGhost.hoverId && <circle cx={bx} cy={by} r={10} fill="none" stroke="#3f8f81" strokeWidth={2} />}
                    </g>
                  );
                })()}
              </svg>
              {items.filter(isShape).map(it => {
                const sel = selected.includes(it.id);
                const fromMark = pendingFrom === it.id;
                const cls = `ws-item ws-${it.type} color-${it.color} ${sel ? "is-selected" : ""} ${fromMark ? "is-from" : ""}`;
                const baseStyle: React.CSSProperties = { left: it.x, top: it.y, width: it.w, height: it.h };
                const onDown = (e: React.MouseEvent) => onItemMouseDown(e, it.id);
                const onDouble = (e: React.MouseEvent) => { e.stopPropagation(); if (it.type === "sticky" || it.type === "text" || it.type === "node") setEditingId(it.id); };

                if (it.type === "sticky") {
                  return (
                    <div key={it.id} className={cls} style={baseStyle} onMouseDown={onDown} onDoubleClick={onDouble}>
                      {editingId === it.id ? (
                        <textarea autoFocus className="ws-sticky-edit" defaultValue={it.text} onBlur={(e) => { updateItem(it.id, { text: e.target.value } as Partial<Item>); setEditingId(null); }} onKeyDown={(e) => { if (e.key === "Escape") setEditingId(null); }} />
                      ) : (
                        <div className="ws-sticky-text">{it.text || "Dubbelklicka för att skriva"}</div>
                      )}
                    </div>
                  );
                }
                if (it.type === "text") {
                  return (
                    <div key={it.id} className={cls} style={baseStyle} onMouseDown={onDown} onDoubleClick={onDouble}>
                      {editingId === it.id ? (
                        <input autoFocus className="ws-text-edit" defaultValue={it.text} onBlur={(e) => { updateItem(it.id, { text: e.target.value } as Partial<Item>); setEditingId(null); }} onKeyDown={(e) => { if (e.key === "Enter" || e.key === "Escape") (e.target as HTMLInputElement).blur(); }} />
                      ) : (
                        <div className="ws-text-show">{it.text}</div>
                      )}
                    </div>
                  );
                }
                if (it.type === "node") {
                  return (
                    <div key={it.id} className={cls} style={baseStyle} onMouseDown={onDown} onDoubleClick={onDouble}>
                      <span className="ws-node-tag">{it.tag}</span>
                      {editingId === it.id ? (
                        <>
                          <input autoFocus className="ws-node-title-edit" defaultValue={it.title} onBlur={(e) => updateItem(it.id, { title: e.target.value } as Partial<Item>)} />
                          <textarea className="ws-node-body-edit" defaultValue={it.body} onBlur={(e) => { updateItem(it.id, { body: e.target.value } as Partial<Item>); setEditingId(null); }} />
                        </>
                      ) : (
                        <>
                          <h3>{it.title}</h3>
                          <p>{it.body}</p>
                        </>
                      )}
                    </div>
                  );
                }
                if (it.type === "rect") return <div key={it.id} className={cls} style={baseStyle} onMouseDown={onDown} />;
                if (it.type === "ellipse") return <div key={it.id} className={cls} style={baseStyle} onMouseDown={onDown} />;
                if (it.type === "lobes") {
                  return (
                    <div key={it.id} className={cls} style={baseStyle} onMouseDown={onDown}>
                      <LoberBrain />
                    </div>
                  );
                }
                if (it.type === "pdf") {
                  const handleFile = (file: File | undefined) => {
                    if (!file) return;
                    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                      const dataUrl = String(reader.result || "");
                      updateItem(it.id, { name: file.name, dataUrl } as Partial<Item>);
                    };
                    reader.readAsDataURL(file);
                  };
                  return (
                    <div key={it.id} className={cls} style={baseStyle} onMouseDown={onDown}>
                      {it.dataUrl ? (
                        <>
                          <div className="ws-pdf-head">
                            <span className="ws-pdf-tag">PDF</span>
                            <span className="ws-pdf-name" title={it.name}>{it.name}</span>
                            <button
                              type="button"
                              className="ws-pdf-open"
                              onMouseDown={(e) => e.stopPropagation()}
                              onClick={(e) => { e.stopPropagation(); setPdfOpenId(it.id); }}
                            >Öppna</button>
                          </div>
                          <button
                            type="button"
                            className="ws-pdf-preview"
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => { e.stopPropagation(); setPdfOpenId(it.id); }}
                            aria-label={`Öppna ${it.name}`}
                          >
                            <svg viewBox="0 0 24 24" width="38" height="38" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9z"/>
                              <path d="M14 3v6h6"/>
                            </svg>
                            <span className="ws-pdf-preview-cta">Visa PDF</span>
                          </button>
                        </>
                      ) : (
                        <label className="ws-pdf-drop" onMouseDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
                          <span className="ws-pdf-tag">PDF</span>
                          <span className="ws-pdf-cta">Välj PDF-fil</span>
                          <span className="ws-pdf-hint">eller släpp filen här</span>
                          <input
                            type="file"
                            accept="application/pdf,.pdf"
                            className="ws-pdf-input"
                            onChange={(e) => handleFile(e.target.files?.[0])}
                          />
                        </label>
                      )}
                    </div>
                  );
                }
                if (it.type === "profile") {
                  return (
                    <div key={it.id} className={cls} style={baseStyle} onMouseDown={onDown} onDoubleClick={onDouble}>
                      <div className="ws-profile-tag">{it.role}</div>
                      <div className="ws-profile-avatar" aria-hidden="true">
                        <svg viewBox="0 0 64 64" width="64" height="64"><circle cx="32" cy="24" r="12" fill="#1a1a1a" opacity="0.18"/><path d="M8 60c0-13 11-22 24-22s24 9 24 22" fill="#1a1a1a" opacity="0.18"/></svg>
                      </div>
                      <div className="ws-profile-name">{it.name}</div>
                      <ul className="ws-profile-stats">
                        {it.stats.map((s, i) => (
                          <li key={i} className={`ws-profile-stat color-${s.color}`}>
                            <span className="ws-profile-stat-label">{s.label}</span>
                            <span className="ws-profile-stat-value">{s.value}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                }
                if (it.type === "brain") {
                  return (
                    <div key={it.id} className={cls} style={baseStyle} onMouseDown={onDown}>
                      <div className="ws-brain-head">
                        <span className="ws-brain-tag">{it.title}</span>
                        <span className="ws-brain-sub">{it.subtitle}</span>
                      </div>
                      <div className="ws-brain-canvas" aria-hidden="true">
                        <BrainSvg highlights={it.highlights} />
                      </div>
                      <ul className="ws-brain-legend">
                        {it.highlights.map(h => (
                          <li key={h.id} className={`ws-brain-leg color-${h.color}`}>
                            <span className="ws-brain-leg-dot" />
                            <span className="ws-brain-leg-label">{h.label}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>

          <div className="ws-toolbar" role="toolbar" aria-label="Verktyg">
            {TOOLS.map(t => (
              <button key={t.id} type="button" className={`ws-tool ${tool === t.id ? "is-active" : ""}`} onClick={() => { setTool(t.id); setPendingFrom(null); }} title={t.label} aria-label={t.label}>
                {TOOL_ICONS[t.id]}
              </button>
            ))}
            <div className="ws-tool-sep" />
            <div className="ws-tool-label" title="Templates">TPL</div>
            {TEMPLATES.map(t => (
              <button key={t.id} type="button" className="ws-tool ws-tool-tpl" onClick={t.insert} title={`Template: ${t.label}`} aria-label={`Template: ${t.label}`}>
                <span className="ws-tpl-mini" aria-hidden="true">
                  <span className="ws-tpl-mini-face" />
                  <span className="ws-tpl-mini-bar b1" />
                  <span className="ws-tpl-mini-bar b2" />
                  <span className="ws-tpl-mini-bar b3" />
                </span>
              </button>
            ))}
            <div className="ws-tool-sep" />
            <button type="button" className="ws-tool" onClick={undo} title="Ångra" aria-label="Ångra">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 14l-5-5 5-5"/><path d="M4 9h11a5 5 0 010 10h-3"/></svg>
            </button>
            <button type="button" className="ws-tool" onClick={redo} title="Gör om" aria-label="Gör om">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 14l5-5-5-5"/><path d="M20 9H9a5 5 0 000 10h3"/></svg>
            </button>
            <button type="button" className="ws-tool" onClick={deleteSelected} disabled={!selected.length} title="Radera" aria-label="Radera">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13h10l1-13"/></svg>
            </button>
          </div>

          {selectedItem && (
            <div className="ws-props" role="group" aria-label="Egenskaper">
              <span className="ws-props-label">FÄRG</span>
              <div className="ws-swatches">
                {COLORS.map(c => (
                  <button key={c} type="button" className={`ws-swatch ${(selectedItem as { color: Color }).color === c ? "is-active" : ""}`} style={{ background: COLOR_HEX[c] }} onClick={() => setItemColor(selectedItem.id, c)} aria-label={c} />
                ))}
              </div>
              <button type="button" className="ws-props-del" onClick={deleteSelected}>RADERA</button>
            </div>
          )}

          <div className="ws-zoom" role="group" aria-label="Zoom">
            <button type="button" className="ws-zoom-btn" onClick={zoomIn} aria-label="Zooma in">+</button>
            <span className="ws-zoom-val">{zoom}%</span>
            <button type="button" className="ws-zoom-btn" onClick={zoomOut} aria-label="Zooma ut">−</button>
            <button type="button" className="ws-zoom-fit" onClick={zoomFit}>FIT</button>
          </div>

          {!chatOpen && (
            <button
              type="button"
              className="ws-chat-toggle"
              onClick={() => setChatOpen(true)}
              aria-label="Öppna AI-chatt"
              title="AI-tutor"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a8 8 0 01-11.6 7.15L4 20l1-4.5A8 8 0 1121 12z" />
                <circle cx="9" cy="12" r="1" fill="currentColor" />
                <circle cx="13" cy="12" r="1" fill="currentColor" />
                <circle cx="17" cy="12" r="1" fill="currentColor" />
              </svg>
            </button>
          )}

          {(() => {
            const q = searchQuery.trim().toLowerCase();
            type Hit = { id: string; title: string; snippet: string; kind: string; target: { itemId?: string; section?: SectionId } };
            const hits: Hit[] = [];
            if (q && searchOpen) {
              const snippet = (s: string) => {
                const i = s.toLowerCase().indexOf(q);
                if (i < 0) return s.slice(0, 80);
                const start = Math.max(0, i - 25);
                return (start > 0 ? "…" : "") + s.slice(start, start + 90);
              };
              for (const it of items) {
                if (it.type === "sticky" && it.text.toLowerCase().includes(q)) hits.push({ id: it.id, title: "Notis", snippet: snippet(it.text), kind: "sticky", target: { itemId: it.id } });
                else if (it.type === "text" && it.text.toLowerCase().includes(q)) hits.push({ id: it.id, title: "Text", snippet: snippet(it.text), kind: "text", target: { itemId: it.id } });
                else if (it.type === "node") {
                  const blob = `${it.title} ${it.body}`;
                  if (blob.toLowerCase().includes(q)) hits.push({ id: it.id, title: it.title || "Modul", snippet: snippet(it.body || it.title), kind: it.tag || "Modul", target: { itemId: it.id } });
                }
                else if (it.type === "profile") {
                  const blob = `${it.name} ${it.role} ${it.stats.map(s => s.label + " " + s.value).join(" ")}`;
                  if (blob.toLowerCase().includes(q)) hits.push({ id: it.id, title: it.name, snippet: snippet(blob), kind: "Profil", target: { itemId: it.id } });
                }
                else if (it.type === "brain") {
                  const blob = `${it.title} ${it.subtitle} ${it.highlights.map(h => h.label).join(" ")}`;
                  if (blob.toLowerCase().includes(q)) hits.push({ id: it.id, title: it.title, snippet: snippet(blob), kind: "Hjärna", target: { itemId: it.id } });
                }
                else if (it.type === "pdf" && it.name.toLowerCase().includes(q)) hits.push({ id: it.id, title: it.name, snippet: "PDF-fil", kind: "PDF", target: { itemId: it.id } });
              }
              for (const sec of SECTIONS) {
                const text = notes[sec.id] ?? "";
                if (text.toLowerCase().includes(q)) hits.push({ id: `note-${sec.id}`, title: sec.label, snippet: snippet(text), kind: "Anteckning", target: { section: sec.id } });
              }
            }
            const focusItem = (id: string) => {
              const it = items.find(x => x.id === id);
              if (!it || it.type === "connector") return;
              const rect = viewportRef.current?.getBoundingClientRect();
              if (!rect) return;
              const s = scale;
              const cx = it.x + it.w / 2;
              const cy = it.y + it.h / 2;
              setPan({ x: rect.width / 2 - cx * s, y: rect.height / 2 - cy * s });
              setSelected([id]);
            };
            return (
              <div className={`ws-search-bar ${searchOpen ? "is-open" : ""}`}>
                {searchOpen && (
                  <input
                    autoFocus
                    type="text"
                    className="ws-search-input"
                    placeholder="Sök i workspace…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Escape") { setSearchOpen(false); setSearchQuery(""); } }}
                  />
                )}
                <button
                  type="button"
                  className="ws-search-icon"
                  onClick={() => { if (searchOpen) { setSearchOpen(false); setSearchQuery(""); } else setSearchOpen(true); }}
                  aria-label={searchOpen ? "Stäng sök" : "Öppna sök"}
                  title={searchOpen ? "Stäng sök" : "Sök i workspace"}
                >
                  {searchOpen ? (
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
                  ) : (
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
                  )}
                </button>
                {searchOpen && q && (
                  <div className="ws-search-dropdown">
                    {hits.length === 0 && <div className="ws-search-empty">Inga träffar för "{searchQuery}".</div>}
                    {hits.map(h => (
                      <button
                        key={h.id}
                        type="button"
                        className="ws-search-hit"
                        onClick={() => {
                          if (h.target.itemId) focusItem(h.target.itemId);
                          else if (h.target.section) { setActive(h.target.section); setShowNotes(true); }
                        }}
                      >
                        <span className="ws-search-kind">{h.kind}</span>
                        <span className="ws-search-title">{h.title}</span>
                        <span className="ws-search-snippet">{h.snippet}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

          <WorkspaceChat
            open={chatOpen}
            onClose={() => setChatOpen(false)}
            moduleId={activeModule}
            moduleLabel={activeModule ? (MODULES.find(m => m.id === activeModule)?.label ?? null) : null}
          />

          {(() => {
            const openPdf = pdfOpenId ? items.find(i => i.id === pdfOpenId && i.type === "pdf") as PdfItem | undefined : undefined;
            return (
              <div className={`ws-pdf-viewer ${openPdf && openPdf.dataUrl ? "is-open" : ""}`} role="dialog" aria-label="PDF-läsare">
                {openPdf && openPdf.dataUrl && (
                  <>
                    <div className="ws-pdf-viewer-head">
                      <div>
                        <div className="ws-pdf-viewer-label">PDF</div>
                        <h3 className="ws-pdf-viewer-title" title={openPdf.name}>{openPdf.name}</h3>
                      </div>
                      <div className="ws-pdf-viewer-actions">
                        <a className="ws-pdf-viewer-link" href={openPdf.dataUrl} target="_blank" rel="noreferrer">Ny flik</a>
                        <button type="button" className="ws-chat-close" onClick={() => setPdfOpenId(null)} aria-label="Stäng PDF">
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M18 6l-12 12"/></svg>
                        </button>
                      </div>
                    </div>
                    <object className="ws-pdf-viewer-frame" data={openPdf.dataUrl} type="application/pdf" aria-label={openPdf.name}>
                      <div className="ws-pdf-fallback">Förhandsvisning ej tillgänglig</div>
                    </object>
                  </>
                )}
              </div>
            );
          })()}
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
  --green: #4ec07a;
  --teal: #3f8f81;
  --blue: #2255cc;
  --lilac: #b6a8e8;
  --yellow: #f5d76e;
  --pink: #f1a7b0;
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

.ws-shell {
  position: relative;
  display: block;
  padding: 0;
  flex: 1;
  min-height: 0;
  --side-w: 280px;
}
.ws-shell.is-collapsed { --side-w: 56px; }

.ws-sidebar {
  position: absolute;
  top: 48px;
  left: 24px;
  width: var(--side-w);
  z-index: 4;
  background: var(--cream);
  border: 2px solid var(--ink);
  border-radius: 14px;
  box-shadow: 4px 4px 0 var(--ink);
  padding: 22px 18px;
  transition: width 0.18s ease, padding 0.18s ease;
  max-height: calc(100vh - 120px);
  overflow: auto;
}
.ws-sidebar.is-collapsed { padding: 44px 6px 8px; }
.ws-sidebar.is-collapsed .ws-side-toggle { z-index: 5; }
.ws-empty {
  position: absolute; inset: 0;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  text-align: center; padding: 24px; pointer-events: none; z-index: 2;
}
.ws-empty-label {
  font-family: 'Space Mono', monospace; font-size: 11px; letter-spacing: 0.25em; color: var(--coral);
}
.ws-empty-title {
  font-family: 'Bebas Neue', sans-serif; font-size: clamp(32px, 5vw, 56px);
  letter-spacing: 0.02em; margin: 8px 0 6px; color: var(--ink);
}
.ws-empty-sub {
  font-family: 'Barlow Condensed', sans-serif; font-size: 16px; max-width: 460px; color: var(--ink); opacity: 0.7;
}
.ws-side-toggle {
  position: absolute; top: 8px; right: 8px;
  width: 26px; height: 26px;
  display: grid; place-items: center;
  border: 2px solid var(--ink); border-radius: 999px;
  background: var(--cream); color: var(--ink); cursor: pointer;
  box-shadow: 2px 2px 0 var(--ink);
}
.ws-side-toggle:hover { background: var(--ink); color: var(--cream); }
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
.ws-sidebar.is-collapsed .ws-side-item { padding: 8px 0; justify-content: center; gap: 0; font-size: 12px; }
.ws-sidebar.is-collapsed .ws-side-hint { opacity: 1; }
.ws-sidebar.is-collapsed .ws-side-add { padding: 8px 0; font-size: 16px; border-style: solid; }
.ws-side-item:hover { transform: translate(-1px,-1px); box-shadow: 4px 4px 0 var(--ink); }
.ws-side-item.is-active { background: var(--green); color: #0a2a14; }
.ws-side-hint { font-family: 'Space Mono', monospace; font-size: 11px; opacity: 0.7; }
.ws-side-add {
  width: 100%; padding: 10px; border: 2px dashed var(--ink); border-radius: 14px;
  background: transparent; cursor: pointer;
  font-family: 'Space Mono', monospace; font-size: 12px; letter-spacing: 0.15em;
}
.ws-side-add:hover { background: var(--ink); color: var(--cream); }
.ws-side-back {
  width: 100%; padding: 8px 10px; margin-bottom: 12px;
  border: 1px solid var(--ink); border-radius: 10px;
  background: var(--cream); cursor: pointer; text-align: left;
  font-family: 'Space Mono', monospace; font-size: 11px; letter-spacing: 0.1em; color: var(--ink);
}
.ws-side-back:hover { background: var(--ink); color: var(--cream); }
.ws-side-divider { height: 1px; background: rgba(26,26,26,0.18); margin: 16px 0; }
.ws-side-notes-btn {
  width: 100%; padding: 8px 10px; border: 1px solid var(--ink); border-radius: 10px;
  background: var(--cream); cursor: pointer;
  font-family: 'Space Mono', monospace; font-size: 11px; letter-spacing: 0.12em; color: var(--ink);
}
.ws-side-notes-btn:hover { background: var(--ink); color: var(--cream); }
.ws-side-notes {
  width: 100%; min-height: 140px; margin-top: 10px;
  border: 2px solid var(--ink); border-radius: 12px; padding: 10px;
  background: #fffdf6; resize: vertical; font-family: 'Barlow Condensed', sans-serif; font-size: 14px;
  box-shadow: inset 0 0 0 1px rgba(26,26,26,0.04);
}

.ws-canvas {
  position: relative;
  background: transparent;
  overflow: hidden;
  min-height: calc(100vh - 140px);
  padding: 28px 0 28px 0;
}
.ws-viewport {
  position: absolute; left: 0; right: 0; top: 24px; bottom: 24px;
  overflow: hidden;
  cursor: grab;
  user-select: none;
}
.ws-viewport.tool-sticky, .ws-viewport.tool-text, .ws-viewport.tool-node,
.ws-viewport.tool-rect, .ws-viewport.tool-ellipse { cursor: crosshair; }
.ws-viewport.tool-connector, .ws-viewport.is-linking { cursor: cell; }
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
.ws-edges {
  position: absolute;
  overflow: visible;
  pointer-events: none;
}

.ws-item {
  position: absolute;
  cursor: grab;
}
.ws-item:active { cursor: grabbing; }
.ws-item.is-selected { outline: 2px solid var(--coral); outline-offset: 4px; border-radius: 6px; }
.ws-item.is-from { outline: 2px dashed var(--blue); outline-offset: 4px; }

.ws-lobes {
  background: transparent;
  display: flex; align-items: center; justify-content: center;
}
.ws-lobes > svg { width: 100%; height: 100%; pointer-events: none; }

.ws-sticky {
  background: var(--yellow);
  border: 2px solid var(--ink);
  border-radius: 4px;
  box-shadow: 4px 4px 0 var(--ink);
  padding: 12px 14px;
  display: flex; align-items: center; justify-content: center;
  text-align: center;
  font-family: 'Barlow Condensed', sans-serif;
}
.ws-sticky.color-yellow { background: #f5d76e; }
.ws-sticky.color-pink { background: #f1a7b0; }
.ws-sticky.color-blue { background: #a7c4f1; }
.ws-sticky.color-green { background: #a4d9a8; }
.ws-sticky.color-lilac { background: #b6a8e8; }
.ws-sticky.color-cream { background: #f5f1e8; }
.ws-sticky.color-ink { background: #1a1a1a; color: #f5f1e8; }
.ws-sticky-text { font-size: 15px; line-height: 1.3; width: 100%; word-break: break-word; }
.ws-sticky-edit {
  width: 100%; height: 100%;
  border: 0; outline: 0; background: transparent;
  font: inherit; resize: none; text-align: center;
}

.ws-text {
  display: flex; align-items: center;
  font-family: 'Bebas Neue', sans-serif;
  letter-spacing: 0.03em;
}
.ws-text-show { font-size: 22px; line-height: 1.1; width: 100%; }
.ws-text-edit { width: 100%; border: 0; outline: 0; background: transparent; font: inherit; }
.ws-text.color-coral .ws-text-show, .ws-text.color-pink .ws-text-show { color: var(--coral); }
.ws-text.color-blue .ws-text-show { color: var(--blue); }
.ws-text.color-green .ws-text-show { color: var(--green); }
.ws-text.color-cream .ws-text-show { color: var(--cream); text-shadow: 1px 1px 0 var(--ink); }
.ws-text.color-ink .ws-text-show { color: var(--ink); }

.ws-node {
  background: var(--cream);
  border: 2px solid var(--ink);
  border-radius: 18px;
  box-shadow: 4px 4px 0 var(--ink);
  padding: 12px 14px;
  display: flex; flex-direction: column; gap: 4px;
}
.ws-node.color-yellow { background: #f5d76e; }
.ws-node.color-pink { background: #f1a7b0; }
.ws-node.color-blue { background: #a7c4f1; }
.ws-node.color-green { background: #a4d9a8; }
.ws-node.color-lilac { background: #b6a8e8; }
.ws-node.color-cream { background: #f5f1e8; }
.ws-node.color-ink { background: #1a1a1a; color: #f5f1e8; }
.ws-node.color-ink p { color: rgba(245,241,232,0.8); }
.ws-node.color-ink .ws-node-tag { color: var(--cream); border-color: var(--cream); }
.ws-node h3 { font-family: 'Bebas Neue', sans-serif; font-size: 20px; margin: 2px 0 2px; letter-spacing: 0.03em; }
.ws-node p { margin: 0; font-size: 13px; color: #2a2a2a; line-height: 1.3; }
.ws-node-tag {
  align-self: flex-start; font-family: 'Space Mono', monospace;
  font-size: 10px; letter-spacing: 0.18em;
  padding: 2px 8px; border: 1px solid var(--ink); border-radius: 999px;
}
.ws-node-title-edit { font: inherit; font-family: 'Bebas Neue', sans-serif; font-size: 20px; letter-spacing: 0.03em; border: 0; outline: 0; background: rgba(255,255,255,0.4); padding: 2px 4px; border-radius: 4px; }
.ws-node-body-edit { font: inherit; font-size: 13px; resize: none; border: 0; outline: 0; background: rgba(255,255,255,0.4); padding: 4px; border-radius: 4px; flex: 1; }

.ws-rect, .ws-ellipse {
  border: 2px solid var(--ink);
  background: rgba(167,196,241,0.55);
  box-shadow: 4px 4px 0 var(--ink);
}
.ws-rect { border-radius: 14px; }
.ws-ellipse { border-radius: 50%; }
.ws-rect.color-yellow, .ws-ellipse.color-yellow { background: rgba(245,215,110,0.7); }
.ws-rect.color-pink, .ws-ellipse.color-pink { background: rgba(241,167,176,0.7); }
.ws-rect.color-blue, .ws-ellipse.color-blue { background: rgba(167,196,241,0.7); }
.ws-rect.color-green, .ws-ellipse.color-green { background: rgba(164,217,168,0.7); }
.ws-rect.color-lilac, .ws-ellipse.color-lilac { background: rgba(182,168,232,0.7); }
.ws-rect.color-cream, .ws-ellipse.color-cream { background: rgba(245,241,232,0.85); }
.ws-rect.color-ink, .ws-ellipse.color-ink { background: rgba(26,26,26,0.85); }

.ws-profile {
  background: var(--cream);
  border: 2px solid var(--ink);
  border-radius: 14px;
  box-shadow: 6px 6px 0 var(--ink);
  padding: 14px 14px 12px;
  display: flex; flex-direction: column; gap: 8px;
}
.ws-profile-tag {
  align-self: flex-start;
  font-family: 'Space Mono', monospace; font-size: 10px; letter-spacing: 0.18em;
  padding: 2px 8px; border: 1px solid var(--ink); border-radius: 999px;
  background: var(--cream);
}
.ws-profile-avatar {
  width: 100%; aspect-ratio: 4 / 3;
  background: #d6d2c4; border: 2px solid var(--ink); border-radius: 10px;
  display: grid; place-items: end center; overflow: hidden;
}
.ws-profile-name {
  font-family: 'Bebas Neue', sans-serif; font-size: 20px; letter-spacing: 0.03em;
}
.ws-profile-stats { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 4px; }
.ws-profile-stat {
  display: flex; align-items: center; justify-content: space-between;
  padding: 4px 8px; border: 1px solid var(--ink); border-radius: 6px;
  font-family: 'Space Mono', monospace; font-size: 11px;
}
.ws-profile-stat.color-yellow { background: #f5d76e; }
.ws-profile-stat.color-pink   { background: #f1a7b0; }
.ws-profile-stat.color-blue   { background: #a7c4f1; }
.ws-profile-stat.color-green  { background: #a4d9a8; }
.ws-profile-stat.color-lilac  { background: #b6a8e8; }
.ws-profile-stat.color-cream  { background: #f5f1e8; }
.ws-profile-stat.color-ink    { background: #1a1a1a; color: var(--cream); }
.ws-profile-stat-label { letter-spacing: 0.08em; }
.ws-profile-stat-value { font-weight: 700; }

.ws-side-templates { list-style: none; padding: 0; margin: 8px 0 4px; display: flex; flex-direction: column; gap: 8px; }
.ws-brain {
  background: var(--cream);
  border: 2px solid var(--ink);
  border-radius: 18px;
  box-shadow: 6px 6px 0 var(--ink);
  padding: 14px 14px 12px;
  display: flex; flex-direction: column; gap: 10px;
}
.ws-brain-head { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; }
.ws-brain-tag { font-family: 'Bebas Neue', sans-serif; font-size: 22px; letter-spacing: 0.06em; color: #2f8576; }
.ws-brain-sub { font-family: 'Space Mono', monospace; font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(26,26,26,0.55); }
.ws-brain-canvas { flex: 1; min-height: 0; background: #efece2; border: 1.5px solid var(--ink); border-radius: 14px; padding: 6px; overflow: hidden; display: grid; place-items: center; }
.ws-brain-canvas svg { display: block; width: 100%; height: 100%; }
.ws-brain-legend { list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 4px 10px; }
.ws-brain-leg { display: flex; align-items: center; gap: 6px; font-family: 'Space Mono', monospace; font-size: 10px; letter-spacing: 0.06em; color: var(--ink); }
.ws-brain-leg-dot { width: 8px; height: 8px; border-radius: 999px; border: 1px solid var(--ink); display: inline-block; }
.ws-brain-leg.color-yellow .ws-brain-leg-dot { background: #e0b94a; }
.ws-brain-leg.color-pink   .ws-brain-leg-dot { background: #cc4a6a; }
.ws-brain-leg.color-blue   .ws-brain-leg-dot { background: #2255cc; }
.ws-brain-leg.color-green  .ws-brain-leg-dot { background: #226633; }
.ws-brain-leg.color-lilac  .ws-brain-leg-dot { background: #7a5fc7; }
.ws-brain-leg.color-cream  .ws-brain-leg-dot { background: #f5f1e8; }
.ws-brain-leg.color-ink    .ws-brain-leg-dot { background: #1a1a1a; }

.ws-template-card {
  width: 100%; display: flex; align-items: center; gap: 10px;
  padding: 8px; border: 2px solid var(--ink); border-radius: 12px;
  background: var(--cream); cursor: pointer;
  box-shadow: 3px 3px 0 var(--ink);
  transition: transform 0.1s ease, box-shadow 0.1s ease;
  text-align: left;
}
.ws-template-card:hover { transform: translate(-1px,-1px); box-shadow: 4px 4px 0 var(--ink); }
.ws-template-thumb {
  position: relative; width: 44px; height: 44px; flex: none;
  border: 1.5px solid var(--ink); border-radius: 6px; background: #eceadf;
  overflow: hidden;
}
.ws-template-thumb-face {
  position: absolute; left: 6px; top: 5px; width: 16px; height: 16px;
  border-radius: 999px; background: #1a1a1a; opacity: 0.55;
}
.ws-template-thumb-bar {
  position: absolute; right: 5px; height: 4px; border-radius: 2px; border: 1px solid var(--ink);
}
.ws-template-thumb-bar.ws-tt-green  { top: 8px;  width: 18px; background: #a4d9a8; }
.ws-template-thumb-bar.ws-tt-pink   { top: 16px; width: 20px; background: #f1a7b0; }
.ws-template-thumb-bar.ws-tt-yellow { top: 24px; width: 14px; background: #f5d76e; }
.ws-template-meta { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.ws-template-name {
  font-family: 'Barlow Condensed', sans-serif; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.06em; font-size: 14px;
}
.ws-template-desc { font-family: 'Space Mono', monospace; font-size: 10px; color: rgba(26,26,26,0.6); }

.ws-toolbar {
  position: absolute; left: calc(24px + var(--side-w) + 24px); top: 48px;
  display: flex; flex-direction: column; gap: 6px;
  padding: 8px 6px;
  background: var(--cream); border: 2px solid var(--ink); border-radius: 14px;
  box-shadow: 4px 4px 0 var(--ink);
  z-index: 3;
  transition: left 0.18s ease;
}
.ws-tool {
  width: 36px; height: 36px;
  display: grid; place-items: center;
  border: 1px solid transparent; border-radius: 10px;
  background: transparent; color: var(--ink); cursor: pointer;
  transition: background 0.1s ease, color 0.1s ease;
}
.ws-tool:hover { background: rgba(26,26,26,0.08); }
.ws-tool:disabled { opacity: 0.35; cursor: not-allowed; }
.ws-tool.is-active { background: var(--ink); color: var(--cream); border-color: var(--ink); }
.ws-tool-sep { height: 1px; background: rgba(26,26,26,0.18); margin: 4px 4px; }
.ws-tool-label {
  font-family: 'Space Mono', monospace; font-size: 9px; letter-spacing: 0.18em;
  color: rgba(26,26,26,0.55); text-align: center; padding: 2px 0;
}
.ws-tool-tpl { position: relative; }
.ws-tpl-mini {
  position: relative; width: 22px; height: 22px;
  border: 1.5px solid currentColor; border-radius: 4px; display: block;
  background: transparent;
}
.ws-tpl-mini-face {
  position: absolute; left: 2px; top: 2px; width: 7px; height: 7px;
  border-radius: 999px; background: currentColor; opacity: 0.7;
}
.ws-tpl-mini-bar {
  position: absolute; right: 2px; height: 2px; border-radius: 1px; background: currentColor; opacity: 0.7;
}
.ws-tpl-mini-bar.b1 { top: 3px;  width: 9px; }
.ws-tpl-mini-bar.b2 { top: 8px;  width: 11px; }
.ws-tpl-mini-bar.b3 { top: 13px; width: 7px; }

.ws-props {
  position: absolute; left: 50%; transform: translateX(-50%); top: 48px;
  z-index: 3;
  display: flex; align-items: center; gap: 12px;
  padding: 8px 14px;
  background: var(--cream); border: 2px solid var(--ink); border-radius: 14px;
  box-shadow: 4px 4px 0 var(--ink);
}
.ws-props-label { font-family: 'Space Mono', monospace; font-size: 10px; letter-spacing: 0.18em; color: var(--ink); }
.ws-swatches { display: flex; gap: 6px; }
.ws-swatch {
  width: 22px; height: 22px; border-radius: 999px;
  border: 2px solid var(--ink); cursor: pointer; padding: 0;
}
.ws-swatch.is-active { box-shadow: 0 0 0 2px var(--cream), 0 0 0 4px var(--ink); }
.ws-props-del {
  font-family: 'Space Mono', monospace; font-size: 11px; letter-spacing: 0.15em;
  padding: 6px 10px; border: 1px solid var(--coral); border-radius: 8px;
  background: var(--cream); color: var(--coral); cursor: pointer;
}
.ws-props-del:hover { background: var(--coral); color: var(--cream); }

.ws-zoom {
  position: absolute; right: 24px; bottom: 48px;
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
  font-family: 'Space Mono', monospace; font-size: 10px; letter-spacing: 0;
  color: var(--ink); display: inline-block; width: 36px; text-align: center;
  font-variant-numeric: tabular-nums; white-space: nowrap; overflow: hidden;
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
  .ws-toolbar { left: 24px; top: 12px; flex-direction: row; }
}

/* AI chat */
.ws-chat-toggle {
  position: absolute; top: 48px; right: 24px;
  width: 44px; height: 44px;
  display: grid; place-items: center;
  border: 2px solid var(--ink); border-radius: 14px;
  background: var(--cream); color: var(--ink); cursor: pointer;
  box-shadow: 4px 4px 0 var(--ink);
  z-index: 5;
  transition: transform 0.1s ease, box-shadow 0.1s ease, background 0.15s ease;
}
.ws-chat-toggle:hover { background: var(--green); transform: translate(-1px,-1px); box-shadow: 5px 5px 0 var(--ink); }

/* Search */
.ws-search-bar {
  position: absolute; top: 48px; right: 80px;
  height: 44px;
  display: flex; align-items: stretch;
  z-index: 5;
}
.ws-search-bar.is-open {
  background: var(--cream);
  border: 2px solid var(--ink); border-radius: 14px;
  box-shadow: 4px 4px 0 var(--ink);
  width: min(360px, 60vw);
}
.ws-search-icon {
  width: 44px; height: 44px;
  display: grid; place-items: center;
  border: 2px solid var(--ink); border-radius: 14px;
  background: var(--cream); color: var(--ink); cursor: pointer;
  box-shadow: 4px 4px 0 var(--ink);
  transition: transform 0.1s ease, box-shadow 0.1s ease, background 0.15s ease;
  flex: none;
}
.ws-search-icon:hover { background: var(--yellow); transform: translate(-1px,-1px); box-shadow: 5px 5px 0 var(--ink); }
.ws-search-bar.is-open .ws-search-icon {
  border: 0; box-shadow: none; background: transparent;
  width: 40px; height: 40px; margin: auto 2px auto 0;
}
.ws-search-bar.is-open .ws-search-icon:hover { background: transparent; transform: none; box-shadow: none; color: var(--coral); }
.ws-search-input {
  flex: 1; border: 0; outline: none; background: transparent;
  padding: 0 14px;
  font-family: 'Space Mono', monospace; font-size: 13px; color: var(--ink);
}
.ws-search-dropdown {
  position: absolute; top: calc(100% + 6px); right: 0;
  width: 100%;
  max-height: 360px; overflow-y: auto;
  background: var(--cream);
  border: 2px solid var(--ink); border-radius: 12px;
  box-shadow: 4px 4px 0 var(--ink);
  padding: 6px;
  display: flex; flex-direction: column; gap: 6px;
}
.ws-search-empty {
  padding: 18px 12px; font-size: 12px; color: var(--ink); opacity: 0.6;
  font-family: 'Space Mono', monospace;
}
.ws-search-hit {
  display: grid; grid-template-columns: auto 1fr; grid-template-rows: auto auto;
  gap: 2px 10px; padding: 10px 12px;
  background: #fff; border: 2px solid var(--ink); border-radius: 8px;
  cursor: pointer; text-align: left;
  transition: transform 0.1s ease, box-shadow 0.1s ease;
}
.ws-search-hit:hover { transform: translate(-1px,-1px); box-shadow: 3px 3px 0 var(--ink); }
.ws-search-kind {
  grid-row: 1; grid-column: 1;
  font-family: 'Space Mono', monospace; font-size: 9px; letter-spacing: 0.18em;
  color: var(--coral); align-self: center; text-transform: uppercase;
}
.ws-search-title {
  grid-row: 1; grid-column: 2;
  font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 14px; color: var(--ink);
}
.ws-search-snippet {
  grid-row: 2; grid-column: 1 / -1;
  font-family: 'Space Mono', monospace; font-size: 11px; color: var(--ink); opacity: 0.7;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

.ws-chat {
  position: absolute; top: 48px; right: 24px; bottom: 48px;
  width: min(380px, 92vw);
  background: var(--cream);
  border: 2px solid var(--ink); border-radius: 14px;
  box-shadow: 4px 4px 0 var(--ink);
  display: flex; flex-direction: column;
  z-index: 6;
  transform: translateX(calc(100% + 40px));
  opacity: 0;
  pointer-events: none;
  transition: transform 0.22s ease, opacity 0.18s ease;
}
.ws-chat.is-open { transform: translateX(0); opacity: 1; pointer-events: auto; }

.ws-chat-head {
  display: flex; align-items: flex-start; justify-content: space-between;
  padding: 16px 18px 12px;
  border-bottom: 2px solid var(--ink);
}
.ws-chat-label {
  font-family: 'Space Mono', monospace; font-size: 10px; letter-spacing: 0.22em; color: var(--coral);
}
.ws-chat-title {
  font-family: 'Bebas Neue', sans-serif; font-size: 24px; line-height: 1; margin: 4px 0 0; letter-spacing: 0.02em;
}
.ws-chat-close {
  width: 26px; height: 26px; display: grid; place-items: center;
  border: 2px solid var(--ink); border-radius: 999px;
  background: var(--cream); color: var(--ink); cursor: pointer;
  box-shadow: 2px 2px 0 var(--ink);
}
.ws-chat-close:hover { background: var(--ink); color: var(--cream); }

.ws-chat-scroll {
  flex: 1; min-height: 0; overflow-y: auto;
  padding: 16px 16px 8px;
  display: flex; flex-direction: column; gap: 12px;
}
.ws-chat-empty {
  font-family: 'Barlow Condensed', sans-serif; font-size: 15px;
  color: var(--ink); opacity: 0.7; padding: 8px 4px;
}
.ws-chat-msg { display: flex; }
.ws-chat-msg.is-user { justify-content: flex-end; }
.ws-chat-msg.is-assistant { justify-content: flex-start; }
.ws-chat-bubble-user {
  background: var(--ink); color: var(--cream);
  padding: 10px 14px; border-radius: 14px 14px 4px 14px;
  max-width: 85%; font-family: 'Barlow Condensed', sans-serif; font-size: 15px;
  white-space: pre-wrap; line-height: 1.35;
}
.ws-chat-bubble-assistant {
  background: transparent; color: var(--ink);
  padding: 4px 2px;
  max-width: 100%; font-family: 'Barlow Condensed', sans-serif; font-size: 15px;
  white-space: pre-wrap; line-height: 1.45;
}
.ws-chat-thinking { opacity: 0.55; font-style: italic; }
.ws-chat-error {
  font-family: 'Space Mono', monospace; font-size: 12px;
  color: var(--coral); padding: 8px 4px;
}

.ws-chat-form {
  display: flex; gap: 8px; align-items: flex-end;
  padding: 10px 12px 12px;
  border-top: 2px solid var(--ink);
}
.ws-chat-input {
  flex: 1; resize: none;
  border: 2px solid var(--ink); border-radius: 12px;
  background: var(--cream); padding: 10px 12px;
  font-family: 'Barlow Condensed', sans-serif; font-size: 15px; line-height: 1.35;
  outline: none; color: var(--ink);
  box-shadow: 2px 2px 0 var(--ink);
}
.ws-chat-input:focus { box-shadow: 3px 3px 0 var(--ink); }
.ws-chat-send {
  width: 40px; height: 40px; display: grid; place-items: center;
  border: 2px solid var(--ink); border-radius: 12px;
  background: var(--green); color: #0a2a14; cursor: pointer;
  box-shadow: 2px 2px 0 var(--ink);
}
.ws-chat-send:hover:not(:disabled) { transform: translate(-1px,-1px); box-shadow: 3px 3px 0 var(--ink); }
.ws-chat-send:disabled { opacity: 0.4; cursor: not-allowed; }

.ws-pdf {
  background: var(--cream);
  border: 2px solid var(--ink);
  border-radius: 14px;
  box-shadow: 4px 4px 0 var(--ink);
  padding: 8px;
  display: flex; flex-direction: column; gap: 6px;
  overflow: hidden;
}
.ws-pdf.color-yellow { background: #f5d76e; }
.ws-pdf.color-pink { background: #f1a7b0; }
.ws-pdf.color-blue { background: #a7c4f1; }
.ws-pdf.color-green { background: #a4d9a8; }
.ws-pdf.color-lilac { background: #b6a8e8; }
.ws-pdf.color-cream { background: #f5f1e8; }
.ws-pdf.color-ink { background: #1a1a1a; color: #f5f1e8; }
.ws-pdf-head { display: flex; align-items: center; gap: 8px; padding: 2px 4px; }
.ws-pdf-tag {
  font-family: 'Space Mono', monospace; font-size: 10px; letter-spacing: 0.18em;
  padding: 2px 8px; border: 1px solid currentColor; border-radius: 999px;
}
.ws-pdf-name { flex: 1; min-width: 0; font-family: 'Barlow Condensed', sans-serif; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ws-pdf-open { font-family: 'Space Mono', monospace; font-size: 11px; color: inherit; text-decoration: underline; cursor: pointer; }
.ws-pdf-preview {
  flex: 1; width: 100%; min-height: 0;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px;
  border: 1.5px solid var(--ink); border-radius: 8px; background: #efece2;
  color: var(--ink); cursor: pointer;
}
.ws-pdf-preview:hover { background: #e6e2d3; }
.ws-pdf-preview-cta { font-family: 'Space Mono', monospace; font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; }
.ws-pdf-fallback { display: grid; place-items: center; width: 100%; height: 100%; font-family: 'Space Mono', monospace; font-size: 11px; color: var(--ink); opacity: 0.6; }
.ws-pdf-drop {
  flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px;
  border: 2px dashed var(--ink); border-radius: 10px; padding: 18px 12px; cursor: pointer;
  text-align: center;
}
.ws-pdf-drop:hover { background: rgba(26,26,26,0.04); }
.ws-pdf-cta { font-family: 'Bebas Neue', sans-serif; font-size: 20px; letter-spacing: 0.04em; }
.ws-pdf-hint { font-family: 'Space Mono', monospace; font-size: 10px; letter-spacing: 0.12em; opacity: 0.65; text-transform: uppercase; }
.ws-pdf-input { position: absolute; opacity: 0; pointer-events: none; width: 0; height: 0; }

.ws-pdf-viewer {
  position: absolute; top: 48px; right: 24px; bottom: 48px; left: 24px;
  background: var(--cream);
  border: 2px solid var(--ink); border-radius: 14px;
  box-shadow: 4px 4px 0 var(--ink);
  display: flex; flex-direction: column;
  z-index: 7;
  transform: translateY(20px) scale(0.98);
  opacity: 0;
  pointer-events: none;
  transition: transform 0.22s ease, opacity 0.18s ease;
}
.ws-pdf-viewer.is-open { transform: translateY(0) scale(1); opacity: 1; pointer-events: auto; }
.ws-pdf-viewer-head {
  display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;
  padding: 14px 18px; border-bottom: 2px solid var(--ink);
}
.ws-pdf-viewer-label { font-family: 'Space Mono', monospace; font-size: 10px; letter-spacing: 0.22em; color: var(--coral); }
.ws-pdf-viewer-title { font-family: 'Bebas Neue', sans-serif; font-size: 24px; line-height: 1; margin: 4px 0 0; letter-spacing: 0.02em; max-width: 70vw; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ws-pdf-viewer-actions { display: flex; align-items: center; gap: 10px; }
.ws-pdf-viewer-link {
  font-family: 'Space Mono', monospace; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase;
  padding: 6px 10px; border: 1.5px solid var(--ink); border-radius: 10px;
  color: var(--ink); text-decoration: none; background: var(--cream); box-shadow: 2px 2px 0 var(--ink);
}
.ws-pdf-viewer-link:hover { background: var(--ink); color: var(--cream); }
.ws-pdf-viewer-frame { flex: 1; width: 100%; min-height: 0; border: 0; background: #efece2; border-radius: 0 0 12px 12px; }
`;
