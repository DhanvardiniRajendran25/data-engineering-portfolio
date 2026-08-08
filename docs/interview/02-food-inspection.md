# Food Inspection Analytics

**Three cities, three incompatible shapes, one star schema.**
The only project on the site that is genuinely running. Everything below is
verifiable by anyone who opens the page, which changes how you talk about it: you
are not describing something you once built, you are describing something that
ran this morning.

There are **two builds** and you must keep them distinct in an interview:

| | Original | Live rebuild |
|---|---|---|
| Cities | Chicago, Dallas | Chicago, Dallas, **New York** |
| Stack | ADF, ADLS Gen2, Databricks, Snowflake, Tableau | GitHub Actions, Python, Neon Postgres, Next.js |
| Why | coursework, enterprise stack | Azure cannot be left running for a portfolio |
| Status | delivered | **running twice daily** |

---

## Pitch ladder

### 20 seconds
> Three cities publish restaurant inspections in three incompatible shapes.
> Chicago packs every violation into one pipe-delimited string. Dallas spreads
> them across 25 numbered columns. New York already emits one row per violation.
> I unified them at violation grain in a star schema. It runs live on a scheduled
> job into Postgres and the site reads from that database.

### 2 minutes
> The interesting constraint is that no two sources agree on shape, so there is no
> generic pipeline that handles all three. Chicago needs regex parsing, Dallas
> needs a wide-to-long unpivot, New York needs pass-through. Those share no logic,
> so I made the branch explicit at the top: three lanes, converging at exactly one
> point.
>
> They converge at violation grain, because that is the only grain all three can
> reach without inventing data. Inspection grain would need an array column and
> would block every violation-level question.
>
> Profiling drove the Dallas transform. Blocks past violation five are over 99%
> empty, so the unpivot is selective rather than melting all 25. That is measured
> every run and published on the page, not a threshold I wrote down once.

### 10 minutes
Walk the six stages, then **the four production bugs the live version exposed**,
which is the strongest material in this project.

---

## The problem

| City | Shape | Violations arrive as | Needs |
|---|---|---|---|
| Chicago | long | one pipe-delimited free-text string | **PARSE** |
| Dallas | wide | up to 25 numbered violation blocks across 63 columns | **UNPIVOT** |
| New York | narrow | already one row per violation | **PASS THROUGH** |

And they do not even measure danger at the same level:

- **Chicago** grades the *establishment*'s risk (categories 1 to 3)
- **New York** flags each *violation* critical or not
- **Dallas** assigns *point deductions* per violation

**This is the sentence that makes the project sound hard:** three cities publish
the same domain, no two publish it the same way, and nothing about reading one
helps you read another.

---

## Architecture

```
SOURCE            BRONZE           PROFILE          SILVER            UNIFY          GOLD
Chicago (long) -> landed as-is -\                -> PARSE      -\
Dallas  (wide) -> landed as-is --> profile both  -> UNPIVOT    ---> one violation -> star schema
NYC   (narrow) -> landed as-is -/  decides rules -> PASS THRU  -/    per row         + Tableau / web
```

**One convergence point.** That is the whole architectural idea, and it is drawn
rather than described on the site.

### Original stack (Azure)
ADF orchestration → ADLS Gen2 raw → Databricks PySpark transforms → Snowflake
Dynamic Tables → Tableau. ER Studio for the model, Alteryx and ydata-profiling
for profiling.

### Live rebuild stack
GitHub Actions cron → Python + `requests` → Socrata APIs → Neon Postgres
(bronze/silver/gold + run log) → Next.js API route → dashboard.

---

## Decisions

### D1. Land each city in its own native shape

**Chose** bronze holds the source unchanged. **Over** conforming on ingest.
**Because** conforming on ingest destroys the evidence when a parse is wrong; the
two shapes need different logic and that belongs downstream; and re-processing
never re-downloads. **Cost:** divergent shapes to carry until silver.

### D2. Profile to decide what *not* to process

**Chose** profile before writing any transform. **Over** transforming every
column defensively.
**Because** Dallas blocks past violation five are over 99% null, so unpivoting
all 25 would multiply row count for almost no data. Profiling turned a guess
about cost into a measurement.
**Cost:** a sparse block could gain data later and be silently skipped.

> **The live version strengthens this.** Sparsity is recomputed every run and
> published as a decay curve across all 25 blocks, so the threshold is never
> stale. That is a genuinely better design than the original, and it came from
> having to defend the number publicly.

### D3. One pipeline per city, then union

**Chose** three lanes. **Over** a single generic pipeline.
**Because** wide-to-long, text parsing and pass-through share no logic, and a
generic path would branch on city at every step anyway. City-specific code is
readable; a branching monolith is not.
**Cost:** a fourth city means writing a fourth transformation, not adding a
config entry.

> **Follow-up: "That does not scale. What if you had fifty cities?"**
> Correct, and the honest answer has two parts. First, at fifty cities you would
> invert it: a small set of shape *handlers* (long, wide, narrow) plus a per-city
> config that names its handler and column mappings. Second, you would only build
> that once you had enough cities to know the shape taxonomy is stable. Building
> the generic framework at three cities would have been designing for a scale I
> did not have, against a taxonomy I had not yet confirmed.

### D4. Unify at violation grain

**Chose** one row per violation per inspection. **Over** inspection grain.
**Because** Dallas carries many violations per inspection while Chicago packs
them into one string; inspection grain would need an array column and would block
violation-level analysis; and violation grain makes the cities genuinely
comparable. **Cost:** inspection-level counts now require a `DISTINCT`.

### D5. Snowflake Dynamic Tables over scheduled MERGE

**Chose** Dynamic Tables. **Over** hand-written MERGE on a schedule.
**Because** refresh and dependency order are declared rather than orchestrated;
the warehouse works out what is stale instead of a cron guessing; less pipeline
code to keep correct.
**Cost:** refresh behaviour is Snowflake's to decide, so tuning latency means
tuning lag targets, not logic.

### D6. Audit columns on every record

`job_id` (which run produced the row), `load_dt` (when), `source` (which city).

> **The line that lands:** three columns are the difference between rerunning a
> job and opening an investigation into which run produced a bad row.

### D7 (live). Rolling window plus prune

Neon's free tier is 0.5 GB. An unbounded live pipeline reaches that eventually
and then fails in a way nobody notices. So: a 24-month rolling window, with a
prune step, and the current usage shown on the dashboard as a meter against the
cap.

**Bounded by design, and stated on the page rather than hidden.**

### D8 (live). Per-city windows, not one global window

This is the fix for a real bug (see below). Live cities roll forward from today;
a frozen source anchors to its own final date and keeps its last 24 months
permanently.

---

## The four bugs the live build exposed

**This is your best material in this project.** Each one is a real defect found
by putting the thing in production, and each has a concrete fix. Interviewers
care far more about this than about the happy path.

### Bug 1: the rolling window silently erased Dallas

Dallas stopped publishing on 2024-02-29. The global 24-month window begins
2024-07-23. **Every Dallas row fell outside it.** The fetch returned zero rows
and, worse, the prune step would have deleted the entire lane on the very run
that loaded it.

**Fix:** per-city windows. A frozen source anchors to its own final date. Prune
runs per city rather than globally.

**Why it is a good story:** the bug was invisible in the happy path. Chicago and
NYC worked perfectly. A whole city disappearing was only detectable by asking
"why does the map have two panels and not three."

### Bug 2: a deadlock from concurrent runs

`DeadlockDetected` on `dim_establishment`, caused by two overlapping runs of the
same job competing to upsert the same dimension rows in different orders.

**Fix:** a Postgres advisory lock. A second run sees the lock held and exits
cleanly instead of corrupting state.

**Lesson to state:** every scheduled job needs a concurrency guard, because the
run that overruns its window will eventually meet the next one.

### Bug 3: null-island coordinates destroyed the map

NYC publishes `(0, 0)` for records it has not geocoded. **One** such row
stretched the map extent from the equator to Manhattan and collapsed every real
point into a corner.

**Fix at three levels:** the ingest job rejects null-island coordinates for every
city; the query filters rows loaded before that fix; and the map takes its extent
from the 1st-to-99th percentile with clamping, so no single bad row can do it
again.

**The principle:** fix it where it originates, but also make the consumer robust,
because you cannot re-ingest the past cheaply.

### Bug 4: Dallas coordinates were being discarded entirely

Dallas nests coordinates inside a `lat_long` object alongside a `human_address`
blob rather than publishing plain `latitude` and `longitude` columns like the
other two. The extraction was reading the plain columns, finding nothing, and
storing null. Dallas had no place on any map and nobody would have noticed.

**Fix:** extract from the nested object. And critically, the fact upsert had to be
changed to **re-point dimension keys**, because enriching a dimension creates new
rows that existing facts still point away from.

> **Follow-up: "Explain that upsert change."**
> The `ON CONFLICT DO UPDATE` originally refreshed measures but not the foreign
> keys. So when the enriched `dim_location` rows were created with coordinates,
> every existing fact row stayed pointed at the old coordinate-less row. The fix
> adds `establishment_key`, `location_key` and `violation_key` to the update set.
> It is a good illustration of why an upsert needs to be reviewed whenever a
> dimension changes.

---

## Live numbers

| | |
|---|---|
| Violations | 393,522 |
| Inspections | 107,100 |
| Establishments | 48,525 |
| Storage | ~158 MB of 512 MB (31%) |
| Refresh | twice daily via GitHub Actions |

| City | Violations | Per inspection | Latest |
|---|---|---|---|
| New York | 182,188 | 3.52 | live |
| Chicago | 122,392 | 3.27 | live |
| Dallas | 88,942 | 4.97 | 2024-02-29 (frozen) |

**Violations per inspection is the number the shared grain buys.** It is not
comparable across cities in any raw feed, because one publishes a string, one
publishes columns and one publishes rows.

---

## The honesty features

Three things on the live dashboard that are unusual and worth pointing at:

1. **Rejected rows are published.** A pipeline that reports only what it accepted
   is not telling you what it did.
2. **Run history includes failures.** A log that only shows successes is not a
   log.
3. **Severity is explicitly not normalised.** The three cities measure danger
   differently, and the dashboard draws the ungraded share rather than omitting
   it. Forcing them onto one scale would invent a comparison the sources do not
   support.

---

## Anticipated questions

**"Why Postgres for the rebuild when the original used Snowflake?"**
Free tier and the demonstration is architectural, not vendor-specific. The
medallion layering, the grain decision and the star schema are identical; only
the engine changed. Concede what is lost: no Dynamic Tables, so refresh is
orchestrated by cron rather than declared.

**"How do you handle the source changing its schema?"**
Currently it would fail the transform, which surfaces as a failed run in the log
and an alert. That is the honest answer. A better version would assert the
expected column set at bronze and fail loudly with a schema diff rather than
failing deep in the transform.

**"Why twice a day and not hourly?"**
The sources publish daily at best, so hourly would be polling for data that does
not exist. Freshness should match the source's cadence, not the scheduler's
capability.

**"You said GitHub Actions was delayed 2.5 hours. Is that acceptable?"**
For daily-cadence public data, yes, and the page shows the actual last-run
timestamp so nobody has to trust a claim. If the cadence mattered, the scheduler
would be wrong for the job and I would move to a worker with a real timer.

**"What is the single weakest part?"**
Schema-change handling. Everything else degrades visibly; a column rename would
fail in the transform rather than at a boundary, and the error would point at the
wrong place.

---

## Adjacent theory

- Medallion architecture and why bronze is immutable (fundamentals §2)
- Grain, and why declaring it first prevents downstream errors
- Idempotency: upsert on natural key, advisory locks, watermark rewind
- Snowflake Dynamic Tables vs dbt incremental vs scheduled MERGE
- Wide-to-long reshaping and why it multiplies rows
- Rolling windows and retention as a cost control

---

## Gaps to concede

- Severity is not comparable across cities, by design
- Schema drift is not detected at a boundary
- Dallas is frozen, so one third of the data never changes
- The rebuild's scheduler cannot guarantee timing
- Coordinates for ~1.5% of Dallas locations are still missing after the fix
