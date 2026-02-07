# Dashboard Example

## Agent Browser Testing

Use the `agent-browser` skill to test UI pages:

```
/agent-browser visit http://localhost:3000
```

The dashboard runs on `localhost:3000`. Use agent-browser to:
- Visit individual example pages (`/support`, `/onboarding`, `/reports`, `/forms`, `/explorer`, `/invoices`)
- Verify AI-generated UI renders correctly
- Test navigation between pages
- Interact with forms and data displays

## Project Structure

- `app/page.tsx` — Main dashboard with draggable widget grid
- `app/support/page.tsx` — AI Customer Support Portal
- `app/onboarding/page.tsx` — Dynamic Onboarding Flow
- `app/reports/page.tsx` — Sales Report / Analytics
- `app/forms/page.tsx` — Dynamic Form Builder
- `app/explorer/page.tsx` — Interactive Data Explorer
- `app/invoices/page.tsx` — Invoice Generator
- `components/widget.tsx` — Core Widget component (streams AI-generated UI)
- `components/header.tsx` — Navigation header with links to all pages
- `lib/render/catalog.ts` — Component catalog (Zod schemas)
- `lib/render/registry.tsx` — Component registry (React implementations + actions)
- `lib/render/renderer.tsx` — Spec renderer

## Key Patterns

- Each example page creates a `<Widget>` with an `initialPrompt` that auto-generates the UI on mount
- The Widget component streams JSON specs from `/api/generate` and renders them progressively
- All pages share the same catalog, registry, and dummy data APIs
- No database changes needed for new example pages
