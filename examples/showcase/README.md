# json-render Showcase

10 AI content generation demos built with the json-render pattern. Each demo takes a text prompt, generates structured JSON via AI, and renders it into visual content in real-time.

**Live demo**: https://jr-showcase.vercel.app

## Demos

| Demo | Description | Route |
|------|-------------|-------|
| Slides | Presentation decks with themes and layouts | `/slides` |
| Infographics | Data visualization with themed sections | `/infographic` |
| Diagrams | Flowcharts and process maps (ReactFlow + Dagre) | `/diagrams` |
| Videos | Timeline-based video with Remotion | `/remotion` |
| Comics | Panel-based visual storytelling | `/comic` |
| Wireframes | Lo-fi UI mockups | `/wireframes` |
| Pixel Art | Retro-style pixel compositions | `/pixel` |
| Generative Art | SVG-based artistic compositions | `/generative-art` |
| Mermaid | Mermaid diagram generation | `/mermaid` |
| Adventure | Interactive text adventure game | `/adventure` |

## How It Works

```
User prompt → AI generates JSON spec → Streaming parser → React renderer
```

1. User types a prompt describing what they want
2. AI (Claude via Vercel AI Gateway) generates a JSON spec constrained to a component catalog
3. `createSpecStreamCompiler` parses the streaming JSON incrementally
4. Format-specific React renderers display the content in real-time

The key pattern is **constrained generation**: each format defines a catalog of allowed components (as Zod schemas), and the AI can only output JSON that matches those schemas. This ensures reliable, predictable rendering.

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm
- A [Vercel AI Gateway](https://sdk.vercel.ai/docs/ai-sdk-core/settings#provider-registry) API key

### Setup

```bash
# From the repo root
pnpm install

# Set up environment
cd examples/showcase
cp .env.example .env
# Edit .env and add your AI_GATEWAY_API_KEY

# Run dev server
pnpm dev
# Visit http://localhost:3005
```

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `AI_GATEWAY_API_KEY` | Yes | — | Vercel AI Gateway API key |
| `AI_GATEWAY_MODEL` | No | `anthropic/claude-haiku-4.5` | AI model to use |

## Project Structure

```
app/
  page.tsx                    # Landing page
  comic/page.tsx              # Comic demo
  slides/page.tsx             # Slides demo
  diagrams/page.tsx           # Diagrams demo
  infographic/page.tsx        # Infographic demo
  remotion/page.tsx           # Video demo
  wireframes/page.tsx         # Wireframes demo
  pixel/page.tsx              # Pixel art demo
  generative-art/page.tsx     # Generative art demo
  mermaid/page.tsx            # Mermaid demo
  adventure/page.tsx          # Adventure game demo
  api/
    comic/route.ts            # Comic generation API
    slides/route.ts           # Slides generation API
    ... (one per format)

lib/
  comic/
    catalog.ts                # Component catalog (Zod schemas)
    registry.tsx              # React component registry
  slides/
    catalog.ts
    registry.tsx
  ... (one per format)
```

### Adding a New Format

1. Create `lib/myformat/catalog.ts` — define components with `defineCatalog()`
2. Create `lib/myformat/registry.tsx` — implement React components
3. Create `app/api/myformat/route.ts` — API route using `streamText()` + `catalog.prompt()`
4. Create `app/myformat/page.tsx` — page with prompt input + streaming renderer

## Product Roadmap

This showcase is evolving into the **AI Content Studio** — a productized version with auth, persistence, inline editing, and export capabilities.

See the spec documents in the repo root:
- `CONTENT_STUDIO_SPEC.md` — Product vision and strategy
- `STUDIO_MODE.spec.md` — Detailed MVP spec

## License

Apache 2.0 — see root LICENSE file.
