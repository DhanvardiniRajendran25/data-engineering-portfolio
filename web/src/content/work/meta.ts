import type { ProjectMeta } from "./types";

/**
 * The featured projects, in display order.
 *
 * Ordering here is the ordering everywhere: the work index and prev/next
 * navigation both read from this array.
 *
 * Ranked by how much each one moves a hiring decision, not by how impressive
 * the stack sounds. Two things dominate: whether a stranger can verify it, and
 * whether it covers ground nothing else here covers.
 *
 *   1 PodcastIQ        broadest reach, AI and data at once, and complete
 *   2 Food Inspection  the only one demonstrably running right now
 *   3 SAGE             the only other one a stranger can actually use
 *   4 DocuParse        real ML rather than API orchestration, and costed
 *   5 IMDb Analytics   the deepest pure warehouse work, at 190M rows
 *   6 META TradePulse  the only streaming pipeline in the set
 *   7 ReflexAI         live and distinctive, but a personal project
 *   8 NYPD Crime       solid, now largely covered by Food Inspection
 *   9 CourtVision      the best demo, the weakest fit for these roles
 *
 * Two calls worth recording. IMDb sits at 5 despite being the only project
 * without a repo link, because 190M rows with real DISTKEY and SORTKEY tuning
 * is the strongest warehouse credential in the set and the write-up stands on
 * its own; restoring that link should move it to 4. CourtVision falls furthest,
 * not on quality but on fit: the court simulator is the most engaging thing
 * here and says the least about the roles this site is aimed at.
 *
 * See docs/PROJECT_INVENTORY.md for how the set was chosen in the first place.
 */
export const PROJECTS: ProjectMeta[] = [
  {
    slug: "podcastiq",
    image: "/projects/podcastiq.webp",
    metric: { value: "9", label: "agents" },
    title: "PodcastIQ",
    year: 2026,
    context: "Northeastern",
    oneLiner:
      "9-agent LangGraph system over 286 podcast episodes, with a 4-layer Snowflake knowledge base and an 88,823-node Neo4j temporal graph for semantic search and claim drift detection.",
    roles: ["ai", "data"],
    stack: ["LangGraph", "Snowflake", "Neo4j", "Python"],
    repo: "https://github.com/DhanvardiniRajendran25/PodcastIQ",
    hasWriteUp: true,
  },
  {
    slug: "food-inspection",
    image: "/projects/food-inspection.webp",
    metric: { value: "Live", label: "refreshed twice daily" },
    title: "Multi-City Food Inspection Platform",
    year: 2025,
    context: "Northeastern",
    oneLiner:
      "Medallion pipeline reconciling three incompatible city schemas, long, wide and narrow, into one violation-grain star schema. Rebuilt on free infrastructure and genuinely running: a scheduled job refreshes it twice a day and the page reads that database live.",
    roles: ["data"],
    stack: ["PySpark", "Snowflake", "Postgres", "GitHub Actions"],
    repo: "https://github.com/DhanvardiniRajendran25/Public_Health_Compliance_Food_Inspection_Analytics_Platform",
    hasWriteUp: true,
  },
  {
    slug: "sage",
    image: "/projects/sage.webp",
    metric: { value: "100%", label: "injection block rate" },
    title: "SAGE",
    year: 2026,
    context: "Northeastern",
    oneLiner:
      "Enterprise AI compliance assistant on GPT-4o and LangGraph with hybrid RAG over policy documents, policy-conflict detection, and a 100% prompt-injection block rate.",
    roles: ["ai", "systems"],
    stack: ["GPT-4o", "LangGraph", "ChromaDB", "Streamlit"],
    repo: "https://github.com/DhanvardiniRajendran25/SAGE",
    // Cloud Run URL returned 503; the Streamlit deployment is the live one.
    live: "https://sage-compliance-assistant.streamlit.app/",
    hasWriteUp: true,
  },
  {
    slug: "docuparse",
    image: "/projects/docuparse.webp",
    metric: { value: "99.56%", label: "native text extraction" },
    title: "DocuParse",
    year: 2025,
    context: "Northeastern",
    oneLiner:
      "SEC EDGAR document intelligence pipeline on Detectron2, LayoutLMv3, and Docling, orchestrated by DVC. 676 pages in 3 minutes, 187 tables extracted, at $1.05 per 1,000 pages against a cloud floor of $1.50.",
    roles: ["ai", "systems"],
    stack: ["Detectron2", "LayoutLMv3", "Docling", "DVC"],
    repo: "https://github.com/DhanvardiniRajendran25/Docuparse",
    hasWriteUp: true,
  },
  {
    slug: "imdb-analytics",
    image: "/projects/imdb-analytics.webp",
    metric: { value: "190M", label: "rows ingested" },
    title: "IMDb Analytics",
    year: 2025,
    context: "Northeastern",
    oneLiner:
      "AWS cloud-native ETL over 190M rows from 7 IMDb datasets: S3 to Glue to a Redshift Serverless star schema with 5 conformed dimensions, tuned distribution and sort keys, served through QuickSight.",
    roles: ["data"],
    stack: ["Amazon S3", "AWS Glue", "Redshift Serverless", "QuickSight"],
    // Repo link intentionally omitted: the published repository still documents
    // the earlier Azure Data Factory and Snowflake build, so linking it would
    // put ADF and Snowflake one click behind an AWS-titled page. Restore once
    // the code matches.
    hasWriteUp: true,
  },
  {
    slug: "meta-tradepulse",
    image: "/projects/meta-tradepulse.webp",
    metric: { value: "70+", label: "engineered features" },
    title: "META TradePulse",
    year: null,
    context: "Northeastern",
    oneLiner:
      "70+ feature financial signal pipeline across 4 live API sources and 5 modeling layers from OLS to GARCH, with walk-forward backtesting.",
    roles: ["data"],
    stack: ["Python", "GARCH", "Financial APIs"],
    repo: "https://github.com/DhanvardiniRajendran25/Quantitative_Trading_Analysis_on_META_Stock",
    hasWriteUp: false,
  },
  {
    slug: "reflexai",
    image: "/projects/reflexai.webp",
    title: "ReflexAI",
    metric: { value: "3", label: "data classes" },
    year: 2025,
    context: "Personal",
    oneLiner:
      "Stock and macro risk platform combining financial statement data, reflexivity-inspired risk diagnostics, and retrieval-augmented reasoning.",
    roles: ["ai", "data"],
    stack: ["RAG", "Python", "Financial APIs"],
    repo: "https://github.com/DhanvardiniRajendran25/ReflexAI_AI-Powered_Stock_And_Macro_Risk_Analysis_Platform",
    live: "https://reflex-ai-ai-powered-stock-and-macr.vercel.app/",
    hasWriteUp: true,
  },
  {
    slug: "nypd-crime",
    image: "/projects/nypd-crime.webp",
    title: "NYPD Crime Analytics Pipeline",
    metric: { value: "152K", label: "arrests, top age group" },
    year: 2024,
    context: "Northeastern",
    oneLiner:
      "End-to-end dimensional model for NYPD arrest data: profiling, Alteryx cleaning, SCD Type 2 in Snowflake, Power BI and Tableau dashboards.",
    roles: ["data"],
    stack: ["Alteryx", "Snowflake", "Azure Data Factory", "Power BI"],
    repo: "https://github.com/DhanvardiniRajendran25/End_to_End_NYPD_Crime_Arrest_Data_Engineering_Pipeline",
    hasWriteUp: true,
  },
  {
    slug: "courtvision",
    image: "/projects/courtvision.webp",
    metric: { value: "3", label: "coordinated agents" },
    title: "CourtVision AI",
    year: null,
    context: "Northeastern",
    oneLiner:
      "3-agent basketball coaching assistant on Gemini 2.5 that scouts opponents, analyzes film, and simulates interactive games.",
    roles: ["ai"],
    stack: ["Gemini 2.5", "Multi-agent", "Python"],
    repo: "https://github.com/DhanvardiniRajendran25/CourtVisionAI",
    hasWriteUp: false,
  },
];

export function getProject(slug: string): ProjectMeta | undefined {
  return PROJECTS.find((study) => study.slug === slug);
}
