"use client";

import type { ReactNode } from "react";
import type { Spec } from "@json-render/react";

// =============================================================================
// Theme Color Mappings
// =============================================================================

const themeColors: Record<string, { primary: string; lighter: string }> = {
  blue: { primary: "#3b82f6", lighter: "#93c5fd" },
  green: { primary: "#22c55e", lighter: "#86efac" },
  purple: { primary: "#a855f7", lighter: "#d8b4fe" },
  orange: { primary: "#f97316", lighter: "#fdba74" },
  red: { primary: "#ef4444", lighter: "#fca5a5" },
  neutral: { primary: "#6b7280", lighter: "#d1d5db" },
};

const iconEmojis: Record<string, string> = {
  chart: "\u{1F4CA}",
  users: "\u{1F465}",
  globe: "\u{1F30D}",
  lightning: "\u26A1",
  shield: "\u{1F6E1}\uFE0F",
  star: "\u2B50",
  heart: "\u2764\uFE0F",
  target: "\u{1F3AF}",
};

const listIconMap: Record<string, string> = {
  check: "\u2713",
  x: "\u2717",
  arrow: "\u2192",
  star: "\u2605",
  info: "\u2139",
  warning: "\u26A0",
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
  theme: { primary: string; lighter: string };
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
  Infographic: (element, ctx) => {
    const title = element.props.title as string;
    const subtitle = element.props.subtitle as string | null;
    const colors = ctx.theme;
    const children = renderChildren(element, ctx);

    return (
      <div
        className="max-w-full sm:max-w-2xl md:max-w-3xl mx-auto p-4 sm:p-6 md:p-8 rounded-xl"
        style={{
          background: "#111111",
          borderTop: `4px solid ${colors.primary}`,
        }}
      >
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-tight">
            {title}
          </h1>
          {subtitle && <p className="text-sm text-gray-400 mt-2">{subtitle}</p>}
        </div>
        <div className="flex flex-col gap-5 sm:gap-6">{children}</div>
      </div>
    );
  },

  StatRow: (element, ctx) => {
    const children = renderChildren(element, ctx);
    return (
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 flex-wrap">
        {children}
      </div>
    );
  },

  StatCard: (element, ctx) => {
    const value = element.props.value as string;
    const label = element.props.label as string;
    const icon = element.props.icon as string | null;

    return (
      <div
        className="min-w-full sm:min-w-[140px] flex-1 rounded-lg p-4 sm:p-5 text-center"
        style={{
          background: "#1a1a1a",
          border: "1px solid #2a2a2a",
        }}
      >
        {icon && <div className="text-2xl mb-2">{iconEmojis[icon] ?? ""}</div>}
        <div
          className="text-2xl sm:text-3xl font-extrabold leading-tight"
          style={{ color: ctx.theme.primary }}
        >
          {value}
        </div>
        <div className="text-xs text-gray-400 mt-1.5 uppercase tracking-wider">
          {label}
        </div>
      </div>
    );
  },

  BarChart: (element, ctx) => {
    const title = element.props.title as string | null;
    const children = renderChildren(element, ctx);

    return (
      <div
        className="rounded-lg p-4 sm:p-5"
        style={{
          background: "#1a1a1a",
          border: "1px solid #2a2a2a",
        }}
      >
        {title && (
          <div className="text-sm font-semibold text-gray-200 mb-3 sm:mb-4">
            {title}
          </div>
        )}
        <div className="flex flex-col gap-3">{children}</div>
      </div>
    );
  },

  Bar: (element, ctx) => {
    const label = element.props.label as string;
    const value = (element.props.value as number) ?? 0;
    const color = (element.props.color as string) ?? ctx.theme.primary;
    const clampedValue = Math.max(0, Math.min(100, value));

    return (
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="w-20 sm:w-24 shrink-0 text-xs text-gray-300 text-right">
          {label}
        </div>
        <div
          className="flex-1 h-5 sm:h-6 rounded overflow-hidden"
          style={{ background: "#0a0a0a" }}
        >
          <div
            className="h-full rounded transition-[width] duration-700 ease-out"
            style={{
              width: `${clampedValue}%`,
              background: color,
            }}
          />
        </div>
        <div className="w-10 shrink-0 text-xs text-gray-400">
          {clampedValue}%
        </div>
      </div>
    );
  },

  Timeline: (element, ctx) => {
    const title = element.props.title as string | null;
    const children = renderChildren(element, ctx);

    return (
      <div
        className="rounded-lg p-4 sm:p-5"
        style={{
          background: "#1a1a1a",
          border: "1px solid #2a2a2a",
        }}
      >
        {title && (
          <div className="text-sm font-semibold text-gray-200 mb-3 sm:mb-4">
            {title}
          </div>
        )}
        <div className="relative pl-4 sm:pl-6">
          <div
            className="absolute top-2 bottom-2"
            style={{
              left: "7px",
              width: "2px",
              background: "#333333",
            }}
          />
          {children}
        </div>
      </div>
    );
  },

  TimelineEvent: (element, ctx) => {
    const date = element.props.date as string;
    const title = element.props.title as string;
    const description = element.props.description as string | null;

    return (
      <div
        style={{
          position: "relative",
          paddingBottom: "20px",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: "-21px",
            top: "6px",
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            background: ctx.theme.primary,
            border: "2px solid #1a1a1a",
          }}
        />
        <div
          style={{
            display: "inline-block",
            fontSize: "10px",
            fontWeight: 600,
            color: ctx.theme.primary,
            background: `${ctx.theme.primary}1a`,
            padding: "2px 8px",
            borderRadius: "4px",
            marginBottom: "4px",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {date}
        </div>
        <div
          style={{
            fontSize: "14px",
            fontWeight: 600,
            color: "#e5e7eb",
          }}
        >
          {title}
        </div>
        {description && (
          <div
            style={{
              fontSize: "12px",
              color: "#9ca3af",
              marginTop: "4px",
              lineHeight: 1.5,
            }}
          >
            {description}
          </div>
        )}
      </div>
    );
  },

  SectionHeader: (element, ctx) => {
    const title = element.props.title as string;
    const subtitle = element.props.subtitle as string | null;

    return (
      <div style={{ paddingTop: "8px" }}>
        <div
          style={{
            height: "1px",
            background: `linear-gradient(to right, ${ctx.theme.primary}, transparent)`,
            marginBottom: "12px",
          }}
        />
        <div
          style={{
            fontSize: "18px",
            fontWeight: 700,
            color: "#ffffff",
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div
            style={{
              fontSize: "13px",
              color: "#9ca3af",
              marginTop: "4px",
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
    );
  },

  Callout: (element, ctx) => {
    const text = element.props.text as string;
    const source = element.props.source as string | null;
    const variant = (element.props.variant as string) ?? "highlight";

    const borderColor = variant === "warning" ? "#f59e0b" : ctx.theme.primary;
    const bgColor =
      variant === "warning" ? "#f59e0b1a" : `${ctx.theme.primary}1a`;

    return (
      <div
        style={{
          borderLeft: `4px solid ${borderColor}`,
          background: bgColor,
          borderRadius: "0 8px 8px 0",
          padding: "16px 20px",
        }}
      >
        <div
          style={{
            fontSize: "15px",
            color: "#e5e7eb",
            fontStyle: variant === "quote" ? "italic" : "normal",
            lineHeight: 1.6,
          }}
        >
          {variant === "quote" ? `\u201C${text}\u201D` : text}
        </div>
        {source && (
          <div
            style={{
              fontSize: "12px",
              color: "#6b7280",
              marginTop: "8px",
            }}
          >
            \u2014 {source}
          </div>
        )}
      </div>
    );
  },

  ComparisonRow: (element, ctx) => {
    const leftLabel = element.props.leftLabel as string;
    const rightLabel = element.props.rightLabel as string;
    const leftValue = element.props.leftValue as string;
    const rightValue = element.props.rightValue as string;
    const winner = element.props.winner as string | null;

    const leftBorder =
      winner === "left"
        ? `2px solid ${ctx.theme.primary}`
        : "1px solid #2a2a2a";
    const rightBorder =
      winner === "right"
        ? `2px solid ${ctx.theme.primary}`
        : "1px solid #2a2a2a";
    const leftShadow =
      winner === "left" ? `0 0 12px ${ctx.theme.primary}40` : "none";
    const rightShadow =
      winner === "right" ? `0 0 12px ${ctx.theme.primary}40` : "none";

    return (
      <div className="flex flex-col sm:flex-row gap-3 items-stretch">
        <div
          className="flex-1 rounded-lg p-4 text-center"
          style={{
            background: "#1a1a1a",
            border: leftBorder,
            boxShadow: leftShadow,
          }}
        >
          <div
            className="text-xl sm:text-2xl font-extrabold"
            style={{ color: winner === "left" ? ctx.theme.primary : "#e5e7eb" }}
          >
            {leftValue}
          </div>
          <div className="text-xs text-gray-400 mt-1 uppercase tracking-wider">
            {leftLabel}
          </div>
        </div>
        <div className="flex items-center justify-center text-sm text-gray-600 font-bold">
          vs
        </div>
        <div
          className="flex-1 rounded-lg p-4 text-center"
          style={{
            background: "#1a1a1a",
            border: rightBorder,
            boxShadow: rightShadow,
          }}
        >
          <div
            className="text-xl sm:text-2xl font-extrabold"
            style={{
              color: winner === "right" ? ctx.theme.primary : "#e5e7eb",
            }}
          >
            {rightValue}
          </div>
          <div className="text-xs text-gray-400 mt-1 uppercase tracking-wider">
            {rightLabel}
          </div>
        </div>
      </div>
    );
  },

  IconList: (element, ctx) => {
    const children = renderChildren(element, ctx);
    return (
      <div
        className="flex flex-col gap-2 rounded-lg p-4"
        style={{
          background: "#1a1a1a",
          border: "1px solid #2a2a2a",
        }}
      >
        {children}
      </div>
    );
  },

  IconListItem: (element, ctx) => {
    const icon = element.props.icon as string;
    const text = element.props.text as string;
    const bold = element.props.bold as boolean | null;

    const iconChar = listIconMap[icon] ?? "\u2022";
    const iconColor =
      icon === "check"
        ? "#22c55e"
        : icon === "x"
          ? "#ef4444"
          : icon === "warning"
            ? "#f59e0b"
            : icon === "star"
              ? "#eab308"
              : ctx.theme.primary;

    return (
      <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
        <span
          style={{
            color: iconColor,
            fontSize: "14px",
            fontWeight: 700,
            lineHeight: "22px",
            flexShrink: 0,
            width: "16px",
            textAlign: "center",
          }}
        >
          {iconChar}
        </span>
        <span
          style={{
            fontSize: "13px",
            color: "#d1d5db",
            lineHeight: "22px",
            fontWeight: bold ? 600 : 400,
          }}
        >
          {text}
        </span>
      </div>
    );
  },
};

// =============================================================================
// Render Engine
// =============================================================================

function resolveTheme(spec: Spec): { primary: string; lighter: string } {
  const rootEl = spec.root ? spec.elements[spec.root] : null;
  if (rootEl?.type === "Infographic") {
    const theme = (rootEl.props as Record<string, unknown>).theme as string;
    return themeColors[theme] ?? themeColors.blue;
  }
  return themeColors.blue;
}

function RenderElement({
  spec,
  elementKey,
  theme,
}: {
  spec: Spec;
  elementKey: string;
  theme: { primary: string; lighter: string };
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
    theme,
    renderElement: (childKey: string) => (
      <RenderElement
        key={childKey}
        spec={spec}
        elementKey={childKey}
        theme={theme}
      />
    ),
  };

  const renderer = componentRenderers[element.type];
  if (!renderer) {
    return (
      <div
        style={{
          color: "#ef4444",
          fontSize: "12px",
          padding: "8px",
          border: "1px solid #7f1d1d",
          borderRadius: "4px",
          background: "#1a0000",
        }}
      >
        Unknown: {element.type}
      </div>
    );
  }

  return <>{renderer(data, ctx)}</>;
}

// =============================================================================
// Infographic Renderer (exported)
// =============================================================================

interface InfographicRendererProps {
  spec: Spec;
  isStreaming?: boolean;
}

export function InfographicRenderer({
  spec,
  isStreaming,
}: InfographicRendererProps) {
  if (!spec?.root || !spec.elements?.[spec.root]) {
    if (isStreaming) {
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "80px 0",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div style={{ display: "flex", gap: "6px" }}>
              <span
                className="animate-bounce"
                style={{
                  width: "12px",
                  height: "12px",
                  background: "#3b82f680",
                  borderRadius: "50%",
                }}
              />
              <span
                className="animate-bounce"
                style={{
                  width: "12px",
                  height: "12px",
                  background: "#3b82f680",
                  borderRadius: "50%",
                  animationDelay: "0.1s",
                }}
              />
              <span
                className="animate-bounce"
                style={{
                  width: "12px",
                  height: "12px",
                  background: "#3b82f680",
                  borderRadius: "50%",
                  animationDelay: "0.2s",
                }}
              />
            </div>
            <span
              style={{
                color: "#9ca3af",
                fontSize: "14px",
                fontFamily: "monospace",
              }}
            >
              Building infographic...
            </span>
          </div>
        </div>
      );
    }
    return null;
  }

  const theme = resolveTheme(spec);

  return (
    <div style={{ opacity: isStreaming ? 0.8 : 1 }}>
      <RenderElement spec={spec} elementKey={spec.root} theme={theme} />
    </div>
  );
}
