import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

type ChatRequestBody = { messages?: unknown; module?: unknown };

const SYSTEM_PROMPT = `Du är en hjälpsam AI-tutor inom psykologi för svenska universitetsstudenter. Du svarar koncist på svenska, förklarar begrepp tydligt med exempel, och hjälper studenten tänka kritiskt. När frågan rör en specifik delkurs (t.ex. "Biologisk psykologi"), håll dig nära dess innehåll.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages, module } = (await request.json()) as ChatRequestBody;
        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }
        const key = process.env.LOVABLE_API_KEY;
        if (!key) {
          return new Response("Missing LOVABLE_API_KEY", { status: 500 });
        }

        const gateway = createLovableAiGatewayProvider(key);
        const model = gateway("google/gemini-3-flash-preview");

        const system = typeof module === "string" && module.length > 0
          ? `${SYSTEM_PROMPT}\n\nAktuell delkurs: ${module}.`
          : SYSTEM_PROMPT;

        const result = streamText({
          model,
          system,
          messages: await convertToModelMessages(messages as UIMessage[]),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: messages as UIMessage[],
        });
      },
    },
  },
});