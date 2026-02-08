# Studio Mode — Product Spec (MVP)

> The self-serve content generation studio. Users pick a format, write a prompt, and get production-ready content. No AI orchestration — the user drives everything.
>
> **Scope**: This spec covers Studio Mode only. Agent Mode (AI-guided content planning and orchestration) will be a separate spec and a separate feature phase.

---

## 1. What We're Building

A unified content studio at `/studio` where authenticated users can:

1. Pick a content format (slides, infographic, diagram, video, comic)
2. Write a prompt describing what they want — including their real data
3. Watch it generate in real-time (streaming)
4. Click any text to edit it inline (fix numbers, tweak copy, add details)
5. Export in a usable format (PPTX for slides, PNG/SVG for others)
6. Save and access their generation history

That's it. No content planning, no multi-format briefs, no AI agent. Just a fast, polished single-format generator with persistence and real editing capability.

---

## 2. Showcase → Studio Funnel

The existing showcase (jr-showcase.vercel.app) stays as-is. It becomes the marketing funnel. The studio (`/studio`) is the product behind auth. They live in the same app.

### What the user sees:

```
PUBLIC (no auth required)                 PRODUCT (auth required)
┌─────────────────────────────┐          ┌──────────────────────────────────┐
│                             │          │                                  │
│  / (landing page)           │          │  /studio                         │
│  Hero + format previews     │  signup  │  Format tabs, prompt bar,        │
│  Pricing, "Get started" CTA │ ──────>  │  streaming canvas, inline edit,  │
│                             │          │  save, export, history           │
│  /slides (live demo)        │          │                                  │
│  /comic (live demo)         │          │                                  │
│  /diagrams (live demo)      │          │                                  │
│  /infographic (live demo)   │          │                                  │
│  /remotion (live demo)      │          │                                  │
│  ... (5 more demos)         │          │                                  │
│                             │          │                                  │
│  All 10 demos work without  │          │  All 5 MVP formats with:         │
│  signup. Anonymous. No save.│          │  auth, save, edit, export,       │
│  The "free trial" without   │          │  history, usage tracking         │
│  a signup wall.             │          │                                  │
└─────────────────────────────┘          └──────────────────────────────────┘
```

### The funnel:

```
1. User discovers us (search, social, Product Hunt)
              │
              ▼
2. Lands on / (landing page)
   Sees live previews of each format, pricing, social proof
              │
              ▼
3. Clicks a demo (e.g., /slides)
   Tries it — no signup needed. Types a prompt, watches it stream.
   This IS the free trial. Zero friction.
              │
              ▼
4. Wants more: save it, export as PPTX, edit the text
   Sees CTA: "Save this? Create a free account"
   After generation: [Save to Studio] button
              │
              ▼
5. Signs up (Google/GitHub OAuth — one click)
              │
              ▼
6. Redirected to /studio?format=slides
   Their format is pre-selected. They can regenerate or start fresh.
   Now they have: saving, history, inline editing, export.
              │
              ▼
7. Hits free tier limit (10 generations/month)
   Sees: "You've used 10/10 generations. Upgrade to Pro for 200/month + PPTX export"
              │
              ▼
8. Upgrades to Pro ($29/month)
```

### What changes on the existing demo pages (small additions):

- **Persistent top banner**: *"Like this? Sign up to save, edit, and export as PowerPoint → [Create free account]"*
- **Post-generation nudge**: After streaming completes, show a [Save to Studio] button
  - If logged in → saves directly, opens in `/studio`
  - If not logged in → triggers signup, then redirects to `/studio` with the generation
- **No other changes**: The demos keep working exactly as they do today. Same code, same UX, same anonymous access.

### Returning user:
1. Goes to `/studio` directly (bookmarked or from nav)
2. Sees history of past generations per format
3. Picks up where they left off or starts new

### Key principle:
**The demo pages are the marketing. The studio is the product. They coexist in the same app.**

---

## 3. Data Input Strategy

The #1 question: how does the user get their real data into the generated content?

### MVP: Rich Prompts + Inline Editing

Users include their actual data in the prompt. The AI uses real numbers, not placeholders.

**Example — bad prompt:**
> "Q3 board presentation"
> → AI invents fake numbers. Useless.

**Example — good prompt:**
> "Q3 board presentation. Revenue $2.3M up 15% from Q2. Expenses $1.8M. 340 new customers. Churn dropped to 2.1%. Key wins: launched Widget Pro, closed Enterprise deal with Acme Corp."
> → AI uses real data throughout. Useful.

The UI encourages this with:
- Placeholder text: *"Describe what you want — include your real data, numbers, and key points"*
- Format-specific prompt tips (e.g., for slides: *"Tip: include your actual metrics for accurate content"*)
- Example prompts that model data-rich inputs

**After generation — inline editing:**
- Click any text element to edit it directly in the preview
- Change a number, fix a name, tweak a headline
- The underlying spec JSON updates in real-time
- No regeneration needed for small fixes

This two-step flow covers 90% of use cases:
1. **Generate** with a data-rich prompt → get 90% right
2. **Edit inline** → fix the remaining 10%

### Future: Structured Data Input (Studio v2 / Agent Mode)
- CSV/spreadsheet upload → AI reads as context
- Google Sheets connection → live data
- Form fields for key metrics → fed to prompt automatically
- Agent Mode asks for specific data points in conversation

---

## 4. Studio UI Layout

```
┌─────────────────────────────────────────────────────────┐
│  Logo    [Slides] [Infographic] [Diagram] [Video] [Comic]   [Avatar ▾]  │
├────────┬────────────────────────────────────────────────┤
│        │                                                │
│ History│   ┌──────────────────────────────────────┐    │
│        │   │  > [prompt input]            [Generate]│    │
│ • Gen 1│   └──────────────────────────────────────┘    │
│ • Gen 2│                                                │
│ • Gen 3│   ┌──────────────────────────────────────┐    │
│        │   │                                      │    │
│ ────── │   │         Preview / Canvas              │    │
│ Examples│   │         (streaming render)            │    │
│ • CI/CD│   │                                      │    │
│ • Auth │   │                                      │    │
│        │   │                                      │    │
│        │   └──────────────────────────────────────┘    │
│        │                                                │
│        │   [Export ▾]  [Save]  [Regenerate]             │
│        │   (PPTX / PNG / SVG depending on format)      │
├────────┴────────────────────────────────────────────────┤
│  Free: 7/10 generations remaining    [Upgrade to Pro]   │
└─────────────────────────────────────────────────────────┘
```

### Key UI elements:
- **Format tabs** (top) — switch between content types
- **History sidebar** (left) — past generations for this format, click to reload
- **Prompt bar** (top of canvas) — text input + generate button
- **Canvas** (center) — streaming preview, format-specific renderer, click-to-edit text
- **Action bar** (below canvas) — export (format-aware), save, regenerate
- **Usage bar** (footer) — generations remaining, upgrade CTA
- **Example prompts** — collapsed in sidebar below history, quick-start suggestions

---

## 5. Launch Formats

### Tier 1 — MVP launch (5 formats)

| Format | Renderer | Why include |
|--------|----------|-------------|
| **Slides** | @json-render/react | Highest demand, most versatile |
| **Infographics** | @json-render/react | Visual, shareable, high perceived value |
| **Diagrams** | ReactFlow + Dagre | Developer/PM audience, clear use case |
| **Videos** | @json-render/remotion | Wow factor, hard to find elsewhere |
| **Comics** | @json-render/react | Unique, fun, viral potential |

### Tier 2 — Post-launch additions
| Format | When |
|--------|------|
| Wireframes | Month 2 — useful for product teams |
| Social Media Posts | Month 2 — sized variants of infographics |
| Pixel Art | Month 3 — fun, low priority |
| Generative Art | Month 3 — niche |
| Email Templates | Month 3 — needs HTML export work |

---

## 6. Features

### 6.1 Core (MVP)

| Feature | Description |
|---------|-------------|
| **Format picker** | Tab bar to switch between content types |
| **Rich prompt input** | Text input with data-rich examples, tips per format |
| **Streaming generation** | Real-time spec building with live preview |
| **Inline text editing** | Click any text in the preview to edit directly. Spec JSON updates in real-time. Essential for putting real data in. |
| **Format-aware export** | Slides → PPTX (PowerPoint). Infographic → PNG/SVG. Diagrams → SVG. Comics → PNG. Video → MP4 (Pro). |
| **Save** | Persist generation (prompt + spec + format) to database |
| **History** | List of past generations, click to reload |
| **Auth** | Google + GitHub OAuth via Neon Auth |
| **Usage tracking** | Count generations per month, enforce limits |
| **Upgrade CTA** | Free tier limit hit → prompt to upgrade |

### 6.2 Export Matrix (MVP)

| Format | Free export | Pro export | Library |
|--------|-------------|------------|---------|
| **Slides** | PNG (images) | **PPTX** (editable PowerPoint) | `pptxgenjs` |
| **Infographics** | PNG | PNG, SVG, PDF | `html-to-image`, `jspdf` |
| **Diagrams** | PNG | SVG (editable in Figma) | ReactFlow built-in |
| **Videos** | — | MP4 | Remotion |
| **Comics** | PNG | PNG, PDF | `html-to-image` |

**Why PPTX matters**: PNG slides are screenshots — the user can't edit them in PowerPoint, can't hand them to their boss for tweaks, can't present from them properly. PPTX export is the difference between a demo and a product. `pptxgenjs` maps our spec JSON (text boxes, layouts, colors) to native PowerPoint elements.

**Future**: Google Slides export (via API), Keynote export, Figma export for wireframes.

### 6.3 Post-MVP (Studio Mode v2)

| Feature | Description | Agent Mode hook? |
|---------|-------------|------------------|
| **Export PDF** | PDF rendering for slides, infographics | No |
| **Google Slides export** | Direct export to Google Slides via API | No |
| **Brand kits** | Saved color/font/logo configs | Yes — Agent uses brand context |
| **Regenerate section** | Re-prompt a specific section of the output | Yes — Agent uses for iteration |
| **Drag to reorder** | Drag slides/sections to reorder | No |
| **Templates** | Pre-built starting points per format | Yes — Agent selects templates |
| **Favorites** | Star generations for quick access | No |
| **Sharing** | Public link to view a generation | Yes — Agent shares deliverables |
| **Duplicate** | Clone a generation as starting point | No |
| **CSV/file upload** | Upload data files as AI context | Yes — Agent ingests data |

### 6.4 Agent Mode Hooks (data model only — no UI in Studio Mode)

These tables/fields exist in the database from day 1 but are unused until Agent Mode ships:

| Table | Purpose |
|-------|---------|
| `briefs` | Multi-format content briefs (Agent creates these) |
| `content_plans` | Planned content pieces within a brief |
| `plan_items` | Individual generation tasks within a plan |

Studio Mode only uses: `users`, `generations`, `brand_kits` (v2), `usage_logs`.

---

## 7. Technical Architecture

### 7.1 Project Structure

We evolve the existing showcase app — no separate app. The showcase already has all 10 working formats. We add `/studio` as a new route group alongside the existing demo pages.

```
examples/showcase/                    ← Same app, expanded
  app/
    (marketing)/                      ← PUBLIC: Landing + demos (no auth)
      page.tsx                        ← Landing page (polished with pricing + CTAs)
      comic/page.tsx                  ← Existing demo (unchanged)
      slides/page.tsx                 ← Existing demo (+ save CTA added)
      diagrams/page.tsx               ← Existing demo (+ save CTA added)
      infographic/page.tsx            ← Existing demo (+ save CTA added)
      remotion/page.tsx               ← Existing demo (+ save CTA added)
      wireframes/page.tsx             ← Existing demo (unchanged, Tier 2)
      pixel/page.tsx                  ← Existing demo (unchanged, Tier 2)
      generative-art/page.tsx         ← Existing demo (unchanged, Tier 2)
      mermaid/page.tsx                ← Existing demo (unchanged, Tier 2)
      adventure/page.tsx              ← Existing demo (unchanged, Tier 2)

    (app)/                            ← PRODUCT: Behind auth
      studio/
        page.tsx                      ← NEW — Unified studio UI
        layout.tsx                    ← NEW — Studio layout with sidebar
      settings/
        page.tsx                      ← NEW — Account settings
      billing/
        page.tsx                      ← NEW — Plan management

    api/
      auth/[...neonauth]/route.ts     ← NEW — Neon Auth
      v1/
        generate/route.ts             ← NEW — Unified generation (format param)
        generations/route.ts          ← NEW — Save/load CRUD
        usage/route.ts                ← NEW — Usage stats
      comic/route.ts                  ← Existing (stays for demo pages)
      slides/route.ts                 ← Existing (stays for demo pages)
      diagrams/route.ts               ← Existing (stays for demo pages)
      ... (7 more existing routes)    ← All stay, demo pages use them

    layout.tsx                        ← Root layout (add auth provider)

  lib/
    comic/catalog.ts                  ← Existing (unchanged)
    comic/registry.tsx                ← Existing (unchanged)
    slides/catalog.ts                 ← Existing (unchanged)
    slides/registry.tsx               ← Existing (unchanged)
    ... (8 more)                      ← All existing, unchanged
    db/                               ← NEW — Neon client + queries
      client.ts
      generations.ts
      usage.ts
    auth/                             ← NEW — Neon Auth helpers
      session.ts
      middleware.ts

  components/
    studio/                           ← NEW — Studio-specific components
      format-tabs.tsx
      prompt-bar.tsx
      canvas.tsx
      history-sidebar.tsx
      export-menu.tsx
      usage-bar.tsx
      inline-editor.tsx
    demo-cta.tsx                      ← NEW — Reusable "Save to Studio" CTA
```

### 7.2 What Gets Reused vs What's New

**Unchanged** (existing showcase code):
- All 10 catalog definitions (`lib/*/catalog.ts`)
- All 10 renderer registries (`lib/*/registry.tsx`)
- All 10 demo pages (`app/*/page.tsx`)
- All 10 API routes (`app/api/*/route.ts`)
- The streaming generation pattern

**Small additions to existing files**:
- Demo pages get a `<DemoCTA />` component (save/signup nudge after generation)
- Root layout gets Neon Auth provider wrapper

**New code**:
- `/studio` page + layout (unified studio UI)
- `/api/v1/*` routes (auth-protected, format-aware generation + CRUD)
- `lib/db/` (Neon client, queries)
- `lib/auth/` (session helpers)
- `components/studio/` (studio UI components)
- `components/demo-cta.tsx` (CTA for demo pages)

**Key insight**: The existing demo API routes (`/api/comic`, `/api/slides`, etc.) stay and continue serving the public demo pages. The new `/api/v1/generate` route is a unified, auth-protected version that the studio uses. Both call the same catalogs underneath — no logic duplication.

### 7.3 Database Schema (Neon Postgres)

```sql
-- =============================================
-- STUDIO MODE MVP
-- =============================================

-- Users (managed by Neon Auth, we extend with plan info)
CREATE TABLE user_profiles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id  TEXT UNIQUE NOT NULL,    -- from Neon Auth
  email         TEXT NOT NULL,
  name          TEXT,
  avatar_url    TEXT,
  plan          TEXT NOT NULL DEFAULT 'free',  -- free | pro | team
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Saved generations
CREATE TABLE generations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES user_profiles(id),
  format        TEXT NOT NULL,           -- slides | infographic | diagram | video | comic
  prompt        TEXT NOT NULL,
  spec_json     JSONB NOT NULL,          -- the generated spec
  title         TEXT,                    -- auto-generated or user-set
  is_favorite   BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_generations_user ON generations(user_id, created_at DESC);
CREATE INDEX idx_generations_format ON generations(user_id, format);

-- Usage tracking
CREATE TABLE usage_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES user_profiles(id),
  action        TEXT NOT NULL,           -- generate | export
  format        TEXT NOT NULL,
  tokens_used   INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_usage_user_month ON usage_logs(user_id, created_at);

-- =============================================
-- AGENT MODE HOOKS (tables created now, used later)
-- =============================================

-- Brand kits (Studio v2 + Agent Mode)
CREATE TABLE brand_kits (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES user_profiles(id),
  name          TEXT NOT NULL,
  config_json   JSONB NOT NULL,          -- { colors, fonts, logo_urls, voice }
  is_default    BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Content briefs (Agent Mode only)
CREATE TABLE briefs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES user_profiles(id),
  brand_kit_id  UUID REFERENCES brand_kits(id),
  title         TEXT NOT NULL,
  prompt        TEXT NOT NULL,
  audience      TEXT,
  key_messages  JSONB,                   -- array of strings
  formats       JSONB,                   -- array of format strings
  status        TEXT DEFAULT 'draft',    -- draft | planning | generating | complete
  plan_json     JSONB,                   -- Agent's content plan
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Link generations to briefs (Agent Mode)
ALTER TABLE generations ADD COLUMN brief_id UUID REFERENCES briefs(id);
```

### 7.4 Auth

**Neon Auth** (already available via MCP tooling):
- Google + GitHub OAuth out of the box
- Session management included
- JWT for API route protection
- User data stored in `neon_auth` schema, we extend with `user_profiles`

### 7.5 API Routes

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/api/v1/generate` | POST | Yes | Streaming generation (reuses showcase logic) |
| `/api/v1/generations` | GET | Yes | List user's saved generations |
| `/api/v1/generations` | POST | Yes | Save a generation |
| `/api/v1/generations/[id]` | GET | Yes | Get a single generation |
| `/api/v1/generations/[id]` | DELETE | Yes | Delete a generation |
| `/api/v1/usage` | GET | Yes | Get usage stats for current billing period |
| `/api/auth/[...neonauth]` | * | No | Neon Auth handler |

### 7.6 Generation Flow

```
Client                          Server
  │                               │
  │  POST /api/v1/generate        │
  │  { format, prompt }           │
  │ ─────────────────────────>    │
  │                               │  1. Verify auth + check usage limits
  │                               │  2. Select catalog for format
  │                               │  3. Build system prompt from catalog
  │                               │  4. streamText() via AI Gateway
  │  <── SSE: spec patches ────   │  5. Stream response
  │  <── SSE: spec patches ────   │
  │  <── SSE: done ────────────   │
  │                               │  6. Log usage
  │                               │
  │  POST /api/v1/generations     │
  │  { format, prompt, spec }     │
  │ ─────────────────────────>    │  7. Save to DB (client-initiated)
  │  <── { id, ... } ─────────   │
  │                               │
```

Note: Save is client-initiated, not automatic. User clicks "Save" after reviewing. This avoids storing garbage generations.

---

## 8. Pricing & Limits

### Free
| Limit | Value |
|-------|-------|
| Generations / month | 10 |
| Formats | All 5 |
| Export | PNG only (slides as images) |
| Inline editing | Yes |
| History | Last 20 generations |
| Watermark | Yes (small "Made with [Product]" footer) |

### Pro — $29/month
| Limit | Value |
|-------|-------|
| Generations / month | 200 |
| Formats | All |
| Export | **PPTX**, PNG, SVG, PDF |
| Video export | MP4 (5 min/month) |
| Inline editing | Yes |
| History | Unlimited |
| Watermark | No |
| Brand kits | 1 (when available) |

### Team — $79/month (post-MVP)
| Limit | Value |
|-------|-------|
| Generations / month | Unlimited |
| Video export | 30 min/month |
| Team members | 10 |
| Brand kits | 5 |
| API access | 1,000 calls/month |

Billing via **Stripe Checkout + Customer Portal**. Usage tracking in `usage_logs` table, checked on each generation request.

---

## 9. Migration Path: Showcase → Studio

We're NOT creating a new app. We're expanding the existing showcase. Nothing gets deleted or moved — we add new routes alongside what exists.

### Nothing breaks
- All 10 demo pages keep working at their current URLs
- All 10 API routes keep working
- All catalogs and registries are unchanged
- The current Vercel deployment keeps serving everything

### What we add
| Addition | Where | Purpose |
|----------|-------|---------|
| Neon Auth | `app/api/auth/`, `lib/auth/` | Google + GitHub login |
| Studio page | `app/(app)/studio/` | Unified studio behind auth |
| Studio API | `app/api/v1/` | Auth-protected generate + CRUD |
| Database layer | `lib/db/` | Neon Postgres queries |
| Studio components | `components/studio/` | Format tabs, canvas, sidebar, editor |
| Inline editor | `components/studio/inline-editor.tsx` | Click-to-edit text on canvas |
| Export pipeline | `components/studio/export-menu.tsx` | PPTX, PNG, SVG exports |
| Demo CTAs | `components/demo-cta.tsx` | "Save to Studio" nudge on demo pages |

### Small modifications to existing files
| File | Change |
|------|--------|
| `app/layout.tsx` | Wrap with Neon Auth provider |
| `app/(marketing)/page.tsx` | Polish landing page, add pricing + signup CTA |
| 5 demo pages (slides, comic, diagrams, infographic, remotion) | Add `<DemoCTA />` after generation completes |
| `package.json` | Add deps: `pptxgenjs`, `html-to-image`, Neon Auth SDK |

### Deployment
Same Vercel project, same domain. The `/studio` route just appears alongside the existing pages. No DNS changes, no new project setup.

---

## 10. Milestones

### M1: Foundation (Week 1-2)
- [ ] Set up Neon database with schema (use existing Neon project or create new)
- [ ] Add Neon Auth to existing showcase app (Google + GitHub OAuth)
- [ ] Create `app/(app)/studio/` route group with auth guard
- [ ] Build studio layout (format tabs, sidebar, canvas area)
- [ ] Create `/api/v1/generate` — unified auth-protected generation endpoint
- [ ] Wire up Slides end-to-end in studio (generate → preview → save to DB → load from history)

### M2: Inline Editing + All Formats (Week 3-4)
- [ ] Build inline text editing system (click text → edit → update spec JSON)
- [ ] Port remaining 4 formats (Infographic, Diagram, Video, Comic)
- [ ] Build history sidebar (list, load, delete)
- [ ] Build save flow (auto-title from prompt)
- [ ] Rich prompt input with data tips per format

### M3: Export Pipeline (Week 5-6)
- [ ] PPTX export for slides (`pptxgenjs` — map spec JSON → PowerPoint elements)
- [ ] PNG export for infographics, comics (`html-to-image`)
- [ ] SVG export for diagrams (ReactFlow built-in)
- [ ] Watermark for free tier exports
- [ ] Usage tracking (count generations, enforce Free tier limit)
- [ ] Example prompts per format

### M4: Polish + Landing (Week 7-8)
- [ ] Landing page (hero + live demos + pricing + signup CTA)
- [ ] Responsive design (mobile-friendly studio)
- [ ] Error handling, loading states, empty states
- [ ] Analytics (PostHog or similar)

### M5: Billing + Launch (Week 9-10)
- [ ] Stripe integration (Checkout, webhooks, Customer Portal)
- [ ] Pro plan enforcement (PPTX export, no watermark, higher limits, MP4)
- [ ] Deploy to production domain
- [ ] Product Hunt submission

### M6: Studio v2 (Post-launch)
- [ ] PDF export
- [ ] Google Slides export (via API)
- [ ] MP4 video export (Remotion)
- [ ] Brand kits (basic)
- [ ] Regenerate section (re-prompt individual parts)
- [ ] Drag to reorder slides/sections
- [ ] Templates gallery
- [ ] Sharing (public links)
- [ ] CSV/file upload as AI context

---

## 11. Agent Mode Reference

> This section documents how Studio Mode's architecture enables Agent Mode in the future. **None of this is built in Studio Mode** — it's here so we don't paint ourselves into a corner.

### What Agent Mode will add:
- A `/agent` route with a conversational interface
- Agent asks clarifying questions about the user's content needs
- Agent creates a `brief` (stored in `briefs` table)
- Agent generates a content plan (multiple formats from one brief)
- Agent triggers generation for each format (reuses `/api/v1/generate`)
- Agent stores all generations linked to the brief (`generations.brief_id`)
- Agent applies brand kit context to all generations

### What Studio Mode must NOT do:
- Don't couple the generation API to the studio UI — keep it generic
- Don't hardcode format selection — Agent Mode will select programmatically
- Don't skip the `brief_id` column on `generations` — Agent Mode needs it
- Don't make brand kits UI-only — store as structured JSON for Agent consumption

### Shared infrastructure:
```
Studio Mode uses:    │  Agent Mode will add:
                     │
/api/v1/generate     │  /api/v1/briefs (CRUD)
/api/v1/generations  │  /api/v1/plans (CRUD)
/api/v1/usage        │  /api/v1/agent/chat (conversational)
user_profiles        │  briefs table
generations          │  content_plans table
usage_logs           │  plan_items table
brand_kits (v2)      │  Agent orchestration logic
```

---

## 12. Open Decisions

| # | Decision | Options | Recommendation |
|---|----------|---------|----------------|
| 1 | App structure | Monorepo new app vs extend showcase | **Extend showcase** — no duplication, demos become marketing funnel |
| 2 | Domain | studio.jsonrender.com vs app.jsonrender.com | `app.jsonrender.com` — simple |
| 3 | PNG export method | html-to-image vs Puppeteer server-side | html-to-image (client-side, no server cost) |
| 4 | PPTX export | `pptxgenjs` vs `officegen` vs server-side LibreOffice | `pptxgenjs` — pure JS, client-side, well-maintained |
| 5 | Video export | Client-side vs Remotion Lambda | Remotion Lambda (Pro only, metered) |
| 6 | Free tier watermark | Overlay vs footer text | Footer text — less annoying, still visible |
| 7 | Auto-save | Save automatically vs user-initiated | User-initiated — avoids junk data |
| 8 | Inline edit scope | Text only vs text + images + layout | Text only for MVP — covers 90% of edits |
| 9 | PPTX in Free tier? | Free gets PNG only vs Free gets PPTX too | PPTX is Pro only — strong upgrade incentive |
| 10 | Product name | Content Studio, RenderAI, SpecFlow, ... | TBD — needs brainstorming |
