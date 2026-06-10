/**
 * LoberBrain.tsx — visualisering av LOBER-hjärnan för FAVO!-workspacet.
 *
 * Ren, transparent SVG-komponent. Ingen bakgrund, inga typsnitt-imports
 * (antas finnas i Lovable). Använder workspacets egna COLOR_HEX-värden.
 *
 * Lägg den ovanpå canvasen, t.ex.:
 *   <div style={{ position:"absolute", inset:0, pointerEvents:"none" }}>
 *     <div style={{ position:"absolute", left:CX, top:CY, width:520, pointerEvents:"auto" }}>
 *       <LoberBrain onRegionClick={(id) => ...} />
 *     </div>
 *   </div>
 * Eller rendera den inuti en brain-item i din befintliga canvas.
 *
 * Klick-innehåll (kunskapsceller) kommer i nästa fil — onRegionClick är
 * förberedd men valfri.
 */
import * as React from "react";

type RegionId = "frontal" | "parietal" | "temporal" | "occipital" | "limbiska";

const COLOR_HEX: Record<string, string> = {
  yellow: "#f5d76e", pink: "#f1a7b0", blue: "#a7c4f1",
  green: "#a4d9a8", lilac: "#b6a8e8", ink: "#1a1a1a",
};
const REGION_COLOR: Record<RegionId, keyof typeof COLOR_HEX> = {
  frontal: "yellow", parietal: "blue", temporal: "green", occipital: "lilac", limbiska: "pink",
};

const OUTLINE = "M 482 142 Q 444 108 404 140 Q 358 128 340 184 Q 300 206 302 262 Q 272 304 292 352 Q 270 400 296 446 Q 282 496 318 532 Q 322 580 368 598 Q 398 636 438 630 Q 466 640 482 624 L 482 142 Z";

// [region, cx, cy, r] — vänster hemisfär (höger speglas)
const NODES: [RegionId, number, number, number][] = [
  ["limbiska",446.0,476.0,12],
  ["parietal",369.6,418.3,9],
  ["frontal",396.3,225.1,6.5],
  ["parietal",316.9,360.0,5],
  ["temporal",409.5,447.0,5],
  ["occipital",403.4,558.3,4.5],
  ["parietal",371.9,356.9,9],
  ["frontal",391.5,185.6,4.5],
  ["parietal",447.6,329.1,4.5],
  ["frontal",430.1,190.8,5],
  ["temporal",353.0,450.4,5],
  ["occipital",459.9,551.2,5],
  ["frontal",381.4,261.4,7],
  ["frontal",419.5,262.3,9],
  ["parietal",459.2,382.9,6.5],
  ["parietal",314.9,319.9,6.5],
  ["temporal",345.5,507.4,6.5],
  ["parietal",406.0,378.4,7],
  ["parietal",362.4,300.0,7],
  ["temporal",382.6,518.2,5.5],
  ["frontal",334.5,240.3,6],
  ["temporal",413.1,498.9,9],
  ["frontal",452.8,151.4,7],
  ["parietal",406.9,338.7,5],
  ["occipital",436.8,596.7,4.5],
  ["temporal",382.6,479.1,6],
  ["parietal",323.8,401.2,5.5],
  ["parietal",444.6,419.2,5],
  ["occipital",355.5,565.3,6.5],
  ["temporal",317.9,448.2,5.5],
  ["temporal",319.8,481.4,9],
  ["temporal",427.4,530.7,9],
  ["parietal",407.6,412.9,7],
  ["temporal",457.7,515.4,4.5],
  ["frontal",350.6,209.7,5.5],
  ["frontal",454.4,274.9,4.5],
  ["frontal",415.4,295.3,6],
  ["parietal",346.8,332.0,7],
  ["frontal",417.1,160.4,5.5],
  ["frontal",324.2,288.2,7],
  ["frontal",449.5,235.5,6.5],
  ["occipital",395.3,593.2,5.5],
  ["parietal",357.6,387.2,4.5],
  ["parietal",433.7,359.2,5]
];
// [x1, y1, x2, y2] — kanter, vänster hemisfär
const EDGES: [number, number, number, number][] = [
  [446.0,476.0,409.5,447.0],
  [446.0,476.0,413.1,498.9],
  [446.0,476.0,457.7,515.4],
  [369.6,418.3,353.0,450.4],
  [369.6,418.3,357.6,387.2],
  [396.3,225.1,391.5,185.6],
  [396.3,225.1,381.4,261.4],
  [316.9,360.0,314.9,319.9],
  [316.9,360.0,323.8,401.2],
  [316.9,360.0,346.8,332.0],
  [409.5,447.0,382.6,479.1],
  [409.5,447.0,407.6,412.9],
  [403.4,558.3,436.8,596.7],
  [403.4,558.3,355.5,565.3],
  [403.4,558.3,427.4,530.7],
  [403.4,558.3,395.3,593.2],
  [371.9,356.9,406.9,338.7],
  [371.9,356.9,346.8,332.0],
  [371.9,356.9,357.6,387.2],
  [391.5,185.6,430.1,190.8],
  [391.5,185.6,350.6,209.7],
  [391.5,185.6,417.1,160.4],
  [447.6,329.1,406.9,338.7],
  [447.6,329.1,433.7,359.2],
  [430.1,190.8,452.8,151.4],
  [430.1,190.8,417.1,160.4],
  [353.0,450.4,317.9,448.2],
  [459.9,551.2,427.4,530.7],
  [459.9,551.2,457.7,515.4],
  [381.4,261.4,419.5,262.3],
  [419.5,262.3,454.4,274.9],
  [419.5,262.3,415.4,295.3],
  [419.5,262.3,449.5,235.5],
  [459.2,382.9,444.6,419.2],
  [459.2,382.9,433.7,359.2],
  [314.9,319.9,346.8,332.0],
  [314.9,319.9,324.2,288.2],
  [345.5,507.4,382.6,518.2],
  [345.5,507.4,319.8,481.4],
  [406.0,378.4,407.6,412.9],
  [406.0,378.4,433.7,359.2],
  [362.4,300.0,346.8,332.0],
  [362.4,300.0,324.2,288.2],
  [382.6,518.2,413.1,498.9],
  [382.6,518.2,382.6,479.1],
  [334.5,240.3,350.6,209.7],
  [334.5,240.3,324.2,288.2],
  [413.1,498.9,382.6,479.1],
  [413.1,498.9,427.4,530.7],
  [452.8,151.4,417.1,160.4],
  [406.9,338.7,433.7,359.2],
  [436.8,596.7,395.3,593.2],
  [323.8,401.2,357.6,387.2],
  [444.6,419.2,407.6,412.9],
  [355.5,565.3,395.3,593.2],
  [317.9,448.2,319.8,481.4],
  [427.4,530.7,457.7,515.4],
  [454.4,274.9,415.4,295.3],
  [454.4,274.9,449.5,235.5]
];

// kort: [region, x, y, w, tag, titel, beskrivning, connector "x1 y1 x2 y2"]
const CARDS: [RegionId, number, number, number, string, string, string, string][] = [
  ["frontal",   92, 104, 212, "EXEKUTIV", "FRONTALLOB",        "Beslut, planering, impulser",          "304 147 322.5 276.3"],
  ["parietal", 742, 236, 212, "SENSORIK", "PARIETALLOB",       "Känsel, rumsuppfattning",              "742 279 675.3 314.5"],
  ["temporal",  44, 420, 212, "MINNE",    "TEMPORALLOB",       "Hörsel, språk, hippocampus",           "256 463 307.7 450.7"],
  ["occipital",730, 556, 212, "SYN",      "OCCIPITALLOB",      "Visuell bearbetning",                  "730 599 635.5 568.8"],
  ["limbiska", 104, 614, 232, "EMOTION",  "LIMBISKA SYSTEMET", "Amygdala, hippocampus, hypothalamus",  "336 657 437.2 490.5"],
];

const css = `
.lb-svg { width:100%; height:auto; display:block; overflow:visible; }
.lb-node { cursor:pointer; transform-box:fill-box; transform-origin:center;
  transition:transform .18s ease, filter .18s ease; }
.lb-node.is-hot { transform:scale(1.3); filter:brightness(.92); }
.lb-tag   { font:700 9.5px "Space Mono",monospace; letter-spacing:1px; fill:#1a1a1a; }
.lb-title { font:400 22px "Bebas Neue",sans-serif; letter-spacing:.04em; fill:#1a1a1a; }
.lb-cap   { font:400 10px "Space Mono",monospace; fill:#1a1a1a; opacity:.72; }
.lb-card { cursor:pointer; }
.lb-card .lb-body { transition:transform .18s ease; }
.lb-card.is-hot .lb-body, .lb-card:hover .lb-body { transform:translate(-4px,-4px); }
@media (prefers-reduced-motion:reduce){ .lb-node,.lb-card .lb-body{ transition:none; } }
`;

export default function LoberBrain({ onRegionClick }: { onRegionClick?: (id: RegionId) => void }) {
  const [hot, setHot] = React.useState<RegionId | null>(null);
  const hx = (r: RegionId) => (hot === r ? " is-hot" : "");
  const col = (r: RegionId) => COLOR_HEX[REGION_COLOR[r]];

  const Hemi = ({ mirror }: { mirror?: boolean }) => (
    <g transform={mirror ? "translate(980 0) scale(-1 1)" : undefined}>
      <g clipPath="url(#lbClip)">
        <path d={OUTLINE} fill="#FFFFFF" />
        {EDGES.map(([x1, y1, x2, y2], i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#161514" strokeOpacity={0.4} strokeWidth={1.6} />
        ))}
        {NODES.map(([r, cx, cy, rr], i) => (
          <circle key={i} className={"lb-node" + hx(r)} cx={cx} cy={cy} r={rr}
            fill={col(r)} stroke="#161514" strokeWidth={2.2}
            onMouseEnter={() => setHot(r)} onMouseLeave={() => setHot(null)}
            onClick={() => onRegionClick?.(r)} />
        ))}
      </g>
      <path d={OUTLINE} fill="none" stroke="#161514" strokeWidth={3.5} strokeLinejoin="round" />
    </g>
  );

  return (
    <svg className="lb-svg" viewBox="0 0 980 760" xmlns="http://www.w3.org/2000/svg"
      role="img" aria-label="Hjärnans lober">
      <style>{css}</style>
      <defs><clipPath id="lbClip"><path d={OUTLINE} /></clipPath></defs>

      {/* hård skugga */}
      <g transform="translate(8 8)" fill="#161514">
        <path d={OUTLINE} />
        <path d={OUTLINE} transform="translate(980 0) scale(-1 1)" />
      </g>

      <Hemi />
      <Hemi mirror />

      {CARDS.map(([r, x, y, w, tag, title, cap, conn]) => {
        const [cx1, cy1, cx2, cy2] = conn.split(" ").map(Number);
        const chipW = 18 + tag.length * 6.6;
        return (
          <g key={r}>
            <path d={`M ${cx1} ${cy1} L ${cx2} ${cy2}`} fill="none" stroke="#161514"
              strokeWidth={2} strokeDasharray="2 7" strokeLinecap="round" />
            <g className={"lb-card" + hx(r)}
              onMouseEnter={() => setHot(r)} onMouseLeave={() => setHot(null)}
              onClick={() => onRegionClick?.(r)}>
              <rect x={x + 5} y={y + 5} width={w} height={86} rx={14} fill="#161514" />
              <g className="lb-body">
                <rect x={x} y={y} width={w} height={86} rx={14} fill="#FFFFFF" stroke="#161514" strokeWidth={2.5} />
                <rect x={x + 14} y={y + 12} width={chipW} height={19} rx={9.5}
                  fill={col(r)} stroke="#161514" strokeWidth={1.8} />
                <text x={x + 14 + chipW / 2} y={y + 25.5} className="lb-tag" textAnchor="middle">{tag}</text>
                <text x={x + 14} y={y + 54} className="lb-title">{title}</text>
                <text x={x + 14} y={y + 73} className="lb-cap">{cap}</text>
              </g>
            </g>
          </g>
        );
      })}
    </svg>
  );
}
