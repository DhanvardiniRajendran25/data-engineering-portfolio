# Migration Plan — Static HTML/CSS/JS → Full-Stack Next.js Portfolio

Status: **DRAFT — awaiting approval to begin Phase 1.** Nothing in this document has been built yet. Each phase below is a separate go/no-go checkpoint; nothing in a later phase starts until the current one is reviewed and approved.

## Decisions already made (2026-07-27)

| Decision | Choice |
|---|---|
| Frontend framework | **Next.js (React + TypeScript)**, App Router |
| Backend purpose | **Live data-engineering demo** — a real API + database proving the skills the case studies describe, not just a contact form |
| Hosting/budget | **Free-tier only** — no recurring cost |
| Content cleanup | Done now, on the current static site (see [CLEANUP_LOG.md](./CLEANUP_LOG.md)) |

## Why this stack

- **Next.js + TypeScript**: the most recognized full-stack React framework in the current job market; App Router gives static generation for case-study pages (fast, SEO-friendly) *and* API route handlers for the live-demo backend in one codebase — no separate backend repo to stand up for a portfolio.
- **Tailwind CSS**, seeded from the *existing* design tokens (Fraunces/Inter fonts, the light/dark color variables already in `css/styles.css`) — so the visual identity carries over instead of resetting to a generic template, but the maintainability problem (40 pages of hand-copied boilerplate, two divergent JS bundles) goes away.
- **A typed content layer** (case studies as data, not hand-written HTML) — replaces the current copy-paste-per-project pattern that caused the JS-bundle-mismatch bug found in the site audit.
- **Postgres (Neon, free tier) + a scheduled Python ingestion job (GitHub Actions cron)** for the live demo — Python because that's the real data-engineering language on your resume (pairs with the TS/React frontend to explicitly show polyglot range), GitHub Actions cron because it's free and needs no extra infra.
- **Vercel** for hosting the Next.js app + API routes, free hobby tier, generous enough for a portfolio's traffic.

## Phase plan

### Phase 0 — Cleanup (✅ done)
Deleted the 34 unlinked PM/UX pages (32 removed, 2 PRDs kept and linked), removed 68 orphaned assets. See [CLEANUP_LOG.md](./CLEANUP_LOG.md).

### Phase 1 — Scaffolding (no visible content changes)
- New Next.js 15 + TypeScript + Tailwind project, in a new branch (current static site untouched until cutover).
- Port design tokens (colors, spacing, fonts, radii, shadows) from `css/styles.css` into `tailwind.config`.
- Set up ESLint/Prettier, GitHub Actions CI (lint + typecheck + build on every push), Vercel preview deployments per PR.
- Deliverable to review: a blank-but-styled shell (header/footer/theme toggle) deployed to a Vercel preview URL.

### Phase 2 — Static page migration (visual parity, no redesign yet)
- Port Home, About, Story, Experience, Education, Skills, Awards, Contact, Gallery 1:1 into React components/pages.
- Goal here is parity, not improvement — de-risks the migration before any redesign decisions.
- Deliverable to review: full site navigable on Vercel preview, side-by-side comparable to the current live site.

### Phase 3 — Case-study content model
- Build one shared `<CaseStudy>` template and move the 10 flagship DE projects + `sage-prd`/`podcastiq-prd` into typed content files (MDX or a `content/*.json` collection — will confirm which when we get here) instead of 12 separate hand-written HTML files.
- This directly fixes the root cause of the JS-bundle bug found in the audit (flagship pages silently loading the wrong script) — with one template, that class of bug can't happen again.

### Phase 4 — Interactions, animation, accessibility fixes
- Re-implement theme toggle, scroll reveals, counters, hero animation with React-idiomatic libraries (Framer Motion; keep Lenis for smooth scroll).
- Fix the accessibility gaps found in the audit while rebuilding: keyboard-operable gallery lightbox, Space-key support on cards, contrast pass on muted text colors.

### Phase 5 — Live data-engineering demo (the actual "backend")
The centerpiece: a small but real pipeline you can point to and say "this is live," not just described in a case study. Two candidate shapes — we'll pick one together when we reach this phase:

- **Option A — Live ETL dashboard**: a scheduled Python job (GitHub Actions cron) ingests a public dataset, transforms it, and loads it into Postgres (Neon). A Next.js API route reads it; a dashboard page on the site renders live charts with a "last refreshed" timestamp and a link to the GitHub Actions run log. Demonstrates ingest → transform → load → serve, end to end, actually running.
- **Option B — Query playground**: visitors run a handful of *pre-approved, parameterized* queries against a small public dataset through an API route and see results rendered live. (Deliberately **not** a free-text SQL box — exposing arbitrary SQL execution to the public internet is a real injection/DoS risk regardless of how it's sandboxed, so this would only ship as a fixed, whitelisted query menu.)

Either option adds: Postgres schema + migrations, a typed API layer, and a dashboard UI component.

### Phase 6 — SEO, performance, cutover prep
- Next.js Metadata API for titles/descriptions/OG images (carry forward the JSON-LD from `index.html`), auto-generated sitemap.
- Lighthouse pass; fix anything the new stack regresses versus the current static site's decent baseline.
- Redirect map from old URLs (`/projects/sage.html`) to new ones (`/projects/sage`) so no existing inbound link breaks.

### Phase 7 — Cutover & decommission
- DNS/domain switch from GitHub Pages to Vercel (or keep GitHub Pages via static export — trade-off to revisit at this point, since it affects whether Phase 5's API routes can run at all: GitHub Pages can't host server code, Vercel can).
- Once the new site is verified live and stable, retire the old static files.

## Open questions to resolve before Phase 5 specifically
- Which public dataset for the live demo — reuse the spirit of an existing case study (e.g. NYC food inspections, NYPD crime, Seattle pet licenses) so the demo and the write-up reinforce each other?
- Domain: keep the current GitHub Pages URL pattern, or move to a custom domain now that a real backend needs a real host?

## Next step
Confirm Phase 1 (scaffolding) to begin, or flag anything above you want changed first.
