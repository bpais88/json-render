import { streamText } from "ai";
import { gateway } from "@ai-sdk/gateway";
import { getSlidePrompt } from "@/lib/slides/catalog";

export const maxDuration = 60;

const SYSTEM_PROMPT = getSlidePrompt();
const MAX_PROMPT_LENGTH = 1000;
const DEFAULT_MODEL = "anthropic/claude-haiku-4.5";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    const sanitizedPrompt = String(prompt || "").slice(0, MAX_PROMPT_LENGTH);

    const result = streamText({
      model: gateway(process.env.AI_GATEWAY_MODEL || DEFAULT_MODEL),
      system: SYSTEM_PROMPT,
      prompt: `Create a presentation about: ${sanitizedPrompt}`,
      temperature: 0.7,
    });

    return result.toTextStreamResponse();
  } catch (e) {
    const message = e instanceof Error ? e.message : "Internal server error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
