-- Multi-city food inspection warehouse, Neon Postgres.
--
-- Mirrors the medallion structure of the original Databricks/Snowflake build:
-- raw lands per city in its native shape, silver reconciles the three shapes to
-- one grain, gold is a star schema. What is different here is the budget. Neon's
-- free tier is 0.5 GB, so this holds a rolling 24-month window and prunes on
-- every run. An unbounded live pipeline eventually hits the cap and dies quietly,
-- which is a worse outcome than a stated window.
--
-- Grain of the fact table is ONE VIOLATION, not one inspection. That is the only
-- grain all three cities can reach: Chicago packs violations into a delimited
-- string, Dallas spreads them across 25 columns, NYC already publishes one row
-- per violation. Inspection-level counts therefore need COUNT(DISTINCT ...),
-- which is the price of comparability.
--
-- Idempotent. Safe to run against an existing database on every job.

-- ---------------------------------------------------------------------------
-- Run log and observability. These exist so the site can show what happened
-- rather than assert that something happened.
-- ---------------------------------------------------------------------------

create table if not exists pipeline_runs (
  job_id        uuid primary key,
  started_at    timestamptz not null,
  finished_at   timestamptz,
  -- running | success | failed. A row is inserted as `running` before any work,
  -- so a job killed mid-flight leaves evidence instead of vanishing.
  status        text        not null,
  rows_fetched  integer     not null default 0,
  rows_accepted integer     not null default 0,
  rows_rejected integer     not null default 0,
  rows_pruned   integer     not null default 0,
  duration_ms   integer,
  error         text
);

create index if not exists pipeline_runs_started_idx
  on pipeline_runs (started_at desc);

-- Row counts by medallion layer, per city, per run. This is what makes the
-- layering visible: you can see exactly what each stage dropped.
create table if not exists pipeline_stage_counts (
  job_id  uuid    not null references pipeline_runs (job_id) on delete cascade,
  city    text    not null,
  stage   text    not null,          -- bronze | silver | gold
  rows    bigint  not null,
  primary key (job_id, city, stage)
);

-- Rejections with their reason. Published deliberately. A pipeline that reports
-- a clean number is less trustworthy than one that says it dropped 340 rows and
-- why.
create table if not exists pipeline_rejects (
  job_id uuid    not null references pipeline_runs (job_id) on delete cascade,
  city   text    not null,
  reason text    not null,
  rows   integer not null,
  primary key (job_id, city, reason)
);

-- Column-level profile, recomputed every run. Stored over time so drift is
-- observable: a source column that starts emptying out shows up here first.
create table if not exists pipeline_profile (
  job_id      uuid   not null references pipeline_runs (job_id) on delete cascade,
  city        text   not null,
  column_name text   not null,
  populated   bigint not null,
  total       bigint not null,
  null_pct    numeric(5, 2) not null,
  primary key (job_id, city, column_name)
);

-- Per-city ingestion watermark. Incremental loads read from here rather than
-- re-scanning the warehouse, and Dallas parks permanently at its final date.
create table if not exists ingest_watermark (
  city         text primary key,
  last_seen_at date,
  updated_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Gold: star schema.
--
-- Every dimension carries a `natural_key` rather than relying on a composite
-- UNIQUE over nullable columns. Postgres treats NULLs as distinct in a unique
-- index, so a composite key containing a nullable latitude would happily insert
-- the same location a thousand times.
-- ---------------------------------------------------------------------------

create table if not exists dim_establishment (
  establishment_key bigserial primary key,
  natural_key       text not null unique,
  city              text not null,
  source_id         text not null,
  name              text,
  facility_type     text,
  cuisine           text
);

create table if not exists dim_location (
  location_key bigserial primary key,
  natural_key  text not null unique,
  city         text not null,
  zip          text,
  latitude     numeric(9, 6),
  longitude    numeric(9, 6)
);

create table if not exists dim_violation (
  violation_key bigserial primary key,
  natural_key   text not null unique,
  city          text not null,
  code          text,
  description   text,
  -- Each city grades severity in its own vocabulary. Held as-is rather than
  -- forced into a shared scale, because Chicago's "Risk 1 (High)" and NYC's
  -- "Critical" are not the same measurement and pretending otherwise would
  -- invent a comparison the sources do not support.
  severity      text
);

create table if not exists dim_date (
  date_key   date primary key,
  year       integer not null,
  month      integer not null,
  day        integer not null,
  weekday    integer not null,
  month_name text    not null
);

create table if not exists fact_inspection_violations (
  fact_key          bigserial primary key,
  city              text not null,
  inspection_id     text not null,
  -- Position of this violation within its inspection. Chicago gets it from the
  -- order of the delimited string, Dallas from the block number, NYC from a
  -- window over the source rows.
  violation_seq     integer not null,

  establishment_key bigint references dim_establishment (establishment_key),
  location_key      bigint references dim_location (location_key),
  violation_key     bigint references dim_violation (violation_key),
  date_key          date   references dim_date (date_key),

  inspection_date   date not null,
  result            text,
  score             integer,
  critical          boolean,

  -- Audit columns on every row. Three columns are the difference between
  -- rerunning a job and opening an investigation into which run produced a
  -- bad number.
  source            text        not null,
  job_id            uuid        not null,
  load_dt           timestamptz not null default now(),

  unique (city, inspection_id, violation_seq)
);

create index if not exists fact_date_idx  on fact_inspection_violations (inspection_date desc);
create index if not exists fact_city_idx  on fact_inspection_violations (city);
create index if not exists fact_viol_idx  on fact_inspection_violations (violation_key);
