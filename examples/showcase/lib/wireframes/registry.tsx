"use client";

import type { ReactNode } from "react";
import type { Spec } from "@json-render/react";

// =============================================================================
// Style Mappings
// =============================================================================

const gapMap: Record<string, string> = {
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
};

const alignMap: Record<string, string> = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
};

const colWidthMap: Record<string, string> = {
  auto: "flex-1",
  "1/4": "w-1/4",
  "1/3": "w-1/3",
  "1/2": "w-1/2",
  "2/3": "w-2/3",
  "3/4": "w-3/4",
  full: "w-full",
};

const btnVariant: Record<string, string> = {
  primary: "wf-btn-primary",
  secondary: "wf-btn-secondary",
  outline: "wf-btn-outline",
  danger: "wf-btn-danger",
  ghost: "wf-btn-ghost",
};

const btnSize: Record<string, string> = {
  sm: "text-xs px-3 py-1",
  md: "text-sm px-4 py-2",
  lg: "text-base px-6 py-3",
};

const badgeVariant: Record<string, string> = {
  default: "bg-gray-200 text-gray-800",
  success: "bg-green-100 text-green-700 border-green-300",
  warning: "bg-amber-100 text-amber-700 border-amber-300",
  error: "bg-red-100 text-red-700 border-red-300",
  info: "bg-blue-100 text-blue-700 border-blue-300",
};

const toastVariant: Record<string, string> = {
  success: "border-l-green-500 bg-green-50",
  error: "border-l-red-500 bg-red-50",
  warning: "border-l-amber-500 bg-amber-50",
  info: "border-l-blue-500 bg-blue-50",
};

const annotationColor: Record<string, string> = {
  red: "bg-red-100 border-red-300 text-red-700",
  blue: "bg-blue-100 border-blue-300 text-blue-700",
  green: "bg-green-100 border-green-300 text-green-700",
  yellow: "bg-yellow-100 border-yellow-300 text-yellow-700",
};

const imgAspect: Record<string, string> = {
  square: "aspect-square",
  video: "aspect-video",
  wide: "aspect-[3/1]",
  tall: "aspect-[2/3]",
};

const imgSize: Record<string, string> = {
  sm: "w-24",
  md: "w-48",
  lg: "w-72",
  full: "w-full",
};

const modalWidth: Record<string, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
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
  Wireframe: (element, ctx) => {
    const title = element.props.title as string;
    const device = (element.props.device as string) ?? "desktop";
    const children = renderChildren(element, ctx);

    const deviceClass =
      device === "mobile"
        ? "max-w-sm"
        : device === "tablet"
          ? "max-w-2xl"
          : "max-w-5xl";

    return (
      <div>
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold font-mono tracking-tight">
            {title}
          </h2>
          <div className="text-xs text-gray-600 font-mono mt-1">
            {device} &middot; wireframe
          </div>
        </div>
        <div className={`${deviceClass} mx-auto space-y-8`}>{children}</div>
      </div>
    );
  },

  Screen: (element, ctx) => {
    const name = element.props.name as string;
    const description = element.props.description as string | null;
    const children = renderChildren(element, ctx);

    return (
      <div className="wf-screen">
        <div className="wf-screen-header">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-gray-300" />
              <span className="w-2.5 h-2.5 rounded-full bg-gray-300" />
              <span className="w-2.5 h-2.5 rounded-full bg-gray-300" />
            </div>
            <span className="font-mono text-sm font-bold">{name}</span>
          </div>
          {description && (
            <span className="text-[10px] text-gray-600 font-mono">
              {description}
            </span>
          )}
        </div>
        <div className="wf-screen-body">{children}</div>
      </div>
    );
  },

  Row: (element, ctx) => {
    const gap = gapMap[(element.props.gap as string) ?? "md"] ?? gapMap.md;
    const align =
      alignMap[(element.props.align as string) ?? "stretch"] ??
      alignMap.stretch;
    const children = renderChildren(element, ctx);

    return <div className={`flex ${gap} ${align}`}>{children}</div>;
  },

  Column: (element, ctx) => {
    const width =
      colWidthMap[(element.props.width as string) ?? "auto"] ??
      colWidthMap.auto;
    const gap = gapMap[(element.props.gap as string) ?? "md"] ?? gapMap.md;
    const children = renderChildren(element, ctx);

    return <div className={`flex flex-col ${width} ${gap}`}>{children}</div>;
  },

  NavBar: (element) => {
    const brand = element.props.brand as string;
    const items = (element.props.items as string[]) ?? [];

    return (
      <div className="wf-navbar">
        <span className="font-mono font-bold text-sm">{brand}</span>
        <div className="flex items-center gap-4">
          {items.map((item, i) => (
            <span
              key={i}
              className="text-xs font-mono text-gray-700 hover:text-gray-900 cursor-pointer underline decoration-dashed"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    );
  },

  Sidebar: (element) => {
    const items = (element.props.items as string[]) ?? [];
    const active = element.props.active as string | null;

    return (
      <div className="wf-sidebar">
        {items.map((item, i) => (
          <div
            key={i}
            className={`wf-sidebar-item ${item === active ? "wf-sidebar-active" : ""}`}
          >
            <span className="w-3 h-3 border border-dashed border-gray-400 rounded-sm inline-block mr-2" />
            {item}
          </div>
        ))}
      </div>
    );
  },

  Heading: (element) => {
    const text = element.props.text as string;
    const level = (element.props.level as string) ?? "h2";
    const sizeClass =
      level === "h1"
        ? "text-2xl font-bold"
        : level === "h3"
          ? "text-base font-semibold"
          : "text-lg font-bold";

    return <div className={`${sizeClass} font-mono`}>{text}</div>;
  },

  Paragraph: (element) => {
    const text = element.props.text as string;
    const lines = element.props.lines as string | null;

    if (lines) {
      const count = parseInt(lines) || 2;
      return (
        <div className="space-y-1.5">
          {Array.from({ length: count }).map((_, i) => (
            <div
              key={i}
              className="h-3 bg-gray-200 rounded"
              style={{ width: `${85 - i * 12}%` }}
            />
          ))}
        </div>
      );
    }

    return (
      <p className="text-sm font-mono text-gray-800 leading-relaxed">{text}</p>
    );
  },

  Button: (element) => {
    const label = element.props.label as string;
    const variant = (element.props.variant as string) ?? "primary";
    const size = (element.props.size as string) ?? "md";
    const icon = element.props.icon as string | null;
    const v = btnVariant[variant] ?? btnVariant.primary;
    const s = btnSize[size] ?? btnSize.md;

    return (
      <button className={`wf-btn ${v} ${s} font-mono`}>
        {icon && <span className="mr-1.5">[{icon}]</span>}
        {label}
      </button>
    );
  },

  TextInput: (element) => {
    const label = element.props.label as string | null;
    const placeholder = element.props.placeholder as string;
    const required = element.props.required as boolean | null;

    return (
      <div className="space-y-1">
        {label && (
          <label className="text-xs font-mono font-semibold text-gray-800">
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        <div className="wf-input">
          <span className="text-gray-500">{placeholder}</span>
        </div>
      </div>
    );
  },

  TextArea: (element) => {
    const label = element.props.label as string | null;
    const placeholder = element.props.placeholder as string;
    const rows = parseInt((element.props.rows as string) ?? "3") || 3;

    return (
      <div className="space-y-1">
        {label && (
          <label className="text-xs font-mono font-semibold text-gray-800">
            {label}
          </label>
        )}
        <div className="wf-input" style={{ minHeight: `${rows * 1.5}rem` }}>
          <span className="text-gray-500">{placeholder}</span>
        </div>
      </div>
    );
  },

  Select: (element) => {
    const label = element.props.label as string | null;
    const placeholder = element.props.placeholder as string;

    return (
      <div className="space-y-1">
        {label && (
          <label className="text-xs font-mono font-semibold text-gray-800">
            {label}
          </label>
        )}
        <div className="wf-input flex items-center justify-between">
          <span className="text-gray-500">{placeholder}</span>
          <span className="text-gray-500 text-xs">&#9660;</span>
        </div>
      </div>
    );
  },

  Checkbox: (element) => {
    const label = element.props.label as string;
    const checked = element.props.checked as boolean | null;

    return (
      <div className="flex items-center gap-2">
        <div
          className={`w-4 h-4 border-2 border-dashed border-gray-400 rounded-sm flex items-center justify-center ${checked ? "bg-gray-200" : ""}`}
        >
          {checked && <span className="text-[10px]">&#10003;</span>}
        </div>
        <span className="text-sm font-mono text-gray-800">{label}</span>
      </div>
    );
  },

  RadioGroup: (element) => {
    const label = element.props.label as string | null;
    const options = (element.props.options as string[]) ?? [];
    const selected = element.props.selected as string | null;

    return (
      <div className="space-y-1.5">
        {label && (
          <div className="text-xs font-mono font-semibold text-gray-800">
            {label}
          </div>
        )}
        {options.map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className={`w-4 h-4 border-2 border-dashed border-gray-400 rounded-full flex items-center justify-center`}
            >
              {opt === selected && (
                <span className="w-2 h-2 bg-gray-500 rounded-full" />
              )}
            </div>
            <span className="text-sm font-mono text-gray-800">{opt}</span>
          </div>
        ))}
      </div>
    );
  },

  Toggle: (element) => {
    const label = element.props.label as string;
    const enabled = element.props.enabled as boolean | null;

    return (
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-5 rounded-full border-2 border-dashed border-gray-400 relative ${enabled ? "bg-gray-300" : "bg-gray-100"}`}
        >
          <div
            className={`w-4 h-4 rounded-full bg-gray-500 absolute top-0 transition-all ${enabled ? "left-5" : "left-0"}`}
          />
        </div>
        <span className="text-sm font-mono text-gray-800">{label}</span>
      </div>
    );
  },

  Card: (element, ctx) => {
    const title = element.props.title as string | null;
    const subtitle = element.props.subtitle as string | null;
    const children = renderChildren(element, ctx);

    return (
      <div className="wf-card h-full flex flex-col">
        {(title || subtitle) && (
          <div className="mb-3">
            {title && (
              <div className="font-mono font-bold text-sm">{title}</div>
            )}
            {subtitle && (
              <div className="font-mono text-xs text-gray-600">{subtitle}</div>
            )}
          </div>
        )}
        <div className="space-y-3 flex-1 flex flex-col [&>*:last-child]:mt-auto">
          {children}
        </div>
      </div>
    );
  },

  Table: (element) => {
    const columns = (element.props.columns as string[]) ?? [];
    const rowCount = parseInt((element.props.rows as string) ?? "3") || 3;
    const striped = element.props.striped as boolean | null;

    return (
      <div className="wf-table-wrapper">
        <table className="w-full">
          <thead>
            <tr>
              {columns.map((col, i) => (
                <th key={i} className="wf-th">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rowCount }).map((_, r) => (
              <tr
                key={r}
                className={striped && r % 2 === 1 ? "bg-gray-50" : ""}
              >
                {columns.map((_, c) => (
                  <td key={c} className="wf-td">
                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  },

  List: (element) => {
    const items = (element.props.items as string[]) ?? [];
    const ordered = element.props.ordered as boolean | null;

    return (
      <div className="space-y-1.5">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-start gap-2 font-mono text-sm text-gray-800"
          >
            <span className="text-gray-600 shrink-0">
              {ordered ? `${i + 1}.` : "\u2022"}
            </span>
            {item}
          </div>
        ))}
      </div>
    );
  },

  ImagePlaceholder: (element) => {
    const label = element.props.label as string | null;
    const aspect =
      imgAspect[(element.props.aspect as string) ?? "video"] ?? imgAspect.video;
    const size =
      imgSize[(element.props.size as string) ?? "full"] ?? imgSize.full;

    return (
      <div className={`wf-img ${aspect} ${size}`}>
        <svg
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="none"
        >
          <line
            x1="0"
            y1="0"
            x2="100%"
            y2="100%"
            stroke="#d1d5db"
            strokeWidth="1"
            strokeDasharray="6 4"
          />
          <line
            x1="100%"
            y1="0"
            x2="0"
            y2="100%"
            stroke="#d1d5db"
            strokeWidth="1"
            strokeDasharray="6 4"
          />
        </svg>
        {label && (
          <span className="relative z-10 text-xs font-mono text-gray-600 bg-white/80 px-2 py-0.5 rounded">
            {label}
          </span>
        )}
      </div>
    );
  },

  Avatar: (element) => {
    const name = element.props.name as string;
    const size = (element.props.size as string) ?? "md";
    const sizeClass =
      size === "sm"
        ? "w-8 h-8 text-xs"
        : size === "lg"
          ? "w-14 h-14 text-lg"
          : "w-10 h-10 text-sm";
    const initials = name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    return (
      <div
        className={`${sizeClass} rounded-full border-2 border-dashed border-gray-400 bg-gray-100 flex items-center justify-center font-mono font-bold text-gray-700 shrink-0`}
      >
        {initials}
      </div>
    );
  },

  Badge: (element) => {
    const text = element.props.text as string;
    const variant = (element.props.variant as string) ?? "default";
    const v = badgeVariant[variant] ?? badgeVariant.default;

    return (
      <span
        className={`inline-block text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-dashed ${v}`}
      >
        {text}
      </span>
    );
  },

  Divider: (element) => {
    const label = element.props.label as string | null;

    if (label) {
      return (
        <div className="flex items-center gap-3 my-2">
          <div className="flex-1 border-t border-dashed border-gray-300" />
          <span className="text-[10px] font-mono text-gray-600">{label}</span>
          <div className="flex-1 border-t border-dashed border-gray-300" />
        </div>
      );
    }

    return <div className="border-t border-dashed border-gray-300 my-2" />;
  },

  Breadcrumb: (element) => {
    const items = (element.props.items as string[]) ?? [];

    return (
      <div className="flex items-center gap-1.5 text-xs font-mono text-gray-600">
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <span>/</span>}
            <span
              className={
                i === items.length - 1
                  ? "text-gray-700 font-semibold"
                  : "underline decoration-dashed"
              }
            >
              {item}
            </span>
          </span>
        ))}
      </div>
    );
  },

  Tabs: (element) => {
    const items = (element.props.items as string[]) ?? [];
    const active = element.props.active as string | null;

    return (
      <div className="flex border-b-2 border-dashed border-gray-300 gap-0">
        {items.map((item, i) => (
          <div
            key={i}
            className={`px-4 py-2 text-xs font-mono cursor-pointer ${
              item === active
                ? "border-b-2 border-gray-700 text-gray-700 font-bold -mb-[2px]"
                : "text-gray-600"
            }`}
          >
            {item}
          </div>
        ))}
      </div>
    );
  },

  Modal: (element, ctx) => {
    const title = element.props.title as string;
    const width =
      modalWidth[(element.props.width as string) ?? "md"] ?? modalWidth.md;
    const children = renderChildren(element, ctx);

    return (
      <div className="wf-modal-backdrop">
        <div className={`wf-modal ${width}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono font-bold text-sm">{title}</span>
            <span className="text-gray-600 cursor-pointer text-lg leading-none">
              &times;
            </span>
          </div>
          <div className="space-y-3">{children}</div>
        </div>
      </div>
    );
  },

  Toast: (element) => {
    const message = element.props.message as string;
    const variant = (element.props.variant as string) ?? "info";
    const v = toastVariant[variant] ?? toastVariant.info;

    return (
      <div className={`wf-toast ${v}`}>
        <span className="text-xs font-mono">{message}</span>
        <span className="text-gray-600 text-sm cursor-pointer">&times;</span>
      </div>
    );
  },

  ProgressBar: (element) => {
    const label = element.props.label as string | null;
    const percent = Math.min(
      100,
      Math.max(0, (element.props.percent as number) ?? 0),
    );

    return (
      <div className="space-y-1">
        {label && (
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-gray-800">{label}</span>
            <span className="text-xs font-mono text-gray-600">{percent}%</span>
          </div>
        )}
        <div className="h-3 bg-gray-100 border border-dashed border-gray-300 rounded-full overflow-hidden">
          <div
            className="h-full bg-gray-400 rounded-full transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    );
  },

  Skeleton: (element) => {
    const lines = parseInt((element.props.lines as string) ?? "3") || 3;
    const type = (element.props.type as string) ?? "text";

    if (type === "avatar") {
      return (
        <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse border border-dashed border-gray-300" />
      );
    }

    if (type === "card") {
      return (
        <div className="h-32 bg-gray-100 rounded border border-dashed border-gray-300 animate-pulse" />
      );
    }

    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-3 bg-gray-200 rounded animate-pulse"
            style={{ width: `${90 - i * 15}%` }}
          />
        ))}
      </div>
    );
  },

  Annotation: (element) => {
    const text = element.props.text as string;
    const color = (element.props.color as string) ?? "yellow";
    const c = annotationColor[color] ?? annotationColor.yellow;

    return (
      <div className={`wf-annotation ${c}`}>
        <span className="text-xs">&#x1F4CC;</span> {text}
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
      <div className="text-red-500 text-xs p-2 border border-red-300 rounded bg-red-50 font-mono">
        Unknown: {element.type}
      </div>
    );
  }

  return <>{renderer(data, ctx)}</>;
}

// =============================================================================
// Wireframe Renderer (exported)
// =============================================================================

interface WireframeRendererProps {
  spec: Spec;
  isStreaming?: boolean;
}

export function WireframeRenderer({
  spec,
  isStreaming,
}: WireframeRendererProps) {
  if (!spec?.root || !spec.elements?.[spec.root]) {
    if (isStreaming) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 bg-gray-300 rounded-sm animate-pulse" />
              <span className="w-3 h-3 bg-gray-300 rounded-sm animate-pulse [animation-delay:0.1s]" />
              <span className="w-3 h-3 bg-gray-300 rounded-sm animate-pulse [animation-delay:0.2s]" />
            </div>
            <span className="text-gray-600 text-sm font-mono">
              Sketching wireframes...
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
