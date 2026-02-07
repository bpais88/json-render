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
  PixelCanvas: (element, ctx) => {
    const title = element.props.title as string;
    const description = element.props.description as string | null;
    const width = (element.props.width as number) ?? 12;
    const background = (element.props.background as string) ?? "#1a1a2e";

    // Separate PixelRow children from PaletteInfo
    const rowChildren: ReactNode[] = [];
    let paletteChild: ReactNode | null = null;

    if (element.children) {
      for (const childKey of element.children) {
        const child = ctx.spec.elements[childKey];
        if (child?.type === "PaletteInfo") {
          paletteChild = ctx.renderElement(childKey);
        } else {
          rowChildren.push(ctx.renderElement(childKey));
        }
      }
    }

    return (
      <div className="flex flex-col items-center gap-6">
        {/* Title */}
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-white">
            {title}
          </h2>
          {description && (
            <p className="text-sm text-neutral-400 mt-1">{description}</p>
          )}
        </div>

        {/* Pixel grid — use CSS grid for tight, even cells */}
        <div
          className="rounded-lg border border-neutral-700 overflow-hidden shadow-2xl shadow-black/50"
          style={{
            backgroundColor: background,
            display: "grid",
            gridTemplateColumns: `repeat(${width}, 1fr)`,
            width: `min(100%, ${width * 28}px)`,
            aspectRatio: `${width} / ${rowChildren.length}`,
          }}
        >
          {rowChildren}
        </div>

        {/* Palette */}
        {paletteChild}
      </div>
    );
  },

  PixelRow: (_element, ctx) => {
    // In grid mode, rows are flattened — just render children directly
    const element = _element;
    if (!element.children) return null;
    return (
      <>{element.children.map((childKey) => ctx.renderElement(childKey))}</>
    );
  },

  Pixel: (element) => {
    const color = element.props.color as string;
    const isTransparent = color === "transparent";

    return (
      <div
        style={{
          backgroundColor: isTransparent ? "transparent" : color,
          aspectRatio: "1",
          width: "100%",
        }}
      />
    );
  },

  PaletteInfo: (element) => {
    const colors =
      (element.props.colors as Array<{ name: string; hex: string }>) ?? [];

    return (
      <div className="flex flex-wrap gap-3 justify-center">
        {colors.map((c, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className="w-5 h-5 rounded border border-neutral-600"
              style={{ backgroundColor: c.hex }}
            />
            <span className="text-xs text-neutral-400 font-mono">{c.name}</span>
          </div>
        ))}
      </div>
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
// Pixel Renderer (exported)
// =============================================================================

interface PixelRendererProps {
  spec: Spec;
  isStreaming?: boolean;
}

export function PixelRenderer({ spec, isStreaming }: PixelRendererProps) {
  if (!spec?.root || !spec.elements?.[spec.root]) {
    if (isStreaming) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 bg-emerald-400/50 rounded-sm animate-bounce" />
              <span className="w-3 h-3 bg-cyan-400/50 rounded-sm animate-bounce [animation-delay:0.1s]" />
              <span className="w-3 h-3 bg-purple-400/50 rounded-sm animate-bounce [animation-delay:0.2s]" />
            </div>
            <span className="text-neutral-400 text-sm font-mono">
              Drawing pixels...
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
