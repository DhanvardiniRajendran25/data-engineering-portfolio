# Local Setup — Next.js Rewrite (`web/`)

This covers the new stack being built in `web/` (branch `rewrite/nextjs`). The live static site at the repo root is untouched and keeps working independently until [cutover (Phase 7)](./MIGRATION_PLAN.md#phase-7--cutover--decommission).

## Prerequisites
Node 20+ (built/tested on Node 24), npm. Python 3.11+ only needed once you touch `pipeline/`.

## Run the site locally
```bash
cd web
npm install
npm run dev
# http://localhost:3000
```

## Before committing
```bash
cd web
npm run lint
npx tsc --noEmit
npm run build
```
These three are exactly what `.github/workflows/web-ci.yml` runs on every push/PR touching `web/**`.

## What's wired up so far (Phase 1)
- Next.js 16 (App Router) + TypeScript + Tailwind CSS 4, scaffolded via `create-next-app`.
- Design tokens ported from `css/styles.css` into `web/src/app/globals.css` — same colors, fonts (Fraunces/Inter via `next/font/google`), radii, shadow, and light/dark theme switch (`data-theme` attribute, unchanged mechanism).
- Theme flash prevention: an inline bootstrap script in `web/src/app/layout.tsx` sets `data-theme` before first paint, matching [Next's documented pattern](https://nextjs.org/docs) for this — and, unlike the old `js/main.js`, wraps the `localStorage` read in `try/catch` too (the old version only guarded the reduced-motion check).
- `SiteHeader` / `SiteFooter` / `ThemeToggle` components — real, working nav (`usePathname`-based active-link state) and a working light/dark toggle.
- One stub page per nav route (About, Story, Experience, Education, Skills, Awards, Projects, Gallery, Contact) so the whole nav is clickable with no dead links; each just says which phase will fill it in. This is intentional scaffolding, not forgotten content.
- `GET /api/health` — proves API route handlers work end to end.
- `web/src/db/` — Drizzle ORM wired to Neon Postgres via `@neondatabase/serverless`, with one placeholder table (`pipeline_runs`). Nothing calls it yet; it exists so Phase 5 has working plumbing instead of a blank page. **Nothing breaks if `DATABASE_URL` is unset** — `getDb()` throws only when actually called, not at import/build time.
- `pipeline/` — a Python ingestion script skeleton (`ingest.py`) and `.github/workflows/pipeline.yml`, manually triggerable (`workflow_dispatch`), cron commented out until Phase 5 has a real dataset and a `DATABASE_URL` secret.
- CI: `.github/workflows/web-ci.yml` runs lint + typecheck + build on every push/PR that touches `web/**`.

## What you need to do (accounts I can't create for you)
1. **Neon** (free Postgres): create a project at neon.tech, copy the connection string into `web/.env.local` (from `web/.env.example`) for local dev, and into the `DATABASE_URL` GitHub Actions secret for CI/the pipeline.
2. **Vercel** (free hosting): import this repo, set the project's root directory to `web`, and it should deploy on push with zero extra config. Preview deployments will show up on PRs automatically once connected.

Neither is needed yet to keep building — only once we reach Phase 5 (or if you want a live preview URL sooner).

## Known trade-off worth knowing about
The theme toggle button's icon (sun vs. moon) is computed client-side from `document.documentElement`, so on a hard page load it can very briefly (pre-hydration) show the wrong icon before correcting — the actual page colors are never wrong, only that one icon glyph, for a fraction of a second. This is the accepted trade-off in Next's own documented pattern for any client-only preference; not worth adding complexity to eliminate on a portfolio site.
