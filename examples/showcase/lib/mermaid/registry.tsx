"use client";

import { type ReactNode, useEffect, useRef, useState, useId } from "react";
import type { Spec } from "@json-render/react";

// =============================================================================
// Mermaid Renderer Hook
// =============================================================================

function useMermaid() {
  const [mermaidApi, setMermaidApi] = useState<typeof import("mermaid") | null>(
    null,
  );

  useEffect(() => {
    import("mermaid").then((m) => {
      m.default.initialize({
        startOnLoad: false,
        theme: "dark",
        fontFamily: "ui-monospace, monospace",
        themeVariables: {
          primaryColor: "#3b82f6",
          primaryTextColor: "#f8fafc",
          primaryBorderColor: "#60a5fa",
          lineColor: "#64748b",
          secondaryColor: "#1e293b",
          tertiaryColor: "#0f172a",
          noteBkgColor: "#1e293b",
          noteTextColor: "#e2e8f0",
          noteBorderColor: "#334155",
        },
      });
      setMermaidApi(m);
    });
  }, []);

  return mermaidApi;
}

function MermaidDiagram({ code }: { code: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const uniqueId = useId().replace(/:/g, "-");
  const mermaid = useMermaid();

  useEffect(() => {
    if (!mermaid || !code?.trim()) return;

    let cancelled = false;

    const render = async () => {
      try {
        const id = `mermaid-${uniqueId}-${Date.now()}`;
        const { svg: renderedSvg } = await mermaid.default.render(
          id,
          code.trim(),
        );
        if (!cancelled) {
          setSvg(renderedSvg);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to render diagram",
          );
          setSvg(null);
        }
      }
    };

    render();
    return () => {
      cancelled = true;
    };
  }, [mermaid, code, uniqueId]);

  if (error) {
    return (
      <div className="border border-red-500/30 bg-red-500/10 rounded-lg p-4">
        <div className="text-red-400 text-xs font-mono mb-2">Render error</div>
        <pre className="text-red-300 text-xs font-mono whitespace-pre-wrap">
          {error}
        </pre>
        <details className="mt-2">
          <summary className="text-xs text-slate-500 cursor-pointer">
            Show source
          </summary>
          <pre className="mt-2 text-xs text-slate-400 font-mono whitespace-pre-wrap bg-slate-900 rounded p-3">
            {code}
          </pre>
        </details>
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex gap-1.5">
          <span className="w-2 h-2 bg-blue-500/50 rounded-full animate-pulse" />
          <span className="w-2 h-2 bg-blue-500/50 rounded-full animate-pulse [animation-delay:0.15s]" />
          <span className="w-2 h-2 bg-blue-500/50 rounded-full animate-pulse [animation-delay:0.3s]" />
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="mermaid-svg-container overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

// =============================================================================
// Style Mappings
// =============================================================================

const noteVariant: Record<string, string> = {
  info: "border-blue-500/30 bg-blue-500/10 text-blue-300",
  tip: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  warning: "border-amber-500/30 bg-amber-500/10 text-amber-300",
};

const noteIcon: Record<string, string> = {
  info: "\u2139\uFE0F",
  tip: "\u2705",
  warning: "\u26A0\uFE0F",
};

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
  MermaidDocument: (element, ctx) => {
    const title = element.props.title as string;
    const description = element.props.description as string | null;
    const children = renderChildren(element, ctx);

    return (
      <div>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
          {description && (
            <p className="text-slate-400 text-sm mt-2 max-w-2xl mx-auto">
              {description}
            </p>
          )}
        </div>
        <div className="space-y-6">{children}</div>
      </div>
    );
  },

  Section: (element, ctx) => {
    const title = element.props.title as string;
    const description = element.props.description as string | null;
    const children = renderChildren(element, ctx);

    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-200">{title}</h3>
          {description && (
            <p className="text-slate-500 text-sm mt-1">{description}</p>
          )}
        </div>
        <div className="space-y-4">{children}</div>
      </div>
    );
  },

  Diagram: (element) => {
    const title = element.props.title as string;
    const code = element.props.code as string;
    const caption = element.props.caption as string | null;

    return (
      <div className="diagram-card">
        <div className="diagram-header">
          <span className="text-sm font-semibold">{title}</span>
          <button
            onClick={() => navigator.clipboard.writeText(code)}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors font-mono"
          >
            copy
          </button>
        </div>
        <div className="diagram-body">
          <MermaidDiagram code={code} />
        </div>
        {caption && (
          <div className="diagram-footer">
            <p className="text-xs text-slate-500">{caption}</p>
          </div>
        )}
        <details className="px-4 pb-3">
          <summary className="text-xs text-slate-600 cursor-pointer hover:text-slate-400 transition-colors font-mono">
            source
          </summary>
          <pre className="mt-2 text-xs text-slate-400 font-mono whitespace-pre-wrap bg-slate-900/50 rounded p-3 border border-slate-800">
            {code}
          </pre>
        </details>
      </div>
    );
  },

  Note: (element) => {
    const text = element.props.text as string;
    const variant = (element.props.variant as string) ?? "info";
    const style = noteVariant[variant] ?? noteVariant.info;
    const icon = noteIcon[variant] ?? noteIcon.info;

    return (
      <div className={`border rounded-lg px-4 py-3 ${style}`}>
        <div className="flex gap-2 items-start">
          <span className="text-sm shrink-0">{icon}</span>
          <p className="text-sm leading-relaxed">{text}</p>
        </div>
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
      <div className="text-red-500 text-xs p-2 border border-red-500/30 rounded bg-red-500/10 font-mono">
        Unknown: {element.type}
      </div>
    );
  }

  return <>{renderer(data, ctx)}</>;
}

// =============================================================================
// Mermaid Renderer (exported)
// =============================================================================

interface MermaidRendererProps {
  spec: Spec;
  isStreaming?: boolean;
}

export function MermaidRenderer({ spec, isStreaming }: MermaidRendererProps) {
  if (!spec?.root || !spec.elements?.[spec.root]) {
    if (isStreaming) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 bg-blue-500/40 rounded animate-pulse" />
              <span className="w-3 h-3 bg-blue-500/40 rounded animate-pulse [animation-delay:0.1s]" />
              <span className="w-3 h-3 bg-blue-500/40 rounded animate-pulse [animation-delay:0.2s]" />
            </div>
            <span className="text-slate-500 text-sm font-mono">
              Generating diagrams...
            </span>
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <div className={isStreaming ? "opacity-70" : ""}>
      <RenderElement spec={spec} elementKey={spec.root} />
    </div>
  );
}
