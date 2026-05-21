# Construction Takeoff Platform — WoZ Demo

## What This Is
Wizard-of-Oz investor demo for an AI construction takeoff platform. Upload a PDF → "AI analyzes" (actually loads prebaked data) → polygons render over the plan → user accepts/rejects/deletes → exports CSV.

## Tech Stack (NON-NEGOTIABLE — do not substitute any of these)
- Next.js 15 App Router, TypeScript strict, React 19
- Tailwind CSS v4 + shadcn/ui (already initialized via `npx shadcn@latest init`)
- Zustand for client state (no Redux, no Context for shared state)
- OpenSeadragon for the plan viewer (DZI tile source)
- SVG overlay on OpenSeadragon for polygon rendering (NOT Konva for now)
- No database — all state is in-memory (Zustand) + static JSON files
- No auth — hardcoded demo user
- No external API calls — everything runs locally in Next.js route handlers

## Project Structure
- apps/web/                   Next.js 15 app (the demo)
- apps/web/src/app/           App Router pages
- apps/web/src/app/api/       Route Handlers (demo-only; production uses Hono on Fly.io)
- apps/web/src/components/    React components
- apps/web/src/components/ui/ shadcn primitives (do not edit these)
- apps/web/src/lib/           Utilities, store, types, demo data loader
- apps/web/src/hooks/         Custom hooks
- apps/web/public/demo/       Static demo assets (DZI tiles, prebaked polygon JSON)
- packages/api-types/         Shared TypeScript types
- scripts/                    Build/conversion scripts
- demo-fixtures/              Raw source assets (PDF, labelme output)

## Coding Rules
- TypeScript strict mode. No `any`. No untyped state.
- Prefer `type` over `interface` for data shapes.
- Default to Server Components. Add 'use client' only when the component needs browser APIs, state, or event handlers.
- Use the `dynamic(() => import(...), { ssr: false })` pattern for OpenSeadragon and any canvas/SVG-bindingcode.
- One component per file. Max 150 lines. If longer, split.
- Use lucide-react for icons (already a shadcn dependency).
- Every component must have explicit TypeScript prop types.
- Use Zustand selectors (not full store subscription) to prevent unnecessary re-renders.

## Visual Design Language — "Ember"
The platform follows the Caliente AI "Ember" design system (Confluence: "Caliente AI
Brand & Design System (Ember)"). Dark, cinematic, precise. Tokens live in
`apps/web/src/app/globals.css`; build every new surface from them.
- Dark theme only, no theme toggle. Ink `#0B0C10` background, Carbon `#14161C` surfaces.
- Ember `#FF5C35` is the signature accent: CTAs, highlights, the selected/"lock-on"
  state. Keep it scarce (roughly one ember element per viewport). Ember always carries
  Ink text, never white.
- Blueprint `#3B82F6` is the cool supporting accent for data and tech moments.
- Text: Bone `#F5F3EF` for headlines, Slate `#9498A6` for body. Borders: Hairline `#242732`.
- Detection status colors: pending = Blueprint, accepted = emerald `#10B981`,
  rejected = rose `#F43F5E`, selected = Ember.
- Fonts: Inter Tight (`font-display`, headlines), Inter (`font-sans`, body),
  JetBrains Mono (`font-mono`, eyebrow labels and data). Mono UPPERCASE is for labels only.
- Tailwind utilities expose the palette: `bg-ink`, `bg-carbon`, `text-ember`,
  `text-blueprint`, `text-bone`, `text-slate`, `border-hairline`, etc.
- Brand patterns: `.eyebrow` (mono label), `.bp-grid` / `.glow-ember` / `.glow-blueprint`
  / `.film-grain` (cinematic backdrop), `.rise-in` (entrance motion).
- Three-pane layout: left sidebar 280px (detection list), center (OSD viewer fills
  remaining), right panel 320px (detail/inspector).
- Loading states: skeleton placeholders + staged text labels, never bare spinners.
- Voice: confirm, don't pitch. Sentence case. Never use em dashes (use a period or comma).

## Off-Limits (DO NOT DO THESE)
- No Server Actions for data mutations.
- No fetch() to external URLs.
- No MUI, Material UI, Chakra, or Ant Design.
- No Redux, React Context for shared state, or React Query (data is local, not fetched).
- No CSS-in-JS (styled-components, emotion).
- No new npm dependencies without listing them first and getting approval.
- No console.log in committed code (use console.error for actual errors only).
- No localStorage except via Zustand persist middleware if needed.
