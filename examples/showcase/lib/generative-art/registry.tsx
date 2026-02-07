"use client";

import type { ReactNode } from "react";
import type { Spec } from "@json-render/react";

// =============================================================================
// Component Renderers
// =============================================================================

interface ElementData {
  type: string;
  props: Record<string, unknown>;
  children?: string[];
}

interface RenderContext {
  spec: Spec;
  renderElement: (key: string) => ReactNode;
}

function renderChildren(element: ElementData, ctx: RenderContext): ReactNode[] {
  if (!element.children) return [];
  return element.children.map((childKey) => ctx.renderElement(childKey));
}

const componentRenderers: Record<
  string,
  (element: ElementData, ctx: RenderContext) => ReactNode
> = {
  ArtCanvas: (element, ctx) => {
    const title = element.props.title as string;
    const description = element.props.description as string | null;
    const width = element.props.width as number;
    const height = element.props.height as number;
    const background = element.props.background as string;
    const children = renderChildren(element, ctx);

    return (
      <div className="flex flex-col items-center gap-6">
        <div className="w-full max-w-2xl rounded-xl overflow-hidden border border-white/10 shadow-2xl">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            width="100%"
            preserveAspectRatio="xMidYMid meet"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="0" y="0" width={width} height={height} fill={background} />
            {children}
          </svg>
        </div>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          {description && (
            <p className="text-white/50 text-sm mt-1">{description}</p>
          )}
        </div>
      </div>
    );
  },

  Circle: (element) => {
    const { cx, cy, r, fill, stroke, strokeWidth, opacity } = element.props as {
      cx: number;
      cy: number;
      r: number;
      fill: string;
      stroke: string | null;
      strokeWidth: number | null;
      opacity: number | null;
    };

    return (
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill={fill}
        stroke={stroke ?? undefined}
        strokeWidth={strokeWidth ?? undefined}
        opacity={opacity ?? undefined}
      />
    );
  },

  Rect: (element) => {
    const {
      x,
      y,
      width,
      height,
      fill,
      stroke,
      strokeWidth,
      rx,
      opacity,
      rotation,
    } = element.props as {
      x: number;
      y: number;
      width: number;
      height: number;
      fill: string;
      stroke: string | null;
      strokeWidth: number | null;
      rx: number | null;
      opacity: number | null;
      rotation: number | null;
    };

    const transform = rotation
      ? `rotate(${rotation}, ${x + width / 2}, ${y + height / 2})`
      : undefined;

    return (
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fill}
        stroke={stroke ?? undefined}
        strokeWidth={strokeWidth ?? undefined}
        rx={rx ?? undefined}
        opacity={opacity ?? undefined}
        transform={transform}
      />
    );
  },

  Line: (element) => {
    const { x1, y1, x2, y2, stroke, strokeWidth, opacity } = element.props as {
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      stroke: string;
      strokeWidth: number | null;
      opacity: number | null;
    };

    return (
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={stroke}
        strokeWidth={strokeWidth ?? undefined}
        opacity={opacity ?? undefined}
      />
    );
  },

  Ellipse: (element) => {
    const { cx, cy, rx, ry, fill, stroke, strokeWidth, opacity } =
      element.props as {
        cx: number;
        cy: number;
        rx: number;
        ry: number;
        fill: string;
        stroke: string | null;
        strokeWidth: number | null;
        opacity: number | null;
      };

    return (
      <ellipse
        cx={cx}
        cy={cy}
        rx={rx}
        ry={ry}
        fill={fill}
        stroke={stroke ?? undefined}
        strokeWidth={strokeWidth ?? undefined}
        opacity={opacity ?? undefined}
      />
    );
  },

  Path: (element) => {
    const { d, fill, stroke, strokeWidth, opacity } = element.props as {
      d: string;
      fill: string;
      stroke: string | null;
      strokeWidth: number | null;
      opacity: number | null;
    };

    return (
      <path
        d={d}
        fill={fill}
        stroke={stroke ?? undefined}
        strokeWidth={strokeWidth ?? undefined}
        opacity={opacity ?? undefined}
      />
    );
  },

  ArtText: (element) => {
    const { x, y, text, fontSize, fill, fontWeight, textAnchor, opacity } =
      element.props as {
        x: number;
        y: number;
        text: string;
        fontSize: number;
        fill: string;
        fontWeight: string | null;
        textAnchor: string | null;
        opacity: number | null;
      };

    return (
      <text
        x={x}
        y={y}
        fontSize={fontSize}
        fill={fill}
        fontWeight={fontWeight ?? undefined}
        textAnchor={(textAnchor as "start" | "middle" | "end") ?? undefined}
        opacity={opacity ?? undefined}
        fontFamily="system-ui, sans-serif"
      >
        {text}
      </text>
    );
  },

  ShapeGroup: (element, ctx) => {
    const { translateX, translateY, rotation, scale, opacity } =
      element.props as {
        translateX: number | null;
        translateY: number | null;
        rotation: number | null;
        scale: number | null;
        opacity: number | null;
      };
    const children = renderChildren(element, ctx);

    const transforms: string[] = [];
    if (translateX != null || translateY != null) {
      transforms.push(`translate(${translateX ?? 0}, ${translateY ?? 0})`);
    }
    if (rotation != null) {
      transforms.push(`rotate(${rotation})`);
    }
    if (scale != null) {
      transforms.push(`scale(${scale})`);
    }

    return (
      <g
        transform={transforms.length > 0 ? transforms.join(" ") : undefined}
        opacity={opacity ?? undefined}
      >
        {children}
      </g>
    );
  },
};

// =============================================================================
// Render Engine
// =============================================================================

function RenderElement({
  spec,
  elementKey,
}: {
  spec: Spec;
  elementKey: string;
}) {
  const element = spec.elements[elementKey];
  if (!element) return null;

  const data: ElementData = {
    type: element.type,
    props: element.props as Record<string, unknown>,
    children: element.children,
  };

  const ctx: RenderContext = {
    spec,
    renderElement: (childKey: string) => (
      <RenderElement key={childKey} spec={spec} elementKey={childKey} />
    ),
  };

  const renderer = componentRenderers[element.type];
  if (!renderer) {
    return (
      <div className="text-red-500 text-xs p-2 border border-red-300 rounded bg-red-50">
        Unknown: {element.type}
      </div>
    );
  }

  return <>{renderer(data, ctx)}</>;
}

// =============================================================================
// Generative Art Renderer (exported)
// =============================================================================

interface GenerativeArtRendererProps {
  spec: Spec;
  isStreaming?: boolean;
}

export function GenerativeArtRenderer({
  spec,
  isStreaming,
}: GenerativeArtRendererProps) {
  if (!spec?.root || !spec.elements?.[spec.root]) {
    if (isStreaming) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 bg-white/50 rounded-full animate-bounce" />
              <span className="w-3 h-3 bg-white/50 rounded-full animate-bounce [animation-delay:0.1s]" />
              <span className="w-3 h-3 bg-white/50 rounded-full animate-bounce [animation-delay:0.2s]" />
            </div>
            <span className="text-white/40 text-sm font-mono">
              Composing artwork...
            </span>
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <div className={isStreaming ? "opacity-80" : ""}>
      <RenderElement spec={spec} elementKey={spec.root} />
    </div>
  );
}
