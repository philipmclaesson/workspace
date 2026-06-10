import { createFileRoute } from "@tanstack/react-router";
import { BracketLandingPage } from "@/components/bracket/BracketLandingPage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bracket — Build Better March Madness Predictions" },
      { name: "description", content: "Create your perfect bracket, join groups with friends, and compete for bracket supremacy with an exclusive dual scoring system." },
      { property: "og:title", content: "Bracket — Build Better March Madness Predictions" },
      { property: "og:description", content: "Create your perfect bracket, join groups with friends, and compete for bracket supremacy." },
    ],
  }),
  component: Index,
});

function Index() {
  return <BracketLandingPage />;
}
