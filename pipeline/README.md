# Live food inspection pipeline

A scheduled job that ingests restaurant inspection data from three cities into
Neon Postgres, twice a day. The [Food Inspection project
page](https://dhanvardini.vercel.app/work/food-inspection) reads from it.

This exists because the original build (Azure Data Factory, Databricks,
Snowflake, Tableau) cannot be left running for a portfolio. Rather than
describing a pipeline nobody can inspect, this rebuilds the same problem on free
infrastructure and keeps it running.

## The problem it reproduces

Three cities publish the same domain in three incompatible shapes. Each needs a
different transformation to reach a shared grain.

| City | Shape | Violations arrive as | Transform |
|---|---|---|---|
| Chicago | long | one pipe-delimited free-text string per inspection | **parse** |
| Dallas | wide | up to 25 numbered blocks across 63 columns | **unpivot** |
| New York | narrow | already one row per violation | **pass through** |

They converge at exactly one point: **one row per violation per inspection**.
That is the only grain all three can reach without inventing data. Inspection
counts therefore need `COUNT(DISTINCT ...)`, which is the price of
comparability.

## Sources

| City | Portal | Resource | Status |
|---|---|---|---|
| Chicago | data.cityofchicago.org | `4ijn-s7e5` | live |
| New York | data.cityofnewyork.us | `43nn-pn8j` | live |
| Dallas | dallasopendata.com | `dri5-wcct` | **frozen since 2024-02-29** |

Dallas moved live inspections to a vendor portal that is not an open API. Its
Socrata dataset covers October 2016 to February 2024 and will not change again.
It is still loaded, and the site labels it frozen. A source going dark is a
normal thing for a pipeline to carry, and hiding it would make the two live
lanes less believable.

## Constraints that shaped the design

**Neon free tier is 0.5 GB.** The warehouse holds a rolling 24-month window and
prunes on every run. An unbounded live pipeline reaches the cap eventually and
then fails in a way nobody notices, which is worse than a stated window.

**Runs must be resumable.** Pages are fetched oldest-first and the watermark
advances after each page commits, so a job killed at page 30 of 40 resumes near
where it stopped. Resuming rewinds seven days before the watermark, because
Socrata amends recent records after first publication and the fact table
upserts, so overlap is cheap and a gap is not.

**GitHub disables scheduled workflows after 60 days of repo inactivity.** A
portfolio repo goes quiet and the failure is silent: the panel would just start
reading "89d ago". The workflow writes a heartbeat file on every run to keep
itself alive.

## Schema

Gold is a star schema at violation grain. See [`schema.sql`](./schema.sql).

```
fact_inspection_violations
  ├── dim_establishment    name, facility type, cuisine
  ├── dim_location         zip, lat, lon
  ├── dim_violation        code, description, severity
  └── dim_date             calendar attributes
```

Every dimension carries a `natural_key` rather than a composite UNIQUE over
nullable columns. Postgres treats NULLs as distinct in a unique index, so a
composite key containing a nullable latitude would insert the same location
indefinitely.

Every fact row carries `source`, `job_id` and `load_dt`. Three columns are the
difference between rerunning a job and opening an investigation into which run
produced a bad number.

## Observability

Four tables exist so the site can show what happened rather than assert it:

- `pipeline_runs` — one row per run, inserted as `running` before any work, so a
  job killed mid-flight leaves evidence rather than vanishing
- `pipeline_stage_counts` — rows per medallion layer per city, which makes what
  each stage dropped visible
- `pipeline_rejects` — rejections with their reason, published on the page
- `pipeline_profile` — column-level null rates, recomputed every run so source
  drift is observable

## A profiling result worth recording

The original write-up stated that Dallas violation blocks beyond number five
were "over 99% null". Profiling the live feed does not support that:

| Block | Populated |
|---|---|
| 1 | 91.7% |
| 5 | 49.1% |
| 10 | 13.0% |
| 17 | 0.70% |
| 25 | 0.01% |

The 99%-null threshold is not crossed until block 17. The project page has been
corrected, and the panel now recomputes these figures on every run rather than
trusting a number written down once.

## Running it

```bash
pip install -r pipeline/requirements.txt
python -u pipeline/ingest.py
```

Reads `DATABASE_URL_DIRECT` (preferred) or `DATABASE_URL`, plus an optional
`SOCRATA_APP_TOKEN`. Falls back to `web/.env.local`, so a local run needs no
extra setup.

Use the **direct** Neon endpoint, not the pooler. This job runs multi-statement
transactions and bulk upserts, which a transaction pooler handles badly. The
website uses the pooled endpoint, for the opposite reason.

`schema.sql` is idempotent and applied on every run, so there is no separate
migration step.

## Known characteristics

**The first backfill is slow.** Dimension upserts are one round trip per row
per dimension, which over a network connection to Neon means the initial load
takes tens of minutes. Incremental runs touch only new rows and finish in
seconds, so this has not been optimised. If a full rebuild becomes routine,
batching the dimension upserts with `execute_values` is the obvious fix.

**Dallas has no inspection id.** Establishment plus date is the natural key, and
a same-day re-inspection would collide, so the score is folded in to separate
them. Imperfect, and better than dropping the row.

**Severity is not normalised across cities.** Chicago grades establishment risk,
NYC flags violations critical or not, Dallas assigns point deductions. These are
held as published rather than forced onto a shared scale, because they are not
the same measurement and pretending otherwise would invent a comparison the
sources do not support.
