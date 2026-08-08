# IMDb Analytics

**AWS cloud-native warehouse over 190M rows.**
The project to lead with for classic data engineering and warehouse roles. Its
distinguishing feature is physical tuning, which is where warehouse work is
actually judged and where most portfolio projects stop short.

**Note before you start:** the published repo still documents an earlier Azure
Data Factory and Snowflake build, which is why the site omits the repo link. If
asked, say so directly: the page describes the AWS rebuild, the repo has not
caught up, and linking it would put ADF and Snowflake one click behind an
AWS-titled page.

---

## Pitch ladder

### 20 seconds
> An AWS warehouse over 190 million rows from seven IMDb datasets. S3 to Glue to a
> Redshift Serverless star schema with five conformed dimensions. The part worth
> talking about is the physical tuning: DISTKEY on the fact join, DISTSTYLE ALL on
> the small dimensions, SORTKEY on date.

### 2 minutes
> Six stages. Land raw `.tsv.gz` in S3 partitioned by dataset and date, never
> mutated, because a reload should never re-download 190 million rows and the raw
> files are the audit trail when a number is questioned.
>
> Then profile all seven datasets before designing anything, which is where the
> real surprises are: IMDb encodes missing values as the literal string
> backslash-N rather than as null, and several fields are multi-value.
>
> Glue with PySpark normalises that, explodes multi-value fields into bridge
> tables, and writes Parquet to a curated layer. Then a star schema with five
> conformed dimensions into Redshift Serverless, tuned, and served through
> QuickSight from SPICE.

### 10 minutes
Walk the six stages, then spend most of the time on the tuning table and the
modelling alternatives you rejected.

---

## The datasets

| Dataset | Rows | Role |
|---|---|---|
| title.principals | 90,984,000 | cast and crew per title, **many-to-many bridge** |
| title.akas | 51,409,000 | alternate titles by region |
| name.basics | 14,195,000 | people master data |
| title.basics | 11,464,000 | core title metadata |
| title.crew | 11,464,000 | directors and writers |
| title.episode | 8,815,000 | episode to series links |
| title.ratings | 1,536,000 | ratings and vote counts, **the measures** |

**~190M total.** Be precise about this: an earlier version of the site said 91M,
which was `title.principals` alone, the largest single dataset rather than the
corpus. If someone asks how you got 190M, it is the sum of the seven.

---

## Architecture

```
01 LAND        S3 raw           .tsv.gz, partitioned by dataset + date, immutable
02 PROFILE     Alteryx          all 7 datasets, before any modelling
03 TRANSFORM   Glue / PySpark   \N -> NULL, explode multi-value, cast, bound
                                 -> Parquet in curated S3
04 MODEL       star schema      5 conformed dims + fact_title_performance
05 WAREHOUSE   Redshift Serverless   DISTKEY / DISTSTYLE ALL / SORTKEY, COPY
06 SERVE       QuickSight       SPICE, with direct query where freshness matters
```

---

## Decisions

### D1. Land raw, transform later

**Chose** immutable raw layer in S3. **Over** transforming in flight on ingest.
**Because** a reload never needs to re-download 190M rows; raw files are the audit
trail when a number is questioned; S3 is the cheapest layer in the stack.
**Cost:** two copies of the data, raw and modelled.

### D2. Profile before designing the schema

**Chose** profile all seven first. **Over** designing from the documented column
list.
**Because** cardinality decides what can be a dimension key, null density decides
what can be `NOT NULL`, and documented types disagree with actual values in public
data.
**Cost:** a profiling pass with no user-facing output.

**What it found:**
- Missing encoded as the literal string `\N`, not null
- Multi-value fields: `genres`, `primaryProfession`, `knownForTitles`
- Declared types not matching actual values

> **This is your best concrete example of why profiling is not ceremony.** If you
> had trusted the docs, every null check would have passed on a string literal
> `\N` and every genre filter would have matched a comma-delimited blob.

### D3. Parquet in a curated layer

**Chose** write Parquet to curated S3, then COPY. **Over** loading TSV straight
into Redshift.
**Because** columnar means COPY reads only needed columns, compression cuts bytes
scanned, and the curated layer is reusable by Athena without touching the
warehouse.
**Cost:** an extra materialisation between raw and warehouse.

> **Follow-up: "Why does Parquet help a COPY that loads everything anyway?"**
> Two reasons. Compression reduces the bytes moved, which is the dominant cost at
> this volume. And the curated layer is not only for Redshift: Athena can query it
> in place, so an ad-hoc question does not need warehouse capacity at all. The
> claim is about the layer's reusability more than the COPY itself.

### D4. Star schema, not wide and not 3NF

**Chose** five conformed dimensions plus one fact. **Over** a fully denormalised
flat table, or third normal form.
**Because** a wide table repeats title text 90M times in the principals join; 3NF
needs six joins for a genre-by-year question; conformed dimensions mean a new mart
reuses `dim_date` rather than inventing one.
**Cost:** joins at query time, and surrogate keys to maintain.

Dimensions: `dim_title`, `dim_person`, `dim_date`, `dim_genre`, `dim_region`.
Fact: `fact_title_performance`, grained on title. Surrogate keys with natural keys
retained for lineage.

> **Follow-up: "Why is the fact grained on title and not on title-person?"**
> Because the measures are ratings and votes, which exist per title, not per
> person. Putting a person in the grain would force the rating to repeat per cast
> member and any naive sum would multiply it. The many-to-many relationship lives
> in a **bridge table** instead, which is the correct pattern and the reason
> `title.principals` did not become the fact.

**That answer demonstrates you understand fact-table grain and additivity**, which
is the single most common dimensional modelling interview probe.

### D5. Serverless over provisioned Redshift

**Chose** Redshift Serverless. **Over** a fixed-size provisioned cluster.
**Because** load is bursty, heavy during refresh and near idle between; there is
no cluster to size in advance or leave running overnight; and distribution and
sort keys still apply, so tuning is not lost.
**Cost:** less control over warm capacity, and cold starts on the first query.

### D6. SPICE for most dashboards

**Chose** SPICE in-memory. **Over** direct query everywhere.
**Because** Redshift Serverless cold starts are visible in an interactive
dashboard, SPICE absorbs repeated slicing without re-scanning, and refresh cadence
matches a source that updates daily at best.
**Cost:** dashboard data is as old as the last SPICE refresh.

---

## The tuning table

**Spend your time here.** This is the part that separates a warehouse project from
a SQL project.

| Choice | Applied to | Why |
|---|---|---|
| `DISTKEY` | `fact_title_performance.title_key` | co-locates fact rows with the title dimension so the largest join runs on-node instead of redistributing 90M rows across slices |
| `DISTSTYLE ALL` | `dim_date`, `dim_genre`, `dim_region` | small dimensions replicate to every node, so joining them never triggers a broadcast at query time |
| `SORTKEY` | `dim_date.date_key`, `fact.start_year` | nearly every question is bounded by year, so sorting lets Redshift skip blocks rather than scan the fact table |
| `COPY` | S3 Parquet to Redshift | parallel bulk load across slices; row-by-row INSERT at this volume is orders of magnitude slower and generates far more WAL |

### Questions this invites

**"How would you know the DISTKEY was wrong?"**
The query plan. `DS_BCAST_INNER` or `DS_DIST_BOTH` on the large join means
Redshift is redistributing at runtime. `DS_DIST_NONE` is what you want. Also
`SVV_TABLE_INFO` for skew: if one slice holds far more rows than the others, the
distribution key has poor cardinality.

**"What is the risk of DISTSTYLE ALL?"**
Storage multiplies by node count and every write replicates. It is only correct
for genuinely small, slowly-changing dimensions. Applying it to `dim_title` at
11M rows would be a serious mistake.

**"SORTKEY compound or interleaved?"**
Compound is right when queries filter on a consistent leading column, which is the
case here since almost everything is bounded by year. Interleaved gives equal
weight to several columns but has expensive `VACUUM REINDEX` maintenance. For a
predictable date-led access pattern, compound.

**"Does any of this transfer to Snowflake?"**
The concepts do, the knobs do not. Snowflake has no DISTKEY: it uses
micro-partitions with automatic metadata for pruning, and clustering keys are the
nearest analogue to SORTKEY but are usually unnecessary below multi-terabyte
scale. The transferable idea is co-location and pruning; the implementation is
vendor-specific.

---

## Anticipated questions

**"Why AWS when you had already built this on Azure?"**
Rebuilding the same model on a second cloud is the fastest way to learn which
parts of your design were architecture and which were vendor habit. The star
schema and grain survived unchanged; the physical tuning did not, because
Redshift and Snowflake optimise differently.

**"190M rows is not that large. Would this design hold at 10 billion?"**
Several things would change: the fact table would be partitioned by date and
likely kept in S3 with Redshift Spectrum or Iceberg rather than fully loaded;
`title.principals` would need its own aggregate tables; and DISTSTYLE ALL would
stop being viable on anything but the smallest dimensions. The star schema itself
holds; the physical layer does not.

**"How do you handle the multi-value fields?"**
Explode into bridge tables. `genres` is a comma-delimited list, so a title-to-genre
bridge preserves the many-to-many without repeating the title row per genre or
storing a delimited string that nobody can filter on.

**"What is your data quality strategy?"**
Profiling before modelling, bounded ranges on years, and referential checks
between fact and dimensions. Concede what is missing: no automated freshness test,
and no distribution monitoring between loads. That is the gap I would close first.

**"Why Glue and not EMR or plain Spark?"**
Serverless, no cluster to manage, and the workload is a scheduled transform rather
than an interactive one. EMR wins when you need fine control over the cluster or
run long enough that reserved capacity is cheaper.

---

## Adjacent theory

- Star vs snowflake vs 3NF vs one big table (fundamentals §1)
- Fact grain and additivity: additive, semi-additive, non-additive measures
- Bridge tables for many-to-many
- Conformed dimensions and why they enable cross-mart comparison
- Redshift internals: slices, distribution, zone maps, VACUUM, ANALYZE
- Columnar formats: Parquet, predicate pushdown, projection pushdown
- Serverless vs provisioned warehouse economics

---

## Gaps to concede

- Repo documents the older Azure build, so the link is omitted
- No automated freshness or distribution testing
- Design is tuned for ~190M rows and would need rework an order of magnitude up
- SPICE means dashboards are as stale as the last refresh
