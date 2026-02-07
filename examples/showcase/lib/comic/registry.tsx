"use client";

import type { ReactNode } from "react";
import type { Spec } from "@json-render/react";

// =============================================================================
// Mood & Color Mappings
// =============================================================================

const moodBg: Record<string, string> = {
  normal: "bg-gray-100",
  dramatic: "bg-gradient-to-b from-orange-100 to-red-50",
  dark: "bg-gradient-to-b from-slate-300 to-slate-200",
  bright: "bg-gradient-to-b from-yellow-50 to-amber-50",
  action: "bg-gradient-to-b from-red-100 to-orange-50",
  quiet: "bg-gradient-to-b from-blue-50 to-sky-50",
};

const moodBorder: Record<string, string> = {
  normal: "border-gray-900",
  dramatic: "border-red-900",
  dark: "border-slate-900",
  bright: "border-amber-700",
  action: "border-red-800",
  quiet: "border-blue-900",
};

const sfxColors: Record<string, string> = {
  red: "text-red-600",
  blue: "text-blue-600",
  yellow: "text-yellow-500",
  orange: "text-orange-500",
  purple: "text-purple-600",
  white: "text-white",
};

const sfxSizes: Record<string, string> = {
  sm: "text-xl",
  md: "text-3xl",
  lg: "text-5xl",
};

const panelSizes: Record<string, string> = {
  small: "col-span-1 row-span-1",
  medium: "col-span-1 row-span-1",
  large: "col-span-2 row-span-2",
  wide: "col-span-2 row-span-1",
  tall: "col-span-1 row-span-2",
};

const bubblePositions: Record<string, string> = {
  "top-left": "top-3 left-3",
  "top-right": "top-3 right-3",
  "bottom-left": "bottom-8 left-3",
  "bottom-right": "bottom-8 right-3",
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
  ComicPage: (element, ctx) => {
    const title = element.props.title as string;
    const children = renderChildren(element, ctx);

    return (
      <div>
        {/* Comic title */}
        <div className="text-center mb-6">
          <h2
            className="text-3xl font-black uppercase tracking-wider"
            style={{ textShadow: "2px 2px 0 oklch(0.2 0.01 260 / 0.1)" }}
          >
            {title}
          </h2>
        </div>

        {/* Panel grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 auto-rows-[200px] md:auto-rows-[250px]">
          {children}
        </div>
      </div>
    );
  },

  Panel: (element, ctx) => {
    const scene = element.props.scene as string;
    const mood = (element.props.mood as string) ?? "normal";
    const size = (element.props.size as string) ?? "medium";
    const bg = moodBg[mood] ?? moodBg.normal;
    const border = moodBorder[mood] ?? moodBorder.normal;
    const sizeClass = panelSizes[size] ?? panelSizes.medium;
    const children = renderChildren(element, ctx);

    return (
      <div
        className={`comic-panel ${sizeClass} ${bg} border-3 ${border} relative flex flex-col`}
      >
        {/* Scene description overlay */}
        <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
          <p className="text-xs text-center text-foreground/20 font-mono leading-relaxed max-w-[80%]">
            [{scene}]
          </p>
        </div>

        {/* Dialogue elements */}
        <div className="relative z-10 flex flex-col h-full p-2 gap-1">
          {children}
        </div>
      </div>
    );
  },

  SpeechBubble: (element) => {
    const speaker = element.props.speaker as string;
    const text = element.props.text as string;
    const emphasis = element.props.emphasis as boolean | null;
    const position = (element.props.position as string) ?? "top-left";

    const isRight = position.includes("right");
    const isBottom = position.includes("bottom");

    return (
      <div
        className={`flex ${isRight ? "justify-end" : "justify-start"} ${isBottom ? "mt-auto" : ""}`}
      >
        <div
          className="speech-bubble"
          style={isRight ? { transform: "scaleX(-1)" } : undefined}
        >
          <div style={isRight ? { transform: "scaleX(-1)" } : undefined}>
            <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">
              {speaker}
            </div>
            <p
              className={`text-sm leading-snug ${emphasis ? "font-black text-base" : ""}`}
            >
              {text}
            </p>
          </div>
        </div>
      </div>
    );
  },

  ThoughtBubble: (element) => {
    const speaker = element.props.speaker as string;
    const text = element.props.text as string;
    const position = (element.props.position as string) ?? "top-right";

    const isRight = position.includes("right");
    const isBottom = position.includes("bottom");

    return (
      <div
        className={`flex ${isRight ? "justify-end" : "justify-start"} ${isBottom ? "mt-auto" : ""}`}
      >
        <div className="thought-bubble">
          <span className="thought-dot" />
          <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-0.5">
            {speaker}
          </div>
          <p className="text-sm italic text-foreground/70 leading-snug">
            {text}
          </p>
        </div>
      </div>
    );
  },

  Narration: (element) => {
    const text = element.props.text as string;
    const position = (element.props.position as string) ?? "top";

    return (
      <div className={`${position === "bottom" ? "mt-auto" : ""}`}>
        <div className="narration-box">
          <p className="text-xs leading-relaxed">{text}</p>
        </div>
      </div>
    );
  },

  SoundEffect: (element) => {
    const text = element.props.text as string;
    const size =
      sfxSizes[(element.props.size as string) ?? "md"] ?? sfxSizes.md;
    const color =
      sfxColors[(element.props.color as string) ?? "red"] ?? sfxColors.red;

    return (
      <div className="flex items-center justify-center flex-1">
        <span className={`sfx-text ${size} ${color}`}>{text}</span>
      </div>
    );
  },

  CharacterLabel: (element) => {
    const name = element.props.name as string;
    const description = element.props.description as string | null;
    const position = (element.props.position as string) ?? "center";
    const align =
      position === "right"
        ? "self-end"
        : position === "left"
          ? "self-start"
          : "self-center";

    return (
      <div className={`${align} mt-auto`}>
        <div className="bg-white border-2 border-foreground px-2 py-1 inline-block">
          <div className="text-xs font-black uppercase">{name}</div>
          {description && (
            <div className="text-[9px] text-muted-foreground italic">
              {description}
            </div>
          )}
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
      <div className="text-red-500 text-xs p-2 border border-red-300 rounded bg-red-50">
        Unknown: {element.type}
      </div>
    );
  }

  return <>{renderer(data, ctx)}</>;
}

// =============================================================================
// Comic Renderer (exported)
// =============================================================================

interface ComicRendererProps {
  spec: Spec;
  isStreaming?: boolean;
}

export function ComicRenderer({ spec, isStreaming }: ComicRendererProps) {
  if (!spec?.root || !spec.elements?.[spec.root]) {
    if (isStreaming) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 bg-primary/50 rounded-full animate-bounce" />
              <span className="w-3 h-3 bg-primary/50 rounded-full animate-bounce [animation-delay:0.1s]" />
              <span className="w-3 h-3 bg-primary/50 rounded-full animate-bounce [animation-delay:0.2s]" />
            </div>
            <span className="text-muted-foreground text-sm font-mono">
              Drawing panels...
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
