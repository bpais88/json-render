"use client";

import { useState, useCallback, useRef } from "react";
import { createSpecStreamCompiler } from "@json-render/core";
import type { Spec } from "@json-render/react";
import { GenerativeArtRenderer } from "@/lib/generative-art/registry";

const EXAMPLES = [
  {
    label: "Ocean Waves",
    prompt: "Abstract ocean waves with flowing curves and deep blue gradients",
  },
  {
    label: "Constellation",
    prompt: "A star constellation map with connected dots and cosmic dust",
  },
  {
    label: "Bauhaus",
    prompt:
      "Bauhaus-inspired geometric composition with primary colors and clean shapes",
  },
  {
    label: "Neural Network",
    prompt:
      "Abstract visualization of a neural network with nodes and connections",
  },
  {
    label: "Japanese Garden",
    prompt:
      "Minimalist zen garden with stones, ripples, and bamboo silhouettes",
  },
  {
    label: "Neon City",
    prompt: "Neon-lit cityscape skyline with glowing reflections",
  },
];

export default function GenerativeArtPage() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [spec, setSpec] = useState<Spec | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const generate = useCallback(
    async (text?: string) => {
      const p = text || prompt;
      if (!p.trim() || isGenerating) return;
      if (text) setPrompt(text);

      setIsGenerating(true);
      setError(null);
      setSpec(null);

      try {
        const response = await fetch("/api/generative-art", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: p }),
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
        setError(err instanceof Error ? err.message : "Generation failed");
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
        <h1 className="text-5xl font-black tracking-tight mb-3">
          Generative Art
        </h1>
        <p className="text-white/40 text-sm max-w-lg mx-auto">
          AI creates SVG compositions from your imagination.
        </p>
      </header>

      <div className="max-w-3xl mx-auto px-6 mb-8">
        <form onSubmit={handleSubmit} className="mb-3">
          <div className="border border-white/10 rounded-lg bg-white/5 p-3 text-sm flex items-center gap-2">
            <span className="text-white/30">&gt;</span>
            <input
              ref={inputRef}
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe artwork you want to create..."
              className="flex-1 bg-transparent outline-none text-white placeholder:text-white/20"
              disabled={isGenerating}
              maxLength={1000}
            />
            {isGenerating ? (
              <span className="text-xs text-white/40 animate-pulse font-mono">
                composing...
              </span>
            ) : (
              <button
                type="submit"
                disabled={!prompt.trim()}
                className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center hover:bg-white/90 transition-colors disabled:opacity-30"
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
              className="text-xs px-3 py-1.5 rounded-full border border-white/10 text-white/40 hover:text-white hover:border-white/30 hover:bg-white/5 transition-colors disabled:opacity-30 font-medium"
            >
              {ex.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}
      </div>

      <main className="max-w-4xl mx-auto px-6 pb-16">
        {spec ? (
          <GenerativeArtRenderer spec={spec} isStreaming={isGenerating} />
        ) : !isGenerating ? (
          <div className="text-center py-20 text-white/20">
            <p className="text-sm font-mono">Your artwork will appear here</p>
          </div>
        ) : (
          <GenerativeArtRenderer
            spec={{ root: "", elements: {} } as Spec}
            isStreaming
          />
        )}
      </main>
    </div>
  );
}
