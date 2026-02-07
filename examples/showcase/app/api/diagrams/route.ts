import { streamText } from "ai";
import { getDiagramPrompt } from "@/lib/diagrams/catalog";

export const maxDuration = 60;

const SYSTEM_PROMPT = getDiagramPrompt();
const MAX_PROMPT_LENGTH = 1000;
const DEFAULT_MODEL = "anthropic/claude-haiku-4.5";

export async function POST(req: Request) {
  const { prompt } = await req.json();
  const sanitizedPrompt = String(prompt || "").slice(0, MAX_PROMPT_LENGTH);

  const result = streamText({
    model: process.env.AI_GATEWAY_MODEL || DEFAULT_MODEL,
    system: SYSTEM_PROMPT,
    prompt: `Create a flowchart diagram for: ${sanitizedPrompt}`,
    temperature: 0.7,
  });

  return result.toTextStreamResponse();
}
