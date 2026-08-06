/**
 * DocuParse deep-dive content.
 *
 * SOURCES: the repository README (raw, main branch) for measured results, stage
 * list and the build-versus-buy cost table; the previous site's case study for
 * the decision rationale behind the two-model layout stage, DVC and the
 * three-format export.
 *
 * Every figure here appears in one of those two, none is inferred.
 */

export type Stat = { value: string; label: string; note?: string };

export const HEADLINE: Stat[] = [
  { value: "99.56%", label: "Native text extraction", note: "minimal OCR fallback" },
  { value: "187", label: "Tables extracted", note: "from financial statements" },
  { value: "2,954", label: "XBRL concepts validated", note: "against authoritative filings" },
  { value: "$1.05", label: "Per 1,000 pages", note: "30 to 98% below cloud" },
];

export const SCALE: Stat[] = [
  { value: "676", label: "Pages processed" },
  { value: "~3 min", label: "End to end" },
  { value: "6", label: "Pipeline stages" },
  { value: "2", label: "Layout models" },
  { value: "3", label: "Export formats" },
  { value: "3", label: "Filing types" },
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
    id: "download",
    step: "01",
    title: "Download",
    tool: "SEC EDGAR API",
    facts: [
      "10-K annual, 10-Q quarterly, 8-K current reports",
      "Filing metadata stored beside the document for traceability",
      "DVC content hash gates re-download",
    ],
    decision: {
      chose: "Content-hash the source",
      over: ["Re-download on every run"],
      because: [
        "Filings are immutable once published",
        "A hash check turns a network fetch into a no-op",
      ],
      cost: "A stale hash would silently skip a genuinely changed filing.",
    },
    output: [{ value: "3", label: "filing types" }],
  },
  {
    id: "text",
    step: "02",
    title: "Text extraction",
    tool: "Native PDF parsing + OCR fallback",
    facts: [
      "PDF text layer read first",
      "OCR only where no text layer exists",
      "Word Error Rate tracked as a quality metric",
    ],
    decision: {
      chose: "Native first, OCR as fallback",
      over: ["OCR everything for consistency"],
      because: [
        "SEC filings are mostly born-digital, so a text layer already exists",
        "OCR on a clean text layer introduces errors rather than removing them",
        "99.56% needed no OCR at all",
      ],
      cost: "Two code paths to maintain instead of one.",
    },
    output: [
      { value: "99.56%", label: "native extraction" },
      { value: "676", label: "pages" },
    ],
  },
  {
    id: "tables",
    step: "03",
    title: "Table detection",
    tool: "Camelot + pdfplumber",
    facts: [
      "Hybrid detection rather than a single library",
      "Table precision and recall measured",
      "Financial statements are the target case",
    ],
    decision: {
      chose: "Two libraries in combination",
      over: ["Camelot alone", "pdfplumber alone"],
      because: [
        "Camelot handles ruled tables; pdfplumber handles whitespace-aligned ones",
        "Financial filings contain both in the same document",
      ],
      cost: "Duplicate candidates to reconcile before export.",
    },
    output: [{ value: "187", label: "tables" }],
  },
  {
    id: "layout",
    step: "04",
    title: "Layout analysis",
    tool: "Detectron2 + LayoutLMv3",
    facts: [
      "Detectron2 finds table region bounding boxes",
      "Also classifies title, section header, body, figure, caption",
      "LayoutLMv3 reads text and layout jointly",
      "Handles merged cells, row and column spans, multi-column, nested tables",
    ],
    decision: {
      chose: "Both models, in sequence",
      over: ["Detectron2 alone", "LayoutLMv3 alone", "A pure text extractor"],
      because: [
        "Detectron2 finds where tables are but knows nothing about cell content",
        "LayoutLMv3 understands structure but needs spatial coordinates as input",
        "Neither alone produces an accurate parse of a merged-cell table",
      ],
      cost: "Two models to load, version and run per page.",
    },
    output: [{ value: "2", label: "models chained" }],
  },
  {
    id: "docling",
    step: "05",
    title: "Document understanding",
    tool: "Docling (IBM)",
    facts: [
      "Converts parsed structure into clean output",
      "Compared head to head against the custom pipeline",
      "Findings written up in reports/docling_vs_custom_comparison.md",
    ],
    decision: {
      chose: "Run Docling alongside the custom path",
      over: ["Trust one approach"],
      because: [
        "A benchmark against an enterprise tool is the only way to know if custom work is justified",
        "The comparison is a deliverable, not an internal note",
      ],
      cost: "Two pipelines producing overlapping output.",
    },
    output: [{ value: "1", label: "comparison report" }],
  },
  {
    id: "export",
    step: "06",
    title: "Export and validation",
    tool: "JSON, Markdown, CSV + XBRL",
    facts: [
      "One file per table, tagged with filing ID and page number",
      "Cross-checked against official XBRL filings",
      "Regression tests enforce quality thresholds",
      "Distribution monitoring for drift and anomalies",
    ],
    decision: {
      chose: "Three formats at export time",
      over: ["JSON only, convert later"],
      because: [
        "Downstream Python wants JSON",
        "LLM summarisation wants Markdown, where pipe-delimited tables are the norm",
        "Analysts want CSV",
        "Cost is negligible next to detection and parsing",
      ],
      cost: "Three artefacts per table to keep consistent.",
    },
    output: [
      { value: "2,954", label: "XBRL concepts validated" },
      { value: "3", label: "formats" },
    ],
  },
];

/**
 * Build versus buy, from the README's cost analysis. The strongest engineering
 * argument in the project: the alternative was priced, not hand-waved.
 */
export const COST_COMPARISON = [
  { name: "Azure Form Recognizer", low: 10, high: 50 },
  { name: "Google Document AI", low: 1.5, high: 50 },
  { name: "AWS Textract", low: 1.5, high: 50 },
  { name: "DocuParse", low: 1.05, high: 1.05, ours: true },
];

export const BUILD_BENEFITS = [
  "Complete data privacy, nothing leaves the environment",
  "No API rate limits",
  "Optimised for financial documents specifically",
  "30 to 98% cost saving at 1,000 pages",
];

export const QUALITY = [
  { metric: "Native text extraction", value: "99.56%", note: "OCR needed on the remainder only" },
  { metric: "Tables extracted", value: "187", note: "financial statements" },
  { metric: "XBRL concepts validated", value: "2,954", note: "against authoritative filings" },
  { metric: "Pages per run", value: "676", note: "in roughly 3 minutes" },
  { metric: "Cost per 1,000 pages", value: "$1.05", note: "open-source infrastructure" },
];

export const ASSURANCE = [
  { name: "XBRL validation", what: "Cross-check extracted values against authoritative financial data" },
  { name: "Accuracy metrics", what: "Word Error Rate, table precision and recall" },
  { name: "Regression testing", what: "Automated quality-threshold validation on every run" },
  { name: "Distribution monitoring", what: "Detect data drift and anomalies between runs" },
];

export const TECH_STACK: { group: string; items: string[] }[] = [
  { group: "Layout and vision", items: ["Detectron2", "LayoutLMv3"] },
  { group: "Document AI", items: ["Docling", "pdfplumber", "Camelot", "OCR"] },
  { group: "Orchestration", items: ["DVC", "params.yaml", "Python 3.9+"] },
  { group: "Source and validation", items: ["SEC EDGAR API", "XBRL parsing"] },
  { group: "Outputs", items: ["JSON", "Markdown", "CSV"] },
  { group: "Analysis", items: ["Benchmarking", "Cost modelling", "Drift monitoring"] },
];

export const DEMO_VIDEO_ID = "1w8RPBch1nPV8BpZIw0tFLPD1BmK0rkfN";
export const CODELABS_URL =
  "https://codelabs-preview.appspot.com/?file_id=1eoeyKHeNX_qYq6m8oL37XLQMEoLCK7Xv02sBSGAGbwg#0";
