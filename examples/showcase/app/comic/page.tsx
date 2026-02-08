"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { createSpecStreamCompiler } from "@json-render/core";
import type { Spec } from "@json-render/react";
import { ComicRenderer } from "@/lib/comic/registry";

const EXAMPLES = [
  {
    label: "Space Cat",
    prompt:
      "A cat astronaut discovers an alien artifact on Mars and must decide whether to bring it back to Earth",
  },
  {
    label: "Coffee Quest",
    prompt:
      "A programmer's epic quest to get coffee — the coffee machine is broken, chaos ensues",
  },
  {
    label: "Time Loop",
    prompt:
      "A person realizes they're stuck in a 5-minute time loop at a bus stop",
  },
  {
    label: "Robot Chef",
    prompt:
      "A robot tries to cook dinner for humans for the first time, hilariously misunderstanding recipes",
  },
  {
    label: "Last Dragon",
    prompt:
      "The last dragon in the world tries to hide among humans in a big city",
  },
  {
    label: "Debugging",
    prompt:
      "Two developers trying to fix a production bug at 3am — dramatic noir style",
  },
];

export default function ComicPage() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [spec, setSpec] = useState<Spec | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const generate = useCallback(
    async (text?: string) => {
      const p = text || prompt;
      if (!p.trim() || isGenerating) return;
      if (text) setPrompt(text);

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setIsGenerating(true);
      setError(null);
      setSpec(null);

      try {
        const response = await fetch("/api/comic", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: p }),
          signal: controller.signal,
        });

        if (!response.ok) throw new Error("Generation failed");

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        const compiler = createSpecStreamCompiler<Spec>();

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
        setSpec(finalSpec);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setError(err instanceof Error ? err.message : "Generation failed");
        }
      } finally {
        setIsGenerating(false);
      }
    },
    [prompt, isGenerating],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generate();
  };

  return (
    <div className="min-h-screen comic-theme">
      <header className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 pb-8 text-center">
        <h1
          className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight mb-3"
          style={{ textShadow: "3px 3px 0 oklch(0.2 0.01 260 / 0.1)" }}
        >
          Comic Strip
        </h1>
        <p className="text-muted-foreground text-sm max-w-lg mx-auto">
          Describe a story. AI generates panel layouts with dialogue, narration,
          and sound effects.
        </p>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 mb-8">
        <form onSubmit={handleSubmit} className="mb-3">
          <div className="border-3 border-foreground rounded bg-white p-3 font-mono text-sm flex items-center gap-2 shadow-[3px_3px_0_oklch(0.2_0.01_260/0.15)]">
            <span className="text-muted-foreground">&gt;</span>
            <input
              ref={inputRef}
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe a story for your comic strip..."
              className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground/40"
              disabled={isGenerating}
              maxLength={1000}
            />
            {isGenerating ? (
              <span className="text-xs text-primary animate-pulse font-mono">
                drawing...
              </span>
            ) : (
              <button
                type="submit"
                disabled={!prompt.trim()}
                className="w-11 h-11 sm:w-8 sm:h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-30"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        </form>

        <div className="flex flex-wrap gap-2 justify-center">
          {EXAMPLES.map((ex) => (
            <button
              key={ex.label}
              onClick={() => generate(ex.prompt)}
              disabled={isGenerating}
              className="text-sm sm:text-xs px-4 py-2.5 sm:px-3 sm:py-1.5 rounded-full border-2 border-foreground/20 text-muted-foreground hover:text-foreground hover:border-foreground/50 hover:bg-white transition-colors disabled:opacity-30 font-medium"
            >
              {ex.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mt-3 p-3 bg-red-50 border-2 border-red-300 rounded text-red-600 text-sm">
            {error}
          </div>
        )}
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pb-16">
        {spec ? (
          <ComicRenderer spec={spec} isStreaming={isGenerating} />
        ) : !isGenerating ? (
          <div className="text-center py-20 text-muted-foreground/40">
            <p className="text-sm font-mono">Your comic will appear here</p>
          </div>
        ) : (
          <ComicRenderer
            spec={{ root: "", elements: {} } as Spec}
            isStreaming
          />
        )}
      </main>
    </div>
  );
}
