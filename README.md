# json-render

**Predictable. Guardrailed. Fast.**

Let end users generate dashboards, widgets, apps, and videos from prompts — safely constrained to components you define.

```bash
npm install @json-render/core @json-render/react
# or for video
npm install @json-render/core @json-render/remotion
```

## Why json-render?

When users prompt for UI, you need guarantees. json-render gives AI a **constrained vocabulary** so output is always predictable:

- **Guardrailed** — AI can only use components in your catalog
- **Predictable** — JSON output matches your schema, every time
- **Fast** — Stream and render progressively as the model responds

## Live Showcase

Try the live showcase at **[jr-showcase.vercel.app](https://jr-showcase.vercel.app)**

![Showcase Landing](docs/screenshots/showcase-landing.png)

### Comic Generator

AI generates multi-panel comic strips as structured JSON. Custom renderers handle panels, speech bubbles, and captions.

![Comic Example](docs/screenshots/example-comic.png)

### Wireframe Builder

Prompt-to-wireframe in seconds. Components include cards, forms, tables, navigation, and pricing layouts.

![Wireframe Example](docs/screenshots/example-wireframes.png)

### Mermaid Diagrams

AI produces Mermaid syntax constrained by the catalog. Rendered client-side with live preview.

![Mermaid Example](docs/screenshots/example-mermaid.png)

### Slide Deck Presenter

Full presentation decks with multiple layouts, backgrounds, code blocks, and bullet lists — all streamed progressively.

![Slides Example](docs/screenshots/example-slides.png)

### Interactive Adventure

Choose-your-own-adventure game with themed scenes, choices, and inventory — rendered from a single JSON spec.

![Adventure Example](docs/screenshots/example-adventure.png)

### Flow Diagrams

Interactive node-based diagrams powered by React Flow. AI generates the graph structure, the renderer handles layout and interaction.

![Diagrams Example](docs/screenshots/example-diagrams.png)

### Remotion Video

AI generates video timeline JSON (composition, tracks, clips). Remotion renders it as a playable video with title cards, images, and transitions.

![Remotion Example](docs/screenshots/example-remotion.png)

---

## Quick Start

### 1. Define Your Catalog

```typescript
import { defineCatalog } from "@json-render/core";
import { schema } from "@json-render/react";
import { z } from "zod";

const catalog = defineCatalog(schema, {
  components: {
    Card: {
      props: z.object({ title: z.string() }),
      description: "A card container",
    },
    Metric: {
      props: z.object({
        label: z.string(),
        value: z.string(),
        format: z.enum(["currency", "percent", "number"]).nullable(),
      }),
      description: "Display a metric value",
    },
    Button: {
      props: z.object({
        label: z.string(),
        action: z.string(),
      }),
      description: "Clickable button",
    },
  },
  actions: {
    export_report: { description: "Export dashboard to PDF" },
    refresh_data: { description: "Refresh all metrics" },
  },
});
```

### 2. Define Your Components

```tsx
import { defineRegistry, Renderer } from "@json-render/react";

const { registry } = defineRegistry(catalog, {
  components: {
    Card: ({ props, children }) => (
      <div className="card">
        <h3>{props.title}</h3>
        {children}
      </div>
    ),
    Metric: ({ props }) => (
      <div className="metric">
        <span>{props.label}</span>
        <span>{format(props.value, props.format)}</span>
      </div>
    ),
    Button: ({ props, onAction }) => (
      <button onClick={() => onAction?.({ name: props.action })}>
        {props.label}
      </button>
    ),
  },
});
```

### 3. Render AI-Generated Specs

```tsx
function Dashboard({ spec }) {
  return <Renderer spec={spec} registry={registry} />;
}
```

**That's it.** AI generates JSON, you render it safely.

---

## Packages

| Package | Description |
|---------|-------------|
| `@json-render/core` | Schemas, catalogs, AI prompts, SpecStream utilities |
| `@json-render/react` | React renderer, contexts, hooks |
| `@json-render/remotion` | Remotion video renderer, timeline schema |

## Renderers

### React (UI)

```tsx
import { defineRegistry, Renderer } from "@json-render/react";
import { schema } from "@json-render/react";

// Element tree spec format
const spec = {
  root: {
    type: "Card",
    props: { title: "Hello" },
    children: [
      { type: "Button", props: { label: "Click me" } }
    ]
  }
};

// defineRegistry creates a type-safe component registry
const { registry } = defineRegistry(catalog, { components });
<Renderer spec={spec} registry={registry} />
```

### Remotion (Video)

```tsx
import { Player } from "@remotion/player";
import { Renderer, schema, standardComponentDefinitions } from "@json-render/remotion";

// Timeline spec format
const spec = {
  composition: { id: "video", fps: 30, width: 1920, height: 1080, durationInFrames: 300 },
  tracks: [{ id: "main", name: "Main", type: "video", enabled: true }],
  clips: [
    { id: "clip-1", trackId: "main", component: "TitleCard", props: { title: "Hello" }, from: 0, durationInFrames: 90 }
  ],
  audio: { tracks: [] }
};

<Player
  component={Renderer}
  inputProps={{ spec }}
  durationInFrames={spec.composition.durationInFrames}
  fps={spec.composition.fps}
  compositionWidth={spec.composition.width}
  compositionHeight={spec.composition.height}
/>
```

## Features

### Streaming (SpecStream)

Stream AI responses progressively:

```typescript
import { createSpecStreamCompiler } from "@json-render/core";

const compiler = createSpecStreamCompiler<MySpec>();

// Process chunks as they arrive
const { result, newPatches } = compiler.push(chunk);
setSpec(result); // Update UI with partial result

// Get final result
const finalSpec = compiler.getResult();
```

### AI Prompt Generation

Generate system prompts from your catalog:

```typescript
const systemPrompt = catalog.prompt();
// Includes component descriptions, props schemas, available actions
```

### Conditional Visibility

```json
{
  "type": "Alert",
  "props": { "message": "Error occurred" },
  "visible": {
    "and": [
      { "path": "/form/hasError" },
      { "not": { "path": "/form/errorDismissed" } }
    ]
  }
}
```

### Data Binding

```json
{
  "type": "Metric",
  "props": {
    "label": "Revenue",
    "value": "{{data.revenue}}"
  }
}
```

---

## Demo

Try the live showcase: **[jr-showcase.vercel.app](https://jr-showcase.vercel.app)**

Or run locally:

```bash
git clone https://github.com/bpais88/json-render
cd json-render
pnpm install
pnpm dev
```

- http://localhost:3000 — Docs & Playground
- http://localhost:3001 — Example Dashboard
- http://localhost:3002 — Remotion Video Example
- http://localhost:3010 — Showcase (all examples)

## How It Works

```mermaid
flowchart LR
    A[User Prompt] --> B[AI + Catalog]
    B --> C[JSON Spec]
    C --> D[Renderer]
    
    B -.- E([guardrailed])
    C -.- F([predictable])
    D -.- G([streamed])
```

1. **Define the guardrails** — what components, actions, and data bindings AI can use
2. **Users prompt** — end users describe what they want in natural language
3. **AI generates JSON** — output is always predictable, constrained to your catalog
4. **Render fast** — stream and render progressively as the model responds

## License

Apache-2.0
