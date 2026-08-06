import type { ProjectMeta } from "./types";

/**
 * The featured projects, in display order.
 *
 * Ordering here is the ordering everywhere: the work index, the homepage
 * selection, and prev/next navigation all read from this array.
 *
 * Ranked by how much each project moves a hiring decision, not by how
 * impressive the stack sounds. Finished work and verifiable artifacts rank
 * above interesting-but-unwritten: PodcastIQ has a full write-up, Sage is the
 * only one a stranger can actually use, DocuParse is distinct ML on
 * unstructured data. Food Inspection ranks last because it overlaps most with
 * NYPD Crime and IMDb, so it adds the least that is not already covered. See
 * docs/PROJECT_INVENTORY.md for how this set was chosen.
 *
 * `oneLiner` values are carried over verbatim from the previous site's meta
 * descriptions. Rewriting them to the new structure happens in Phase E.
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
    slug: "food-inspection",
    image: "/projects/food-inspection.webp",
    metric: { value: "2", label: "cities unified" },
    title: "Multi-City Food Inspection Platform",
    year: 2025,
    context: "Northeastern",
    oneLiner:
      "Medallion pipeline reconciling two incompatible city schemas, Chicago long-form and Dallas wide-form, into one violation-grain star schema on Databricks PySpark, Snowflake Dynamic Tables, and Tableau.",
    roles: ["data"],
    stack: ["Databricks", "PySpark", "Snowflake", "Tableau"],
    repo: "https://github.com/DhanvardiniRajendran25/Public_Health_Compliance_Food_Inspection_Analytics_Platform",
    hasWriteUp: true,
  },
];

export function getProject(slug: string): ProjectMeta | undefined {
  return PROJECTS.find((study) => study.slug === slug);
}
