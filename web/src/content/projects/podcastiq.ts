/**
 * PodcastIQ deep-dive content.
 *
 * NUMBERS POLICY: every figure here comes from the final measured run, not from
 * the April technical document or the architecture SVG. Those were produced
 * mid-project and understate the corpus by roughly 10x (8,660 claims vs 84,260;
 * 10,610 nodes vs 88,823). The SVG was patched to agree, so nothing on screen
 * contradicts anything else. This file is the only source the page reads.
 *
 * COPY POLICY: fields hold fragments, not sentences. An earlier version wrote
 * each tradeoff as a paragraph, which read like a report and got skipped. The
 * decision shape below (chose / over / because / cost) is scannable in seconds.
 */

export type Stat = { value: string; label: string; note?: string };

export const HEADLINE: Stat[] = [
  { value: "84,260", label: "Claims extracted", note: "~6.1 per chunk" },
  { value: "88,823", label: "Graph nodes", note: "253,740 relationships" },
  { value: "9", label: "LangGraph agents", note: "8 routed intents" },
  { value: "$0.0012", label: "Cost per query", note: "$1.19 per 1,000" },
];

export const CORPUS: Stat[] = [
  { value: "25", label: "Channels" },
  { value: "286", label: "Episodes" },
  { value: "44", label: "Months covered" },
  { value: "13,807", label: "Chunks" },
  { value: "768", label: "Vector dimensions" },
  { value: "100%", label: "Embedded" },
];

/** Three phases, named for what they do rather than which team owns them. */
export const PHASES = [
  {
    id: "ingest" as const,
    n: "Phase 1",
    label: "Ingest",
    sub: "Data engineering",
    from: "YouTube captions",
    to: "Queryable chunk table",
  },
  {
    id: "enrich" as const,
    n: "Phase 2",
    label: "Enrich",
    sub: "AI engineering",
    from: "Raw chunks",
    to: "Attributed, linked claims",
  },
  {
    id: "serve" as const,
    n: "Phase 3",
    label: "Serve",
    sub: "Agent runtime",
    from: "A user question",
    to: "Guarded, cited answer",
  },
];

export type Stage = {
  id: string;
  step: string;
  title: string;
  phase: "ingest" | "enrich" | "serve";
  tool: string;
  /** Short fragments. Never sentences. */
  facts: string[];
  decision: {
    chose: string;
    over: string[];
    because: string[];
    cost: string;
  };
  output: { value: string; label: string }[];
};

export const STAGES: Stage[] = [
  {
    id: "extract",
    step: "01",
    title: "Extraction",
    phase: "ingest",
    tool: "yt-dlp + YouTube Data API v3",
    facts: [
      "25 channels, 6 genres",
      "Filter: 30 min or longer, post-2022",
      "WebVTT captions plus metadata",
      "Resumable via checkpoint JSON",
    ],
    decision: {
      chose: "Captions",
      over: ["Audio download plus Whisper"],
      because: ["No GPU", "No transcription cost", "Timestamps come free"],
      cost: "Inherits YouTube caption errors. Rules out acoustic diarization.",
    },
    output: [
      { value: "286", label: "episodes" },
      { value: "146 MB", label: "JSON" },
      { value: "0", label: "failures" },
    ],
  },
  {
    id: "profile",
    step: "02",
    title: "Quality profiling",
    phase: "ingest",
    tool: "ydata-profiling",
    facts: [
      "Missing transcript detection",
      "Length distribution outliers",
      "Temporal cluster detection",
      "Duplicate video ID check",
      "VTT artefact rate",
    ],
    decision: {
      chose: "Gate before load, every cycle",
      over: ["Load first, fix later"],
      because: [
        "One bad episode contaminates chunks, embeddings, claims and graph",
        "Cheap to catch here, expensive downstream",
      ],
      cost: "A full pass that produces no user-facing output.",
    },
    output: [
      { value: "5", label: "quality gates" },
      { value: "286", label: "rated HIGH" },
    ],
  },
  {
    id: "load",
    step: "03",
    title: "Raw load",
    phase: "ingest",
    tool: "Snowflake · PUT + COPY INTO",
    facts: [
      "VARIANT payload column",
      "VIDEO_ID typed as primary key",
      "Schema-on-read",
      "RSA key-pair auth, no passwords",
    ],
    decision: {
      chose: "VARIANT plus typed join keys",
      over: ["Fully typed columns", "Fully schemaless"],
      because: [
        "Typed breaks whenever YouTube changes a field",
        "Schemaless lets duplicate episodes through",
      ],
      cost: "Casting deferred to the staging layer.",
    },
    output: [
      { value: "286", label: "rows" },
      { value: "50-100x", label: "faster than INSERT" },
      { value: "Idempotent", label: "re-runs" },
    ],
  },
  {
    id: "transform",
    step: "04",
    title: "Staging",
    phase: "ingest",
    tool: "dbt · SQL views",
    facts: [
      "LATERAL FLATTEN over transcript array",
      "VARIANT cast to 22 typed columns",
      "NULL coalescing",
      "YouTube deep-link built here",
    ],
    decision: {
      chose: "Views",
      over: ["Materialised tables"],
      because: ["Zero storage cost", "New episodes appear with no rebuild step"],
      cost: "Recomputes on every read.",
    },
    output: [
      { value: "Silver", label: "layer" },
      { value: "3", label: "dbt test types passing" },
    ],
  },
  {
    id: "chunk",
    step: "05",
    title: "Chunking",
    phase: "ingest",
    tool: "GROUP BY FLOOR(start / 120)",
    facts: [
      "Fixed 120-second windows",
      "Stub chunks under 50 chars dropped",
      "About 48 chunks per episode",
      "About 120 words per chunk",
    ],
    decision: {
      chose: "Fixed 120-second windows",
      over: ["Word-count chunking", "Semantic chunking", "Sliding windows"],
      because: [
        "Word-count breaks timestamp alignment",
        "Semantic costs an LLM call and still lands imprecisely",
        "Sliding duplicates content and hurts MRR",
        "120s lands near 120 words, optimal for arctic-embed-m",
      ],
      cost: "A window edge can split a thought mid-sentence.",
    },
    output: [
      { value: "13,807", label: "chunks" },
      { value: "100%", label: "with deep link" },
    ],
  },
  {
    id: "speakers",
    step: "06",
    title: "Speaker attribution",
    phase: "enrich",
    tool: "Regex tier + llama3.1-70b tier",
    facts: [
      "Tier 1: title regex, zero LLM calls",
      "Tier 2: per-claim inference, fires only on a Tier 1 miss",
      "Confidence: HIGH / MED / LOW / UNKNOWN",
    ],
    decision: {
      chose: "Text inference",
      over: ["pyannote acoustic diarization"],
      because: [
        "No audio was downloaded",
        "Diarization separates speakers but cannot name them",
        "Text can name the guest",
      ],
      cost: "No labelled set, so coverage is measurable but precision is not.",
    },
    output: [
      { value: "683", label: "participant rows" },
      { value: "220/286", label: "episodes with named guests" },
    ],
  },
  {
    id: "claims",
    step: "07",
    title: "Claim extraction",
    phase: "enrich",
    tool: "Snowflake Cortex · llama3.1-70b",
    facts: [
      "Types: FACT, PREDICTION, OPINION, STATISTIC",
      "Structured JSON per assertion",
      "Carries speaker, confidence, rationale",
      "Parallel across chunks",
    ],
    decision: {
      chose: "70b here, 8b for routing",
      over: ["One model everywhere"],
      because: [
        "Extraction output is a dependency for four later stages",
        "Routing only picks one of eight labels",
        "8b routes at 87.5%, 70b measured at 95.8%",
      ],
      cost: "Largest single line in the credit budget.",
    },
    output: [
      { value: "84,260", label: "claims" },
      { value: "~6.1", label: "per chunk" },
      { value: "100%", label: "attributed" },
    ],
  },
  {
    id: "temporal",
    step: "08",
    title: "Temporal drift",
    phase: "enrich",
    tool: "llama3.1-70b · pairwise",
    facts: [
      "Earliest against latest claim, per speaker per topic",
      "Gap over 30 days required",
      "Claim length over 50 chars",
      "UNKNOWN speakers excluded",
    ],
    decision: {
      chose: "Pre-compute",
      over: ["Compare at query time"],
      because: [
        "Keeps an LLM call out of the request path",
        "Temporal agent answers with plain SQL",
        "Protects the 5-second p95 budget",
      ],
      cost: "Stale between pipeline runs.",
    },
    output: [
      { value: "823", label: "evolution pairs" },
      { value: "5", label: "drift types" },
      { value: "44", label: "month span" },
    ],
  },
  {
    id: "graph",
    step: "09",
    title: "Knowledge graph",
    phase: "enrich",
    tool: "Neo4j · Cypher",
    facts: [
      "5 node types, 7 relationship types",
      "Confidence encoded in the edge type",
      "Exported from Snowflake",
      "Self-healing Cypher retry, 3 attempts",
    ],
    decision: {
      chose: "Add a graph store",
      over: ["Vector search alone"],
      because: [
        "Who appeared with whom is a traversal, not a similarity",
        "Vector search cannot answer it at any top-k",
      ],
      cost: "A second store to keep consistent with Snowflake.",
    },
    output: [
      { value: "88,823", label: "nodes" },
      { value: "253,740", label: "relationships" },
    ],
  },
  {
    id: "agents",
    step: "10",
    title: "Agent orchestration",
    phase: "serve",
    tool: "LangGraph StateGraph",
    facts: [
      "1 router plus 8 specialists",
      "8 intents routed",
      "Search to Summarize is the only chain",
      "Unrecognised label falls back to SEARCH",
    ],
    decision: {
      chose: "Route first, then dispatch",
      over: ["One agent holding every tool"],
      because: [
        "One prompt per job",
        "Routing measurable against 48 labelled queries",
        "Failures stay contained",
      ],
      cost: "A misroute sends the query to the wrong specialist entirely.",
    },
    output: [
      { value: "9", label: "agents" },
      { value: "87.5%", label: "router accuracy" },
    ],
  },
  {
    id: "safety",
    step: "11",
    title: "Guardrails",
    phase: "serve",
    tool: "4 input layers + GPT-4o judge",
    facts: [
      "Length cap",
      "Prompt-injection pattern match",
      "Language detection",
      "Scope classification",
      "LLM semantic check",
    ],
    decision: {
      chose: "Cross-family judge",
      over: ["llama grading llama"],
      because: [
        "A model is a weak critic of itself",
        "Shared blind spots go undetected",
      ],
      cost: "An external API call, so it runs selectively.",
    },
    output: [
      { value: "4", label: "input layers" },
      { value: "7/7", label: "KPI checks passing" },
    ],
  },
];

/** Extreme range (3,370:1) is why this renders as a table, not a bar chart. */
export const GRAPH_NODES = [
  { label: "Claim", value: 84260 },
  { label: "Topic", value: 3786 },
  { label: "Person", value: 466 },
  { label: "Episode", value: 286 },
  { label: "Channel", value: 25 },
];

export const GRAPH_EDGES = [
  { label: "ABOUT", value: 84260, note: "Claim to Topic" },
  { label: "SOURCED_FROM", value: 84260, note: "Claim to Episode" },
  { label: "MADE_CLAIM", value: 63274, note: "high confidence" },
  { label: "DISCUSSED_IN", value: 13479, note: "unknown speaker" },
  { label: "LIKELY_MADE_CLAIM", value: 7507, note: "medium confidence" },
  { label: "APPEARED_ON", value: 674, note: "Person to Episode" },
  { label: "BELONGS_TO", value: 286, note: "Episode to Channel" },
];

/** 823 pairs. Nominal categories, so one hue for every bar. */
export const DRIFT = [
  { label: "Contradicted", value: 396 },
  { label: "Escalated", value: 237 },
  { label: "Confirmed", value: 128 },
  { label: "Softened", value: 39 },
  { label: "Revised", value: 23 },
];


/**
 * Measured evaluation, 17 April 2026. 110 test queries across six scripts.
 *
 * Includes the two dimensions that missed target. An earlier version of this
 * page showed per-agent "typical mean" latencies from the design doc, which
 * implied the 5s p95 budget was met; the measured p95 is 16.3s. Publishing the
 * flattering number while the real report says otherwise is the kind of claim a
 * reviewer disproves in one question.
 */
export const EVAL: {
  dimension: string;
  result: string;
  target: string;
  status: "exceeds" | "pass" | "below";
}[] = [
  { dimension: "Router accuracy (70b)", result: "95.8%", target: "> 90%", status: "exceeds" },
  { dimension: "Retrieval MRR", result: "0.775", target: "> 0.70", status: "exceeds" },
  { dimension: "BERTScore F1", result: "0.774", target: "> 0.70", status: "exceeds" },
  { dimension: "LLM relevance", result: "4.4 / 5", target: "> 4.0", status: "exceeds" },
  { dimension: "Cost per query", result: "$0.0012", target: "< $0.01", status: "exceeds" },
  { dimension: "Pipeline KPI checks", result: "7 / 7", target: "7 / 7", status: "pass" },
  { dimension: "LLM faithfulness", result: "2.4 / 5", target: "> 4.0", status: "below" },
  { dimension: "LLM groundedness", result: "2.7 / 5", target: "> 4.0", status: "below" },
  { dimension: "p95 latency", result: "16.3s", target: "< 5s", status: "below" },
];

/** Real per-agent cost, from the evaluation's token-budget model. */
export const COST_BY_AGENT = [
  { label: "Summarize", value: 0.00218, note: "3,000 in / 600 out tokens" },
  { label: "Compare", value: 0.00212, note: "3,000 in / 500 out" },
  { label: "Recommend", value: 0.00146, note: "2,000 in / 400 out" },
  { label: "Fact-check", value: 0.0014, note: "2,000 in / 300 out" },
  { label: "Temporal", value: 0.00116, note: "70b plus 8b" },
  { label: "Insight", value: 0.00115, note: "1,500 in / 400 out" },
  { label: "Search", value: 0.000018, note: "embedding only, no generation" },
  { label: "Graph", value: 0.000018, note: "embedding only, no generation" },
];

/** Latency, stated as measured plus the diagnosis. */
export const LATENCY_FACTS = {
  p95: "16.3s",
  mean: "12.6s",
  target: "5s",
  cause: "Snowflake Cortex cold start on an X-SMALL warehouse",
  fix: "Warehouse scaling to M or L plus keep-warm queries brings this to 6-8s",
  context: "Comparable hosted models sit in the same range: GPT-4o 5-15s, Claude 8-20s for long completions",
};

export const KPIS = [
  { check: "Chunks indexed", threshold: "≥ 6,000", actual: "13,807" },
  { check: "Claims extracted", threshold: "≥ 1,000", actual: "84,260" },
  { check: "Evolution pairs", threshold: "≥ 100", actual: "823" },
  { check: "Claims with speaker", threshold: "≥ 50%", actual: "100%" },
  { check: "Chunks with embeddings", threshold: "≥ 90%", actual: "100%" },
  { check: "Evolution pairs valid", threshold: "≥ 90%", actual: "100%" },
  { check: "YouTube URLs valid", threshold: "≥ 95%", actual: "100%" },
];

export type Agent = {
  n: string;
  name: string;
  intent: string | null;
  model: string;
  job: string;
  example: string;
  latency?: string;
  chained?: boolean;
};

export const ROUTER: Agent = {
  n: "01",
  name: "Router",
  intent: null,
  model: "llama3.1-8b",
  job: "Classifies into one of eight intents, then dispatches. Unrecognised output falls back to SEARCH.",
  example: "87.5% on 48 labelled queries (8b, shipped)",
};

export const AGENTS: Agent[] = [
  {
    n: "02",
    name: "Search",
    intent: "SEARCH",
    model: "no LLM",
    job: "Vector retrieval over Cortex Search.",
    example: "What did Sam Altman say about GPT-5?",
    latency: "1.5s",
    chained: true,
  },
  {
    n: "03",
    name: "Summarization",
    intent: "SUMMARIZE",
    model: "llama3.1-70b",
    job: "Synthesises retrieved chunks, cited back to timestamps.",
    example: "Best strategies for building a startup?",
    latency: "3.5s",
    chained: true,
  },
  {
    n: "04",
    name: "Knowledge graph",
    intent: "GRAPH",
    model: "70b + Cypher",
    job: "Generates Cypher, traverses Neo4j, retries on malformed output.",
    example: "Who has Sam Altman appeared with?",
    latency: "4.5s",
  },
  {
    n: "05",
    name: "Temporal",
    intent: "TEMPORAL",
    model: "SQL + 70b",
    job: "Reads pre-computed drift pairs.",
    example: "How has AGI opinion changed over time?",
    latency: "3.8s",
  },
  {
    n: "06",
    name: "Fact-check",
    intent: "FACTCHECK",
    model: "Cortex + Brave",
    job: "Cortex pre-filter first; only uncertain claims reach the web.",
    example: "Fact check: GPT-5 released in 2024",
    latency: "2.5-5.5s",
  },
  {
    n: "07",
    name: "Comparison",
    intent: "COMPARE",
    model: "2 SQL + 70b",
    job: "Pulls each side independently, then contrasts.",
    example: "Compare Lex Fridman vs Joe Rogan on AI safety",
    latency: "4.0s",
  },
  {
    n: "08",
    name: "Recommendation",
    intent: "RECOMMEND",
    model: "SQL + 70b",
    job: "Falls back through looser filters so narrow asks still return.",
    example: "Suggest episodes about AI",
    latency: "2.0s",
  },
  {
    n: "09",
    name: "Insight",
    intent: "INSIGHT",
    model: "5 SQL + 70b",
    job: "Aggregates across the corpus to answer questions about the corpus.",
    example: "Which channel has the most contradicted claims?",
    latency: "4.2s",
  },
];

/** Google Drive file id for the walkthrough. */
export const DEMO_VIDEO_ID = "1d0jUIje5mElE8_u1BpUbYwlpnGoE9ZgP";

/** Everything used, grouped. Rendered at the end of the page. */
export const TECH_STACK: { group: string; items: string[] }[] = [
  { group: "Warehouse and modelling", items: ["Snowflake", "dbt", "SQL", "Snowflake Cortex"] },
  { group: "Graph", items: ["Neo4j", "Cypher", "Docker"] },
  { group: "Models", items: ["llama3.1-70b", "llama3.1-8b", "arctic-embed-m", "GPT-4o"] },
  { group: "AI orchestration", items: ["LangGraph", "Cortex Search", "GraphRAG", "Brave Search API"] },
  { group: "Ingestion", items: ["Python", "yt-dlp", "YouTube Data API v3", "ydata-profiling"] },
  { group: "Interface", items: ["Streamlit"] },
];
