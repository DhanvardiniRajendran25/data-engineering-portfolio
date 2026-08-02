# Design Plan — Clean, Minimal, Distinctive Engineering Portfolio

Built on the structural decisions recorded in [MIGRATION_PLAN.md](./MIGRATION_PLAN.md): one site with role-filterable projects, a lean four-page set, and three phased signature elements.

Status: **draft for review.** Nothing here is built yet beyond the current homepage hero/impact section.

---

## 1. The core positioning problem

A portfolio aimed at three role types usually fails one of two ways: it either becomes generic ("full-stack engineer who does everything," which reads as nothing), or it splinters into three half-built sections. The resolution is a single claim broad enough to cover all three, with the *evidence* underneath tagged by role.

**The claim:** you build systems that move and use data in production. SDE, DE, and AI Engineer are three angles on that one competence, not three different people.

**The mechanism:** every project carries `roles[]` tags. The visitor filters. The narrative stays singular; the proof reorders itself to whoever is reading.

---

## 2. Information architecture

Four pages. The nav goes from eight items to four, which alone makes the site read more senior.

| Page | Purpose | Absorbs |
|---|---|---|
| **Home** | Claim, proof, and a fast route into the work | (current homepage) |
| **Work** | The editorial index of case studies, filterable by role | Projects |
| **About** | Story, experience timeline, skills, education, awards, in one dense narrative page | Experience, Education, Skills, Awards |
| **Contact** | Direct, low-friction contact + resume | Contact |

**Dropped:** Gallery. It dilutes a technical portfolio and competes for attention with the case studies.

**Why one About page instead of four:** four thin pages each holding a single list reads as padding. One page that moves from "who I am" to "where I've worked" to "what I use" to "what I've won" reads as a story with substance and is faster to scan than four navigations.

---

## 3. Homepage structure

Five sections, in this order. The logic is: **claim → proof → work → credibility → action.**

1. **Hero** (exists, refined). Name, one-line claim, role rotator, resume + social icons, photo.
2. **Impact metrics** (exists). Six numbers spanning all three role lenses.
3. **Selected work** (new). Three or four hand-picked case studies, not all ten. A curated selection reads as confident; a full dump reads as a database. Links through to Work.
4. **Live system panel** (new, Phase 5 signature). A small real component fed by the actual running pipeline: last refresh timestamp, rows processed, a compact chart. This is the single strongest differentiator on the site, because it is the only element that *demonstrates* rather than *claims*.
5. **Closing CTA** (new). One clear line and a contact link. Not a giant footer wall.

**Homepage principle:** it should be fully readable in about 30 seconds of scrolling, and every section should either make a claim or prove one.

---

## 4. Work page — signature element #1 (editorial index)

Not a card grid. Card grids are the single most generic pattern in developer portfolios.

Instead: a **numbered editorial index**. Each row is a full-width line with a large serif title, a one-line outcome, and small mono role tags. Hovering a row reveals its hero image, either inline or as a floating preview that follows the cursor. Clicking opens the case study.

```
FILTER   [ All ]  Software   Data   AI

01 ── Seattle Pet ETL                      DATA · SOFTWARE
      Nightly pipeline, 1.2M records, zero manual touch

02 ── PodcastIQ                            AI · DATA
      Multi-agent knowledge graph over 40k episodes

03 ── Sage                                 AI · SOFTWARE
      RAG compliance assistant with prompt-injection defense
```

Why this works: it is scannable like a table of contents (which is what a hiring manager actually wants), it is distinctive without being decorative, and it scales cleanly from 4 projects to 40. The filter is a real function of the role tags, not a UI toy.

---

## 5. Case study template — signature element #2 (interactive diagrams)

One consistent structure for every case study. This consistency is itself a signal of engineering discipline, and it fixes the exact bug class the original site audit found (34 hand-copied pages that drifted apart).

1. **Header** — title, one-line outcome, role tags, stack chips, timeframe.
2. **The problem** — what was broken or needed, and the constraints. Constraints are what separate real engineering from a tutorial.
3. **Architecture** — the interactive diagram. Steppable stage by stage: ingest → transform → store → serve. This is where a technical reader decides whether you actually know what you're doing.
4. **Key decisions** — 2-4 real tradeoffs, each stated as *option chosen vs. option rejected, and why*. This section matters more than any other for senior-level credibility.
5. **Outcome** — concrete numbers. Runtime, volume, cost, error rate, whatever is honest and real.
6. **What I'd do differently** — short. Signals maturity and self-awareness; almost nobody includes it, which makes it memorable.

**Length target:** readable in 3-4 minutes. Long enough to show depth, short enough to actually get read.

---

## 6. About page

A single narrative page in four movements, not four separate lists:

1. **Opening** — two or three sentences of actual voice. Who you are as an engineer and what you care about building.
2. **Experience timeline** — Optum roles, Northeastern, teaching. Vertical, restrained, with outcomes rather than responsibilities.
3. **Skills, bucketed by role lens** — Languages & Fundamentals · Data Engineering · Cloud & Infra · AI/ML & LLM Systems · Software Engineering. Plain grouped text.
   **No proficiency bars.** "Python 90%" is meaningless, universally mocked by engineers, and actively damages credibility.
4. **Education & recognition** — compact, factual, at the end.

---

## 7. Contact page

Deliberately minimal: one line of invitation, direct email, LinkedIn, GitHub, resume download. A form is optional; if added it needs validation, spam protection, and rate limiting (tracked in [QUALITY_CHECKLIST.md](./QUALITY_CHECKLIST.md) §10). A plain mailto is more honest than a form that might silently fail.

---

## 8. Design system refinements

Carrying forward the quiet-luxury direction already established, with these specific changes:

- **Shell width** — resolved to 1600px shared across header, hero, impact, and footer so all edges align. (Fixed; previously the header was full-bleed while the body sat in a 1180px island.)
- **Vertical rhythm** — standardize on a spacing scale (section padding, heading margins) rather than per-component values, so pages feel like one system.
- **Type scale** — Playfair Display for display only; Geist Sans for all body/UI; Geist Mono reserved for data (metrics, tags, timestamps, code). The mono-as-data rule is a small thing that makes a technical site feel intentional.
- **Accent discipline** — coral stays reserved for the role rotator, active states, and links. Never for large fills.
- **Motion** — entrance reveals and the nav pill only. The background stays monochrome and subtle. Motion should never be the thing you notice.

---

## 9. What to deliberately avoid

These are the patterns that make engineering portfolios read as junior:

- Skill proficiency bars or percentages
- Walls of technology logos
- "Passionate developer who loves clean code" copy
- Terminal/matrix/particle backgrounds as decoration
- Card grids of identical-looking projects with no hierarchy
- Listing every course taken or every tool ever touched
- Case studies that describe *what* was built with no *why*
- Animation that delays reading

---

## 10. Build sequence

| Phase | Work | Signature |
|---|---|---|
| **A** | Consolidate routes to 4 pages; delete Gallery; redirect old paths | — |
| **B** | Typed content model for case studies with `roles[]`; migrate the 10 projects | — |
| **C** | Work page editorial index + role filter | #1 |
| **D** | Case study template + interactive architecture diagrams | #2 |
| **E** | About page consolidation; homepage Selected Work + closing CTA | — |
| **F** | Live pipeline + homepage live panel | #3 |
| **G** | Hardening pass against [QUALITY_CHECKLIST.md](./QUALITY_CHECKLIST.md): SEO metadata, sitemap, JSON-LD, 404, error boundary, contrast audit, Lighthouse | — |

Each phase is a review checkpoint.

---

## 11. Competitive research findings

*(To be filled in from the in-flight design research pass: specific admired engineer portfolios, the structural devices they use, layout conventions on large displays, and what hiring managers report actually valuing. Findings that contradict anything above take precedence, and this document gets revised accordingly.)*
