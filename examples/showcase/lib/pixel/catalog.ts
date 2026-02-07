import { defineCatalog } from "@json-render/core";
import { schema } from "@json-render/react/schema";
import { z } from "zod";

/**
 * Pixel Art Catalog
 *
 * Components for generating pixel art as a grid.
 * The AI generates a PixelCanvas with rows of colored pixels.
 * Each pixel is a single colored cell in the grid.
 */
export const pixelCatalog = defineCatalog(schema, {
  components: {
    PixelCanvas: {
      props: z.object({
        title: z.string(),
        description: z.string().nullable(),
        width: z.number(),
        height: z.number(),
        background: z.string(),
      }),
      slots: ["default"],
      description:
        "Root container for pixel art. title is the artwork name. description is an optional short description. width and height define the grid dimensions (8-32). background is a hex color for the canvas background. Children are PixelRow elements and a PaletteInfo element.",
    },

    PixelRow: {
      props: z.object({
        y: z.number(),
      }),
      slots: ["default"],
      description:
        "A single row of pixels in the grid. y is the row index (0-based). Children are Pixel elements, one for each column.",
    },

    Pixel: {
      props: z.object({
        color: z.string(),
        x: z.number(),
      }),
      description:
        'A single colored pixel in the grid. color is a hex color like "#ff0000" or "transparent" for empty pixels. x is the column index (0-based).',
    },

    PaletteInfo: {
      props: z.object({
        colors: z.array(
          z.object({
            name: z.string(),
            hex: z.string(),
          }),
        ),
      }),
      description:
        "Displays the color palette used in this artwork. colors is an array of objects with name (human-readable color name) and hex (the hex color code).",
    },
  },

  actions: {},
});

const customRules = [
  "The root element MUST be a PixelCanvas",
  "Use 12x12 or 16x16 grids for good detail — avoid grids smaller than 8x8 or larger than 24x24",
  "Use a limited palette of 4-8 colors for cohesive pixel art",
  "Every PixelRow MUST have exactly the same number of Pixel children as the canvas width",
  "The number of PixelRow children MUST equal the canvas height",
  "Create recognizable pixel art: characters, items, animals, landscapes, icons",
  'Use "transparent" for empty/background pixels',
  "Include a PaletteInfo element as the last child of PixelCanvas, listing all colors used",
  "Think like a pixel artist — use clean outlines, consistent shading, and dithering where appropriate",
  "Each PixelRow must have the correct y index (0-based, sequential)",
  "Each Pixel must have the correct x index (0-based, sequential within its row)",
  "Use darker shades for outlines and lighter shades for highlights",
  "Keep designs centered in the grid with transparent pixels around the edges",
];

export function getPixelPrompt(): string {
  return pixelCatalog.prompt({ customRules });
}
