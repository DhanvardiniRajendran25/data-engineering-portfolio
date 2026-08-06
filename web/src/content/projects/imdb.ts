/**
 * IMDb Analytics deep-dive content: AWS cloud-native rebuild.
 *
 * STACK NOTE: this page documents the AWS architecture (S3, Glue, Redshift
 * Serverless, QuickSight). The public repository currently documents the earlier
 * Azure Data Factory and Snowflake build, so the repo link is deliberately
 * omitted from meta.ts until the code matches what is described here. Linking it
 * would put ADF and Snowflake one click behind an AWS-titled page.
 *
 * ROW COUNTS: per-dataset figures are from the repository README and sum to
 * ~190M, not the 91M previously shown on the card. 91M was title.principals
 * alone, which is the largest single dataset rather than the corpus.
 */

export type Stat = { value: string; label: string; note?: string };

export const HEADLINE: Stat[] = [
  { value: "190M", label: "Rows ingested", note: "across 7 datasets" },
  { value: "5", label: "Conformed dimensions", note: "star schema" },
  { value: "7", label: "Datasets profiled", note: "Alteryx" },
  { value: "Serverless", label: "Redshift", note: "no cluster to size" },
];

export const SCALE: Stat[] = [
  { value: "7", label: "Source datasets" },
  { value: "190M", label: "Total rows" },
  { value: "5", label: "Dimensions" },
  { value: "1", label: "Fact table" },
  { value: "6", label: "Pipeline stages" },
  { value: "Dec 2025", label: "Delivered" },
];

/** The seven IMDb datasets, with real record counts from the README. */
export const DATASETS = [
  { name: "title.principals", rows: 90_984_000, role: "Cast and crew per title", note: "many-to-many bridge" },
  { name: "title.akas", rows: 51_409_000, role: "Alternate titles by region", note: "localisation" },
  { name: "name.basics", rows: 14_195_000, role: "People master data", note: "people dimension" },
  { name: "title.basics", rows: 11_464_000, role: "Core title metadata", note: "title dimension" },
  { name: "title.crew", rows: 11_464_000, role: "Directors and writers", note: "creative ownership" },
  { name: "title.episode", rows: 8_815_000, role: "Episode to series links", note: "TV hierarchy" },
  { name: "title.ratings", rows: 1_536_000, role: "Ratings and vote counts", note: "the measures" },
];

export type Stage = {
  id: string;
  step: string;
  title: string;
  tool: string;
  facts: string[];
  decision: { chose: string; over: string[]; because: string[]; cost: string };
  output: { value: string; label: string }[];
};

export const STAGES: Stage[] = [
  {
    id: "land",
    step: "01",
    title: "Land",
    tool: "Amazon S3",
    facts: [
      "IMDb .tsv.gz pulled to a raw prefix",
      "Partitioned by dataset and load date",
      "Compression kept, gzip is splittable enough at this size",
      "Raw layer never mutated",
    ],
    decision: {
      chose: "Land raw, transform later",
      over: ["Transform in flight on ingest"],
      because: [
        "A reload never needs to re-download 190M rows",
        "Raw files are the audit trail when a number is questioned",
        "S3 storage is the cheapest layer in the stack",
      ],
      cost: "Two copies of the data: raw and modelled.",
    },
    output: [
      { value: "7", label: "datasets" },
      { value: "190M", label: "rows landed" },
    ],
  },
  {
    id: "profile",
    step: "02",
    title: "Profile",
    tool: "Alteryx",
    facts: [
      "All 7 datasets profiled before any modelling",
      "Null density, cardinality, value distributions",
      "IMDb encodes missing as the literal string backslash-N",
      "Multi-value fields: genres, primaryProfession, knownForTitles",
    ],
    decision: {
      chose: "Profile before designing the schema",
      over: ["Design from the documented column list"],
      because: [
        "Cardinality decides what can be a dimension key",
        "Null density decides what can be NOT NULL",
        "Documented types and actual values disagree in public data",
      ],
      cost: "A profiling pass that produces no user-facing output.",
    },
    output: [{ value: "7", label: "profiles" }],
  },
  {
    id: "transform",
    step: "03",
    title: "Transform",
    tool: "AWS Glue (PySpark)",
    facts: [
      "Backslash-N normalised to true NULL",
      "Multi-value fields exploded to bridge tables",
      "Types cast, years bounded to plausible ranges",
      "Written back to S3 as Parquet",
    ],
    decision: {
      chose: "Parquet in a curated S3 layer",
      over: ["Load TSV straight into Redshift"],
      because: [
        "Columnar means COPY reads only needed columns",
        "Compression cuts the bytes Redshift has to scan",
        "The curated layer is reusable by Athena without touching the warehouse",
      ],
      cost: "An extra materialisation between raw and warehouse.",
    },
    output: [
      { value: "Parquet", label: "curated layer" },
      { value: "1", label: "bridge table" },
    ],
  },
  {
    id: "model",
    step: "04",
    title: "Model",
    tool: "Star schema · 5 conformed dimensions",
    facts: [
      "dim_title, dim_person, dim_date, dim_genre, dim_region",
      "fact_title_performance grains on title",
      "Conformed so dimensions are shared, not duplicated per mart",
      "Surrogate keys, natural keys retained for lineage",
    ],
    decision: {
      chose: "Star schema, not one wide table",
      over: ["Fully denormalised flat table", "Third normal form"],
      because: [
        "A wide table repeats title text 90M times in the principals join",
        "3NF needs six joins for a genre-by-year question",
        "Conformed dimensions mean a new mart reuses dim_date rather than inventing one",
      ],
      cost: "Joins at query time, and surrogate keys to maintain.",
    },
    output: [
      { value: "5", label: "conformed dimensions" },
      { value: "1", label: "fact table" },
    ],
  },
  {
    id: "warehouse",
    step: "05",
    title: "Warehouse",
    tool: "Redshift Serverless",
    facts: [
      "DISTKEY on the fact join key so matching rows co-locate",
      "Dimensions distributed ALL, small enough to replicate per node",
      "SORTKEY on the date column, since almost every query filters by year",
      "COPY from S3 in parallel, not INSERT",
    ],
    decision: {
      chose: "Serverless over a provisioned cluster",
      over: ["Fixed-size provisioned Redshift"],
      because: [
        "Load is bursty: heavy during refresh, near idle between",
        "No cluster to size in advance or leave running overnight",
        "Distribution and sort keys still apply, so tuning is not lost",
      ],
      cost: "Less control over warm capacity, and cold starts on the first query.",
    },
    output: [
      { value: "DISTKEY", label: "on fact join" },
      { value: "SORTKEY", label: "on date" },
      { value: "ALL", label: "on dimensions" },
    ],
  },
  {
    id: "bi",
    step: "06",
    title: "Serve",
    tool: "Amazon QuickSight",
    facts: [
      "SPICE for dashboard responsiveness",
      "Direct query kept for freshness-critical views",
      "Genre, runtime, region and rating analyses",
      "Row-level security available via the dimension keys",
    ],
    decision: {
      chose: "SPICE for most dashboards",
      over: ["Direct query for everything"],
      because: [
        "Redshift Serverless cold starts are visible in an interactive dashboard",
        "SPICE absorbs repeated slicing without re-scanning the warehouse",
        "Refresh cadence matches the source, which updates daily at best",
      ],
      cost: "Dashboard data is as old as the last SPICE refresh.",
    },
    output: [{ value: "4", label: "analysis themes" }],
  },
];

/** Physical tuning decisions, which is where warehouse work is actually judged. */
export const TUNING = [
  {
    key: "DISTKEY",
    on: "fact_title_performance.title_key",
    why: "Co-locates fact rows with the title dimension so the largest join happens on-node rather than redistributing 90M rows across slices.",
  },
  {
    key: "DISTSTYLE ALL",
    on: "dim_date, dim_genre, dim_region",
    why: "Small dimensions replicate to every node, so joining them never triggers a broadcast at query time.",
  },
  {
    key: "SORTKEY",
    on: "dim_date.date_key, fact.start_year",
    why: "Nearly every question is bounded by year, so sorting on it lets Redshift skip blocks instead of scanning the fact table.",
  },
  {
    key: "COPY",
    on: "S3 Parquet to Redshift",
    why: "Parallel bulk load across slices. Row-by-row INSERT at this volume is orders of magnitude slower and generates far more WAL.",
  },
];

export const TECH_STACK: { group: string; items: string[] }[] = [
  { group: "Storage", items: ["Amazon S3", "Parquet", "Raw and curated layers"] },
  { group: "Transform", items: ["AWS Glue", "PySpark", "Python"] },
  { group: "Warehouse", items: ["Redshift Serverless", "Star schema", "DISTKEY / SORTKEY"] },
  { group: "Profiling", items: ["Alteryx", "Data quality checks"] },
  { group: "Modelling", items: ["Conformed dimensions", "Surrogate keys", "Bridge tables"] },
  { group: "Serving", items: ["Amazon QuickSight", "SPICE"] },
];
