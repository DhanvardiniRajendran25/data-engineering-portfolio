# Cleanup Log — 2026-07-27

Housekeeping pass on the current static site, done ahead of the full stack rewrite (see [MIGRATION_PLAN.md](./MIGRATION_PLAN.md)). All changes are in git history and fully reversible via `git revert`/`git log -- <path>`.

## Why

`projects/` contained two unrelated sets of pages: 10 real data-engineering case studies (linked from `projects.html`) and 34 product-management/UX case studies that were never linked from `projects.html`, `index.html`, or the nav — only reachable by clicking through an internal "next project" carousel starting at `sage.html`, or by guessing a direct URL. `wilson.html` had zero inbound links at all, even from the carousel. This split had no discovery path for visitors or search engines and made the site's "10 data engineering projects" framing inaccurate relative to what was actually on disk.

## What changed

### Deleted: 32 unlinked PM/UX case study pages
adobe-figma, amazon, apple-heart-id (+ apple-heart-id-prd), boeing, courtvision (+ courtvision-prd), evenza, glp1, hm, husky-happs, ikea, inclusived (+ inclusived-prd), ing, lyft, mbta, move-in, netflix, recruiter-app, resmail, salesforce, spacex, spotify, student-housing, target, toyota, tripmate, tsmc, twitter, wilson, zara

### Kept and re-linked: sage-prd.html, podcastiq-prd.html
These two PRDs existed and already linked *back* to their parent case study, but `sage.html`/`podcastiq.html` never linked *forward* to them. Added a "Read the full PRD" button to each page's `cs-hero-actions` block:
- `projects/sage.html` → `projects/sage-prd.html`
- `projects/podcastiq.html` → `projects/podcastiq-prd.html`

### Deleted: 55 assets orphaned by the page deletion
Hero images (`assets/projects/*.webp/.jpeg`), client logos (`assets/project_logos/*.webp`), and PM deck/wireframe PDFs (`assets/projects_attachments/*.pdf`) that were referenced only by the 32 deleted pages. Verified via cross-reference against every remaining HTML/CSS file before deletion — none are used elsewhere.

### Deleted: 13 assets that were already orphaned before this pass
Leftover `.svg`/duplicate-format hero images and logos from an earlier asset-format migration (e.g. `food-inspection-hero.svg` superseded by `food-inspection-hero.jpg`, which is the one actually in use). Found during the earlier full-site audit, removed now as part of the same cleanup.

## Verified after the change
- No remaining HTML/CSS file references any deleted page or asset (grepped exhaustively).
- `projects/` now contains exactly the 12 files that matter: the 10 flagship case studies + the 2 kept PRDs.
- Root nav, `projects.html`, and all back-links were already pointing only at the 10 flagship pages, so no other file needed editing besides the two PRD-link additions above.

## Known issue carried forward, not fixed in this pass
All 10 flagship case-study pages load `js/main.js`, but their markup (`#csProgress`, `.cs-reveal`) is only wired up by `js/project-page.js` — so the scroll-progress bar and reveal animations are currently inert on those pages. Not touched here because the whole JS layer is being replaced in the Next.js rewrite; fixing it on the static site would be throwaway work. Tracked in the migration plan as a "must not regress" item for the rewrite.
