"use client";

import {
  useState,
  useCallback,
  useRef,
  useEffect,
  type MouseEvent,
  type TouchEvent,
} from "react";
import { createSpecStreamCompiler } from "@json-render/core";
import type { Spec } from "@json-render/react";
import { SlidePresenter, getSlideKeys } from "@/lib/slides/registry";

// =============================================================================
// Code Highlighting (lazy Shiki)
// =============================================================================

import { createHighlighter, type Highlighter } from "shiki";

const darkTheme = {
  name: "slides-dark",
  type: "dark" as const,
  colors: {
    "editor.background": "transparent",
    "editor.foreground": "#EDEDED",
  },
  settings: [
    { scope: ["string", "string.quoted"], settings: { foreground: "#50E3C2" } },
    {
      scope: [
        "constant.numeric",
        "constant.language.boolean",
        "constant.language.null",
      ],
      settings: { foreground: "#50E3C2" },
    },
    {
      scope: ["punctuation", "meta.brace", "meta.bracket"],
      settings: { foreground: "#888" },
    },
    {
      scope: ["support.type.property-name", "entity.name.tag.json"],
      settings: { foreground: "#EDEDED" },
    },
  ],
};

let highlighterPromise: Promise<Highlighter> | null = null;
function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: [darkTheme],
      langs: ["json"],
    });
  }
  return highlighterPromise;
}
if (typeof window !== "undefined") getHighlighter();

function CodeBlock({ code }: { code: string }) {
  const [html, setHtml] = useState("");
  useEffect(() => {
    getHighlighter().then((h) => {
      setHtml(h.codeToHtml(code, { lang: "json", theme: "slides-dark" }));
    });
  }, [code]);

  if (!html) {
    return (
      <pre className="p-4 text-left">
        <code className="text-muted-foreground">{code}</code>
      </pre>
    );
  }
  return (
    <div
      className="p-4 text-[13px] leading-relaxed [&_pre]:bg-transparent! [&_pre]:p-0! [&_pre]:m-0! [&_code]:bg-transparent!"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

// =============================================================================
// Copy Button
// =============================================================================

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground"
      title="Copy JSON"
    >
      {copied ? (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
    </button>
  );
}

// =============================================================================
// Example Prompts
// =============================================================================

const EXAMPLE_PROMPTS = [
  "Why Rust is the future of systems programming",
  "Introduction to Machine Learning for beginners",
  "Startup pitch: AI-powered recipe app",
  "The history of the internet in 7 slides",
  "How to build a great engineering team",
  "Climate change: causes, effects, and solutions",
];

// =============================================================================
// Main Page
// =============================================================================

export default function SlidesPage() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [spec, setSpec] = useState<Spec | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showUI, setShowUI] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const touchStartX = useRef<number | null>(null);
  const fullscreenRef = useRef<HTMLDivElement>(null);
  const uiTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalSlides = spec ? getSlideKeys(spec).length : 0;

  // Enter/exit browser fullscreen API
  const enterFullscreen = useCallback(() => {
    setIsFullscreen(true);
    setShowUI(true);
    // Auto-hide UI after 3 seconds
    uiTimeoutRef.current = setTimeout(() => setShowUI(false), 3000);
    document.documentElement.requestFullscreen?.().catch(() => {
      // Fullscreen API not supported or denied — still show our fullscreen overlay
    });
  }, []);

  const exitFullscreen = useCallback(() => {
    setIsFullscreen(false);
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
    }
    if (uiTimeoutRef.current) clearTimeout(uiTimeoutRef.current);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        setCurrentSlide((prev) => Math.min(prev + 1, totalSlides - 1));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setCurrentSlide((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Escape") {
        exitFullscreen();
      } else if (e.key === "f" && !e.metaKey && !e.ctrlKey) {
        // Only toggle fullscreen if not typing in an input
        if (document.activeElement?.tagName !== "INPUT") {
          if (isFullscreen) exitFullscreen();
          else enterFullscreen();
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [totalSlides, isFullscreen, enterFullscreen, exitFullscreen]);

  // Sync when user exits fullscreen via browser UI (e.g. Escape on desktop)
  useEffect(() => {
    const handler = () => {
      if (!document.fullscreenElement) setIsFullscreen(false);
    };
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  // Auto-advance to latest slide during streaming
  useEffect(() => {
    if (isGenerating && totalSlides > 0) {
      setCurrentSlide(totalSlides - 1);
    }
  }, [isGenerating, totalSlides]);

  // Cleanup on unmount
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
      setCurrentSlide(0);

      try {
        const response = await fetch("/api/slides", {
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
        setCurrentSlide(0);
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

  const handleExport = useCallback(() => {
    if (!spec) return;
    const blob = new Blob([JSON.stringify(spec, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "slides.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [spec]);

  // Fullscreen touch handlers
  const handleFullscreenTap = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      // Ignore if the close button was clicked
      if ((e.target as HTMLElement).closest("[data-close-btn]")) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width;

      if (relX < 0.3) {
        setCurrentSlide((prev) => Math.max(prev - 1, 0));
      } else if (relX > 0.7) {
        setCurrentSlide((prev) => Math.min(prev + 1, totalSlides - 1));
      } else {
        // Center tap — toggle UI
        setShowUI((prev) => {
          const next = !prev;
          if (uiTimeoutRef.current) clearTimeout(uiTimeoutRef.current);
          if (next) {
            uiTimeoutRef.current = setTimeout(() => setShowUI(false), 3000);
          }
          return next;
        });
      }
    },
    [totalSlides],
  );

  const handleTouchStart = useCallback((e: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(
    (e: TouchEvent<HTMLDivElement>) => {
      if (touchStartX.current === null) return;
      const dx = e.changedTouches[0].clientX - touchStartX.current;
      touchStartX.current = null;

      if (Math.abs(dx) < 50) return; // threshold
      if (dx < 0) {
        // Swipe left → next
        setCurrentSlide((prev) => Math.min(prev + 1, totalSlides - 1));
      } else {
        // Swipe right → previous
        setCurrentSlide((prev) => Math.max(prev - 1, 0));
      }
    },
    [totalSlides],
  );

  // Fullscreen mode
  if (isFullscreen && spec) {
    return (
      <div
        ref={fullscreenRef}
        className="fullscreen-mode sm:cursor-none slides-theme"
        onClick={handleFullscreenTap}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <SlidePresenter spec={spec} currentSlide={currentSlide} />

        {/* Close button */}
        <button
          data-close-btn
          onClick={exitFullscreen}
          className={`fixed top-4 right-4 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-black/50 text-white/70 hover:text-white hover:bg-black/70 transition-all ${
            showUI ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          aria-label="Exit fullscreen"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Slide counter */}
        <div
          className={`fixed bottom-4 left-1/2 -translate-x-1/2 text-white/40 text-sm font-mono transition-opacity ${
            showUI ? "opacity-100" : "opacity-0"
          }`}
        >
          {currentSlide + 1} / {totalSlides}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen slides-theme">
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-12 text-center">
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-6">
          Slide Deck
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          Describe a presentation. AI generates slide JSON constrained to your
          catalog. The presenter renders it.
        </p>

        {/* Prompt */}
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="mb-4">
            <div className="border border-border rounded p-3 bg-background font-mono text-sm flex items-center gap-2">
              <span className="text-muted-foreground">&gt;</span>
              <input
                ref={inputRef}
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the presentation you want to create..."
                className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground/50"
                disabled={isGenerating}
                maxLength={1000}
              />
              {isGenerating ? (
                <button
                  type="button"
                  onClick={() => setIsGenerating(false)}
                  className="w-11 h-11 sm:w-8 sm:h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <rect x="6" y="6" width="12" height="12" />
                  </svg>
                </button>
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
                    strokeWidth="2"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
          </form>

          {/* Example prompts */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {EXAMPLE_PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => generate(p)}
                className="text-sm sm:text-xs px-4 py-2.5 sm:px-3 sm:py-1.5 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-foreground/50 transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="max-w-3xl mx-auto mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded text-red-500 text-sm">
            {error}
          </div>
        )}

        {/* Main content: Slide Preview + JSON */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-4">
          {/* Slide Preview */}
          <div>
            <div className="flex items-center justify-between mb-2 h-6">
              <span className="text-xs font-mono text-muted-foreground">
                preview
              </span>
              <div className="flex items-center gap-2">
                {totalSlides > 0 && (
                  <>
                    <span className="text-xs font-mono text-muted-foreground">
                      {currentSlide + 1} / {totalSlides}
                    </span>
                    <button
                      onClick={enterFullscreen}
                      className="text-sm sm:text-xs px-3 py-2 sm:px-2 sm:py-1 rounded border border-border text-muted-foreground hover:text-foreground hover:border-foreground/50 transition-colors"
                      title="Present (F)"
                    >
                      Present
                    </button>
                    <button
                      onClick={handleExport}
                      className="text-sm sm:text-xs px-3 py-2 sm:px-2 sm:py-1 rounded border border-border text-muted-foreground hover:text-foreground hover:border-foreground/50 transition-colors"
                      title="Export JSON"
                    >
                      Export
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Slide viewport */}
            <div className="border border-border rounded bg-black overflow-hidden aspect-video relative">
              {spec ? (
                <SlidePresenter
                  spec={spec}
                  currentSlide={currentSlide}
                  isStreaming={isGenerating}
                />
              ) : isGenerating ? (
                <div className="h-full flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce [animation-delay:0.1s]" />
                      <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce [animation-delay:0.2s]" />
                    </div>
                    <span className="text-white/30 text-sm">
                      Generating slides...
                    </span>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-white/30 text-sm">
                  Enter a prompt to create a presentation
                </div>
              )}
            </div>

            {/* Navigation */}
            {totalSlides > 1 && (
              <div className="flex items-center justify-center gap-3 mt-3">
                <button
                  onClick={() =>
                    setCurrentSlide((prev) => Math.max(prev - 1, 0))
                  }
                  disabled={currentSlide === 0}
                  className="p-3 sm:p-2 rounded border border-border text-muted-foreground hover:text-foreground hover:border-foreground/50 transition-colors disabled:opacity-30"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                </button>

                {/* Slide dots */}
                <div className="flex gap-1.5">
                  {Array.from({ length: totalSlides }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentSlide(i)}
                      className={`w-3 h-3 sm:w-2 sm:h-2 rounded-full transition-all ${
                        i === currentSlide
                          ? "bg-white w-5 sm:w-4"
                          : i <= (isGenerating ? totalSlides : currentSlide)
                            ? "bg-white/40 hover:bg-white/60"
                            : "bg-white/20"
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={() =>
                    setCurrentSlide((prev) =>
                      Math.min(prev + 1, totalSlides - 1),
                    )
                  }
                  disabled={currentSlide === totalSlides - 1}
                  className="p-3 sm:p-2 rounded border border-border text-muted-foreground hover:text-foreground hover:border-foreground/50 transition-colors disabled:opacity-30"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}

            {/* Keyboard hints (desktop only) */}
            {totalSlides > 0 && (
              <div className="hidden sm:flex justify-center gap-4 mt-2">
                <span className="text-xs text-muted-foreground/50">
                  <kbd className="px-1.5 py-0.5 rounded border border-border text-[10px]">
                    &larr;
                  </kbd>{" "}
                  <kbd className="px-1.5 py-0.5 rounded border border-border text-[10px]">
                    &rarr;
                  </kbd>{" "}
                  navigate
                </span>
                <span className="text-xs text-muted-foreground/50">
                  <kbd className="px-1.5 py-0.5 rounded border border-border text-[10px]">
                    F
                  </kbd>{" "}
                  fullscreen
                </span>
                <span className="text-xs text-muted-foreground/50">
                  <kbd className="px-1.5 py-0.5 rounded border border-border text-[10px]">
                    Esc
                  </kbd>{" "}
                  exit
                </span>
              </div>
            )}
          </div>

          {/* JSON Panel */}
          <div className="text-left">
            <div className="flex items-center gap-4 mb-2 h-6">
              <span className="text-xs font-mono text-muted-foreground">
                json
              </span>
              {isGenerating && (
                <span className="text-xs text-muted-foreground animate-pulse">
                  streaming...
                </span>
              )}
            </div>
            <div className="border border-border rounded bg-background font-mono text-xs overflow-auto relative group aspect-video lg:aspect-auto lg:h-[calc(100%-24px-8px)]">
              {spec && (
                <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <CopyButton text={JSON.stringify(spec, null, 2)} />
                </div>
              )}
              {spec ? (
                <CodeBlock code={JSON.stringify(spec, null, 2)} />
              ) : isGenerating ? (
                <div className="p-4 text-muted-foreground/50 h-full flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:0.1s]" />
                      <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:0.2s]" />
                    </div>
                    <span>Generating spec...</span>
                  </div>
                </div>
              ) : (
                <div className="p-4 text-muted-foreground/50 h-full flex items-center justify-center">
                  Slide spec will appear here
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
