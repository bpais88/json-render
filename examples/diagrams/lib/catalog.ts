import { defineCatalog } from "@json-render/core";
import { schema } from "@json-render/react/schema";
import { z } from "zod";

/**
 * Flowchart / Diagram Catalog
 *
 * The AI generates a graph spec: a Diagram root with Node children + edges as a prop.
 * The renderer auto-layouts nodes using dagre, then renders with ReactFlow.
 *
 * Spec structure:
 *   Diagram (root) — has `edges` prop (connections) + `direction` prop (layout)
 *     └─ children: Node elements (ProcessNode, DecisionNode, StartNode, etc.)
 *
 * The AI only defines topology (which nodes, how they connect).
 * Dagre handles positioning automatically.
 */
export const diagramCatalog = defineCatalog(schema, {
  components: {
    Diagram: {
      props: z.object({
        title: z.string(),
        direction: z.enum(["TB", "LR", "RL", "BT"]).nullable(),
        edges: z.array(
          z.object({
            source: z.string(),
            target: z.string(),
            label: z.string().nullable(),
            animated: z.boolean().nullable(),
            type: z.enum(["default", "step", "smoothstep"]).nullable(),
          }),
        ),
      }),
      slots: ["default"],
      description:
        "Root diagram container. direction controls layout flow: TB (top-to-bottom, default), LR (left-to-right), RL (right-to-left), BT (bottom-to-top). edges is an array defining connections between nodes. Each edge has a source (node key) and target (node key). Children are node elements.",
    },

    ProcessNode: {
      props: z.object({
        label: z.string(),
        description: z.string().nullable(),
        color: z.enum(["blue", "purple", "cyan", "default"]).nullable(),
      }),
      description:
        "Standard process/action step. Rectangular shape. Use for actions, tasks, operations. label is the title, description is optional detail text.",
    },

    DecisionNode: {
      props: z.object({
        label: z.string(),
        description: z.string().nullable(),
      }),
      description:
        "Diamond-shaped decision point. Use for yes/no questions, conditionals, branching logic. Label edges leaving this node with 'Yes'/'No' or condition text.",
    },

    StartNode: {
      props: z.object({
        label: z.string(),
      }),
      description:
        "Rounded start/entry point. Use as the first node in a flow. Usually labeled 'Start', 'Begin', or the trigger event.",
    },

    EndNode: {
      props: z.object({
        label: z.string(),
      }),
      description:
        "Rounded end/terminal point. Use as the final node(s) in a flow. Label with the outcome: 'Done', 'Success', 'Error', etc.",
    },

    DataNode: {
      props: z.object({
        label: z.string(),
        description: z.string().nullable(),
      }),
      description:
        "Parallelogram-shaped data/IO node. Use for inputs, outputs, databases, files, API calls, or external data sources.",
    },

    GroupNode: {
      props: z.object({
        label: z.string(),
        color: z
          .enum(["blue", "purple", "green", "orange", "default"])
          .nullable(),
      }),
      slots: ["default"],
      description:
        "Container that groups related nodes visually. Use to represent sub-processes, phases, or logical groupings. Children are node elements that belong to this group.",
    },

    NoteNode: {
      props: z.object({
        text: z.string(),
      }),
      description:
        "Sticky note / annotation. Use for comments, explanations, or documentation. Does not connect to the flow — purely informational.",
    },
  },

  actions: {},
});

/**
 * Custom rules for AI diagram generation
 */
const customRules = [
  "The root element MUST be a Diagram",
  "Every node child MUST have a unique key — use descriptive kebab-case keys like 'validate-input', 'send-email', 'check-auth'",
  "Edges reference nodes by their element KEY (not label). source and target must match exact node keys",
  "Always start with a StartNode and end with at least one EndNode",
  "Use DecisionNode for branching logic — label outgoing edges with conditions (e.g., 'Yes', 'No', 'Valid', 'Invalid')",
  "Use DataNode for external data: databases, APIs, files, user input",
  "Use ProcessNode for actions and operations",
  "Use GroupNode to organize related steps into phases or sub-processes",
  "Use NoteNode sparingly for important context or documentation",
  "Keep diagrams readable: 8-20 nodes is ideal, avoid unnecessary complexity",
  "Use animated: true on edges to highlight the happy path or critical flow",
  "Use direction 'TB' for vertical flows (default), 'LR' for horizontal flows like timelines or pipelines",
  "Make the diagram tell a complete story — every path should reach an EndNode",
];

/**
 * Get the system prompt for AI diagram generation
 */
export function getDiagramPrompt(): string {
  return diagramCatalog.prompt({ customRules });
}
