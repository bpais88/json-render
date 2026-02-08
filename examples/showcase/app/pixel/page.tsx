"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { createSpecStreamCompiler } from "@json-render/core";
import type { Spec } from "@json-render/react";
import { PixelRenderer } from "@/lib/pixel/registry";

const EXAMPLES = [
  {
    label: "Mushroom",
    prompt: "A classic red mushroom power-up",
  },
  {
    label: "Space Ship",
    prompt: "A retro spaceship with engine flames",
  },
  {
    label: "Castle",
    prompt: "A medieval castle with towers and flags",
  },
  {
    label: "Cat",
    prompt: "A sitting cat with a curled tail",
  },
  {
    label: "Treasure",
    prompt: "An open treasure chest overflowing with gold",
  },
  {
    label: "Robot",
    prompt: "A friendly robot with antenna and glowing eyes",
  },
];

export default function PixelPage() {
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
        const response = await fetch("/api/pixel", {
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
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 pb-8 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight mb-3">
          Pixel Art
        </h1>
        <p className="text-neutral-400 text-sm max-w-lg mx-auto">
          Describe anything. AI creates pixel art from a constrained palette.
        </p>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 mb-8">
        <form onSubmit={handleSubmit} className="mb-3">
          <div className="border border-border rounded bg-transparent p-3 font-mono text-sm flex items-center gap-2">
            <span className="text-neutral-500">&gt;</span>
            <input
              ref={inputRef}
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe pixel art to generate..."
              className="flex-1 bg-transparent outline-none text-white placeholder:text-neutral-600"
              disabled={isGenerating}
              maxLength={1000}
            />
            {isGenerating ? (
              <span className="text-xs text-emerald-400 animate-pulse font-mono">
                drawing...
              </span>
            ) : (
              <button
                type="submit"
                disabled={!prompt.trim()}
                className="w-11 h-11 sm:w-8 sm:h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-400 transition-colors disabled:opacity-30"
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
              className="text-sm sm:text-xs px-4 py-2.5 sm:px-3 sm:py-1.5 rounded-full border border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500 hover:bg-neutral-800 transition-colors disabled:opacity-30 font-medium"
            >
              {ex.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mt-3 p-3 bg-red-950/50 border border-red-800 rounded text-red-400 text-sm">
            {error}
          </div>
        )}
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pb-16">
        {spec ? (
          <PixelRenderer spec={spec} isStreaming={isGenerating} />
        ) : !isGenerating ? (
          <div className="text-center py-20 text-neutral-600">
            <p className="text-sm font-mono">Your pixel art will appear here</p>
          </div>
        ) : (
          <PixelRenderer
            spec={{ root: "", elements: {} } as Spec}
            isStreaming
          />
        )}
      </main>
    </div>
  );
}
