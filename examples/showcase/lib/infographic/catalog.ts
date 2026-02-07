import { defineCatalog } from "@json-render/core";
import { schema } from "@json-render/react/schema";
import { z } from "zod";

/**
 * Infographic Catalog
 *
 * Components for generating data-driven infographics.
 * The AI generates an Infographic with sections containing stats,
 * charts, timelines, callouts, and comparisons.
 */
export const infographicCatalog = defineCatalog(schema, {
  components: {
    Infographic: {
      props: z.object({
        title: z.string(),
        subtitle: z.string().nullable(),
        theme: z.enum(["blue", "green", "purple", "orange", "red", "neutral"]),
      }),
      slots: ["default"],
      description:
        "Root container for the infographic. Children are section elements arranged vertically. theme sets the accent color used throughout.",
    },

    StatRow: {
      props: z.object({}),
      slots: ["default"],
      description:
        "Horizontal container for StatCard children. Renders as a responsive flex row.",
    },

    StatCard: {
      props: z.object({
        value: z.string(),
        label: z.string(),
        icon: z
          .enum([
            "chart",
            "users",
            "globe",
            "lightning",
            "shield",
            "star",
            "heart",
            "target",
          ])
          .nullable(),
      }),
      description:
        "A single key statistic with a big value, label, and optional icon.",
    },

    BarChart: {
      props: z.object({
        title: z.string().nullable(),
      }),
      slots: ["default"],
      description: "A horizontal bar chart. Children are Bar elements.",
    },

    Bar: {
      props: z.object({
        label: z.string(),
        value: z.number(),
        color: z.string(),
      }),
      description:
        "A single bar with label and filled percentage. value is 0-100 representing percentage width. color is a hex color.",
    },

    Timeline: {
      props: z.object({
        title: z.string().nullable(),
      }),
      slots: ["default"],
      description:
        "A vertical timeline of events. Children are TimelineEvent elements.",
    },

    TimelineEvent: {
      props: z.object({
        date: z.string(),
        title: z.string(),
        description: z.string().nullable(),
      }),
      description:
        "A single event with date marker, title, and optional description.",
    },

    SectionHeader: {
      props: z.object({
        title: z.string(),
        subtitle: z.string().nullable(),
      }),
      description:
        "A section heading to divide the infographic into logical parts.",
    },

    Callout: {
      props: z.object({
        text: z.string(),
        source: z.string().nullable(),
        variant: z.enum(["highlight", "quote", "warning"]).nullable(),
      }),
      description: "A highlighted block for key quotes, facts, or warnings.",
    },

    ComparisonRow: {
      props: z.object({
        leftLabel: z.string(),
        rightLabel: z.string(),
        leftValue: z.string(),
        rightValue: z.string(),
        winner: z.enum(["left", "right", "tie"]).nullable(),
      }),
      description:
        "A side-by-side comparison of two values with optional winner indicator.",
    },

    IconList: {
      props: z.object({}),
      slots: ["default"],
      description:
        "A list of items with icons. Children are IconListItem elements.",
    },

    IconListItem: {
      props: z.object({
        icon: z.enum(["check", "x", "arrow", "star", "info", "warning"]),
        text: z.string(),
        bold: z.boolean().nullable(),
      }),
      description: "A single list item with an icon prefix.",
    },
  },

  actions: {},
});

const customRules = [
  "The root element MUST be an Infographic",
  "Create a visually rich, data-driven infographic",
  "Use 3-5 sections with SectionHeader dividers",
  "Include at least one StatRow with 2-4 StatCards",
  "Include at least one BarChart or Timeline",
  "Use a Callout for the most impactful takeaway",
  "Keep stat values short and punchy ('$4.2T', '89%', '3x')",
  "Use consistent theme colors throughout",
  "Tell a data story: introduce, present evidence, conclude",
  "Bar values must be between 0 and 100 representing percentage width",
  "Bar colors should be hex colors that complement the chosen theme",
  "Timeline events should be in chronological order",
  "ComparisonRow is great for versus-style data points",
  "Use IconList with check/x icons for pros/cons or true/false lists",
  "Don't overload — aim for clarity and visual impact over density",
];

export function getInfographicPrompt(): string {
  return infographicCatalog.prompt({ customRules });
}
