/**
 * Food Inspection Analytics deep-dive content.
 *
 * SOURCE: transcribed from the project README, including the two cities'
 * differing shapes, the profiling findings that drove selective transformation,
 * and the audit columns stamped on every record.
 */

export type Stat = { value: string; label: string };

export const SCALE: Stat[] = [
  { value: "2", label: "Cities unified" },
  { value: "3", label: "Medallion layers" },
  { value: "25", label: "Dallas violation blocks" },
  { value: "5", label: "Gold entities" },
  { value: "Dynamic", label: "Snowflake tables" },
  { value: "2025", label: "Delivered" },
];

/**
 * The whole problem in one table. Same domain, incompatible shapes, which is
 * why one generic pipeline could not have worked.
 */
export const CITIES = [
  {
    city: "Chicago",
    source: "Chicago Department of Public Health",
    shape: "Long",
    violations: "Pipe-separated free-text strings",
    quirks: ["Risk categories 1 to 3", "Violations need regex parsing", "Missing geographic fields"],
  },
  {
    city: "Dallas",
    source: "Dallas Code Compliance Services",
    shape: "Wide",
    violations: "Up to 25 violation blocks per inspection",
    quirks: ["Coordinates embedded in text", "Blocks past 5 over 99% null", "Address split across columns"],
  },
];

/**
 * Profiling findings.
 *
 * These are measured against the live Socrata feeds, not carried over from the
 * original write-up. The original claimed Dallas violation blocks beyond number
 * five were "over 99% null", which the live data does not support: block 5 is
 * 49% populated and block 6 is 40%. The 99% threshold is not reached until
 * block 17. The corrected figures are below, and the live panel recomputes them
 * on every run rather than trusting this file.
 */
export const FINDINGS = [
  {
    finding: "Dallas violation block sparsity",
    detail: "92% populated at block 1, 13% at block 10, under 1% from block 17",
    action: "Unpivot only blocks that carry data, per row",
  },
  {
    finding: "Chicago violation strings",
    detail: "Pipe-separated free text, 4.8 violations per inspection on average",
    action: "Regex parse into code, description, comment",
  },
  {
    finding: "ZIP codes",
    detail: "Stored as floats, arriving as 60614.0",
    action: "Cast, strip non-digits, zero-pad to five",
  },
  {
    finding: "NYC sentinel dates",
    detail: "Never-inspected records carry 1900-01-01",
    action: "Reject, rather than record a century-old inspection",
  },
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
    id: "ingest",
    step: "01",
    title: "Ingest",
    tool: "Azure Data Factory",
    facts: [
      "Both cities landed unchanged",
      "Azure Data Lake Gen2 as the raw store",
      "Pipeline control and scheduling in ADF",
    ],
    decision: {
      chose: "Land each city in its own native shape",
      over: ["Conform to a shared schema on ingest"],
      because: [
        "Conforming on ingest destroys the evidence when a parse is wrong",
        "The two shapes need different logic, and that belongs downstream",
        "Re-processing never re-downloads",
      ],
      cost: "Two divergent shapes to carry until the silver layer.",
    },
    output: [{ value: "Bronze", label: "layer" }],
  },
  {
    id: "profile",
    step: "02",
    title: "Profile",
    tool: "Alteryx · ydata-profiling",
    facts: [
      "Null distribution and sparsity",
      "Schema mismatches across years",
      "Violation density per inspection",
      "Geographic completeness",
    ],
    decision: {
      chose: "Profile to decide what not to process",
      over: ["Transform every column defensively"],
      because: [
        "Dallas block density falls from 92% to under 1% across 25 columns",
        "Unpivoting every block would multiply rows for mostly empty columns",
        "Profiling turned a guess about cost into a measurement",
      ],
      cost: "Recomputed every run, because a threshold set once goes stale silently.",
    },
    output: [{ value: "4", label: "findings acted on" }],
  },
  {
    id: "transform",
    step: "03",
    title: "Transform",
    tool: "Databricks · PySpark",
    facts: [
      "Dallas: wide to long, blocks unpivoted",
      "Chicago: pipe-separated strings regex-parsed",
      "Coordinates extracted from text via regex",
      "Modular notebooks, run in a fixed order",
    ],
    decision: {
      chose: "One pipeline per city, then union",
      over: ["A single generic pipeline handling both"],
      because: [
        "Wide-to-long and text-parsing share no logic",
        "A generic path would branch on city at every step anyway",
        "City-specific code is readable; a branching monolith is not",
      ],
      cost: "Adding a third city means writing a third transformation, not a config entry.",
    },
    output: [
      { value: "Silver", label: "layer" },
      { value: "2", label: "city pipelines" },
    ],
  },
  {
    id: "unify",
    step: "04",
    title: "Unify",
    tool: "PySpark · staging table",
    facts: [
      "Both cities land in one unified staging table",
      "Violation grain reconciled across shapes",
      "Risk levels and results standardised",
    ],
    decision: {
      chose: "Unify at violation grain",
      over: ["Unify at inspection grain"],
      because: [
        "Dallas carries many violations per inspection, Chicago packs them into one string",
        "Inspection grain would need an array column and block violation-level analysis",
        "Violation grain makes the two cities genuinely comparable",
      ],
      cost: "Inspection-level counts now require a distinct, which is easy to forget.",
    },
    output: [{ value: "1", label: "unified table" }],
  },
  {
    id: "model",
    step: "05",
    title: "Model",
    tool: "Snowflake Dynamic Tables · ER Studio",
    facts: [
      "fact_inspections with 4 dimensions",
      "dim_establishment, dim_location, dim_violation, dim_date",
      "Dynamic Tables handle incremental refresh",
      "Dependency tracking is declarative",
    ],
    decision: {
      chose: "Dynamic Tables over scheduled MERGE",
      over: ["Hand-written MERGE on a schedule"],
      because: [
        "Refresh and dependency order are declared, not orchestrated",
        "The warehouse works out what is stale rather than a cron guessing",
        "Less pipeline code to keep correct",
      ],
      cost: "Refresh behaviour is Snowflake's to decide, so tuning latency means tuning lag targets, not logic.",
    },
    output: [
      { value: "Gold", label: "layer" },
      { value: "5", label: "entities" },
    ],
  },
  {
    id: "serve",
    step: "06",
    title: "Serve",
    tool: "Tableau",
    facts: [
      "Inspection outcome distributions",
      "Risk-based hotspot analysis",
      "Violation frequency and severity trends",
      "Geographic clustering of failed inspections",
    ],
    decision: {
      chose: "Build for public health officials, not analysts",
      over: ["A general exploratory workbook"],
      because: [
        "The audience needs to prioritise interventions, not slice data",
        "Hotspots and severity answer that; a pivot table does not",
      ],
      cost: "Less flexible for someone who wants an unanticipated cut.",
    },
    output: [{ value: "5", label: "dashboard views" }],
  },
];

/** Why the layering exists, in the project's own terms. */
export const MEDALLION_WHY = [
  "Clear separation of concerns",
  "Reprocessing without data loss",
  "Scalable to more cities or years",
  "Audit-friendly and production-ready",
];

/** Stamped on every record. The cheapest governance that actually works. */
export const AUDIT_COLUMNS = [
  { col: "job_id", what: "Unique pipeline execution that produced the row" },
  { col: "load_dt", what: "Ingestion timestamp" },
  { col: "source", what: "Which city the record came from" },
];

export const TECH_STACK: { group: string; items: string[] }[] = [
  { group: "Orchestration", items: ["Azure Data Factory", "Azure Data Lake Gen2"] },
  { group: "Processing", items: ["Databricks", "PySpark", "Regex parsing"] },
  { group: "Warehouse", items: ["Snowflake", "Dynamic Tables", "Incremental refresh"] },
  { group: "Modelling", items: ["ER Studio", "Star schema", "Medallion architecture"] },
  { group: "Profiling", items: ["Alteryx", "ydata-profiling", "Excel"] },
  { group: "Serving", items: ["Tableau"] },
];
