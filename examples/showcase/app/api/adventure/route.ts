import { streamText } from "ai";
import { getAdventurePrompt } from "@/lib/adventure/catalog";

export const maxDuration = 60;

const SYSTEM_PROMPT = getAdventurePrompt();
const DEFAULT_MODEL = "anthropic/claude-haiku-4.5";

export async function POST(req: Request) {
  const { gameState, choiceText, history } = await req.json();

  const contextParts: string[] = [];

  if (gameState) {
    contextParts.push(`CURRENT GAME STATE:`);
    contextParts.push(`- Health: ${gameState.health}/${gameState.maxHealth}`);
    contextParts.push(`- Gold: ${gameState.gold}`);
    if (gameState.inventory?.length > 0) {
      contextParts.push(
        `- Inventory: ${gameState.inventory.map((i: { name: string }) => i.name).join(", ")}`,
      );
    } else {
      contextParts.push(`- Inventory: empty`);
    }
    contextParts.push(`- Current location: ${gameState.location || "Unknown"}`);
  }

  if (history?.length > 0) {
    contextParts.push(`\nSTORY SO FAR:`);
    for (const entry of history.slice(-8)) {
      contextParts.push(`- [${entry.location}] ${entry.summary}`);
      if (entry.choice) {
        contextParts.push(`  Player chose: "${entry.choice}"`);
      }
    }
  }

  let userPrompt: string;
  if (!history || history.length === 0) {
    userPrompt = `Start a new adventure with this theme: ${gameState?.theme || "classic fantasy"}\n\n${contextParts.join("\n")}`;
  } else {
    userPrompt = `The player chose: "${choiceText}"\n\nContinue the story based on this choice.\n\n${contextParts.join("\n")}`;
  }

  const result = streamText({
    model: process.env.AI_GATEWAY_MODEL || DEFAULT_MODEL,
    system: SYSTEM_PROMPT,
    prompt: userPrompt,
    temperature: 0.8,
  });

  return result.toTextStreamResponse();
}
