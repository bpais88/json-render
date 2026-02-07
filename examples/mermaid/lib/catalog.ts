import { defineCatalog } from "@json-render/core";
import { schema } from "@json-render/react/schema";
import { z } from "zod";

/**
 * Mermaid Diagram Catalog
 *
 * Components for generating Mermaid diagram syntax.
 * The AI generates a MermaidDocument with multiple Diagram children,
 * each containing raw Mermaid code that gets rendered client-side.
 */
export const mermaidCatalog = defineCatalog(schema, {
  components: {
    MermaidDocument: {
      props: z.object({
        title: z.string(),
        description: z.string().nullable(),
      }),
      slots: ["default"],
      description:
        "Root container for mermaid diagrams. title is the document heading. description is a brief summary. Children are Section or Diagram elements.",
    },

    Section: {
      props: z.object({
        title: z.string(),
        description: z.string().nullable(),
      }),
      slots: ["default"],
      description:
        "A labeled section grouping related diagrams. title is the section heading. Children are Diagram elements.",
    },

    Diagram: {
      props: z.object({
        title: z.string(),
        code: z.string(),
        caption: z.string().nullable(),
      }),
      description:
        "A single Mermaid diagram. title is the diagram heading. code contains the raw Mermaid syntax (flowchart, sequence, class, state, ER, gantt, pie, mindmap, timeline, etc.). caption is an optional explanation below the diagram. IMPORTANT: The code prop must contain valid Mermaid syntax — it will be rendered directly by mermaid.js.",
    },

    Note: {
      props: z.object({
        text: z.string(),
        variant: z.enum(["info", "tip", "warning"]).nullable(),
      }),
      description:
        "An informational note or callout. Use to explain diagram conventions, provide context, or add tips. variant controls the style: info (blue), tip (green), warning (amber).",
    },
  },

  actions: {},
});

const customRules = [
  "The root element MUST be a MermaidDocument",
  "Generate 1-5 Diagram elements to illustrate the topic",
  "Each Diagram's code prop MUST contain valid Mermaid syntax",
  "Use the appropriate Mermaid diagram type for the content:",
  "  - flowchart TD/LR for process flows, decision trees, architectures",
  "  - sequenceDiagram for API calls, request/response flows, interactions",
  "  - classDiagram for OOP structures, data models, relationships",
  "  - stateDiagram-v2 for state machines, lifecycle flows",
  "  - erDiagram for database schemas, entity relationships",
  "  - gantt for timelines, project plans, schedules",
  "  - pie for proportional data, distribution charts",
  "  - mindmap for brainstorming, topic exploration, concept maps",
  "  - timeline for historical events, version history",
  "  - gitgraph for branching strategies, release flows",
  "Use Section elements to group related diagrams when generating multiple",
  "Use Note elements to explain conventions or provide context",
  "Keep Mermaid syntax clean — avoid overly complex single diagrams, split into multiple if needed",
  "Use descriptive node labels in diagrams, not single letters",
  "Add meaningful edge labels where they help understanding",
  "For flowcharts, use different shapes: [] for process, {} for decision, () for start/end, [( )] for database",
  "CRITICAL: In the code prop, use actual newlines in the Mermaid syntax, NOT escaped \\n characters",
  "CRITICAL: Do NOT use HTML tags or special characters like &, <, > in Mermaid node labels",
  "CRITICAL: Wrap node labels in double quotes if they contain spaces or special characters",
];

export function getMermaidPrompt(): string {
  return mermaidCatalog.prompt({ customRules });
}
