"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { createSpecStreamCompiler } from "@json-render/core";
import type { Spec } from "@json-render/react";
import { DiagramRenderer } from "@/lib/diagrams/registry";

// =============================================================================
// Example Prompts
// =============================================================================

const EXAMPLES = [
  {
    label: "CI/CD Pipeline",
    prompt:
      "CI/CD pipeline: code push, lint, test, build, deploy to staging, approval gate, deploy to production",
  },
  {
    label: "User Authentication",
    prompt:
      "User authentication flow with login, signup, password reset, email verification, and OAuth",
  },
  {
    label: "E-commerce Checkout",
    prompt:
      "E-commerce checkout: cart review, address, payment, validation, order processing, confirmation, error handling",
  },
  {
    label: "Bug Triage",
    prompt:
      "Bug triage process: report submitted, severity assessment, assign team, reproduce, fix, code review, QA, deploy",
  },
  {
    label: "ML Training Pipeline",
    prompt:
      "Machine learning pipeline: data collection, cleaning, feature engineering, model training, evaluation, A/B test, deploy",
  },
  {
    label: "Incident Response",
    prompt:
      "Incident response: alert triggered, acknowledge, assess severity, investigate, mitigate, resolve, post-mortem",
  },
];

// =============================================================================
// Main Page
// =============================================================================

export default function DiagramsPage() {
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
        const response = await fetch("/api/diagrams", {
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
    <div className="h-screen flex flex-col diagrams-theme">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs font-mono text-muted-foreground mb-1">
                @json-render/diagrams
              </div>
              <h1 className="text-2xl font-bold tracking-tight">
                AI &rarr; json-render &rarr; Flowchart
              </h1>
            </div>
            <p className="text-sm text-muted-foreground max-w-sm text-right hidden sm:block">
              Describe a process. AI generates a graph spec. Dagre layouts it.
              ReactFlow renders it.
            </p>
          </div>

          {/* Prompt input */}
          <form onSubmit={handleSubmit} className="mb-3">
            <div className="border border-border rounded-lg p-3 bg-background font-mono text-sm flex items-center gap-2">
              <span className="text-muted-foreground">&gt;</span>
              <input
                ref={inputRef}
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe a process, workflow, or system..."
                className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground/50"
                disabled={isGenerating}
                maxLength={1000}
              />
              {isGenerating ? (
                <span className="text-xs text-primary/60 animate-pulse font-mono">
                  generating...
                </span>
              ) : (
                <button
                  type="submit"
                  disabled={!prompt.trim()}
                  className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-30"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
          </form>

          {/* Example prompts */}
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex.label}
                onClick={() => generate(ex.prompt)}
                disabled={isGenerating}
                className="text-xs px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-foreground/50 transition-colors disabled:opacity-30"
              >
                {ex.label}
              </button>
            ))}
          </div>

          {error && (
            <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>
      </header>

      {/* Diagram area -- fills remaining space */}
      <main className="flex-1 min-h-0">
        {spec ? (
          <DiagramRenderer spec={spec} isStreaming={isGenerating} />
        ) : (
          <DiagramRenderer
            spec={{ root: "", elements: {} } as Spec}
            isStreaming={isGenerating}
          />
        )}
      </main>
    </div>
  );
}
