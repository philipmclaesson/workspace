// supabase/functions/brand-radar/index.ts
// Edge-funktion: tar emot ett varumärkesnamn, låter Claude söka på webben
// efter hur varumärket beskrivs, och returnerar attributpoäng som JSON.
//
// Kräver secret: ANTHROPIC_API_KEY
// Kräver att web search är aktiverat i Anthropic Console (Settings → Privacy).

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

// Samma sex attribut som fram-änden. Definitionerna styr poängsättningen,
// så håll dem synkade om du ändrar attributuppsättningen.
const ATTRIBUTES = [
  { id: "prestige",     name: "Prestige",             def: "premium image, status, exclusivity, high-end positioning" },
  { id: "modern",       name: "Modern & innovativ",   def: "innovation, technology, forward-looking, trendsetting" },
  { id: "inspirerande", name: "Inspirerande",         def: "inspirational, emotionally engaging, aspirational lifestyle" },
  { id: "personal",     name: "Kunnig personal",      def: "knowledgeable staff, expertise, competent service and support" },
  { id: "forskning",    name: "Forskningsorienterad", def: "research-driven, scientific, evidence-based, R&D investment" },
  { id: "prisvard",     name: "Prisvärd",             def: "affordable, good value for money, accessible pricing" },
] as const;

function buildPrompt(brand: string): string {
  const attrList = ATTRIBUTES.map(a => `- "${a.id}" (${a.name}): ${a.def}`).join("\n");
  return `You are a brand perception analyst. Research the brand "${brand}" using web search.

Search for how people, media and customers actually describe ${brand}: reviews, news articles, brand rankings, social media commentary, forum discussions. Run several searches from different angles, for example "${brand} brand perception", "${brand} reviews", "${brand} omdöme". Use both international and Swedish sources where relevant.

Then score how strongly ${brand} is associated with each attribute on a 0-100 scale, where 0 = the association never appears in sources and 100 = an association the brand clearly owns and is famous for. Base every score on what the sources actually say, not on your prior assumptions.

Attributes:
${attrList}

Respond with ONLY a valid JSON object — no markdown fences, no preamble, no explanation outside the JSON:
{
  "scores": { "prestige": <0-100>, "modern": <0-100>, "inspirerande": <0-100>, "personal": <0-100>, "forskning": <0-100>, "prisvard": <0-100> },
  "sourceCount": <number of distinct sources that informed your scores>,
  "summary": "<two short sentences in Swedish: the brand's strongest association and its weakest>"
}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { brand } = await req.json();
    if (!brand || typeof brand !== "string" || brand.trim().length < 2) {
      return json({ error: "Ange ett varumärkesnamn (minst 2 tecken)." }, 400);
    }

    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) {
      return json({ error: "ANTHROPIC_API_KEY saknas som secret i projektet." }, 500);
    }

    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 2500,
        tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 6 }],
        messages: [{ role: "user", content: buildPrompt(brand.trim()) }],
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      console.error("Anthropic API error:", resp.status, errText);
      return json({ error: `Anthropic API svarade ${resp.status}. Kontrollera API-nyckel och att web search är aktiverat i Console.` }, 502);
    }

    const data = await resp.json();

    // Antal genomförda sökningar (server_tool_use-block)
    const searchCount = (data.content ?? []).filter(
      (b: { type: string }) => b.type === "server_tool_use",
    ).length;

    // Plocka textblocken (svaret kan innehålla flera block-typer), hitta JSON-objektet
    const text = (data.content ?? [])
      .filter((b: { type: string }) => b.type === "text")
      .map((b: { text: string }) => b.text)
      .join("\n");

    const clean = text.replace(/```json|```/g, "").trim();
    const start = clean.indexOf("{");
    const end = clean.lastIndexOf("}");
    if (start === -1 || end === -1) {
      console.error("Inget JSON i modellsvaret:", clean.slice(0, 500));
      return json({ error: "Kunde inte tolka analysen. Försök igen." }, 502);
    }

    const parsed = JSON.parse(clean.slice(start, end + 1));
    const clamp = (v: unknown) => Math.max(0, Math.min(100, Math.round(Number(v) || 0)));

    const scores: Record<string, number> = {};
    for (const a of ATTRIBUTES) scores[a.id] = clamp(parsed.scores?.[a.id]);

    return json({
      brand: brand.trim(),
      scores,
      sourceCount: Number(parsed.sourceCount) || searchCount,
      summary: typeof parsed.summary === "string" ? parsed.summary : "",
      searches: searchCount,
    });
  } catch (e) {
    console.error("brand-radar error:", e);
    return json({ error: "Något gick fel i analysen. Försök igen." }, 500);
  }
});
