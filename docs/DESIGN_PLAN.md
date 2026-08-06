# Design Plan — Clean, Minimal, Distinctive Engineering Portfolio

Built on the structural decisions in [MIGRATION_PLAN.md](./MIGRATION_PLAN.md), then revised against a competitive research pass (§12 for sources). Where research contradicted the first draft, the research wins and the change is called out.

Status: **draft for review.** Only the homepage hero/impact section is built.

---

## 0. The finding that matters most

The dominant complaint from engineers reviewing engineer portfolios is **absence of text and judgment**, not absence of polish. From the most-cited HN thread on the subject: *"for many developers, their personal website is the one place where they get to explore their personal taste in web design… This probably explains why the sites are graphic heavy. Putting up text is after all not very challenging to do."*

And on the hiring side: *"Associated blog posts that explain how your code works and why though? I'd put your name to the top of the pile."*

**Applied to this session honestly:** we have spent many rounds on typefaces and background animation and zero rounds on written substance. That is exactly the trap the research describes. The remaining work should be weighted heavily toward *writing* — constraints, tradeoffs, decisions — and lightly toward visual iteration. The design is already good enough; the content is the differentiator.

---

## 1. Positioning

State the **intersection in one sentence**, not three job titles. Research is explicit that role-segmented sites are a mistake: no source supports separate tracks, and splitting forces a recruiter to self-select and halves the evidence they see.

The current hero line already does this correctly: *"I engineer data pipelines, backend systems, and AI features that ship to production."*

**Revision to the earlier decision:** role tags are **evidence labels first, filter second**. On the homepage, tags are quiet monospace labels on each curated project. Filtering UI appears only on the full Work index, where there are enough rows for it to earn its place. This is a refinement of the "role-filterable projects" decision, not a reversal.

---

## 2. Information architecture

Four pages, as decided.

| Page | Purpose | Absorbs |
|---|---|---|
| **Home** | Bio, proof, 4-5 curated case studies | (current homepage) |
| **Work** | Dense archive index of all ~10 case studies | Projects |
| **About** | Story, experience, skills, education, awards | Experience, Education, Skills, Awards |
| **Contact** | Email with copy-to-clipboard, resume, GitHub | Contact |

**Dropped:** Gallery.

---

## 3. Homepage structure

1. **Hero** (exists) — the intersection sentence, resume + socials, photo.
2. **Proof strip** (exists as Impact) — real numbers. Research is emphatic that these must be *outcome* numbers (scale, cost, latency, time saved), never skill levels.
3. **Selected work** (new) — **4-5** curated case studies with role tags as labels. Not all ten. leerob.com carries an entire homepage on curation alone with no project grid at all.
4. **Live system panel** (new, Phase F) — one small, honest widget fed by a real endpoint. Research ranks this highly *provided it is real*: "not fake charts."
5. **Closing CTA** — email with copy-to-clipboard, resume, GitHub.

---

## 4. Work page — REVISED

**Draft said:** numbered editorial index with hover-reveal image previews.

**Research says:** the strongest and safest signature for an engineer is a **dense archive table** (the brittanychiang.com `/archive` pattern), ranked #1 of five candidate signature devices. Hover-reveal image previews are a designer-portfolio device; a table is engineer-flavored, scannable, and scales to 10+ rows without becoming a scroll.

**Revised design** — a real table, monospace metadata columns, full outer-rail width:

```
FILTER   [ All ]  Systems   Data   AI

YEAR   PROJECT              CONTEXT              STACK                    ROLE
2025   Seattle Pet ETL      Personal             Airflow · dbt · Postgres  DATA
2025   PodcastIQ            Personal             Neo4j · LangGraph         AI · DATA
2024   Sage                 Northeastern         RAG · Guardrails          AI · SYSTEMS
```

Dense, sortable, unmistakably an engineer's index. This is signature element #1.

---

## 5. Case study template — REVISED

Research refinements: lead with an abstract *above the fold*, put the architecture diagram immediately after context, and include short code.

1. **One-paragraph abstract** — problem + outcome + numbers, above the fold. Skimmers read only this.
2. **Context & constraints** — business context, users, SLA, budget, data volume, org constraints.
3. **Architecture diagram** — immediately after context. Data-engineering sources are unanimous that the diagram should lead, showing flow source → destination.
4. **Key decisions & tradeoffs** — 2-4 named decisions, each *options considered → chosen → why → what it cost*. Research calls this "the highest-signal section and the most commonly missing."
5. **Selected code** (added) — short surgical snippets: a tricky DAG, a windowing query, a retry/idempotency guard. Not files.
6. **Outcome** — plain metrics.
7. **What I'd do differently.**

**Length: 600-1200 words.** A 30-second skim must still yield the narrative.

Signature element #2 is the **explorable diagram**: hovering a node reveals its throughput, tech, and failure mode. Restrained, framer-motion-friendly, directly on-message for a data engineer.

---

## 6. About page

Four movements in one page: opening in actual first-person voice → experience timeline with outcomes → skills bucketed by discipline → education and recognition.

**No proficiency bars.** From a review of 40+ portfolios: *"percentages or progress bars do not add any value, no one knows what it actually means."* Use years or project counts.

Research note: About is *the one place personality is allowed*. Prose, not bullets.

---

## 7. Contact

Email with **copy-to-clipboard** (the rauno.me pattern — small, genuinely useful), resume PDF, GitHub, LinkedIn. A plain mailto beats a form that might silently fail.

---

## 8. Layout — REVISED (two-tier width)

**Draft said:** one 1600px shell everywhere. **Research says that is the wrong *model*, not the wrong number.**

Premium sites use **two tiers**:

- **Outer rail 1400-1600px** — nav, work index, tables, diagrams, proof strip, image bleed
- **Prose measure 65-72ch (≈680-720px)** — all body text

Observed values: mxstbr.com **1600 shell / 65ch prose**; maggieappleton.com 1420-1512 / 1100-1200; nan.fyi 1450 / 964; paco.me 1072 / 640; rauchg.com 1280 / 600.

The 1600px rail just implemented matches mxstbr exactly and is correct. **What is missing is the narrow measure for text.** The "narrow column, huge margins" problem is solved by letting *wide* elements (work table, diagrams, proof strip) occupy the full rail while text stays narrow — and by putting left-aligned metadata gutters (dates, role tags) in the rail so it carries information rather than emptiness.

**Action:** add a `--measure` token (~68ch) and apply it to prose; keep 1600 for structural elements. Nav aligns to the outer rail (already done).

---

## 9. The background animation — needs a decision

Research lists, under *avoid as signature*: **"ambient background motion, 3D, cursor effects, terminal simulators."**

That is the sweeping light-beam background we just built over several rounds. It is currently monochrome and subtle, so it is not offensive — but per this research it contributes nothing to the signal a technical reader is looking for, and the effort is better spent on the archive table and case-study writing.

Three options, your call (§13):
- **Keep as-is** — it is subtle enough to be harmless.
- **Reduce to static** — keep a faint gradient, drop the motion.
- **Remove entirely** — let the typography and content carry the page.

I am not deleting it unilaterally given the effort already invested.

---

## 10. What to deliberately avoid

Each of these is sourced:

- Skill percentage bars *("no one knows what it actually means")*
- Tech-logo grids — they compress your differentiator (judgment) into the thing everyone shares (tool exposure)
- Tutorial-clone projects; 10+ shallow projects (3-5 deep, deep-linked to GitHub)
- Case studies with no constraints, no pivot, no tradeoff — the single most-named failure mode
- "Passionate developer who loves clean code" copy
- Decorative animation, as distinct from interaction that explains something
- Card grids of identical projects with no hierarchy

---

## 11. Build sequence

| Phase | Work | Signature |
|---|---|---|
| **A** | Consolidate 8 routes → 4; delete Gallery; redirect old paths | — |
| **B** | Two-tier width tokens (`--measure`); typed content model with `roles[]`; migrate 10 projects | — |
| **C** | Work archive table + filter | #1 |
| **D** | Case study template + explorable architecture diagrams | #2 |
| **E** | **Write the case studies** — constraints, tradeoffs, decisions. The highest-value phase per §0. | — |
| **F** | Live pipeline + homepage live panel | #3 |
| **G** | Hardening against [QUALITY_CHECKLIST.md](./QUALITY_CHECKLIST.md) | — |

Phase E is where this portfolio is actually won or lost.

---

## 12. Research sources

Discussion and review: [HN 32113545](https://news.ycombinator.com/item?id=32113545) · [HN 14420802](https://news.ycombinator.com/item?id=14420802) · [dev.to, 40+ portfolios reviewed](https://dev.to/kethmars/what-i-learned-after-reviewing-over-40-developer-portfolios-9-tips-for-a-better-portfolio-4me7) · [The Crit](https://www.thecrit.co/resources/portfolio-project-examples) · [Opendoors](https://blog.opendoorscareers.com/p/how-to-write-a-strong-case-study-for-your-portfolio-in-2025-a14b)

Data/AI specific: [dataexpert.io](https://www.dataexpert.io/blog/data-engineering-portfolio-projects-get-hired) · [pipeline2insights](https://pipeline2insights.substack.com/p/how-to-create-data-engineering-data-engineers-github-portfolio-in-2026)

Sites analyzed: [paco.me](https://paco.me) · [rauno.me](https://rauno.me) · [brittanychiang.com](https://brittanychiang.com) · [mxstbr.com](https://mxstbr.com) · [leerob.com](https://leerob.com) · [nan.fyi](https://nan.fyi) · [joshwcomeau.com](https://www.joshwcomeau.com) · [maggieappleton.com](https://maggieappleton.com) · [shud.in](https://shud.in) · [emilkowal.ski](https://emilkowal.ski)

---

## 13. Open questions

1. **Background animation** — keep, reduce to static, or remove? (§9)
2. **Phase A is destructive** (deletes 4 route files including Gallery). Explicit go needed.
3. **Writing capacity** — Phase E needs ~10 case studies at 600-1200 words each. Draft all ten, or start with the 4-5 that appear on the homepage and let the rest stay as table rows linking to GitHub?
