---
name: takeoff-platform-overview
description: Load shared context for the Caliente AI / takeoff-platform repo — what the WoZ investor demo in this repo actually is, how it differs from the planned production architecture, links to the Notion tech design and Jira (MAR) board, and the non-negotiable rules from CLAUDE.md. Invoke when onboarding to the repo, when the user asks "what is this project / where do I start / what's the architecture / where are the tickets", or when a task touches design/scope decisions that need the bigger picture.
---

# Caliente AI — Construction Takeoff Platform

## TL;DR
The repo at `/Users/dvirbenita/takeoff-platform` is a **Wizard-of-Oz investor demo** for an AI-powered construction takeoff platform. It is **not** the production system described in the Notion tech design — it is the front-end demo that *pretends* to be that system for a 3-minute pitch. Always keep that distinction in mind when scoping work.

- Founders: 2-person team (Dev A = Frontend, Dev B = Backend/ML/Infra).
- Current go-to-market stage: pre-product validation + investor pitch (see Jira MAR board — most open tickets are validation calls, pitch deck, landing page, demo video).
- The demo here exists to (a) close pilot LOIs and (b) raise a round.

## Two architectures — do not confuse them

### What this repo IS (the demo)
- Next.js 15 App Router, TypeScript strict, React 19, Tailwind v4 + shadcn/ui.
- Zustand for client state. OpenSeadragon + SVG overlay for the viewer.
- No DB, no auth, no external APIs — all state in-memory + static JSON in `apps/web/public/demo/`.
- Flow: upload PDF → fake "AI" processing screen → prebaked polygons render → user accepts/rejects/deletes → CSV export.
- Lives entirely in `apps/web` Next.js route handlers.

### What the production system is (Notion tech design)
- **Browser (Vercel, presentation only):** Next.js 15 + React 19 + OpenSeadragon + Konva.
- **API (Fly.io):** Node 22 + TypeScript + Hono + tRPC + Zod — owns *all* business logic, auth/RBAC, webhooks, worker orchestration. **No Server Actions.**
- **DB:** Postgres on Neon with RLS (pgvector deferred).
- **Storage:** Cloudflare R2 behind a `StorageService` abstraction.
- **Queue:** pg-boss inside Neon, wrapped behind a `JobQueue` interface.
- **Python workers (Modal app):** PDF split (pypdfium2), OCR (Google Document AI behind `OcrProvider`), wall/room segmentation (U-Net + ResNet-50 on CubiCasa5K → fine-tune), Shapely geometry.
- **Auth + Billing:** Clerk with built-in Stripe behind a `BillingService` interface.
- **LLM (Phase 3):** Anthropic Claude (Sonnet 4.6 today, re-eval at Phase 3) behind an `LLMProvider` abstraction.
- **Five non-negotiable abstractions:** `StorageService`, `OcrProvider`, `JobQueue`, `BillingService`, `LLMProvider`.

If a task names production tech (Fly, Neon, Modal, R2, Clerk, tRPC), it is **not** a change to this repo unless explicitly scoped. Confirm before writing production-shaped code in the demo.

## Phase roadmap (Notion §8)
- **Phase 1 — AI-detection MVP:** upload + viewer + AI wall/room segmentation + OCR + scale calibration + classifications + CSV/Excel export. **Minimal review surface only — no manual editor.** 1 paying pilot.
- **Phase 2 — Manual editor + AI improvements:** full polygon/polyline/count editor, symbol detection, revision overlay, DZI tiles, audit UI, staging env. 5–10 customers.
- **Phase 3 — Chat over plans:** Claude long context + prompt caching, tool-use agent (no pgvector at MVP), citations.
- **Phase 4 — 3D + integrations:** 2.5D Three.js extrusion, IFC import, Procore OR Sage, SOC 2 Type 1.

**Critical risk (Notion §3.3 decision gate):** if AI recall <80% on real pilot plans, Phase 1 dies — there is no manual fallback. The gate must be evaluated *before* the rest of the Phase 1 build commits.

## Demo behavior (this repo)
- Demo script lives at [docs/demo-script.md](docs/demo-script.md) — 3-minute investor walkthrough.
- Architecture note at [docs/architecture.md](docs/architecture.md).
- Visual language: "Linear meets Bloomberg" — light theme, zinc-50 background, white cards, blue-600 accent, status colors (pending=blue-500, accepted=emerald-500, rejected=rose-500).
- Layout: 280px left sidebar (detection list) · OSD viewer center · 320px right inspector · 56px top bar.
- Emergency fallbacks: Cmd+Shift+D force-loads prebaked demo; logo tap 5× resets.

## Key files / where to look
- [apps/web/src/lib/types.ts](apps/web/src/lib/types.ts) — `Polygon`, `Job`, `DetectionStatus`.
- [apps/web/src/lib/store.ts](apps/web/src/lib/store.ts) — Zustand store (polygons, filter, stats).
- [apps/web/src/lib/projects.ts](apps/web/src/lib/projects.ts) — hardcoded `PROJECTS` list + status enum.
- [apps/web/src/lib/demo-data.ts](apps/web/src/lib/demo-data.ts) — fake processing stages + prebaked polygon loader.
- [apps/web/src/components/Viewer.tsx](apps/web/src/components/Viewer.tsx) — OSD + SVG overlay.
- [apps/web/src/app/api/export/route.ts](apps/web/src/app/api/export/route.ts) — CSV export endpoint.
- [apps/web/public/demo/](apps/web/public/demo/) — prebaked polygon JSON + tile assets.
- [demo-fixtures/](demo-fixtures/) — raw source PDF + labelme output.
- [scripts/](scripts/) — `convert-labelme.py`, `generate-demo-plan.mjs`, `generate-dzi.sh`.

## Non-negotiable rules (from [CLAUDE.md](CLAUDE.md))
Treat these as hard constraints — they override default behavior:

**Stack (do not substitute):** Next.js 15 App Router · TS strict · React 19 · Tailwind v4 + shadcn · Zustand · OpenSeadragon + SVG overlay (NOT Konva in the demo) · no DB · no auth · no external APIs.

**Code rules:**
- No `any`. No untyped state. Prefer `type` over `interface` for data shapes.
- Default to Server Components. `'use client'` only when needed.
- Use `dynamic(() => import(...), { ssr: false })` for OSD and any canvas/SVG-binding code.
- One component per file, max 150 lines.
- Zustand *selectors* — never full-store subscription.
- Icons: `lucide-react` only.

**Off-limits:**
- No Server Actions for mutations.
- No `fetch()` to external URLs.
- No MUI / Chakra / Ant / Material UI.
- No Redux, no React Context for shared state, no React Query.
- No CSS-in-JS.
- No new npm deps without listing them first and getting approval.
- No `console.log` in committed code (only `console.error` for real errors).
- No `localStorage` except via Zustand persist middleware.

## External sources of truth
- **Tech design (Notion):** https://www.notion.so/Tech-Design-AI-Construction-Takeoff-Platform-MVP-V1-3582a2457fd18183a5c4fd8fbda8f8a7 — single source of truth for the production system. Fetch with `mcp__notion__notion-fetch` if details are needed.
- **Jira board (project MAR):** https://calientesolutions.atlassian.net/jira/core/projects/MAR/board — current sprint is **investor pipeline + customer validation**, *not* product engineering. Open epics: `MAR-3` (Customer Validation — Week 1), `MAR-4` (Investor Pipeline — Week 1). Query with `mcp__claude_ai_Atlassian_Rovo__searchJiraIssuesUsingJql` (cloudId = `calientesolutions.atlassian.net`).

## How to use this skill
- When the user starts a new conversation in this repo and asks anything that needs project context, read this skill first instead of re-deriving from scratch.
- If a question is about the *production* tech design (Fly, Neon, Modal, Clerk, U-Net, Document AI, abstractions), the answer almost certainly lives in the Notion doc — fetch it rather than guessing.
- If a question is about *current priorities or who-is-doing-what*, check the Jira MAR board — the founders are in validation mode, not feature-building mode.
- If a task asks to add features that contradict the §"Off-limits" or §"Stack" rules in CLAUDE.md, push back before writing code.
