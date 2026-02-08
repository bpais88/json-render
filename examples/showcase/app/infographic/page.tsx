"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { createSpecStreamCompiler } from "@json-render/core";
import type { Spec } from "@json-render/react";
import { InfographicRenderer } from "@/lib/infographic/registry";

const EXAMPLES = [
  {
    label: "AI in 2025",
    prompt:
      "The state of artificial intelligence in 2025 — market size, adoption rates, and key milestones",
  },
  {
    label: "Climate Change",
    prompt:
      "Climate change by the numbers — temperature rise, carbon emissions, and renewable energy growth",
  },
  {
    label: "Remote Work",
    prompt:
      "The remote work revolution — productivity stats, employee preferences, and industry trends",
  },
  {
    label: "Space Race",
    prompt:
      "The new space race — SpaceX vs Blue Origin vs NASA, launch stats, and Mars timeline",
  },
];

export default function InfographicPage() {
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
        const response = await fetch("/api/infographic", {
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
      <header className="max-w-4xl mx-auto px-6 pt-12 pb-8 text-center">
        <h1 className="text-5xl font-black tracking-tight mb-3">Infographic</h1>
        <p className="text-gray-400 text-sm max-w-lg mx-auto">
          Data-driven visual stories, generated from a single prompt.
        </p>
      </header>

      <div className="max-w-3xl mx-auto px-6 mb-8">
        <form onSubmit={handleSubmit} className="mb-3">
          <div className="border border-[#2a2a2a] rounded-lg bg-[#111111] p-3 text-sm flex items-center gap-2">
            <span className="text-gray-500">&gt;</span>
            <input
              ref={inputRef}
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe a topic for your infographic..."
              className="flex-1 bg-transparent outline-none text-white placeholder:text-gray-600"
              disabled={isGenerating}
              maxLength={1000}
            />
            {isGenerating ? (
              <span className="text-xs text-blue-400 animate-pulse font-mono">
                generating...
              </span>
            ) : (
              <button
                type="submit"
                disabled={!prompt.trim()}
                className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-400 transition-colors disabled:opacity-30"
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
              className="text-xs px-3 py-1.5 rounded-full border border-[#2a2a2a] text-gray-400 hover:text-white hover:border-gray-500 hover:bg-[#1a1a1a] transition-colors disabled:opacity-30 font-medium"
            >
              {ex.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mt-3 p-3 bg-red-900/20 border border-red-800 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}
      </div>

      <main className="max-w-4xl mx-auto px-6 pb-16">
        {spec ? (
          <InfographicRenderer spec={spec} isStreaming={isGenerating} />
        ) : !isGenerating ? (
          <div className="text-center py-20 text-gray-600">
            <p className="text-sm font-mono">
              Your infographic will appear here
            </p>
          </div>
        ) : (
          <InfographicRenderer
            spec={{ root: "", elements: {} } as Spec}
            isStreaming
          />
        )}
      </main>
    </div>
  );
}
