import { defineCatalog } from "@json-render/core";
import { schema } from "@json-render/react/schema";
import { z } from "zod";

/**
 * Text Adventure Game Catalog
 *
 * Components designed for interactive fiction.
 * The AI generates one scene at a time. Player choices trigger new scene generation.
 * Game state (inventory, stats) is tracked client-side and passed as context.
 */
export const adventureCatalog = defineCatalog(schema, {
  components: {
    // Root scene container
    Scene: {
      props: z.object({
        location: z.string(),
        mood: z
          .enum([
            "neutral",
            "tense",
            "mysterious",
            "triumphant",
            "dark",
            "peaceful",
          ])
          .nullable(),
      }),
      slots: ["default"],
      description:
        "Root container for a game scene. location is the name of the current area (e.g., 'Dark Forest', 'Castle Entrance'). mood affects the visual atmosphere. Always use this as the root element.",
    },

    // Narrative text
    Narrative: {
      props: z.object({
        text: z.string(),
      }),
      description:
        "Story narration paragraph. Write immersive, second-person text ('You step into...'). Keep to 2-4 sentences per Narrative block. Use multiple Narrative elements to build the scene.",
    },

    // Dialog from NPCs or the environment
    DialogBox: {
      props: z.object({
        speaker: z.string(),
        text: z.string(),
        mood: z
          .enum(["friendly", "hostile", "mysterious", "scared", "neutral"])
          .nullable(),
      }),
      description:
        "Speech from an NPC or voice. speaker is the character name. text is what they say. Keep dialog natural and in-character.",
    },

    // Player choices
    ChoiceList: {
      props: z.object({
        prompt: z.string().nullable(),
        choices: z.array(
          z.object({
            id: z.string(),
            text: z.string(),
            risk: z.enum(["safe", "moderate", "dangerous"]).nullable(),
          }),
        ),
      }),
      description:
        "Player choice options. prompt is an optional question like 'What do you do?'. Each choice has a unique id, display text, and optional risk level. Provide 2-4 meaningful choices that lead to different outcomes. ALWAYS include at least one safe option.",
    },

    // Game status display
    StatusBar: {
      props: z.object({
        health: z.number(),
        maxHealth: z.number(),
        gold: z.number().nullable(),
        location: z.string().nullable(),
      }),
      description:
        "Player stats display. health/maxHealth shown as a bar. gold is currency. Reflect the current game state from context.",
    },

    // Inventory display
    InventoryPanel: {
      props: z.object({
        items: z.array(
          z.object({
            name: z.string(),
            description: z.string().nullable(),
            quantity: z.number().nullable(),
          }),
        ),
      }),
      description:
        "Shows the player's inventory. Each item has a name, optional description, and quantity. Reflect items from the game state context.",
    },

    // Decorative elements
    Badge: {
      props: z.object({
        text: z.string(),
        variant: z
          .enum(["default", "danger", "success", "warning", "info"])
          .nullable(),
      }),
      description:
        "Small label for status effects, quest markers, or tags. Use danger for threats, success for positive events, warning for caution.",
    },

    Divider: {
      props: z.object({}),
      description: "Visual scene break divider.",
    },

    Stack: {
      props: z.object({
        direction: z.enum(["horizontal", "vertical"]).nullable(),
        gap: z.enum(["sm", "md", "lg"]).nullable(),
      }),
      slots: ["default"],
      description: "Layout container for arranging child elements.",
    },

    // Loot / reward display
    LootDrop: {
      props: z.object({
        title: z.string(),
        items: z.array(
          z.object({
            name: z.string(),
            type: z.enum(["weapon", "armor", "potion", "key", "gold", "misc"]),
          }),
        ),
      }),
      description:
        "Displays loot or rewards the player receives. Use when player finds treasure, defeats an enemy, or completes a quest.",
    },
  },

  // No actions in the catalog - choices are handled by the client
  actions: {},
});

/**
 * Custom rules for the AI when generating game scenes
 */
const customRules = [
  "The root element MUST be a Scene",
  "Generate exactly ONE scene per request - do not generate multiple scenes",
  "Start with 1-3 Narrative elements to describe the scene vividly in second person ('You see...', 'You hear...')",
  "Include a StatusBar reflecting the player's current health, gold, and location from the provided game state",
  "Include an InventoryPanel if the player has items in their inventory (from game state)",
  "ALWAYS end with a ChoiceList giving the player 2-4 meaningful options",
  "Use DialogBox when NPCs speak - give them personality",
  "Use Badge for status effects like 'Poisoned', 'Blessed', quest markers like 'New Quest'",
  "Use LootDrop when the player's previous choice resulted in finding items",
  "Choices should have real consequences - vary risk levels",
  "Track narrative continuity: reference previous choices and events from the context",
  "Do NOT invent game state changes - just describe the scene. The client tracks state.",
  "Be creative with locations, characters, and plot twists",
  "Keep the tone consistent with the adventure theme chosen by the player",
];

/**
 * Get the system prompt for AI scene generation
 */
export function getAdventurePrompt(): string {
  return adventureCatalog.prompt({ customRules });
}
