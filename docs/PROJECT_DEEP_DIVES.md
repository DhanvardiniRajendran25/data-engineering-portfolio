# Project deep dives

All 9 featured projects now have a bespoke deep dive. This file records what each
one contains, where its facts came from, and the open items per project.

A "deep dive" here means a hand-built React component rendered under the project
header instead of an MDX body. `hasDeepDive` in
[`web/src/app/work/[slug]/page.tsx`](../web/src/app/work/%5Bslug%5D/page.tsx)
lists the slugs; a slug in that list skips MDX entirely and also drops the
duplicate stack chip row, because every deep dive closes with a grouped stack
section.

## Status

| # | Project | Content file | Component | Architecture SVG | Interactive |
|---|---|---|---|---|---|
| 1 | PodcastIQ | `podcastiq.ts`, `podcastiq-traces.ts`, `podcastiq-dashboard.ts` | `podcastiq-deep-dive.tsx` | — | `agent-console.tsx`, `pipeline-stepper.tsx` |
| 2 | SAGE | `sage.ts` | `sage-deep-dive.tsx` | `sage-architecture.tsx` | `phase-stepper.tsx` |
| 3 | DocuParse | `docuparse.ts` | `docuparse-deep-dive.tsx` | `docuparse-architecture.tsx` | `stage-stepper.tsx` |
| 4 | IMDb Analytics | `imdb.ts` | `imdb-deep-dive.tsx` | `imdb-architecture.tsx` | `magnitude-table.tsx`, `bar-chart.tsx` |
| 5 | CourtVision AI | `courtvision.ts`, `courtvision-traces.ts` | `courtvision-deep-dive.tsx` | — | `courtvision-console.tsx`, `basketball-court.tsx` |
| 6 | NYPD Crime | `nypd.ts` | `nypd-deep-dive.tsx` | — | `stage-stepper.tsx` |
| 7 | ReflexAI | `reflexai.ts` | `reflexai-deep-dive.tsx` | `reflexai-architecture.tsx` | — |
| 8 | META TradePulse | `meta-tradepulse.ts` | `meta-tradepulse-deep-dive.tsx` | — | `stage-stepper.tsx` |
| 9 | Food Inspection | `food-inspection.ts` | `food-inspection-deep-dive.tsx` | `food-inspection-architecture.tsx` | `stage-stepper.tsx` |

Content files live in `web/src/content/projects/`, components in
`web/src/components/project/`.

## Shared pieces

Extracted once three or more pages needed them, not before.

- **`project-section.tsx`** — the heading rule, kicker and width choice used by
  every section on every deep dive.
- **`stage-stepper.tsx`** — vertical tablist with a chose / over / because / cost
  decision block. Arrow keys, Home and End move between stages. PodcastIQ and
  SAGE keep their own steppers; rewriting two working pages to share code is risk
  with no user-visible gain.

## Sourcing rule

Every number on a deep dive traces to something verifiable: a README, a repo, a
screenshot supplied by you, or a recorded run. Where the source is thin, the page
says so rather than inventing a figure.

Consoles are framed as replays of recorded runs, never as live execution. A
simulated console presented as live is disprovable in one question, and a
portfolio that fails that question loses more than the console was worth.

Two claims are flagged on the pages themselves:

- **META TradePulse R² above 0.99** — the lagged close explains almost all the
  variance, so the R² is not the interesting number. The page points at the 59%
  directional accuracy instead.
- **IMDb Analytics repo link is omitted** — the published repository still
  documents the earlier Azure Data Factory and Snowflake build, so linking it
  would put ADF and Snowflake one click behind an AWS-titled page. Restore the
  link once the code matches the write-up.

## Food Inspection (added last)

The drawing is organised around the actual difficulty rather than the tool list.
Chicago publishes inspections long-form with every violation packed into one
pipe-separated string; Dallas publishes the same domain wide-form with up to 25
numbered violation blocks and coordinates buried in a text field. Nothing about
reading one helps you read the other.

So the architecture renders as two independent lanes converging at exactly one
point, a unified staging table at violation grain. The diagram marks it "THE ONLY
JOIN POINT" because that convergence is the design, and a single left-to-right
flow would hide it.

Three things the page makes explicit that the README implies:

1. **Profiling is a stage, not a preamble.** Dallas violation blocks past number
   five are over 99% null, which is the measurement that made the unpivot
   selective. Without it, melting all 25 blocks multiplies row count for empty
   columns.
2. **Violation grain, not inspection grain.** Inspection grain would need an
   array column and would block every violation-level question. The cost, stated
   on the page: inspection-level counts now need a `DISTINCT`.
3. **Two lanes cost something.** A third city means writing a third
   transformation, not adding a config entry. That is named as the tradeoff, not
   omitted.

## Verification

Both gates run clean as of this writing.

```
npm run build         # 21 static pages, TypeScript clean
npm run test:a11y     # 28/28 chromium
npm run test:a11y:all # chromium + firefox + webkit x 5 viewports
```

Every deep-dive route is in the axe route list in `web/tests/a11y.spec.ts`, light
and dark. That list is exhaustive on purpose: testing one deep dive and assuming
the rest match is how the agent console's fixed dark palette went unchecked, and
it was below the contrast floor when it was finally measured.

Scrollable architecture diagrams are wrapped in a focusable
`role="region"` with an `aria-label`, so keyboard users can scroll them. Each SVG
carries a `<title>` and a `<desc>` that describes the full flow in prose, since a
diagram that only works visually is not a diagram for everyone.
