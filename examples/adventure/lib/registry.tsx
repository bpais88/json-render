"use client";

import type { ReactNode } from "react";
import type { Spec } from "@json-render/react";

// =============================================================================
// Mood Styles
// =============================================================================

const moodStyles: Record<string, string> = {
  neutral: "from-[#1a1a2e]/50 to-transparent",
  tense: "from-red-950/30 to-transparent",
  mysterious: "from-purple-950/30 to-transparent",
  triumphant: "from-amber-950/30 to-transparent",
  dark: "from-gray-950/50 to-transparent",
  peaceful: "from-emerald-950/20 to-transparent",
};

const dialogMoods: Record<string, string> = {
  friendly: "border-emerald-800/50 bg-emerald-950/20",
  hostile: "border-red-800/50 bg-red-950/20",
  mysterious: "border-purple-800/50 bg-purple-950/20",
  scared: "border-amber-800/50 bg-amber-950/20",
  neutral: "border-border bg-muted/30",
};

const riskColors: Record<string, string> = {
  safe: "text-emerald-400",
  moderate: "text-amber-400",
  dangerous: "text-red-400",
};

const badgeVariants: Record<string, string> = {
  default: "bg-primary/20 text-primary",
  danger: "bg-red-500/20 text-red-300",
  success: "bg-emerald-500/20 text-emerald-300",
  warning: "bg-amber-500/20 text-amber-300",
  info: "bg-blue-500/20 text-blue-300",
};

const lootTypeIcons: Record<string, string> = {
  weapon: "\u2694\uFE0F",
  armor: "\uD83D\uDEE1\uFE0F",
  potion: "\uD83E\uDDEA",
  key: "\uD83D\uDD11",
  gold: "\uD83D\uDCB0",
  misc: "\uD83D\uDCE6",
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
  onChoice?: (choiceId: string, choiceText: string) => void;
}

function renderChildren(element: ElementData, ctx: RenderContext): ReactNode[] {
  if (!element.children) return [];
  return element.children.map((childKey) => ctx.renderElement(childKey));
}

const componentRenderers: Record<
  string,
  (element: ElementData, ctx: RenderContext) => ReactNode
> = {
  Scene: (element, ctx) => {
    const mood = (element.props.mood as string) ?? "neutral";
    const location = element.props.location as string;
    const gradient = moodStyles[mood] ?? moodStyles.neutral;

    return (
      <div className="relative">
        {/* Mood gradient overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-b ${gradient} pointer-events-none rounded-xl`}
        />

        {/* Location header */}
        <div className="relative px-6 pt-5 pb-3">
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-primary/60 animate-pulse" />
            {location}
          </div>
        </div>

        {/* Scene content */}
        <div className="relative px-6 pb-6 flex flex-col gap-4">
          {renderChildren(element, ctx)}
        </div>
      </div>
    );
  },

  Narrative: (element) => (
    <p className="narrative-text text-foreground/90 leading-relaxed text-[15px]">
      {element.props.text as string}
    </p>
  ),

  DialogBox: (element) => {
    const mood = (element.props.mood as string) ?? "neutral";
    const moodClass = dialogMoods[mood] ?? dialogMoods.neutral;
    return (
      <div className={`narrative-text border rounded-lg p-4 ${moodClass}`}>
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
          {element.props.speaker as string}
        </div>
        <p className="text-foreground/90 italic leading-relaxed">
          &ldquo;{element.props.text as string}&rdquo;
        </p>
      </div>
    );
  },

  ChoiceList: (element, ctx) => {
    const prompt = element.props.prompt as string | null;
    const choices =
      (element.props.choices as Array<{
        id: string;
        text: string;
        risk?: string | null;
      }>) ?? [];

    return (
      <div className="narrative-text mt-2">
        {prompt && (
          <p className="text-muted-foreground text-sm mb-3 italic">{prompt}</p>
        )}
        <div className="flex flex-col gap-2">
          {choices.map((choice) => {
            const risk = choice.risk ?? "safe";
            const riskDot = riskColors[risk] ?? riskColors.safe;
            return (
              <button
                key={choice.id}
                onClick={() => ctx.onChoice?.(choice.id, choice.text)}
                className="choice-button text-left px-4 py-3 rounded-lg border border-border/60 hover:border-primary/50 bg-muted/20 hover:bg-muted/40 transition-all group"
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${riskDot} bg-current`}
                  />
                  <span className="text-foreground/90 group-hover:text-foreground text-sm leading-relaxed">
                    {choice.text}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
        <div className="flex gap-4 mt-2 text-[10px] text-muted-foreground/50 font-mono">
          <span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1" />
            safe
          </span>
          <span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 mr-1" />
            moderate
          </span>
          <span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-400 mr-1" />
            dangerous
          </span>
        </div>
      </div>
    );
  },

  StatusBar: (element) => {
    const health = (element.props.health as number) ?? 100;
    const maxHealth = (element.props.maxHealth as number) ?? 100;
    const gold = element.props.gold as number | null;
    const healthPercent = Math.round((health / maxHealth) * 100);
    const healthColor =
      healthPercent > 60
        ? "bg-emerald-500"
        : healthPercent > 30
          ? "bg-amber-500"
          : "bg-red-500";

    return (
      <div className="flex items-center gap-4 px-4 py-2.5 rounded-lg bg-muted/30 border border-border/40 text-xs font-mono">
        <div className="flex items-center gap-2 flex-1">
          <span className="text-muted-foreground">HP</span>
          <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden max-w-[120px]">
            <div
              className={`h-full rounded-full transition-all duration-500 ${healthColor}`}
              style={{ width: `${healthPercent}%` }}
            />
          </div>
          <span className="stat-value text-foreground/80">
            {health}/{maxHealth}
          </span>
        </div>
        {gold !== null && gold !== undefined && (
          <div className="flex items-center gap-1.5">
            <span className="text-amber-400">G</span>
            <span className="stat-value text-amber-300">{gold}</span>
          </div>
        )}
      </div>
    );
  },

  InventoryPanel: (element) => {
    const items =
      (element.props.items as Array<{
        name: string;
        description?: string | null;
        quantity?: number | null;
      }>) ?? [];

    if (items.length === 0) return null;

    return (
      <div className="rounded-lg border border-border/40 bg-muted/20 overflow-hidden">
        <div className="px-3 py-2 border-b border-border/40 text-xs font-mono text-muted-foreground uppercase tracking-wider">
          Inventory
        </div>
        <div className="p-2 flex flex-wrap gap-1.5">
          {items.map((item, i) => (
            <div
              key={i}
              className="px-2.5 py-1.5 rounded border border-border/30 bg-muted/30 text-xs"
              title={item.description ?? undefined}
            >
              <span className="text-foreground/80">{item.name}</span>
              {item.quantity && item.quantity > 1 && (
                <span className="text-muted-foreground ml-1">
                  x{item.quantity}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  },

  Badge: (element) => {
    const variant = (element.props.variant as string) ?? "default";
    const cls = badgeVariants[variant] ?? badgeVariants.default;
    return (
      <span
        className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${cls}`}
      >
        {element.props.text as string}
      </span>
    );
  },

  Divider: () => (
    <div className="flex items-center gap-3 py-1">
      <div className="flex-1 h-px bg-border/50" />
      <span className="text-muted-foreground/30 text-xs">***</span>
      <div className="flex-1 h-px bg-border/50" />
    </div>
  ),

  Stack: (element, ctx) => {
    const direction = (element.props.direction as string) ?? "vertical";
    const gap: Record<string, string> = {
      sm: "gap-2",
      md: "gap-3",
      lg: "gap-4",
    };
    const gapClass = gap[(element.props.gap as string) ?? "md"] ?? gap.md;
    const dir = direction === "horizontal" ? "flex-row flex-wrap" : "flex-col";
    return (
      <div className={`flex ${dir} ${gapClass}`}>
        {renderChildren(element, ctx)}
      </div>
    );
  },

  LootDrop: (element) => {
    const title = element.props.title as string;
    const items =
      (element.props.items as Array<{
        name: string;
        type: string;
      }>) ?? [];

    return (
      <div className="narrative-text rounded-lg border border-amber-800/40 bg-amber-950/20 p-4">
        <div className="text-xs font-mono text-amber-400/80 uppercase tracking-wider mb-2">
          {title}
        </div>
        <div className="flex flex-wrap gap-2">
          {items.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-amber-900/20 border border-amber-800/30 text-sm"
            >
              <span>{lootTypeIcons[item.type] ?? lootTypeIcons.misc}</span>
              <span className="text-amber-200">{item.name}</span>
            </div>
          ))}
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
  onChoice,
}: {
  spec: Spec;
  elementKey: string;
  onChoice?: (choiceId: string, choiceText: string) => void;
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
      <RenderElement
        key={childKey}
        spec={spec}
        elementKey={childKey}
        onChoice={onChoice}
      />
    ),
    onChoice,
  };

  const renderer = componentRenderers[element.type];
  if (!renderer) {
    return (
      <div className="text-red-400 text-xs p-2 border border-red-400/30 rounded">
        Unknown: {element.type}
      </div>
    );
  }

  return <>{renderer(data, ctx)}</>;
}

// =============================================================================
// Scene Renderer (exported)
// =============================================================================

interface SceneRendererProps {
  spec: Spec;
  onChoice: (choiceId: string, choiceText: string) => void;
  isStreaming?: boolean;
}

export function SceneRenderer({
  spec,
  onChoice,
  isStreaming,
}: SceneRendererProps): ReactNode {
  if (!spec?.root || !spec.elements?.[spec.root]) {
    if (isStreaming) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-1.5">
              <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" />
              <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce [animation-delay:0.1s]" />
              <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce [animation-delay:0.2s]" />
            </div>
            <span className="text-muted-foreground text-sm italic">
              The scene unfolds...
            </span>
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <div className={isStreaming ? "pointer-events-none opacity-80" : ""}>
      <RenderElement spec={spec} elementKey={spec.root} onChoice={onChoice} />
    </div>
  );
}
