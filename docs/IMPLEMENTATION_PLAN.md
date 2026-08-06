# Implementation Plan — Task Breakdown by Phase

Companion to [DESIGN_PLAN.md](./DESIGN_PLAN.md) (what and why) and [QUALITY_CHECKLIST.md](./QUALITY_CHECKLIST.md) (hardening).

Each phase is a review checkpoint. Nothing in a later phase starts until the current one is approved.

**Legend:** `[ ]` not started · `[~]` in progress · `[x]` done

---

## Phase A — Route consolidation (8 pages → 4) ✅ DONE

**Goal:** collapse the nav from eight routes to Home / Work / About / Contact.
**Destructive:** yes. Deleted 6 route files. All recoverable from git.
**Outcome:** build emits exactly 4 pages; all return 200; deleted routes 404.

### A1. Create the new routes
- [x] `src/app/work/page.tsx` — placeholder, real index lands in Phase C
- [x] `src/app/about/page.tsx` — placeholder, real content lands in Phase E
- [x] Both export `metadata` (title + description), picked up by the root layout's `%s · Dhanvardini Rajendran` template. Slightly ahead of Phase G scope, but creating a new page with no title would have been an obvious miss.

### A2. Delete the absorbed routes
- [x] Delete `src/app/experience/` → folds into About
- [x] Delete `src/app/education/` → folds into About
- [x] Delete `src/app/skills/` → folds into About
- [x] Delete `src/app/awards/` → folds into About
- [x] Delete `src/app/projects/` → replaced by `/work`
- [x] Delete `src/app/gallery/` → dropped entirely

All six were single-file placeholders; no written content was lost.

### A3. Update navigation
- [x] `site-header.tsx` — `NAV_LINKS` from 8 entries to 4 (Home, Work, About, Contact)
- [x] Desktop pill rebalanced: per-link padding `px-3` → `px-4`, so a 4-item pill does not look undersized in the 1600px rail
- [x] Mobile slide-out menu verified — 4 large links, unchanged treatment

### A4. Record the redirect map (do not implement yet)
The current **live static site** has real URLs that must not 404 after cutover. Implementation belongs in Phase G, but the mapping is decided here:

| Old (live static) | New |
|---|---|
| `/projects.html` | `/work` |
| `/projects/<slug>.html` | `/work/<slug>` |
| `/experience.html` | `/about#experience` |
| `/education.html` | `/about#education` |
| `/skills.html` | `/about#skills` |
| `/awards.html` | `/about#awards` |
| `/about.html`, `/story.html` | `/about` |
| `/gallery.html` | `/` (no equivalent; Gallery dropped) |
| `/contact.html` | `/contact` |

- [x] Saved as [REDIRECT_MAP.md](./REDIRECT_MAP.md), expanded with case-study slugs, anchor-target caveats, and a Phase G verification checklist

**Note:** no redirects are needed *within* the new app for `/projects` → `/work`, because the new app has never been deployed. Only the old static URLs matter.

### A5. Verify
- [x] `npm run lint` and `tsc --noEmit` clean
- [x] `npm run build` succeeds; route list is exactly `/`, `/about`, `/contact`, `/work` + `/_not-found`, `/api/health`, `/icon.svg`
- [x] All 4 nav routes return 200
- [x] All 6 deleted routes return 404 (correct — never publicly deployed, so no redirect owed)
- [x] No dead references to deleted paths anywhere in `src/`

**Acceptance met.** Nav shows 4 items, all resolve, build clean, redirect map committed.

---

## Phase B — Foundations: width system + content model ✅ DONE

**Goal:** the two-tier width system, and case studies as typed data instead of hand-written pages.
**Why before the Work page:** the index in Phase C reads from this model. Building it first prevents a rewrite.

### B1. Two-tier width tokens
- [x] Add `--measure: 68ch` (prose) alongside the existing `--container-page: 1600px` (outer rail)
- [x] Expose as Tailwind utilities (`max-w-measure`, existing `max-w-page`)
- [x] Apply `max-w-measure` to all body prose; keep `max-w-page` for nav, tables, diagrams, proof strip
- [x] Document the rule in `globals.css` so it does not drift

### B2. Spacing scale
- [x] Define standard section padding tokens rather than per-component `py-*` values
- [x] Apply to Hero, Impact, and the new placeholders

### B3. Content model
- [x] Define the `CaseStudyMeta` type in `src/content/work/types.ts`:
  ```ts
  slug, title, year (nullable), context, oneLiner,
  roles[], stack[], repo?, live?, hasWriteUp
  ```
  Narrower than originally sketched. The narrative fields (abstract, problem,
  constraints, decisions, code, outcome, retrospective) are **prose**, so they
  live in the MDX body rather than as string fields in a type.
- [x] **Storage decided, but not as originally written.** The plan said "MDX with
  typed frontmatter"; the bundled Next.js docs confirm `@next/mdx` does *not*
  support YAML frontmatter by default. More importantly, `tsc` does not
  typecheck values inside `.mdx`, so frontmatter would have had no real type
  safety. Final design: **metadata in typed `.ts` (`meta.ts`), prose in `.mdx`
  (`bodies/<slug>.mdx`)**, joined by slug. Metadata is genuinely validated by
  the compiler; prose stays comfortable to write.
- [x] Build-time validation in `src/content/work/index.ts`: duplicate slugs,
  empty required fields, and meta↔body mismatches in either direction all
  throw during static generation
- [x] `next.config.ts` + `mdx-components.tsx` wired up; MDX elements map onto
  the site's type system so `.mdx` files carry no Tailwind classes

### B4. Migrate the featured projects as data
Set and rationale in [PROJECT_INVENTORY.md](./PROJECT_INVENTORY.md). Source for existing copy: the old static pages on `main` (`projects/*.html`).

Featured set of 9, in display order:
- [x] 1. podcastiq (AI · Data) — leads the set. Repo link pending, see inventory open item.
- [x] 2. imdb-analytics · 3. nypd-crime · 4. food-inspection (Data)
- [x] 5. sage (AI · Systems, live deployment)
- [x] 6. courtvision (AI) — recover copy from `git show 7549fa4:projects/courtvision.html`
- [x] 7. reflexai (AI · Data) — no existing page, written from scratch in Phase E
- [x] 8. docuparse (AI · Systems)
- [x] 9. meta-tradepulse (Data) — repo is `Quantitative_Trading_Analysis_on_META_Stock`
- [x] **Repo URL attached to every record that has one** — 7 of 9. Sage has no repo (it is live instead); PodcastIQ's is omitted pending your own, per [YOUR_TODOS.md](./YOUR_TODOS.md).
- [x] MDX body skeletons generated for all 9, pre-structured with the Phase D section order so Phase E is fill-in-the-blank
- [ ] **Not done:** carry over `sage-prd`, `podcastiq-prd`, `courtvision-prd` as linked documents
- [ ] **Not done:** migrate hero images into `public/`, referenced by slug
- [ ] **Not done:** decide archive-row treatment for `seattle-pet-etl` and `mookit`; `multiagent-codegen` has no repo at all. Listed in [YOUR_TODOS.md](./YOUR_TODOS.md).
- [ ] **Not done:** `year` is `null` for 8 of 9 (only nypd-crime had a date in the old source). Deliberately not guessed. Renders as a placeholder until confirmed.

**Migration note:** `oneLiner` values are carried over verbatim from the old meta descriptions. Rewriting to the new structure is Phase E.

### B5. Verify
- [x] Build fails loudly on a missing required field, duplicate slug, or meta↔body mismatch — **proven**, not assumed: deliberately broke a slug link and confirmed the build failed with both error directions reported, then restored
- [x] All **9** records load, typecheck, and render on `/work` in the intended order with PodcastIQ leading
- [x] All 7 repo links and the Sage live link render correctly

---

## Phase C — Work page (signature #1: the archive table)

**Goal:** the dense, scannable index. Full outer-rail width.

### C1. Table
- [ ] Columns: Year · Project · Context · Stack · Role tags
- [ ] Real semantic `<table>` (correct for tabular data, and better for screen readers than divs)
- [ ] Monospace for year/stack/tags; Playfair for project title
- [ ] Row links to `/work/<slug>`, entire row clickable, keyboard accessible

### C2. Filter
- [ ] Filter chips: All · Systems · Data · AI, driven by the real `roles[]` data
- [ ] Reflect state in the URL (`/work?role=ai`) so filtered views are shareable and back/forward works
- [ ] Announce result count to screen readers (`aria-live`)
- [ ] Empty state if a filter matches nothing

### C3. Responsive
- [ ] Below `lg`, collapse the table into stacked rows (tables do not shrink gracefully)
- [ ] Verify at 320px, 768px, 1024px, 1920px

### C4. Verify
- [ ] Keyboard: tab through rows, filter chips operable via keyboard
- [ ] All 10 rows present and linking correctly

---

## Phase D — Case study template (signature #2: explorable diagrams)

**Goal:** one template every case study renders through, with the interactive architecture diagram.

### D1. Template
- [ ] Route `src/app/work/[slug]/page.tsx` with `generateStaticParams`
- [ ] Section order per DESIGN_PLAN §5: abstract → context/constraints → architecture → decisions → code → outcome → retrospective
- [ ] Prose at `max-w-measure`; diagrams and code at wider rail
- [ ] `generateMetadata` per case study (title, description, OG image)

### D2. Explorable diagram
- [ ] Data-driven diagram component: nodes + edges from case-study data, not hand-drawn SVG per project
- [ ] Hover/focus a node reveals throughput, tech, failure mode
- [ ] Keyboard navigable between nodes; not hover-only
- [ ] Static, readable fallback under `prefers-reduced-motion`
- [ ] Sensible mobile rendering (likely vertical stack rather than horizontal flow)

### D3. Supporting components
- [ ] Code snippet block with syntax highlighting and language label
- [ ] Decision block (`options considered → chosen → why → cost`)
- [ ] Prev/next case study navigation

### D4. Verify
- [ ] All 10 pages build statically
- [ ] Diagram works with keyboard and with reduced motion

---

## Phase E — Writing (the highest-value phase)

**Goal:** the actual content. Per DESIGN_PLAN §0, this is where the portfolio is won or lost.

### E1. Per case study (300-500 words each)
Target revised down from 600-1200: with the repo linked, the repo carries the "what" and the write-up only has to carry the "why." Seven featured projects at this length is roughly 2,500-3,500 words total.

- [ ] Abstract: problem + outcome + numbers, above the fold
- [ ] Context and **constraints** (SLA, budget, data volume, org constraints)
- [ ] Architecture described well enough to drive the diagram data
- [ ] **2-4 named decisions**, each with options considered, choice, rationale, and cost — the highest-signal section
- [ ] 1-2 surgical code snippets
- [ ] Concrete outcome metrics
- [ ] Short retrospective

### E2. About page
- [ ] Opening in first-person voice
- [ ] Experience timeline (Optum roles, Northeastern, teaching) framed as outcomes not duties
- [ ] Skills bucketed by discipline — no proficiency bars
- [ ] Education and awards, compact

### E3. Homepage additions
- [ ] Selected Work section (4-5 curated, with role tags as labels)
- [ ] Closing CTA
- [ ] Contact page with copy-to-clipboard email

**Open question:** how many case studies get full treatment. See §"Scope question" below.

---

## Phase F — Live system panel (signature #3)

**Goal:** one honest widget fed by real infrastructure.

### F1. Data pipeline
- [ ] Choose the public dataset (candidates: NYC food inspections, NYPD crime, Seattle pet licenses — reusing one that echoes an existing case study)
- [ ] Neon Postgres (free tier); schema + migrations
- [ ] Python ingestion job (ingest → transform → load)
- [ ] GitHub Actions cron schedule
- [ ] Failure handling and alerting on a failed run

### F2. API
- [ ] Typed route handler, fixed whitelisted queries only (**never** free-text SQL from the client)
- [ ] Caching/revalidation so the homepage is not hitting the DB per visit
- [ ] Rate limiting
- [ ] Graceful degradation: if the API is down, the panel hides or shows last-known state rather than breaking the homepage

### F3. UI
- [ ] Compact panel: last refresh timestamp, rows processed, one small real chart
- [ ] Loading, empty, and error states — all three
- [ ] Link to the GitHub Actions run log (transparency is the point)

### F4. Secrets
- [ ] `DATABASE_URL` server-side only; verify it never reaches the client bundle
- [ ] Separate credentials for preview vs. production

---

## Phase G — Hardening and cutover

Driven by [QUALITY_CHECKLIST.md](./QUALITY_CHECKLIST.md).

### G1. SEO
- [ ] Per-page `metadata` on all 4 pages + every case study
- [ ] `sitemap.ts` and `robots.ts`
- [ ] JSON-LD `Person` schema (carry from the old homepage)
- [ ] OG images (static or generated)

### G2. Errors
- [ ] Custom `not-found.tsx` matching the design
- [ ] `error.tsx` boundary
- [ ] Verify JS-disabled still renders readable content

### G3. Accessibility
- [ ] Contrast audit of actual tokens, both themes (`--ink-faint` is the known risk)
- [ ] Screen reader pass
- [ ] `forced-colors` mode (the design leans on low-opacity borders that can flatten)
- [ ] Skip-to-content link
- [ ] Heading hierarchy: one `h1` per page

### G4. Performance
- [ ] Lighthouse on every page type
- [ ] Test on a real mid-tier Android, not just a dev machine
- [ ] Bundle size review

### G5. Cutover
- [ ] Implement the Phase A4 redirect map
- [ ] Vercel deploy; confirm API routes work (GitHub Pages cannot host them)
- [ ] Domain switch
- [ ] Verify old inbound links resolve
- [ ] Retire the old static files only after the new site is confirmed stable

---

## Scope — resolved (2026-08-02)

- **9 featured projects**, listed in display order in [PROJECT_INVENTORY.md](./PROJECT_INVENTORY.md).
- **300-500 words each**, not 600-1200. The repo carries the "what"; the prose carries the "why."
- **Every featured project links its repo** where one exists. The old site linked almost none, which left the work unverifiable.
- Not featured: `seattle-pet-etl` and `mookit` (repos exist, available as archive rows), `multiagent-codegen` (no repo).

Total writing load: roughly 2,700-4,500 words across nine projects, plus the About page.
