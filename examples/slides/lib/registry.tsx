"use client";

import type { ReactNode } from "react";
import type { Spec } from "@json-render/react";

// =============================================================================
// Slide Background Styles
// =============================================================================

const backgrounds: Record<string, string> = {
  default: "bg-[#0a0a0a]",
  gradient: "bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]",
  dark: "bg-[#050505]",
  blue: "bg-gradient-to-br from-[#0c1445] via-[#1a237e] to-[#283593]",
  green: "bg-gradient-to-br from-[#0a2e1a] via-[#1b5e20] to-[#2e7d32]",
  purple: "bg-gradient-to-br from-[#1a0a2e] via-[#4a148c] to-[#6a1b9a]",
  orange: "bg-gradient-to-br from-[#2e1a0a] via-[#bf360c] to-[#e65100]",
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
  Deck: (element, ctx) => {
    // Deck is handled by the presenter - just render children
    return <>{renderChildren(element, ctx)}</>;
  },

  Slide: (element, ctx) => {
    const layout = (element.props.layout as string) ?? "center";
    const bg =
      backgrounds[(element.props.background as string) ?? "default"] ??
      backgrounds.default;
    const children = renderChildren(element, ctx);

    const layoutClasses: Record<string, string> = {
      center: "items-center justify-center text-center",
      left: "items-start justify-center text-left",
      top: "items-center justify-start text-left pt-[8%]",
      split: "items-start justify-center text-left",
    };

    if (layout === "split") {
      const mid = Math.ceil(children.length / 2);
      const left = children.slice(0, mid);
      const right = children.slice(mid);
      return (
        <div
          className={`slide ${bg} w-full h-full flex items-center justify-center px-[8%] py-[6%]`}
        >
          <div className="grid grid-cols-2 gap-[4%] w-full h-full">
            <div className="flex flex-col justify-center gap-[2cqi]">
              {left}
            </div>
            <div className="flex flex-col justify-center gap-[2cqi]">
              {right}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        className={`slide ${bg} w-full h-full flex flex-col ${layoutClasses[layout]} px-[8%] py-[6%] gap-[1.5cqi]`}
      >
        {children}
      </div>
    );
  },

  Title: (element) => {
    const level = (element.props.level as string) ?? "h1";
    const text = element.props.text as string;
    const classes: Record<string, string> = {
      h1: "slide-title font-bold tracking-tight text-white",
      h2: "slide-subtitle font-semibold tracking-tight text-white",
      h3: "slide-subtitle font-medium text-white/90",
    };
    const Tag = level as keyof JSX.IntrinsicElements;
    return <Tag className={classes[level]}>{text}</Tag>;
  },

  Subtitle: (element) => (
    <p className="slide-subtitle text-white/60 font-light">
      {element.props.text as string}
    </p>
  ),

  Text: (element) => {
    const sizes: Record<string, string> = {
      sm: "slide-badge",
      md: "slide-text",
      lg: "slide-subtitle",
    };
    const aligns: Record<string, string> = {
      left: "text-left",
      center: "text-center",
      right: "text-right",
    };
    const size = sizes[(element.props.size as string) ?? "md"] ?? sizes.md;
    const align = aligns[(element.props.align as string) ?? "left"] ?? "";
    const bold = element.props.bold ? "font-semibold" : "";
    const muted = element.props.muted ? "text-white/50" : "text-white/80";

    return (
      <p className={`${size} ${align} ${bold} ${muted} leading-relaxed`}>
        {element.props.content as string}
      </p>
    );
  },

  BulletList: (element) => {
    const items = (element.props.items as string[]) ?? [];
    const ordered = element.props.ordered as boolean;
    const Tag = ordered ? "ol" : "ul";
    return (
      <Tag
        className={`slide-bullet text-white/80 space-y-[0.8cqi] ${ordered ? "list-decimal" : "list-disc"} list-inside`}
      >
        {items.map((item, i) => (
          <li key={i} className="leading-relaxed">
            {item}
          </li>
        ))}
      </Tag>
    );
  },

  CodeBlock: (element) => {
    const code = element.props.code as string;
    const language = (element.props.language as string) ?? "";
    return (
      <div className="w-full rounded-lg bg-black/40 border border-white/10 overflow-hidden">
        {language && (
          <div className="px-[1.5cqi] py-[0.5cqi] border-b border-white/10 text-white/40 slide-badge font-mono">
            {language}
          </div>
        )}
        <pre className="p-[1.5cqi] overflow-x-auto">
          <code className="slide-code font-mono text-[#50e3c2] whitespace-pre">
            {code}
          </code>
        </pre>
      </div>
    );
  },

  Quote: (element) => (
    <blockquote className="border-l-[3px] border-white/30 pl-[2cqi] py-[0.5cqi]">
      <p className="slide-quote text-white/80 italic leading-relaxed">
        &ldquo;{element.props.text as string}&rdquo;
      </p>
      {element.props.attribution && (
        <cite className="slide-badge text-white/50 mt-[1cqi] block not-italic">
          &mdash; {element.props.attribution as string}
        </cite>
      )}
    </blockquote>
  ),

  Image: (element) => (
    <figure className="flex flex-col items-center gap-[0.5cqi]">
      <img
        src={element.props.src as string}
        alt={(element.props.alt as string) ?? ""}
        className="rounded-lg max-h-[50cqi] object-cover shadow-2xl"
      />
      {element.props.caption && (
        <figcaption className="slide-badge text-white/40 italic">
          {element.props.caption as string}
        </figcaption>
      )}
    </figure>
  ),

  TwoColumn: (element, ctx) => {
    const ratio = (element.props.ratio as string) ?? "equal";
    const children = renderChildren(element, ctx);
    const gridClass: Record<string, string> = {
      equal: "grid-cols-2",
      "wide-left": "grid-cols-[2fr_1fr]",
      "wide-right": "grid-cols-[1fr_2fr]",
    };
    const left = children[0] ?? null;
    const right = children[1] ?? null;
    return (
      <div
        className={`grid ${gridClass[ratio] ?? "grid-cols-2"} gap-[3cqi] w-full`}
      >
        <div className="flex flex-col gap-[1cqi]">{left}</div>
        <div className="flex flex-col gap-[1cqi]">{right}</div>
      </div>
    );
  },

  Stack: (element, ctx) => {
    const direction = (element.props.direction as string) ?? "vertical";
    const gap: Record<string, string> = {
      sm: "gap-[0.5cqi]",
      md: "gap-[1cqi]",
      lg: "gap-[2cqi]",
    };
    const align: Record<string, string> = {
      start: "items-start",
      center: "items-center",
      end: "items-end",
    };
    const gapClass = gap[(element.props.gap as string) ?? "md"] ?? gap.md;
    const alignClass = align[(element.props.align as string) ?? "start"] ?? "";
    const dir = direction === "horizontal" ? "flex-row" : "flex-col";

    return (
      <div className={`flex ${dir} ${gapClass} ${alignClass}`}>
        {renderChildren(element, ctx)}
      </div>
    );
  },

  Badge: (element) => {
    const variants: Record<string, string> = {
      default: "bg-white/15 text-white/90",
      accent: "bg-blue-500/20 text-blue-300",
      muted: "bg-white/8 text-white/50",
      success: "bg-green-500/20 text-green-300",
      warning: "bg-orange-500/20 text-orange-300",
    };
    const variant =
      variants[(element.props.variant as string) ?? "default"] ??
      variants.default;
    return (
      <span
        className={`slide-badge inline-block px-[1cqi] py-[0.3cqi] rounded-full font-medium ${variant}`}
      >
        {element.props.text as string}
      </span>
    );
  },

  Divider: () => <hr className="w-full border-t border-white/15 my-[1cqi]" />,

  Spacer: (element) => {
    const sizes: Record<string, string> = {
      sm: "h-[1cqi]",
      md: "h-[2cqi]",
      lg: "h-[4cqi]",
      xl: "h-[6cqi]",
    };
    return (
      <div
        className={sizes[(element.props.size as string) ?? "md"] ?? sizes.md}
      />
    );
  },
};

// =============================================================================
// Render Engine
// =============================================================================

/**
 * Render a single element from the spec by key
 */
function renderElementByKey(spec: Spec, key: string): ReactNode {
  const element = spec.elements[key];
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
      <div className="text-red-400 slide-badge p-[1cqi] border border-red-400/30 rounded">
        Unknown: {element.type}
      </div>
    );
  }

  return renderer(data, ctx);
}

function RenderElement({
  spec,
  elementKey,
}: {
  spec: Spec;
  elementKey: string;
}) {
  return <>{renderElementByKey(spec, elementKey)}</>;
}

// =============================================================================
// Slide Presenter
// =============================================================================

interface SlidePresenterProps {
  spec: Spec;
  currentSlide: number;
  isStreaming?: boolean;
}

/**
 * Extract slide keys from the spec (direct children of the root Deck)
 */
export function getSlideKeys(spec: Spec | null): string[] {
  if (!spec?.root || !spec.elements) return [];
  const rootElement = spec.elements[spec.root];
  if (!rootElement?.children) return [];
  return rootElement.children.filter((key) => {
    const el = spec.elements[key];
    return el?.type === "Slide";
  });
}

/**
 * Renders a single slide from the spec
 */
export function SlidePresenter({
  spec,
  currentSlide,
  isStreaming,
}: SlidePresenterProps): ReactNode {
  const slideKeys = getSlideKeys(spec);

  if (slideKeys.length === 0) {
    if (isStreaming) {
      return (
        <div className="slide bg-[#0a0a0a] w-full h-full flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-1.5">
              <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" />
              <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce [animation-delay:0.1s]" />
              <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce [animation-delay:0.2s]" />
            </div>
            <span className="text-white/30 text-sm">Building slides...</span>
          </div>
        </div>
      );
    }
    return (
      <div className="slide bg-[#0a0a0a] w-full h-full flex items-center justify-center">
        <span className="text-white/30 text-sm">No slides yet</span>
      </div>
    );
  }

  const index = Math.min(currentSlide, slideKeys.length - 1);
  const slideKey = slideKeys[index];
  if (!slideKey || !spec.elements[slideKey]) return null;

  return <RenderElement spec={spec} elementKey={slideKey} />;
}
