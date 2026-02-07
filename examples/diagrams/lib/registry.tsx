"use client";

import { memo, useMemo } from "react";
import type { Spec } from "@json-render/react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  type NodeProps,
  Handle,
  Position,
  BackgroundVariant,
} from "@xyflow/react";
import dagre from "dagre";

// =============================================================================
// Node Color Palettes
// =============================================================================

const processColors: Record<
  string,
  { bg: string; border: string; text: string }
> = {
  default: {
    bg: "bg-slate-900",
    border: "border-slate-600",
    text: "text-slate-100",
  },
  blue: { bg: "bg-blue-950", border: "border-blue-500", text: "text-blue-100" },
  purple: {
    bg: "bg-purple-950",
    border: "border-purple-500",
    text: "text-purple-100",
  },
  cyan: { bg: "bg-cyan-950", border: "border-cyan-500", text: "text-cyan-100" },
};

const groupColors: Record<string, { bg: string; border: string }> = {
  default: { bg: "bg-slate-900/30", border: "border-slate-700/50" },
  blue: { bg: "bg-blue-950/30", border: "border-blue-700/50" },
  purple: { bg: "bg-purple-950/30", border: "border-purple-700/50" },
  green: { bg: "bg-emerald-950/30", border: "border-emerald-700/50" },
  orange: { bg: "bg-orange-950/30", border: "border-orange-700/50" },
};

// =============================================================================
// Custom Node Components
// =============================================================================

type NodeData = {
  label: string;
  description?: string | null;
  color?: string | null;
  text?: string | null;
};

function ProcessNodeComponent({ data }: NodeProps<Node<NodeData>>) {
  const palette =
    processColors[data.color ?? "default"] ?? processColors.default;
  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-slate-500 !w-2 !h-2 !border-0"
      />
      <div
        className={`px-4 py-3 rounded-lg border-2 ${palette.bg} ${palette.border} min-w-[140px] max-w-[220px]`}
      >
        <div className={`text-sm font-semibold ${palette.text}`}>
          {data.label}
        </div>
        {data.description && (
          <div className="text-xs text-slate-400 mt-1 leading-relaxed">
            {data.description}
          </div>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-slate-500 !w-2 !h-2 !border-0"
      />
    </>
  );
}

function DecisionNodeComponent({ data }: NodeProps<Node<NodeData>>) {
  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-amber-500 !w-2 !h-2 !border-0"
      />
      <div className="relative w-[160px] h-[90px] flex items-center justify-center">
        {/* Diamond shape */}
        <div
          className="absolute inset-0 bg-amber-950 border-2 border-amber-500"
          style={{
            transform: "rotate(45deg)",
            width: "70%",
            height: "70%",
            margin: "auto",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            position: "absolute",
          }}
        />
        <div className="relative z-10 text-center px-2">
          <div className="text-sm font-semibold text-amber-100">
            {data.label}
          </div>
          {data.description && (
            <div className="text-[10px] text-amber-300/70 mt-0.5">
              {data.description}
            </div>
          )}
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-amber-500 !w-2 !h-2 !border-0"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!bg-amber-500 !w-2 !h-2 !border-0"
      />
      <Handle
        type="source"
        position={Position.Left}
        id="left"
        className="!bg-amber-500 !w-2 !h-2 !border-0"
      />
    </>
  );
}

function StartNodeComponent({ data }: NodeProps<Node<NodeData>>) {
  return (
    <>
      <div className="px-6 py-2.5 rounded-full bg-emerald-950 border-2 border-emerald-500 min-w-[100px] text-center">
        <div className="text-sm font-semibold text-emerald-100">
          {data.label}
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-emerald-500 !w-2 !h-2 !border-0"
      />
    </>
  );
}

function EndNodeComponent({ data }: NodeProps<Node<NodeData>>) {
  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-red-500 !w-2 !h-2 !border-0"
      />
      <div className="px-6 py-2.5 rounded-full bg-red-950 border-2 border-red-500 min-w-[100px] text-center">
        <div className="text-sm font-semibold text-red-100">{data.label}</div>
      </div>
    </>
  );
}

function DataNodeComponent({ data }: NodeProps<Node<NodeData>>) {
  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-violet-500 !w-2 !h-2 !border-0"
      />
      <div
        className="px-5 py-2.5 bg-violet-950 border-2 border-violet-500 min-w-[130px] max-w-[200px]"
        style={{ clipPath: "polygon(10% 0%, 100% 0%, 90% 100%, 0% 100%)" }}
      >
        <div className="text-sm font-semibold text-violet-100 text-center">
          {data.label}
        </div>
        {data.description && (
          <div className="text-[10px] text-violet-300/70 mt-0.5 text-center">
            {data.description}
          </div>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-violet-500 !w-2 !h-2 !border-0"
      />
    </>
  );
}

function GroupNodeComponent({ data }: NodeProps<Node<NodeData>>) {
  const palette = groupColors[data.color ?? "default"] ?? groupColors.default;
  return (
    <div
      className={`rounded-xl border-2 border-dashed ${palette.border} ${palette.bg} min-w-[200px] min-h-[100px] p-3`}
    >
      <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
        {data.label}
      </div>
    </div>
  );
}

function NoteNodeComponent({ data }: NodeProps<Node<NodeData>>) {
  return (
    <div className="px-3 py-2 bg-yellow-950/50 border border-yellow-700/40 rounded max-w-[180px] shadow-lg">
      <div className="text-xs text-yellow-200/80 italic leading-relaxed">
        {data.text ?? data.label}
      </div>
    </div>
  );
}

// =============================================================================
// Node Type Registry
// =============================================================================

const nodeTypes = {
  ProcessNode: memo(ProcessNodeComponent),
  DecisionNode: memo(DecisionNodeComponent),
  StartNode: memo(StartNodeComponent),
  EndNode: memo(EndNodeComponent),
  DataNode: memo(DataNodeComponent),
  GroupNode: memo(GroupNodeComponent),
  NoteNode: memo(NoteNodeComponent),
};

// =============================================================================
// Auto-Layout with Dagre
// =============================================================================

const NODE_WIDTH = 180;
const NODE_HEIGHT = 80;
const DECISION_WIDTH = 160;
const DECISION_HEIGHT = 90;

function autoLayout(
  nodes: Node[],
  edges: Edge[],
  direction: string = "TB",
): Node[] {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));

  const isHorizontal = direction === "LR" || direction === "RL";
  g.setGraph({
    rankdir: direction,
    nodesep: 60,
    ranksep: 80,
    marginx: 40,
    marginy: 40,
  });

  for (const node of nodes) {
    const w = node.type === "DecisionNode" ? DECISION_WIDTH : NODE_WIDTH;
    const h = node.type === "DecisionNode" ? DECISION_HEIGHT : NODE_HEIGHT;
    g.setNode(node.id, { width: w, height: h });
  }

  for (const edge of edges) {
    g.setEdge(edge.source, edge.target);
  }

  dagre.layout(g);

  return nodes.map((node) => {
    const pos = g.node(node.id);
    if (!pos) return node;
    const w = node.type === "DecisionNode" ? DECISION_WIDTH : NODE_WIDTH;
    const h = node.type === "DecisionNode" ? DECISION_HEIGHT : NODE_HEIGHT;

    // Update handle positions based on direction
    const targetPosition = isHorizontal ? Position.Left : Position.Top;
    const sourcePosition = isHorizontal ? Position.Right : Position.Bottom;

    return {
      ...node,
      position: { x: pos.x - w / 2, y: pos.y - h / 2 },
      targetPosition,
      sourcePosition,
    };
  });
}

// =============================================================================
// Spec to ReactFlow Conversion
// =============================================================================

function specToFlow(spec: Spec): { nodes: Node[]; edges: Edge[] } {
  if (!spec?.root || !spec.elements?.[spec.root]) {
    return { nodes: [], edges: [] };
  }

  const root = spec.elements[spec.root];
  const rootProps = root.props as Record<string, unknown>;
  const direction = (rootProps.direction as string) ?? "TB";
  const edgeDefs =
    (rootProps.edges as Array<{
      source: string;
      target: string;
      label?: string | null;
      animated?: boolean | null;
      type?: string | null;
    }>) ?? [];

  // Build nodes from children
  const rawNodes: Node[] = [];
  const children = root.children ?? [];

  for (const childKey of children) {
    const el = spec.elements[childKey];
    if (!el) continue;

    const props = el.props as Record<string, unknown>;
    rawNodes.push({
      id: childKey,
      type: el.type,
      position: { x: 0, y: 0 },
      data: {
        label: (props.label as string) ?? "",
        description: props.description as string | null,
        color: props.color as string | null,
        text: props.text as string | null,
      },
    });
  }

  // Build edges
  const edges: Edge[] = edgeDefs.map((e, i) => ({
    id: `e-${i}`,
    source: e.source,
    target: e.target,
    label: e.label ?? undefined,
    animated: e.animated ?? false,
    type: (e.type as Edge["type"]) ?? "smoothstep",
    style: { stroke: "oklch(0.6 0.1 250)" },
    labelStyle: { fill: "oklch(0.7 0 0)", fontSize: 11 },
    labelBgStyle: { fill: "oklch(0.145 0 0)", fillOpacity: 0.9 },
    labelBgPadding: [6, 3] as [number, number],
    labelBgBorderRadius: 4,
  }));

  // Auto-layout
  const layoutedNodes = autoLayout(rawNodes, edges, direction);

  return { nodes: layoutedNodes, edges };
}

// =============================================================================
// Diagram Renderer (exported)
// =============================================================================

interface DiagramRendererProps {
  spec: Spec;
  isStreaming?: boolean;
}

export function DiagramRenderer({ spec, isStreaming }: DiagramRendererProps) {
  const { nodes, edges } = useMemo(() => specToFlow(spec), [spec]);

  const title = useMemo(() => {
    if (!spec?.root || !spec.elements?.[spec.root]) return null;
    return (spec.elements[spec.root].props as Record<string, unknown>)
      .title as string;
  }, [spec]);

  if (nodes.length === 0) {
    if (isStreaming) {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-1.5">
              <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" />
              <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce [animation-delay:0.1s]" />
              <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce [animation-delay:0.2s]" />
            </div>
            <span className="text-muted-foreground text-sm">
              Building diagram...
            </span>
          </div>
        </div>
      );
    }
    return (
      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
        Enter a prompt to generate a diagram
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      {title && (
        <div className="absolute top-3 left-3 z-10 text-xs font-mono text-muted-foreground bg-background/80 backdrop-blur-sm px-2 py-1 rounded border border-border">
          {title}
        </div>
      )}
      {isStreaming && (
        <div className="absolute top-3 right-3 z-10 text-xs text-primary/60 animate-pulse font-mono">
          streaming...
        </div>
      )}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        proOptions={{ hideAttribution: true }}
        minZoom={0.3}
        maxZoom={2}
        nodesDraggable={!isStreaming}
        nodesConnectable={false}
        elementsSelectable={!isStreaming}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="oklch(0.25 0 0)"
        />
        <Controls />
        <MiniMap
          nodeStrokeWidth={2}
          nodeColor={(node) => {
            switch (node.type) {
              case "StartNode":
                return "#10b981";
              case "EndNode":
                return "#ef4444";
              case "DecisionNode":
                return "#f59e0b";
              case "DataNode":
                return "#8b5cf6";
              case "GroupNode":
                return "#6b7280";
              case "NoteNode":
                return "#ca8a04";
              default:
                return "#64748b";
            }
          }}
        />
      </ReactFlow>
    </div>
  );
}
