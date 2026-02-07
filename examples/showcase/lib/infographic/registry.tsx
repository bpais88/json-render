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
// Shared Context
// =============================================================================

let currentTheme: { primary: string; lighter: string } = themeColors.blue;

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
  Infographic: (element, ctx) => {
    const title = element.props.title as string;
    const subtitle = element.props.subtitle as string | null;
    const theme = (element.props.theme as string) ?? "blue";
    const colors = themeColors[theme] ?? themeColors.blue;
    currentTheme = colors;
    const children = renderChildren(element, ctx);

    return (
      <div
        style={{
          background: "#111111",
          borderTop: `4px solid ${colors.primary}`,
          borderRadius: "12px",
          padding: "32px",
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1
            style={{
              fontSize: "32px",
              fontWeight: 800,
              color: "#ffffff",
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              style={{
                fontSize: "14px",
                color: "#9ca3af",
                marginTop: "8px",
                margin: "8px 0 0 0",
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {children}
        </div>
      </div>
    );
  },

  StatRow: (element, ctx) => {
    const children = renderChildren(element, ctx);
    return (
      <div
        style={{
          display: "flex",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        {children}
      </div>
    );
  },

  StatCard: (element) => {
    const value = element.props.value as string;
    const label = element.props.label as string;
    const icon = element.props.icon as string | null;

    return (
      <div
        style={{
          flex: "1 1 140px",
          background: "#1a1a1a",
          borderRadius: "8px",
          padding: "20px",
          textAlign: "center",
          border: "1px solid #2a2a2a",
        }}
      >
        {icon && (
          <div style={{ fontSize: "24px", marginBottom: "8px" }}>
            {iconEmojis[icon] ?? ""}
          </div>
        )}
        <div
          style={{
            fontSize: "28px",
            fontWeight: 800,
            color: currentTheme.primary,
            lineHeight: 1.2,
          }}
        >
          {value}
        </div>
        <div
          style={{
            fontSize: "12px",
            color: "#9ca3af",
            marginTop: "6px",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
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
        style={{
          background: "#1a1a1a",
          borderRadius: "8px",
          padding: "20px",
          border: "1px solid #2a2a2a",
        }}
      >
        {title && (
          <div
            style={{
              fontSize: "14px",
              fontWeight: 600,
              color: "#e5e7eb",
              marginBottom: "16px",
            }}
          >
            {title}
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {children}
        </div>
      </div>
    );
  },

  Bar: (element) => {
    const label = element.props.label as string;
    const value = (element.props.value as number) ?? 0;
    const color = (element.props.color as string) ?? currentTheme.primary;
    const clampedValue = Math.max(0, Math.min(100, value));

    return (
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div
          style={{
            width: "100px",
            fontSize: "12px",
            color: "#d1d5db",
            flexShrink: 0,
            textAlign: "right",
          }}
        >
          {label}
        </div>
        <div
          style={{
            flex: 1,
            height: "24px",
            background: "#0a0a0a",
            borderRadius: "4px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${clampedValue}%`,
              height: "100%",
              background: color,
              borderRadius: "4px",
              transition: "width 0.8s ease-out",
            }}
          />
        </div>
        <div
          style={{
            width: "40px",
            fontSize: "12px",
            color: "#9ca3af",
            flexShrink: 0,
          }}
        >
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
        style={{
          background: "#1a1a1a",
          borderRadius: "8px",
          padding: "20px",
          border: "1px solid #2a2a2a",
        }}
      >
        {title && (
          <div
            style={{
              fontSize: "14px",
              fontWeight: 600,
              color: "#e5e7eb",
              marginBottom: "16px",
            }}
          >
            {title}
          </div>
        )}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0px",
            position: "relative",
            paddingLeft: "24px",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: "7px",
              top: "8px",
              bottom: "8px",
              width: "2px",
              background: "#333333",
            }}
          />
          {children}
        </div>
      </div>
    );
  },

  TimelineEvent: (element) => {
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
            background: currentTheme.primary,
            border: "2px solid #1a1a1a",
          }}
        />
        <div
          style={{
            display: "inline-block",
            fontSize: "10px",
            fontWeight: 600,
            color: currentTheme.primary,
            background: `${currentTheme.primary}1a`,
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

  SectionHeader: (element) => {
    const title = element.props.title as string;
    const subtitle = element.props.subtitle as string | null;

    return (
      <div style={{ paddingTop: "8px" }}>
        <div
          style={{
            height: "1px",
            background: `linear-gradient(to right, ${currentTheme.primary}, transparent)`,
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

  Callout: (element) => {
    const text = element.props.text as string;
    const source = element.props.source as string | null;
    const variant = (element.props.variant as string) ?? "highlight";

    const borderColor =
      variant === "warning" ? "#f59e0b" : currentTheme.primary;
    const bgColor =
      variant === "warning" ? "#f59e0b1a" : `${currentTheme.primary}1a`;

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

  ComparisonRow: (element) => {
    const leftLabel = element.props.leftLabel as string;
    const rightLabel = element.props.rightLabel as string;
    const leftValue = element.props.leftValue as string;
    const rightValue = element.props.rightValue as string;
    const winner = element.props.winner as string | null;

    const leftBorder =
      winner === "left"
        ? `2px solid ${currentTheme.primary}`
        : "1px solid #2a2a2a";
    const rightBorder =
      winner === "right"
        ? `2px solid ${currentTheme.primary}`
        : "1px solid #2a2a2a";
    const leftShadow =
      winner === "left" ? `0 0 12px ${currentTheme.primary}40` : "none";
    const rightShadow =
      winner === "right" ? `0 0 12px ${currentTheme.primary}40` : "none";

    return (
      <div style={{ display: "flex", gap: "12px", alignItems: "stretch" }}>
        <div
          style={{
            flex: 1,
            background: "#1a1a1a",
            borderRadius: "8px",
            padding: "16px",
            textAlign: "center",
            border: leftBorder,
            boxShadow: leftShadow,
          }}
        >
          <div
            style={{
              fontSize: "24px",
              fontWeight: 800,
              color: winner === "left" ? currentTheme.primary : "#e5e7eb",
            }}
          >
            {leftValue}
          </div>
          <div
            style={{
              fontSize: "12px",
              color: "#9ca3af",
              marginTop: "4px",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {leftLabel}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: "14px",
            color: "#4b5563",
            fontWeight: 700,
          }}
        >
          vs
        </div>
        <div
          style={{
            flex: 1,
            background: "#1a1a1a",
            borderRadius: "8px",
            padding: "16px",
            textAlign: "center",
            border: rightBorder,
            boxShadow: rightShadow,
          }}
        >
          <div
            style={{
              fontSize: "24px",
              fontWeight: 800,
              color: winner === "right" ? currentTheme.primary : "#e5e7eb",
            }}
          >
            {rightValue}
          </div>
          <div
            style={{
              fontSize: "12px",
              color: "#9ca3af",
              marginTop: "4px",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
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
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          background: "#1a1a1a",
          borderRadius: "8px",
          padding: "16px",
          border: "1px solid #2a2a2a",
        }}
      >
        {children}
      </div>
    );
  },

  IconListItem: (element) => {
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
              : currentTheme.primary;

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

  return (
    <div style={{ opacity: isStreaming ? 0.8 : 1 }}>
      <RenderElement spec={spec} elementKey={spec.root} />
    </div>
  );
}
