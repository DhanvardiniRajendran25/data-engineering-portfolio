# Phase C + D — Exact build spec and required materials

Written so you can see precisely what will exist before it is built, and prepare the materials it needs.

**Terminology:** these are **projects**, not case studies. Renamed throughout the code (`ProjectMeta`, `PROJECTS`, `getProject`).

**Correction to the earlier plan:** Phase C was specced as a dense text archive table. That was based on research favouring engineer-flavoured indexes, but it is plain and unreadable at a glance, and it is not what you want. Phase C is now **image-led**. The table idea is dropped.

---

## Phase C — `/work`, the project index

### What it is
A visual index of the 9 projects. Every project has an image. Hovering reveals a few extra details. Clicking opens its dedicated page.

Explicitly **not** a uniform grid of boxed cards.

### C1. Project index layout
- [ ] Image-led rows, full outer-rail width (1600px), one project per row
- [ ] Always visible per row: image, title, one-liner, role tags
- [ ] Revealed on hover/focus: stack chips, key metric, "View project" affordance
- [ ] Whole row is one link to `/work/<slug>`
- [ ] Image scale/reveal animation via framer-motion, disabled under `prefers-reduced-motion`
- [ ] Keyboard: focus reveals the same detail hover does (never hover-only)

### C2. Role filter
- [ ] Chips: All · Data · AI · Systems, driven by real `roles[]` data
- [ ] URL state (`/work?role=ai`) so filtered views are shareable and back/forward works
- [ ] Result count announced to screen readers
- [ ] Empty state if nothing matches

### C3. Responsive
- [ ] Below `lg`: single column, image above text, details always visible (no hover on touch)
- [ ] Verified at 320 / 768 / 1024 / 1920px

### C4. Homepage "Selected work"
- [ ] The same component, limited to the top 3-4, linking through to `/work`

---

## Phase D — `/work/[slug]`, the dedicated project page

### What it is
One template all 9 projects render through. Consistency here is the thing that prevents the old site's bug where 34 hand-copied pages drifted apart.

### D1. Page structure, top to bottom
- [ ] **Hero**: title, one-liner, year, context, role tags, stack chips, repo + live buttons
- [ ] **Cover image**, full rail width
- [ ] **At a glance**: 3-4 key metrics as a compact strip (the numbers a skimmer needs)
- [ ] **The problem** — prose, reading measure
- [ ] **Constraints** — what you were working within
- [ ] **Architecture** — diagram, full rail width
- [ ] **Decisions** — 2-4 blocks, each: options considered / chosen / why / what it cost
- [ ] **Selected code** — 1-2 short snippets, syntax highlighted
- [ ] **Outcome** — metrics
- [ ] **What I would do differently** — short
- [ ] **Prev/next project** navigation

### D2. Architecture diagram
- [ ] Data-driven from a `nodes` + `edges` structure in `meta.ts`, not hand-drawn per project
- [ ] Hover/focus a node reveals its tech, throughput, and failure mode
- [ ] Keyboard navigable between nodes
- [ ] Static readable fallback under reduced motion
- [ ] Vertical stack on mobile

*Fallback:* if supplying diagram data for 9 projects is too much, a static image per project works and the interactive version can come later.

### D3. Supporting components
- [ ] Metric strip
- [ ] Decision block
- [ ] Code block with language label
- [ ] Image/figure with caption

---

## What I need from you

### 1. Images — one per project, required

This is the main blocker. Nine images, one per project.

| Need | Detail |
|---|---|
| **Count** | 9, one per project (list below) |
| **Aspect** | 16:10 or 3:2 landscape, consistent across all nine |
| **Min size** | 1600px wide |
| **Format** | PNG, JPG, or WebP. I will convert and optimise. |
| **Naming** | `<slug>.<ext>`, e.g. `podcastiq.png` |
| **Where** | Drop into `web/public/projects/` |

Slugs: `podcastiq`, `imdb-analytics`, `nypd-crime`, `food-inspection`, `sage`, `courtvision`, `reflexai`, `docuparse`, `meta-tradepulse`

**What makes a good image here:** a real screenshot of the thing. A Power BI or Tableau dashboard, the Snowflake schema, an architecture diagram, the running app. Real artefacts read as credible; generic stock illustration reads as filler. Dashboards you have already built are ideal.

If a project has no visual, say so and I will generate a clean typographic cover from its title and stack, consistent with the site design.

### 2. Per-project details

For each of the 9, the smallest useful version:

- **Year** — currently blank for 8 of 9
- **Context** — I guessed "Northeastern" for most, "Personal" for ReflexAI. Correct any wrong ones.
- **2-3 key metrics** — the numbers for the "at a glance" strip. Some already exist in your descriptions (91M rows, 99.56% success, 100% injection block rate). I need them for the rest.
- **1-2 sentence hover summary** — or I derive it from the existing one-liner.

### 3. For the dedicated pages (Phase E, later)

Not needed to start C or D:
- Constraints, decisions, outcomes per project
- Architecture node/edge data, or a static diagram image
- Code snippets worth showing

---

## Suggested order

1. You pick the index layout (see the question accompanying this doc)
2. You supply the 9 images
3. I build Phase C and you review the real thing
4. I build Phase D with one project fully populated as a reference
5. You supply details for the rest

**Phase C can start before the images arrive.** I will use neutral placeholders so you can judge the layout, then swap in the real images.
