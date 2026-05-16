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

## Visual Design Language
- Professional, dense, "Linear meets Bloomberg" aesthetic. Not playful.
- Light theme only. Background: zinc-50. Cards: white with subtle border.
- Accent: blue-600. Status colors: pending=blue-500, accepted=emerald-500, rejected=rose-500.
- Font: system font stack (no custom fonts for the demo).
- Three-pane layout: left sidebar 280px (detection list), center (OSD viewer fills remaining), right panel 320px (detail/inspector).
- Top bar: 56px height, logo text left, stats badges center, export button right.
- Loading states: skeleton placeholders + staged text labels, never bare spinners.

## Off-Limits (DO NOT DO THESE)
- No Server Actions for data mutations.
- No fetch() to external URLs.
- No MUI, Material UI, Chakra, or Ant Design.
- No Redux, React Context for shared state, or React Query (data is local, not fetched).
- No CSS-in-JS (styled-components, emotion).
- No new npm dependencies without listing them first and getting approval.
- No console.log in committed code (use console.error for actual errors only).
- No localStorage except via Zustand persist middleware if needed.
