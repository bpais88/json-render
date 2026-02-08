import { streamText } from "ai";
import { gateway } from "@ai-sdk/gateway";
import { getAdventurePrompt } from "@/lib/adventure/catalog";

export const maxDuration = 60;

const SYSTEM_PROMPT = getAdventurePrompt();
const MAX_PROMPT_LENGTH = 1000;
const MAX_HISTORY_ENTRIES = 10;
const DEFAULT_MODEL = "anthropic/claude-haiku-4.5";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const gameState = body.gameState;
    const choiceText = String(body.choiceText || "").slice(
      0,
      MAX_PROMPT_LENGTH,
    );
    const history = Array.isArray(body.history)
      ? body.history.slice(-MAX_HISTORY_ENTRIES)
      : [];

    const contextParts: string[] = [];

    if (gameState && typeof gameState === "object") {
      contextParts.push(`CURRENT GAME STATE:`);
      contextParts.push(
        `- Health: ${Number(gameState.health) || 0}/${Number(gameState.maxHealth) || 100}`,
      );
      contextParts.push(`- Gold: ${Number(gameState.gold) || 0}`);
      if (
        Array.isArray(gameState.inventory) &&
        gameState.inventory.length > 0
      ) {
        contextParts.push(
          `- Inventory: ${gameState.inventory.map((i: { name: string }) => String(i.name || "")).join(", ")}`,
        );
      } else {
        contextParts.push(`- Inventory: empty`);
      }
      contextParts.push(
        `- Current location: ${String(gameState.location || "Unknown").slice(0, 200)}`,
      );
    }

    if (history.length > 0) {
      contextParts.push(`\nSTORY SO FAR:`);
      for (const entry of history) {
        if (entry && typeof entry === "object") {
          contextParts.push(
            `- [${String(entry.location || "").slice(0, 100)}] ${String(entry.summary || "").slice(0, 300)}`,
          );
          if (entry.choice) {
            contextParts.push(
              `  Player chose: "${String(entry.choice).slice(0, 200)}"`,
            );
          }
        }
      }
    }

    let userPrompt: string;
    if (history.length === 0) {
      const theme = String(gameState?.theme || "classic fantasy").slice(0, 200);
      userPrompt = `Start a new adventure with this theme: ${theme}\n\n${contextParts.join("\n")}`;
    } else {
      userPrompt = `The player chose: "${choiceText}"\n\nContinue the story based on this choice.\n\n${contextParts.join("\n")}`;
    }

    const result = streamText({
      model: gateway(process.env.AI_GATEWAY_MODEL || DEFAULT_MODEL),
      system: SYSTEM_PROMPT,
      prompt: userPrompt,
      temperature: 0.8,
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
