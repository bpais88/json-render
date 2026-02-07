import { defineCatalog } from "@json-render/core";
import { schema } from "@json-render/react/schema";
import { z } from "zod";

/**
 * Generative Art Catalog
 *
 * Components for generating SVG-based generative art compositions.
 * The AI generates an ArtCanvas with layered SVG shape elements
 * to create abstract, visually striking artwork.
 */
export const generativeArtCatalog = defineCatalog(schema, {
  components: {
    ArtCanvas: {
      props: z.object({
        title: z.string(),
        description: z.string().nullable(),
        width: z.number(),
        height: z.number(),
        background: z.string(),
      }),
      slots: ["default"],
      description:
        'Root SVG canvas for the artwork. Set viewBox to "0 0 width height". Children are SVG shape elements.',
    },

    Circle: {
      props: z.object({
        cx: z.number(),
        cy: z.number(),
        r: z.number(),
        fill: z.string(),
        stroke: z.string().nullable(),
        strokeWidth: z.number().nullable(),
        opacity: z.number().nullable(),
      }),
      description:
        "A circle shape. Use for dots, orbs, rings (fill none + stroke), and circular patterns.",
    },

    Rect: {
      props: z.object({
        x: z.number(),
        y: z.number(),
        width: z.number(),
        height: z.number(),
        fill: z.string(),
        stroke: z.string().nullable(),
        strokeWidth: z.number().nullable(),
        rx: z.number().nullable(),
        opacity: z.number().nullable(),
        rotation: z.number().nullable(),
      }),
      description:
        "A rectangle or square. Use rx for rounded corners. rotation rotates around the rect center.",
    },

    Line: {
      props: z.object({
        x1: z.number(),
        y1: z.number(),
        x2: z.number(),
        y2: z.number(),
        stroke: z.string(),
        strokeWidth: z.number().nullable(),
        opacity: z.number().nullable(),
      }),
      description: "A straight line between two points.",
    },

    Ellipse: {
      props: z.object({
        cx: z.number(),
        cy: z.number(),
        rx: z.number(),
        ry: z.number(),
        fill: z.string(),
        stroke: z.string().nullable(),
        strokeWidth: z.number().nullable(),
        opacity: z.number().nullable(),
      }),
      description: "An ellipse shape for oval forms and halos.",
    },

    Path: {
      props: z.object({
        d: z.string(),
        fill: z.string(),
        stroke: z.string().nullable(),
        strokeWidth: z.number().nullable(),
        opacity: z.number().nullable(),
      }),
      description:
        'Freeform SVG path. Use for curves (Q, C commands), waves, organic shapes. fill "none" for outlines.',
    },

    ArtText: {
      props: z.object({
        x: z.number(),
        y: z.number(),
        text: z.string(),
        fontSize: z.number(),
        fill: z.string(),
        fontWeight: z.enum(["normal", "bold"]).nullable(),
        textAnchor: z.enum(["start", "middle", "end"]).nullable(),
        opacity: z.number().nullable(),
      }),
      description: "Text element. Use textAnchor middle for centered text.",
    },

    ShapeGroup: {
      props: z.object({
        translateX: z.number().nullable(),
        translateY: z.number().nullable(),
        rotation: z.number().nullable(),
        scale: z.number().nullable(),
        opacity: z.number().nullable(),
      }),
      slots: ["default"],
      description:
        "Group of shapes with a shared transform. Use for repeating patterns, rotated clusters, or layered compositions.",
    },
  },

  actions: {},
});

const customRules = [
  "Root MUST be ArtCanvas",
  "Use canvas size 800x600 for landscape or 600x800 for portrait",
  "Create abstract, visually striking compositions",
  "Layer 15-40 elements for richness and depth",
  "Use opacity for layering and depth (0.1-0.9 range)",
  "Limit palette to 3-5 colors plus black/white for cohesion",
  "Use ShapeGroup for repeating patterns or rotated elements",
  "Create variety: geometric patterns, organic flows, gradients of shapes, particle fields",
  "Think like an artist: balance, rhythm, contrast, focal point",
  "Use Path for organic curves and waves (quadratic/cubic bezier)",
  "Don't cluster all elements in one spot — use the full canvas",
];

export function getGenerativeArtPrompt(): string {
  return generativeArtCatalog.prompt({ customRules });
}
