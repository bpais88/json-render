"use client";

import { useState, useCallback, useRef } from "react";
import { createSpecStreamCompiler } from "@json-render/core";
import type { Spec } from "@json-render/react";
import { WireframeRenderer } from "@/lib/wireframes/registry";

const EXAMPLES = [
  {
    label: "Login Flow",
    prompt:
      "Login page with email/password, social login buttons, and a registration link. Then a dashboard screen after login with sidebar navigation, stats cards, and a recent activity table.",
  },
  {
    label: "E-commerce",
    prompt:
      "Product listing page with search bar, filters sidebar, product grid with images/prices. Then a product detail page with image, description, reviews, and add-to-cart.",
  },
  {
    label: "Settings",
    prompt:
      "Settings page with sidebar navigation (Profile, Notifications, Security, Billing). Profile tab active showing avatar, name, email fields, and save button.",
  },
  {
    label: "Blog CMS",
    prompt:
      "Blog admin: article list with status badges (draft/published), search, and new article button. Then article editor with title, rich text area, category select, tags, and publish button.",
  },
  {
    label: "Chat App",
    prompt:
      "Chat application with contacts sidebar, message area with speech bubbles, and a message input at the bottom. Include online status indicators.",
  },
  {
    label: "Pricing",
    prompt:
      "SaaS pricing page with 3-tier pricing cards (Free, Pro, Enterprise) showing features list, prices, and CTA buttons. Include a toggle for monthly/annual billing.",
  },
];

export default function WireframePage() {
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
        const response = await fetch("/api/wireframes", {
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
    <div className="min-h-screen wireframe-theme">
      <header className="max-w-4xl mx-auto px-6 pt-12 pb-8 text-center">
        <h1 className="text-4xl font-black tracking-tight mb-3 font-mono">
          Wireframes
        </h1>
        <p className="text-gray-500 text-sm max-w-lg mx-auto font-mono">
          Describe a UI. AI generates low-fidelity wireframe mockups.
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
          <div className="border-2 border-dashed border-gray-400 rounded bg-white p-3 font-mono text-sm flex items-center gap-2 shadow-[3px_3px_0_#e5e7eb]">
            <span className="text-gray-400">&gt;</span>
            <input
              ref={inputRef}
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the UI you want to wireframe..."
              className="flex-1 bg-transparent outline-none placeholder:text-gray-300 font-mono"
              disabled={isGenerating}
              maxLength={1000}
            />
            {isGenerating ? (
              <span className="text-xs text-gray-500 animate-pulse font-mono">
                sketching...
              </span>
            ) : (
              <button
                type="submit"
                disabled={!prompt.trim()}
                className="w-7 h-7 rounded border-2 border-dashed border-gray-400 bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-30 font-mono"
              >
                &rarr;
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
              className="text-xs px-3 py-1.5 rounded border border-dashed border-gray-300 text-gray-500 hover:text-gray-700 hover:border-gray-500 hover:bg-white transition-colors disabled:opacity-30 font-mono"
            >
              {ex.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mt-3 p-3 bg-red-50 border-2 border-dashed border-red-300 rounded text-red-600 text-sm font-mono">
            {error}
          </div>
        )}
      </div>

      <main className="max-w-5xl mx-auto px-6 pb-16">
        {spec ? (
          <WireframeRenderer spec={spec} isStreaming={isGenerating} />
        ) : !isGenerating ? (
          <div className="text-center py-20 text-gray-300">
            <p className="text-sm font-mono">
              Your wireframes will appear here
            </p>
          </div>
        ) : (
          <WireframeRenderer
            spec={{ root: "", elements: {} } as Spec}
            isStreaming
          />
        )}
      </main>
    </div>
  );
}
