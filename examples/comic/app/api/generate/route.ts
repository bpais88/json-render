import { streamText } from "ai";
import { getComicPrompt } from "@/lib/catalog";

export const maxDuration = 60;

const SYSTEM_PROMPT = getComicPrompt();
const MAX_PROMPT_LENGTH = 1000;
const DEFAULT_MODEL = "anthropic/claude-haiku-4.5";

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const sanitizedPrompt = String(prompt || "").slice(0, MAX_PROMPT_LENGTH);

  const result = streamText({
    model: process.env.AI_GATEWAY_MODEL || DEFAULT_MODEL,
    system: SYSTEM_PROMPT,
    prompt: `Create a comic strip about: ${sanitizedPrompt}`,
    temperature: 0.8,
  });

  return result.toTextStreamResponse();
}
