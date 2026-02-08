# Showcase / Content Studio

## Project Overview

This is the json-render showcase app — 10 AI content generation demos that will evolve into the Content Studio product.

**Live**: https://jr-showcase.vercel.app
**Repo**: https://github.com/bpais88/json-render

## Product Plan

Two spec documents define the product direction:

1. **`CONTENT_STUDIO_SPEC.md`** (repo root) — High-level product vision, pricing, competitive landscape, go-to-market
2. **`STUDIO_MODE.spec.md`** (repo root) — Detailed MVP spec for Studio Mode: the self-serve content studio with auth, persistence, inline editing, and PPTX export

### Two product modes (planned):
- **Studio Mode** (MVP — build first): User picks format, prompts, edits, exports. Self-serve.
- **Agent Mode** (Phase 2 — separate spec TBD): AI agent guides users, creates content plans, orchestrates multi-format generation.

## Current State: Showcase (10 demos)

Each demo is a standalone page with prompt input → streaming AI generation → live preview.

### Demo Pages
| Route | Format | Catalog | Registry |
|-------|--------|---------|----------|
| `/comic` | Comic strips | `lib/comic/catalog.ts` | `lib/comic/registry.tsx` |
| `/slides` | Presentations | `lib/slides/catalog.ts` | `lib/slides/registry.tsx` |
| `/diagrams` | Flowcharts | `lib/diagrams/catalog.ts` | `lib/diagrams/registry.tsx` |
| `/infographic` | Infographics | `lib/infographic/catalog.ts` | `lib/infographic/registry.tsx` |
| `/remotion` | Videos | Uses `@json-render/remotion` | Built-in |
| `/wireframes` | UI Wireframes | `lib/wireframes/catalog.ts` | `lib/wireframes/registry.tsx` |
| `/pixel` | Pixel Art | `lib/pixel/catalog.ts` | `lib/pixel/registry.tsx` |
| `/generative-art` | SVG Art | `lib/generative-art/catalog.ts` | `lib/generative-art/registry.tsx` |
| `/mermaid` | Mermaid diagrams | `lib/mermaid/catalog.ts` | `lib/mermaid/registry.tsx` |
| `/adventure` | Text adventure | `lib/adventure/catalog.ts` | `lib/adventure/registry.tsx` |

### API Routes
Each demo has a matching API route at `app/api/[format]/route.ts`. All use:
- `gateway()` from `@ai-sdk/gateway` for model provider
- `streamText()` from `ai` for streaming generation
- `catalog.prompt()` for system prompt with JSON schema constraints

## Next Steps: Studio Mode (MVP)

See `STUDIO_MODE.spec.md` for full details. Summary:

1. Add Neon Auth (Google + GitHub OAuth) to this app
2. Create `/studio` route group behind auth
3. Create unified `/api/v1/generate` endpoint
4. Add Neon Postgres for saving generations
5. Build inline text editing on canvas
6. Build PPTX export for slides
7. Add usage tracking + Stripe billing
8. Demo pages become the marketing funnel with "Save to Studio" CTAs

## Key Patterns

- **Catalog → Prompt → Stream → Render**: `defineCatalog()` defines components as Zod schemas → `catalog.prompt()` builds system prompt → `streamText()` streams JSON → `createSpecStreamCompiler` parses incrementally → registry renders React components
- **Spec format**: `{ root: string, elements: Record<string, { key, type, props, children }> }`
- **All API routes** use try-catch, input sanitization, `AbortController` signal support
- **Gateway model**: Configured via `AI_GATEWAY_MODEL` env var, defaults to `anthropic/claude-haiku-4.5`

## Environment Variables

See `.env.example` for required variables:
- `AI_GATEWAY_API_KEY` — Vercel AI Gateway key (required)
- `AI_GATEWAY_MODEL` — Model to use (default: `anthropic/claude-haiku-4.5`)

## Deployment

- Deployed on Vercel
- Project ID: `prj_kBL1OVkROrmNkYdyaObtovSaD42D`
- Team ID: `team_TD3GAj6gebOxQ75KBDR0xldB`

### Deploy command:
```bash
cd examples/showcase
npx vercel --yes --token $VERCEL_TOKEN
npx vercel --prod --yes --token $VERCEL_TOKEN
```

## Dev Setup

```bash
cd examples/showcase
cp .env.example .env
# Fill in AI_GATEWAY_API_KEY
pnpm install
pnpm dev
# Visit http://localhost:3000
```
