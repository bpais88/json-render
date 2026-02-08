# AI Content Studio — Product Spec

## Vision

A prompt-first content generation platform where users describe what they need in plain language and get production-ready content across multiple formats — slides, infographics, videos, diagrams, social posts — all from a single brief.

Built on the json-render pattern: AI generates structured JSON specs constrained to a component catalog, and specialized renderers turn those specs into visual content. The user never touches a drag-and-drop editor unless they want to.

---

## Core Concept

```
User Intent (prompt/brief)
        │
        ▼
┌─────────────────┐
│  Content Studio  │
│                  │
│  1. Understand   │  ← Parse intent, extract key messages, audience, tone
│  2. Plan         │  ← Decide which formats, select templates, allocate content
│  3. Generate     │  ← Stream JSON specs for each format in parallel
│  4. Render       │  ← Specialized renderers produce visual output
│  5. Deliver      │  ← Export PNG, PDF, MP4, JSON, embed code
└─────────────────┘
        │
        ▼
  Multi-format content package
  (slides + infographic + video + social posts + ...)
```

---

## Target Users

### Primary: Marketing Teams (5-50 people)
- Need consistent multi-format content (blog → social → slides → newsletter)
- Currently use 4-5 different tools (Canva, Google Slides, Loom, Figma)
- Pain: recreating the same content in different formats is tedious
- Value: one brief → all formats, brand-consistent

### Secondary: Developers / Product Teams
- Need quick visual assets (diagrams, wireframes, presentations)
- Want API access to embed generation in their own tools
- Value: JSON-based, programmable, version-controlled

### Tertiary: Individual Creators / Freelancers
- Need fast content generation for clients
- Price-sensitive, need a generous free tier to convert
- Value: speed, quality, variety

---

## Content Formats

### Phase 1 — Launch (What We Have)
| Format | Renderer | Export |
|--------|----------|--------|
| Presentation Slides | @json-render/react | PNG, PDF |
| Infographics | @json-render/react | PNG, PDF, SVG |
| Flowcharts & Diagrams | ReactFlow + Dagre | PNG, SVG |
| Wireframes | @json-render/react | PNG, PDF |
| Comics | @json-render/react | PNG, PDF |

### Phase 2 — Video + Social
| Format | Renderer | Export |
|--------|----------|--------|
| Short Videos (15-60s) | @json-render/remotion | MP4, WebM |
| Social Media Posts | @json-render/react | PNG (sized per platform) |
| Email Templates | @json-render/react | HTML |
| Animated Infographics | @json-render/remotion | MP4, GIF |

### Phase 3 — AI Video + Advanced
| Format | Renderer | Export |
|--------|----------|--------|
| AI-Generated Video | Remotion + Video AI APIs | MP4 |
| Interactive Dashboards | @json-render/react | Embed, URL |
| Print Materials | @json-render/react | PDF (CMYK) |
| Brand Kits | System-wide | Config JSON |

---

## User Flows

### Flow 1: Quick Generate (Single Format)

```
1. User lands on studio
2. Selects a format (or lets AI choose)
3. Types a prompt: "Q3 sales report for the board"
4. Sees streaming generation — spec builds in real-time
5. Reviews output, makes text edits inline
6. Exports (PNG, PDF, MP4, etc.)
```

### Flow 2: Content Brief (Multi-Format)

```
1. User creates a "Brief"
   - Topic: "Product launch announcement for Widget Pro"
   - Audience: "Customers, investors, press"
   - Key messages: "50% faster, new AI features, available today"
   - Brand: selects saved brand kit (colors, fonts, logo)
   - Formats: [Slides, Infographic, Social Posts, Email]

2. Studio generates a Content Plan:
   - Slides: 8-slide deck for investors
   - Infographic: Feature comparison for customers
   - Social: 3 posts (LinkedIn, Twitter, Instagram)
   - Email: Launch announcement newsletter

3. User approves or adjusts the plan

4. All formats generate in parallel (streaming)
   - Shared context ensures consistent messaging
   - Brand kit applied across all outputs

5. User reviews each format
   - Inline text editing
   - Regenerate individual sections
   - Swap themes/layouts

6. Export all or individually
```

### Flow 3: API Integration

```
POST /api/v1/generate
{
  "brief": "Monthly sales report",
  "formats": ["slides", "infographic"],
  "brand_kit_id": "bk_abc123",
  "data": { ... },           // Optional structured data
  "stream": true              // SSE streaming
}

Response: Server-Sent Events stream
  → patches for slides spec
  → patches for infographic spec
  → final specs + render URLs
```

### Flow 4: Template Customization

```
1. User browses template gallery
2. Selects "Quarterly Report" template
3. Fills in variables (company name, quarter, metrics)
4. AI adapts template to their data
5. User fine-tunes and exports
```

---

## Key Features

### 1. Streaming Generation
The real-time build effect is a core differentiator. Users see their content materialize piece by piece. This creates engagement and trust ("I can see what it's doing").

- Powered by `createSpecStreamCompiler` — JSON patches applied incrementally
- Each format streams independently
- User can interrupt and redirect mid-generation

### 2. Brand Kits
Saved brand configurations applied across all content:
- Primary/secondary/accent colors
- Font families (heading, body, mono)
- Logo (light/dark variants)
- Tone of voice guidelines (fed to AI as system prompt context)
- Custom component overrides

### 3. Inline Editing
After generation, users can:
- Click any text to edit it directly
- Drag to reorder sections/slides
- Swap between theme variants
- Regenerate individual sections with a new prompt
- The underlying JSON spec updates in real-time

### 4. Content Memory
The system remembers context across generations:
- Brand voice gets more accurate over time
- Past content informs future suggestions
- "Make it like the Q2 report but with Q3 data"

### 5. Collaboration
- Share generated content with team
- Comment on specific elements
- Approval workflows (draft → review → approved)
- Real-time collaborative editing (CRDT on JSON spec)

### 6. Export & Distribution
- Download: PNG, PDF, SVG, MP4, WebM, GIF, HTML
- Direct publish: social media platforms (later phase)
- Embed: iframe / script tag for web embedding
- API: programmatic access to generated specs and renders

---

## Technical Architecture

### Core Stack
```
┌─────────────────────────────────────────────┐
│                  Frontend                     │
│  Next.js App Router + React                  │
│  ├── Studio UI (prompt, preview, edit)       │
│  ├── Template Gallery                         │
│  ├── Brand Kit Manager                        │
│  └── Export Pipeline                          │
├─────────────────────────────────────────────┤
│                  API Layer                     │
│  Next.js Route Handlers                       │
│  ├── /api/v1/generate    (streaming)         │
│  ├── /api/v1/briefs      (CRUD)             │
│  ├── /api/v1/brands      (CRUD)             │
│  ├── /api/v1/templates   (gallery)           │
│  └── /api/v1/export      (render + export)   │
├─────────────────────────────────────────────┤
│               Generation Engine               │
│  ├── Catalog System (defineCatalog)          │
│  ├── AI Provider (ai-sdk + gateway)          │
│  ├── Spec Stream Compiler                     │
│  └── Format-specific prompt builders          │
├─────────────────────────────────────────────┤
│              Rendering Pipeline               │
│  ├── @json-render/react   (static formats)   │
│  ├── @json-render/remotion (video)           │
│  ├── ReactFlow + Dagre    (diagrams)         │
│  └── Export renderers (PNG, PDF, MP4)        │
├─────────────────────────────────────────────┤
│                 Data Layer                     │
│  ├── Neon Postgres (users, briefs, brands)   │
│  ├── Blob Storage (generated assets)         │
│  └── Redis/KV (generation cache, sessions)   │
└─────────────────────────────────────────────┘
```

### AI Model Strategy
- **Primary**: Claude (via AI Gateway) — best for structured JSON generation
- **Fallback**: GPT-4o, Gemini — for redundancy and cost optimization
- **Specialized**:
  - Image generation: DALL-E 3, Midjourney API (for infographic/slide assets)
  - Video generation: Kling, Runway, Google Veo (Phase 3)

### Database Schema (Neon Postgres)

```sql
-- Users & Auth
users (id, email, name, avatar_url, plan, created_at)
teams (id, name, owner_id, plan, created_at)
team_members (team_id, user_id, role)

-- Brand Kits
brand_kits (id, team_id, name, config_json, created_at)
  -- config_json: { colors, fonts, logo_urls, voice_guidelines }

-- Content
briefs (id, team_id, user_id, title, prompt, config_json, status, created_at)
generations (id, brief_id, format, spec_json, status, model_used, tokens_used, created_at)
exports (id, generation_id, format, url, size_bytes, created_at)

-- Templates
templates (id, name, description, category, format, spec_template_json, preview_url, is_public)

-- Usage & Billing
usage_logs (id, team_id, user_id, action, tokens_used, created_at)
```

---

## Pricing

### Free
- 10 generations / month
- 3 formats (Slides, Infographic, Diagram)
- PNG export only
- Watermarked output
- 1 user

### Pro — $29/month
- 100 generations / month
- All formats including video (5 min/month)
- PNG, PDF, SVG export
- No watermark
- 1 brand kit
- 1 user
- Priority generation (faster models)

### Team — $79/month
- Unlimited generations
- All formats, 30 min video/month
- All export formats including MP4, HTML embed
- 5 brand kits
- Up to 10 users
- Collaboration features
- API access (1,000 calls/month)

### Enterprise — Custom
- Unlimited everything
- Custom component catalogs
- White-label embedding
- SSO / SAML
- Dedicated support
- SLA guarantees
- Self-hosted option
- Unlimited API access

---

## Monetization Extras

### Template Marketplace
- Curated templates for common use cases
- Community-submitted templates (revenue share)
- Premium templates ($5-15 one-time purchase)

### API Access
- Pay-per-generation beyond plan limits
- $0.10 per static generation (slides, infographic)
- $0.50 per video generation
- Volume discounts for high-usage customers

### Custom Catalog Development
- Professional services to build custom component catalogs
- For enterprises that want proprietary visual styles
- $5K-50K per engagement

---

## Go-to-Market

### Phase 1: Launch (Month 1-2)
- Ship the web app with Free + Pro tiers
- Focus on single-format generation (what we have now)
- Landing page with live demos (the showcase IS the marketing)
- Product Hunt launch
- Content marketing: "Build a presentation in 30 seconds" videos

### Phase 2: Multi-Format (Month 3-4)
- Add Content Brief flow (multi-format from single prompt)
- Add Brand Kits
- Add Team plan
- Integrations: Slack bot, Chrome extension
- Partner with creator communities

### Phase 3: Video + API (Month 5-8)
- AI video generation (Kling, Runway, Veo integration)
- Public API launch
- Template marketplace
- Enterprise plan + sales motion

### Phase 4: Director Agent (Month 6+)
- Orchestration layer that plans and coordinates multi-format generation
- Automated content calendars
- "Generate a week of social content from this blog post"
- This is the long-term moat — an AI that understands content strategy

---

## Success Metrics

### North Star: Monthly Active Generators
Users who generate at least 1 piece of content per month.

### Key Metrics
| Metric | Target (Month 3) | Target (Month 6) |
|--------|-------------------|-------------------|
| MAG (Monthly Active Generators) | 1,000 | 10,000 |
| Paid conversion rate | 5% | 8% |
| MRR | $5K | $50K |
| Generations per user/month | 8 | 15 |
| Multi-format adoption | 20% | 40% |
| API customers | 10 | 100 |
| NPS | 40+ | 50+ |

---

## Competitive Landscape

| Competitor | Strength | Our Edge |
|------------|----------|----------|
| Canva | Massive template library, brand recognition | Prompt-first (no drag-drop needed), multi-format from single brief |
| Gamma | AI presentations | We do slides + 7 other formats |
| Beautiful.ai | Smart slide design | JSON-based, extensible, API-first |
| Tome | AI storytelling | Streaming generation, open spec format |
| Loom | Video creation | AI-generated video content, not screen recording |
| Figma | Design tool | We generate, they design manually |

**Our moat**: The json-render pattern. Component catalogs are portable, extensible, and constrainable. Enterprises can define exactly what the AI can and cannot generate. No other tool offers this level of control over AI output.

---

## Open Questions

1. **Naming**: "Content Studio" is generic. Need a distinctive brand name.
2. **Pricing validation**: Is $29/mo the right Pro price? Need user research.
3. **Video AI provider**: Kling vs Runway vs Veo — which to integrate first? (Cost, quality, speed tradeoffs)
4. **Self-serve vs sales-led**: At what point do we add a sales team for Enterprise?
5. **Open source strategy**: Keep json-render core open source? Helps adoption but needs careful moat protection.
6. **Image generation**: Should we generate custom images for slides/infographics, or stick with stock/user-uploaded? (Cost implications)
7. **Offline/local**: Is there demand for a desktop app or local-first mode?

---

## Immediate Next Steps

1. ~~Write this spec~~ Done
2. Validate pricing with potential users (5-10 interviews)
3. Build the Brand Kit system (foundation for multi-format consistency)
4. Build the Content Brief flow (multi-format generation)
5. Set up Neon database with the schema above
6. Add authentication (Neon Auth or Clerk)
7. Build the billing system (Stripe integration)
8. Design and build the Director Agent (Phase 4)
