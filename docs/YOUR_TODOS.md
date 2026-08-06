# Your To-Dos — items only you can provide

Things blocked on information, credentials, or decisions that are yours. Everything here is deliberately *not* blocking the build; the site is being built so these can be dropped in later.


## Content you need to write or confirm

For each featured project, the case study needs details only you know. See [PROJECT_INVENTORY.md](./PROJECT_INVENTORY.md) for the set of 9.

- [ ] **Constraints** per project: SLA, data volume, budget, deadline, team size, org constraints.
- [ ] **2-4 real decisions** per project: what you considered, what you chose, why, and what it cost you. This is the highest-signal content on the whole site.
- [ ] **Outcome metrics** per project: runtime, records processed, cost, error rate, time saved. Real numbers only.
- [ ] **Confirm the homepage impact numbers** are still accurate: 8+ pipelines, 5B+ records, 3+ cloud platforms, 10+ tools, 3+ years, 70+ students.
- [ ] **About page**: your own voice for the opening paragraph.

## Images — exact specs

You said you will supply real images. Two separate kinds, both supported in code already.

### A. Cover images (one per project, shows on `/work` and at the top of the project page)

| | |
|---|---|
| **Still needed** | 6 of 9 — `imdb-analytics`, `nypd-crime`, `food-inspection`, `reflexai`, `docuparse`, `meta-tradepulse` |
| **Already in** | `podcastiq`, `sage`, `courtvision` |
| **Aspect** | **3:2** (matches the three already supplied, so the layout is set to 3:2) |
| **Min width** | 1600px |
| **Format** | PNG, JPG, or WebP |
| **Name** | `<slug>.png` |
| **Drop into** | `web/public/projects/` |

### B. In-page images (multiple per project, shown inside the project page)

Dashboards, schemas, architecture diagrams, app screenshots. This is where real artefacts matter most.

| | |
|---|---|
| **Aspect** | Any; they render full width at natural ratio |
| **Min width** | 1600px |
| **Drop into** | `web/public/projects/<slug>/` |
| **Also send** | A one-line caption for each. An uncaptioned screenshot makes the reader guess what they are looking at. |

Just drop files in and tell me they are there. I will wire up the paths and captions.

### Note on consistency

Whatever the final mix, all 9 covers should read as one visual language. Three AI-generated concept covers plus six dashboard screenshots will look like two different sites. If most end up as real screenshots, the three existing covers may be worth regenerating to match, or swapping for real artefacts.

## Quick data fixes

- [ ] **Project years.** Only NYPD Crime had a date in the old source (2024). The other 8 are `null` and render as a placeholder in the Work table. Deliberately not guessed, since an invented date on a portfolio is worse than a blank one. Set them in `web/src/content/work/meta.ts`.
- [ ] **Context field.** Currently set to "Northeastern" for most and "Personal" for ReflexAI, inferred rather than confirmed. Correct any that are wrong.
- [ ] **Hero images.** Not yet migrated from the old site into the new app.

## Decisions still open

- [ ] **Phase F dataset**: NYC food inspections, NYPD crime, or Seattle pet licenses for the live pipeline. Picking one that echoes an existing case study makes the two reinforce each other.
- [ ] **Domain**: keep `dhanvardinirajendran25.github.io`, or move to a custom domain. A custom domain is worth it if this is going on a resume.
- [ ] **Archive rows**: whether `seattle-pet-etl` and `mookit` appear as unwritten rows in the Work table (both have repos) or are left out entirely.
- [ ] **`multiagent-codegen`**: no repo, no live link. Drop it, or is there code somewhere?

## Accounts and credentials (Phase F, later)

- [ ] Neon Postgres account (free tier)
- [ ] Vercel account for deployment
- [ ] Confirm GitHub Actions is enabled on the repo for the scheduled ingestion job
