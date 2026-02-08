"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { createSpecStreamCompiler, type Spec } from "@json-render/core";
import { SceneRenderer } from "@/lib/adventure/registry";

// =============================================================================
// Game State Types
// =============================================================================

interface InventoryItem {
  name: string;
  description?: string | null;
  quantity?: number | null;
}

interface GameState {
  theme: string;
  health: number;
  maxHealth: number;
  gold: number;
  inventory: InventoryItem[];
  location: string;
}

interface HistoryEntry {
  location: string;
  summary: string;
  choice?: string;
}

// =============================================================================
// Adventure Themes
// =============================================================================

const themes = [
  {
    id: "fantasy",
    name: "Classic Fantasy",
    desc: "Swords, sorcery, and ancient dungeons",
    icon: "\u2694\uFE0F",
  },
  {
    id: "horror",
    name: "Gothic Horror",
    desc: "Dark castles, curses, and things that lurk in shadows",
    icon: "\uD83E\uDEA6",
  },
  {
    id: "scifi",
    name: "Sci-Fi Frontier",
    desc: "Derelict spaceships, alien worlds, and rogue AI",
    icon: "\uD83D\uDE80",
  },
  {
    id: "mystery",
    name: "Detective Noir",
    desc: "Rain-soaked streets, hidden clues, and dangerous suspects",
    icon: "\uD83D\uDD75\uFE0F",
  },
  {
    id: "pirate",
    name: "High Seas",
    desc: "Treasure maps, sea monsters, and island secrets",
    icon: "\uD83C\uDFF4\u200D\u2620\uFE0F",
  },
  {
    id: "mythic",
    name: "Mythic Quest",
    desc: "Gods, titans, and legendary artifacts",
    icon: "\u26A1",
  },
];

// =============================================================================
// Initial State
// =============================================================================

function createInitialState(theme: string): GameState {
  return {
    theme,
    health: 100,
    maxHealth: 100,
    gold: 10,
    inventory: [],
    location: "Unknown",
  };
}

// =============================================================================
// Main Component
// =============================================================================

export default function AdventurePage() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [spec, setSpec] = useState<Spec | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [turnCount, setTurnCount] = useState(0);
  const sceneRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // =========================================================================
  // Scene Generation
  // =========================================================================

  const generateScene = useCallback(
    async (
      state: GameState,
      choiceText?: string,
      currentHistory?: HistoryEntry[],
    ) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setIsStreaming(true);
      setError(null);
      setSpec(null);

      try {
        const res = await fetch("/api/adventure", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            gameState: state,
            choiceText,
            history: currentHistory ?? history,
          }),
          signal: controller.signal,
        });

        if (!res.ok) throw new Error(`API error: ${res.status}`);
        if (!res.body) throw new Error("No response body");

        const compiler = createSpecStreamCompiler<Spec>();
        const reader = res.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const { result, newPatches } = compiler.push(chunk);

          if (newPatches.length > 0) {
            setSpec(result);
          }
        }

        const finalSpec = compiler.getResult();
        if (finalSpec?.root && finalSpec.elements[finalSpec.root]) {
          const rootEl = finalSpec.elements[finalSpec.root];
          const location = (rootEl.props as Record<string, unknown>)
            .location as string;
          if (location) {
            setGameState((prev) => (prev ? { ...prev, location } : prev));
          }
        }

        setTurnCount((c) => c + 1);
      } catch (e) {
        if ((e as Error).name !== "AbortError") {
          setError((e as Error).message);
        }
      } finally {
        setIsStreaming(false);
      }
    },
    [history],
  );

  // =========================================================================
  // Start Game
  // =========================================================================

  const startGame = useCallback(
    (themeId: string) => {
      const themeName = themes.find((t) => t.id === themeId)?.name ?? themeId;
      const state = createInitialState(themeName);
      setGameState(state);
      setHistory([]);
      setTurnCount(0);
      generateScene(state, undefined, []);
    },
    [generateScene],
  );

  // =========================================================================
  // Handle Choice
  // =========================================================================

  const handleChoice = useCallback(
    (choiceId: string, choiceText: string) => {
      if (isStreaming || !gameState) return;

      // Add to history
      const entry: HistoryEntry = {
        location: gameState.location,
        summary: `Turn ${turnCount}`,
        choice: choiceText,
      };
      const newHistory = [...history, entry];
      setHistory(newHistory);

      // Generate next scene
      generateScene(gameState, choiceText, newHistory);

      // Scroll to top of scene
      sceneRef.current?.scrollIntoView({ behavior: "smooth" });
    },
    [isStreaming, gameState, history, turnCount, generateScene],
  );

  // =========================================================================
  // Reset Game
  // =========================================================================

  const resetGame = useCallback(() => {
    abortRef.current?.abort();
    setGameState(null);
    setHistory([]);
    setSpec(null);
    setIsStreaming(false);
    setError(null);
    setTurnCount(0);
  }, []);

  // =========================================================================
  // Keyboard shortcut: Escape to go back to menu
  // =========================================================================

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && gameState && !isStreaming) {
        resetGame();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [gameState, isStreaming, resetGame]);

  // =========================================================================
  // Theme Selection Screen
  // =========================================================================

  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 adventure-theme">
        <div className="w-full max-w-2xl">
          {/* Title */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">
              Choose Your Adventure
            </h1>
            <p className="text-muted-foreground text-sm">
              Select a theme to begin your journey. Every choice matters.
            </p>
            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground/50 font-mono">
              <span>powered by</span>
              <span className="text-primary/60">claude</span>
            </div>
          </div>

          {/* Theme Grid */}
          <div className="grid grid-cols-2 gap-3">
            {themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => startGame(theme.id)}
                className="text-left p-5 rounded-xl border border-border/50 bg-muted/20 hover:bg-muted/40 hover:border-primary/30 transition-all group"
              >
                <div className="text-2xl mb-2">{theme.icon}</div>
                <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {theme.name}
                </div>
                <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {theme.desc}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // Game Screen
  // =========================================================================

  return (
    <div className="min-h-screen flex flex-col adventure-theme">
      {/* Top bar */}
      <header className="sticky top-0 z-10 border-b border-border/40 bg-background/80 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={resetGame}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors font-mono"
            >
              &larr; Menu
            </button>
            <span className="text-border">|</span>
            <span className="text-xs font-mono text-muted-foreground">
              {gameState.theme}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-muted-foreground">
              Turn <span className="text-foreground">{turnCount}</span>
            </span>
            {isStreaming && (
              <span className="text-primary/60 animate-pulse">
                generating...
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Game area */}
      <main className="flex-1 game-frame">
        <div ref={sceneRef} className="max-w-3xl mx-auto px-4 py-6">
          {error && (
            <div className="mb-4 p-4 rounded-lg border border-red-500/30 bg-red-950/20 text-red-300 text-sm">
              <div className="font-semibold mb-1">Something went wrong</div>
              <div className="text-red-400/80">{error}</div>
              <button
                onClick={() => generateScene(gameState, undefined, history)}
                className="mt-2 text-xs underline text-red-300 hover:text-red-200"
              >
                Try again
              </button>
            </div>
          )}

          <SceneRenderer
            spec={spec!}
            onChoice={handleChoice}
            isStreaming={isStreaming}
          />
        </div>
      </main>

      {/* Footer hint */}
      <footer className="border-t border-border/20 py-2">
        <div className="max-w-3xl mx-auto px-4 flex items-center justify-between text-[10px] text-muted-foreground/40 font-mono">
          <span>ESC to return to menu</span>
          <span>adventure</span>
        </div>
      </footer>
    </div>
  );
}
