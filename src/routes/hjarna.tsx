import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/hjarna")({
  head: () => ({
    meta: [
      { title: "Hjärna — Interaktivt nätverk" },
      { name: "description", content: "Interaktiv hjärna — nätverksvisualisering." },
    ],
  }),
  component: HjarnaPage,
});

function HjarnaPage() {
  return (
    <div style={{ position: "fixed", inset: 0, background: "#f5f1e8" }}>
      <iframe
        src="/interaktiv-hjarna.html"
        title="Interaktiv hjärna"
        style={{ width: "100%", height: "100%", border: "none", display: "block" }}
      />
    </div>
  );
}