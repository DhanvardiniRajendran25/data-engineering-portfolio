# Migration Plan — Static HTML/CSS/JS → Full-Stack Next.js Portfolio

Status: **Phase 1 done, on branch `rewrite/nextjs`. Awaiting approval for Phase 2.** Each phase below is a separate go/no-go checkpoint; nothing in a later phase starts until the current one is reviewed and approved.

## Decisions already made (2026-07-27)

| Decision | Choice |
|---|---|
| Frontend framework | **Next.js (React + TypeScript)**, App Router |
| Backend purpose | **Live data-engineering demo** — a real API + database proving the skills the case studies describe, not just a contact form |
| Hosting/budget | **Free-tier only** — no recurring cost |
| Content cleanup | Done (see [CLEANUP_LOG.md](./CLEANUP_LOG.md)) |
| Positioning | **One portfolio, three role lenses** — Software Engineer (SDE), Data Engineer, AI Engineer. Not three separate sites; one codebase that reads as strong evidence for all three depending on what a visitor is scanning for. |

## Why this stack

- **Next.js + TypeScript**: the most recognized full-stack React framework in the current job market; App Router gives static generation for case-study pages (fast, SEO-friendly) *and* API route handlers for the live-demo backend in one codebase — no separate backend repo to stand up for a portfolio.
- **Tailwind CSS**, seeded from the *existing* design tokens (Fraunces/Inter fonts, the light/dark color variables already in `css/styles.css`) — visual identity carries over, the maintainability problem (40 pages of hand-copied boilerplate, two divergent JS bundles) goes away.
- **A typed content layer** (case studies as data, not hand-written HTML) — replaces the copy-paste-per-project pattern that caused the JS-bundle-mismatch bug found in the site audit, and is what makes role-tagging/filtering (below) possible at all.
- **Postgres (Neon, free tier) + a scheduled Python ingestion job (GitHub Actions cron)** for the live demo.
- **Vercel** for hosting the Next.js app + API routes, free hobby tier.

## Versatility strategy — SDE / Data Engineer / AI Engineer

The stack choice itself is half the proof: a TypeScript/React frontend (SDE), a Python pipeline writing to Postgres (Data Engineer), and an LLM-powered feature on top (AI Engineer) — in one deployed, tested, CI/CD'd codebase. On top of that, five concrete moves:

1. **Role tags on every project, filterable on the projects page.** Each case study gets `roles: ("data-engineering" | "ai-ml" | "backend-systems")[]` in its content record. The projects page gets a filter bar instead of one flat list, so a recruiter scanning for "AI Engineer" sees Sage (RAG + LangGraph + prompt-injection defense) and PodcastIQ (multi-agent + knowledge graph) surface first, while one scanning for "Data Engineer" sees Seattle Pet ETL / NYPD Crime / Food Inspection first. Same 10-12 projects, re-sliced per visitor instead of one generic order.
2. **Hero rotator already exists — extend it.** `index.html`'s `role-cycle` element already auto-rotates a single role title; expand it to cycle "Data Engineer · AI Systems Builder · Software Engineer" so the very first thing a visitor reads signals all three without picking a lane.
3. **Skills page restructured into role-legible buckets** instead of one undifferentiated grid: Languages & Fundamentals (Python, SQL, Java, DSA) · Data Engineering (Spark, Kafka, Airflow, dbt, Snowflake, Databricks) · Cloud & Infra (Azure, AWS, Docker, CI/CD, Terraform) · AI/ML & LLM Systems (RAG, LangGraph, vector DBs, agents, eval) · Software Engineering (API design, testing, system design). A recruiter can scan straight to their bucket.
4. **The Phase 5 live demo is deliberately a triple-threat artifact, not just an ETL dashboard** — see the reframed Phase 5 below. It's the single most valuable piece for this goal: one live thing that is simultaneously a data pipeline, an AI feature, and a properly engineered service.
5. **Per-project "Skills demonstrated" tags** on each case-study page itself (small chip row, e.g. Sage → `AI/ML` `Security` `Backend`), so the role-relevance is visible even to someone who lands on a project page directly from a shared link, not just from the filtered index.

One thing worth flagging given this new direction: two of the pages deleted in the cleanup pass — `courtvision.html` (3-agent Gemini system, A2A hand-off, live simulator) and `apple-heart-id.html` — were framed as PM/UX case studies but had real AI-engineering substance (multi-agent orchestration, grounding, structured-output design). They're gone from the working tree but fully recoverable from git history (`git show 7549fa4:projects/courtvision.html`, the commit right before the cleanup) if you'd rather rewrite one as a proper AI-engineer case study than build something from scratch. Not doing anything with this unless you want to — just noting it while it's fresh.

## Phase plan

### Phase 0 — Cleanup (✅ done)
Deleted the 34 unlinked PM/UX pages (32 removed, 2 PRDs kept and linked), removed 68 orphaned assets. See [CLEANUP_LOG.md](./CLEANUP_LOG.md). Committed as `f61c4b7`.

### Phase 1 — Scaffolding (✅ done, on branch `rewrite/nextjs`)
- Next.js 16 + TypeScript + Tailwind CSS 4 in `web/`, current static site at the repo root untouched.
- Design tokens (colors, fonts, radii, shadow, light/dark theme) ported from `css/styles.css` into `web/src/app/globals.css` via Tailwind's `@theme inline`.
- Working `SiteHeader`/`SiteFooter`/`ThemeToggle`, one stub page per nav route so the whole nav is clickable, `GET /api/health`.
- Drizzle ORM + Neon driver wired (unused until Phase 5, safe with no `DATABASE_URL` set), Python `pipeline/ingest.py` skeleton + a manually-triggered GitHub Actions workflow.
- CI (`.github/workflows/web-ci.yml`): lint + typecheck + build, verified green locally.
- Not done yet, needs you: creating the actual Neon + Vercel accounts and connecting them (I can't create third-party accounts) — see [SETUP.md](./SETUP.md). Not blocking further phases.
- Full detail: [SETUP.md](./SETUP.md).

### Phase 2 — Home page rebuilt, in progress
Decided while reviewing the Phase 1 shell against the live site's hero:
- **About and Story pages removed entirely** (not just deprioritized) — judged not to add value for SDE/DE/AI Engineer readers. Nav trimmed from 10 to 8 links.
- **Font changed completely**: dropped Fraunces (decorative serif) for Space Grotesk (display) + Inter (body) — reads more professional/technical, still a distinct display/body pairing rather than one flat font.
- **Hero rebuilt**: no more "DATA ENGINEER" eyebrow tag; one-liner tagline broadened to "I engineer data pipelines, backend systems, and AI features that ship to production."; role-rotator expanded to Software Engineer / Data Engineer / AI Engineer / Forward Deployed Engineer / Analytics Engineer, rotating slowly (3.2s); LinkedIn/GitHub/Email/Call collapsed from labeled buttons into a small icon row (LinkedIn and GitHub use their actual logo marks), leaving "Download Resume" as the one primary button.
- **Top bar redesigned**: minimal wordmark + hamburger opening a full-screen slide-out panel with large nav links, instead of a horizontal link row. Keyboard-accessible (Escape closes, focus moves to the close button, body scroll locked while open).
- **Impact section rebuilt** as a role-relevant metric grid: same six real numbers as the live site, relabeled so they read as evidence across all three lenses (e.g. "DE tools mastered" → "Engineering tools mastered") rather than DE-only framing. No new/invented metrics — only honest relabeling of existing, resume-backed numbers.
- **Whole-site copy rule adopted**: no em dashes anywhere in site-facing text, written dash-free from the start rather than edited after.
- Still to port: Experience, Education, Skills, Awards, Projects, Gallery, Contact (currently placeholders).

### Phase 3 — Case-study content model + role tagging + skills restructuring
- Build one shared `<CaseStudy>` template and move the 10 flagship DE projects + `sage-prd`/`podcastiq-prd` into typed content files, each with a `roles[]` field (versatility move #1) and a "Skills demonstrated" chip row (move #5).
- Build the filterable projects page.
- Restructure the Skills page into the five role-legible buckets (move #3).
- This also fixes the audit's JS-bundle bug at the root — one template, that class of bug can't happen again.

### Phase 4 — Interactions, animation, accessibility fixes
- Re-implement theme toggle, scroll reveals, counters, hero animation with React-idiomatic libraries (Framer Motion; keep Lenis for smooth scroll).
- Fix the accessibility gaps found in the audit: keyboard-operable gallery lightbox, Space-key support on cards, contrast pass on muted text colors.

### Phase 5 — Live demo: one pipeline, three proofs (the actual "backend")
Reframed from a single-purpose ETL dashboard into a deliberately triple-threat build:
- **Data engineer layer**: scheduled Python job (GitHub Actions cron) ingests a public dataset, transforms it, loads into Postgres (Neon).
- **AI engineer layer**: an LLM feature on top of the data — e.g. natural-language question → safe parameterized query → answer, or an agent that summarizes anomalies in the latest load. (Deliberately not a free-text SQL box exposed to the public internet — that's a real injection/DoS risk. Any NL-to-query layer ships as a fixed, whitelisted query set, never arbitrary generated SQL executed directly.)
- **SDE layer**: a typed REST API with OpenAPI docs, unit + integration tests, CI gate before deploy, and a short system-design note (schema, request flow, failure modes) linked from the demo page — the part that signals "production engineer," not just "it works."
- Dashboard page renders the live data + the AI feature + a "how this is built" panel linking the API docs and the design note — so all three role lenses get their proof from the same artifact.

Candidate datasets (pick one that echoes an existing case study so the demo and the write-up reinforce each other): NYC food inspections, NYPD crime, Seattle pet licenses.

### Phase 6 — SEO, performance, cutover prep
- Next.js Metadata API for titles/descriptions/OG images (carry forward the JSON-LD from `index.html`), auto-generated sitemap.
- Lighthouse pass; fix anything the new stack regresses versus the current static baseline.
- Redirect map from old URLs (`/projects/sage.html`) to new ones (`/projects/sage`) so no existing inbound link breaks.

### Phase 7 — Cutover & decommission
- DNS/domain switch from GitHub Pages to Vercel (or keep GitHub Pages via static export — revisit at this point, since GitHub Pages can't host Phase 5's API routes at all).
- Once the new site is verified live and stable, retire the old static files.

## Open questions to resolve before later phases
- Which public dataset for the Phase 5 demo?
- Domain: keep the current GitHub Pages URL pattern, or move to a custom domain now that a real backend needs a real host?
- Resurrect a git-recoverable AI-flavored case study (courtvision/apple-heart-id) for the AI Engineer lens, or leave that lens carried entirely by Sage + PodcastIQ + the Phase 5 demo?

## Next step
Confirm Phase 1 (scaffolding) to begin, or flag anything above you want changed first.
