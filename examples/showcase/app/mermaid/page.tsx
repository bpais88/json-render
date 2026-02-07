"use client";

import { useState, useCallback, useRef } from "react";
import { createSpecStreamCompiler } from "@json-render/core";
import type { Spec } from "@json-render/react";
import { MermaidRenderer } from "@/lib/mermaid/registry";

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
        const response = await fetch("/api/mermaid", {
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
          if (newPatches.length > 0) setSpec(result);
        }

        setSpec(compiler.getResult());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Generation failed");
      } finally {
        setIsGenerating(false);
      }
    },
    [prompt, isGenerating],
  );

  return (
    <div className="min-h-screen mermaid-theme">
      <header className="max-w-4xl mx-auto px-6 pt-12 pb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-3">
          Mermaid Diagrams
        </h1>
        <p className="text-slate-400 text-sm max-w-lg mx-auto">
          Describe a system or concept. AI generates Mermaid diagrams.
        </p>
      </header>

      <div className="max-w-3xl mx-auto px-6 mb-8">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            generate();
          }}
          className="mb-3"
        >
          <div className="border border-slate-700 rounded-lg bg-slate-800/50 p-3 font-mono text-sm flex items-center gap-2">
            <span className="text-slate-500">&gt;</span>
            <input
              ref={inputRef}
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe a system, flow, or concept to diagram..."
              className="flex-1 bg-transparent outline-none placeholder:text-slate-600 text-slate-200"
              disabled={isGenerating}
              maxLength={1000}
            />
            {isGenerating ? (
              <span className="text-xs text-blue-400 animate-pulse font-mono">
                rendering...
              </span>
            ) : (
              <button
                type="submit"
                disabled={!prompt.trim()}
                className="w-7 h-7 rounded bg-blue-600 text-white flex items-center justify-center hover:bg-blue-500 transition-colors disabled:opacity-30"
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
              className="text-xs px-3 py-1.5 rounded-full border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-500 transition-colors disabled:opacity-30 font-medium"
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
          <MermaidRenderer spec={spec} isStreaming={isGenerating} />
        ) : !isGenerating ? (
          <div className="text-center py-20 text-slate-600">
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
    </div>
  );
}
