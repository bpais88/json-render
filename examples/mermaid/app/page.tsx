"use client";

import { useState, useCallback, useRef } from "react";
import { createSpecStreamCompiler } from "@json-render/core";
import type { Spec } from "@json-render/react";
import { MermaidRenderer } from "@/lib/registry";

const EXAMPLES = [
  {
    label: "Auth Flow",
    prompt:
      "OAuth 2.0 authentication flow with authorization code grant: client, auth server, resource server interactions",
  },
  {
    label: "Microservices",
    prompt:
      "E-commerce microservices architecture: API gateway, user service, product service, order service, payment service, notification service with message queue",
  },
  {
    label: "Git Strategy",
    prompt:
      "Git branching strategy with main, develop, feature branches, release branches, and hotfix branches showing merge flow",
  },
  {
    label: "DB Schema",
    prompt:
      "Database schema for a social media app: users, posts, comments, likes, follows, with relationships",
  },
  {
    label: "State Machine",
    prompt:
      "Order lifecycle state machine: created, confirmed, processing, shipped, delivered, cancelled, returned with transitions",
  },
  {
    label: "Sprint Plan",
    prompt:
      "2-week sprint timeline with planning, development phases, code review, QA testing, and release milestones",
  },
];

export default function MermaidPage() {
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
        const response = await fetch("/api/generate", {
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
    <div className="min-h-screen">
      {/* Header */}
      <header className="max-w-4xl mx-auto px-6 pt-12 pb-8 text-center">
        <div className="text-xs font-mono text-muted-foreground mb-3">
          @json-render/mermaid
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-3">
          AI &rarr; json-render &rarr; Mermaid
        </h1>
        <p className="text-muted-foreground text-sm max-w-lg mx-auto">
          Describe a system or concept. AI generates Mermaid diagrams —
          flowcharts, sequences, ERDs, state machines, and more.
        </p>
      </header>

      {/* Prompt */}
      <div className="max-w-3xl mx-auto px-6 mb-8">
        <form onSubmit={handleSubmit} className="mb-3">
          <div className="border border-border rounded-lg bg-muted p-3 font-mono text-sm flex items-center gap-2">
            <span className="text-muted-foreground">&gt;</span>
            <input
              ref={inputRef}
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe a system, flow, or concept to diagram..."
              className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground/40"
              disabled={isGenerating}
              maxLength={1000}
            />
            {isGenerating ? (
              <span className="text-xs text-primary animate-pulse font-mono">
                rendering...
              </span>
            ) : (
              <button
                type="submit"
                disabled={!prompt.trim()}
                className="w-7 h-7 rounded bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/80 transition-colors disabled:opacity-30"
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
              className="text-xs px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-accent hover:bg-muted transition-colors disabled:opacity-30 font-medium"
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

      {/* Mermaid output */}
      <main className="max-w-4xl mx-auto px-6 pb-16">
        {spec ? (
          <MermaidRenderer spec={spec} isStreaming={isGenerating} />
        ) : !isGenerating ? (
          <div className="text-center py-20 text-muted-foreground/30">
            <div className="text-6xl mb-4 font-mono">&lt;/&gt;</div>
            <p className="text-sm font-mono">Your diagrams will appear here</p>
          </div>
        ) : (
          <MermaidRenderer
            spec={{ root: "", elements: {} } as Spec}
            isStreaming
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t py-3 text-center">
        <span className="text-[10px] text-muted-foreground/40 font-mono">
          json-render / mermaid
        </span>
      </footer>
    </div>
  );
}
