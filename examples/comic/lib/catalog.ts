import { defineCatalog } from "@json-render/core";
import { schema } from "@json-render/react/schema";
import { z } from "zod";

/**
 * Comic / Storyboard Catalog
 *
 * Components for generating comic strip panels.
 * The AI generates a ComicPage with a grid of Panels.
 * Each Panel contains scene descriptions, dialogue, and effects.
 */
export const comicCatalog = defineCatalog(schema, {
  components: {
    ComicPage: {
      props: z.object({
        title: z.string(),
        layout: z.enum(["auto", "2col", "3col", "cinematic"]).nullable(),
      }),
      slots: ["default"],
      description:
        "Root container for a comic page. layout controls panel arrangement: 'auto' (mixed sizes), '2col' (2 columns), '3col' (3 columns), 'cinematic' (wide panels). Children are Panel elements.",
    },

    Panel: {
      props: z.object({
        scene: z.string(),
        mood: z
          .enum(["normal", "dramatic", "dark", "bright", "action", "quiet"])
          .nullable(),
        size: z.enum(["small", "medium", "large", "wide", "tall"]).nullable(),
        background: z.string().nullable(),
      }),
      slots: ["default"],
      description:
        "A single comic panel. scene describes what's visually happening (for the scene description overlay). mood affects the color treatment. size controls the panel dimensions in the grid. background is a color description like 'sunset orange', 'night blue', 'forest green'. Children are dialogue elements (SpeechBubble, ThoughtBubble, Narration, SoundEffect).",
    },

    SpeechBubble: {
      props: z.object({
        speaker: z.string(),
        text: z.string(),
        position: z
          .enum(["top-left", "top-right", "bottom-left", "bottom-right"])
          .nullable(),
        emphasis: z.boolean().nullable(),
      }),
      description:
        "Character dialogue shown in a speech bubble with a tail. speaker identifies who is talking. position places the bubble in the panel. emphasis makes the text bold for shouting.",
    },

    ThoughtBubble: {
      props: z.object({
        speaker: z.string(),
        text: z.string(),
        position: z
          .enum(["top-left", "top-right", "bottom-left", "bottom-right"])
          .nullable(),
      }),
      description:
        "Internal thoughts shown in a cloud-like bubble. Use for inner monologue, memories, or unspoken reactions.",
    },

    Narration: {
      props: z.object({
        text: z.string(),
        position: z.enum(["top", "bottom"]).nullable(),
      }),
      description:
        "Narrator's caption box. Typically at the top or bottom of a panel. Use for scene-setting ('Meanwhile...', 'Three hours later...'), exposition, or storytelling voice.",
    },

    SoundEffect: {
      props: z.object({
        text: z.string(),
        size: z.enum(["sm", "md", "lg"]).nullable(),
        color: z
          .enum(["red", "blue", "yellow", "orange", "purple", "white"])
          .nullable(),
      }),
      description:
        "Onomatopoeia / sound effect text. Rendered big and stylized. Examples: 'BOOM!', 'CRACK!', 'WHOOSH!', 'RING!', 'SLAM!'. Use for action and drama.",
    },

    CharacterLabel: {
      props: z.object({
        name: z.string(),
        description: z.string().nullable(),
        position: z.enum(["left", "center", "right"]).nullable(),
      }),
      description:
        "Character introduction label. Shows name and optional brief description. Use when a character first appears. Rendered as a small tag in the panel.",
    },
  },

  actions: {},
});

const customRules = [
  "The root element MUST be a ComicPage",
  "Generate 4-8 Panels to tell a complete short story or scene",
  "Each Panel MUST have a descriptive 'scene' prop — paint a picture of what the reader would see",
  "Use varied panel sizes: mix 'small', 'medium', 'large', 'wide' for visual rhythm",
  "Include SpeechBubble for character dialogue — keep it concise and natural",
  "Include ThoughtBubble for internal monologue",
  "Use Narration for scene-setting captions: 'Meanwhile...', 'Later that evening...', time/place transitions",
  "Use SoundEffect for action moments — be creative: 'WHOOSH!', 'CRACK!', 'BZZT!'",
  "Use CharacterLabel when introducing a character for the first time",
  "Tell a story with a clear beginning, middle, and end (or cliffhanger)",
  "Give each panel a background color description that sets the mood",
  "Vary moods across panels for emotional range",
  "Don't overload panels — 1-3 dialogue elements per panel is ideal",
  "Use 'wide' panels for establishing shots and dramatic reveals",
];

export function getComicPrompt(): string {
  return comicCatalog.prompt({ customRules });
}
