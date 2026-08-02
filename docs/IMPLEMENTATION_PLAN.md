# Implementation Plan — Task Breakdown by Phase

Companion to [DESIGN_PLAN.md](./DESIGN_PLAN.md) (what and why) and [QUALITY_CHECKLIST.md](./QUALITY_CHECKLIST.md) (hardening).

Each phase is a review checkpoint. Nothing in a later phase starts until the current one is approved.

**Legend:** `[ ]` not started · `[~]` in progress · `[x]` done

---

## Phase A — Route consolidation (8 pages → 4)

**Goal:** collapse the nav from eight routes to Home / Work / About / Contact.
**Destructive:** yes. Deletes 5 route files. All recoverable from git.
**Estimated size:** small, mechanical. No visual design work.

### A1. Create the new routes
- [ ] `src/app/work/page.tsx` — placeholder, real index lands in Phase C
- [ ] `src/app/about/page.tsx` — placeholder, real content lands in Phase E

### A2. Delete the absorbed routes
- [ ] Delete `src/app/experience/` → folds into About
- [ ] Delete `src/app/education/` → folds into About
- [ ] Delete `src/app/skills/` → folds into About
- [ ] Delete `src/app/awards/` → folds into About
- [ ] Delete `src/app/projects/` → replaced by `/work`
- [ ] Delete `src/app/gallery/` → dropped entirely

### A3. Update navigation
- [ ] `site-header.tsx` — `NAV_LINKS` from 8 entries to 4 (Home, Work, About, Contact)
- [ ] Verify the desktop pill still balances visually with only 4 items (it was sized for 8; may want slightly more horizontal padding)
- [ ] Verify the mobile slide-out menu still looks intentional with 4 large links rather than 8

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

- [ ] Save this table in the repo so it survives to Phase G

**Note:** no redirects are needed *within* the new app for `/projects` → `/work`, because the new app has never been deployed. Only the old static URLs matter.

### A5. Verify
- [ ] `npm run lint` and `tsc --noEmit` clean
- [ ] `npm run build` succeeds and the route list shows exactly 4 pages + `/api/health` + not-found
- [ ] Every nav link returns 200
- [ ] No dead imports left behind (`page-placeholder.tsx` still used by Work/About placeholders)

**Acceptance:** nav shows 4 items, all resolve, build is clean, redirect map is committed.

---

## Phase B — Foundations: width system + content model

**Goal:** the two-tier width system, and case studies as typed data instead of hand-written pages.
**Why before the Work page:** the index in Phase C reads from this model. Building it first prevents a rewrite.

### B1. Two-tier width tokens
- [ ] Add `--measure: 68ch` (prose) alongside the existing `--container-page: 1600px` (outer rail)
- [ ] Expose as Tailwind utilities (`max-w-measure`, existing `max-w-page`)
- [ ] Apply `max-w-measure` to all body prose; keep `max-w-page` for nav, tables, diagrams, proof strip
- [ ] Document the rule in `globals.css` so it does not drift

### B2. Spacing scale
- [ ] Define standard section padding tokens rather than per-component `py-*` values
- [ ] Apply to Hero, Impact, and the new placeholders

### B3. Content model
- [ ] Define the `CaseStudy` TypeScript type:
  ```ts
  slug, title, year, context, oneLiner, roles[], stack[],
  abstract, problem, constraints[], architecture, decisions[],
  codeSnippets[], outcome[], retrospective, links{github?, live?, prd?}
  ```
- [ ] Decide storage format: MDX (rich prose, easy code blocks) vs. typed `.ts` records. **Recommendation: MDX with typed frontmatter** — prose-heavy content is painful in TS string literals, and Phase E is prose-heavy.
- [ ] Build the loader with runtime validation, so a malformed/missing field is a **build-time error**, not a silent broken page

### B4. Migrate the 10 projects as data
Source: the old static pages on `main` (`projects/*.html`).
- [ ] seattle-pet-etl · nypd-crime · imdb-analytics · food-inspection · podcastiq
- [ ] sage · multiagent-codegen · docuparse · meta-tradepulse · mookit
- [ ] Carry over `sage-prd` and `podcastiq-prd` as linked documents
- [ ] Migrate hero images into `public/`, referenced by slug

**Migration note:** this phase moves *existing* copy across verbatim. Rewriting to the new case-study structure is Phase E. Keeping those separate avoids doing structural work and writing work in the same pass.

### B5. Verify
- [ ] Build fails loudly if a case study is missing a required field or references a missing image
- [ ] All 10 records load and typecheck

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

### E1. Per case study (600-1200 words each)
For each of the chosen projects:
- [ ] Abstract: problem + outcome + numbers, above the fold
- [ ] Context and **constraints** (SLA, budget, data volume, org constraints)
- [ ] Architecture described well enough to drive the diagram data
- [ ] **2-4 named decisions**, each with options considered, choice, rationale, and cost
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

## Scope question (Phase E)

Ten case studies at 600-1200 words is roughly 6,000-12,000 words of technical writing. That is the real cost of this project, and it is writing only you can do — the constraints, tradeoffs, and numbers are yours.

Three options:

| Option | Effort | Result |
|---|---|---|
| **All 10 in full** | Highest | Every row is a full case study |
| **4-5 in full, rest as rows** | Moderate | Featured projects go deep; the others stay as archive rows linking to GitHub. This is what leerob.com and paco.me do, and research supports 3-5 deep over 10 shallow. |
| **Rolling** | Lowest upfront | Ship with 2-3 written, add over time |

**Recommendation: 4-5 in full.** Research explicitly favors depth over count, and a table row with a real GitHub link is honest — it does not pretend to be more than it is.
