/**
 * DocuParse architecture, full detail.
 *
 * Built in the same register as the PodcastIQ diagram: banded by concern, one
 * card per stage, and each card carries what goes in, what comes out, the
 * tradeoff taken and the measured result. A six-box arrow chain communicates the
 * order and nothing else; this is meant to be readable on its own.
 *
 * Inline SVG rather than an exported image so it inherits the theme tokens
 * through Tailwind classes, stays legible in light and dark from one source, and
 * keeps every label as real selectable text with a full description for screen
 * readers.
 */

type Card = {
  title: string;
  tool: string;
  /** What this stage emits. */
  formLabel: string;
  form: string[];
  stats: string[];
  tradeoff: { title: string; lines: string[] };
  result: string;
  resultNote?: string;
  accent?: boolean;
};

const CARD_W = 258;
const CARD_H = 520;
const GAP = 24;
const X0 = 26;
const CARD_Y = 112;

const BANDS: { label: string; note: string; from: number; span: number }[] = [
  { label: "INGESTION", note: "raw filings to text", from: 0, span: 2 },
  { label: "STRUCTURE EXTRACTION", note: "where and what", from: 2, span: 2 },
  { label: "UNDERSTANDING AND OUTPUT", note: "parsed to validated", from: 4, span: 2 },
];

const CARDS: Card[] = [
  {
    title: "DOWNLOAD",
    tool: "SEC EDGAR API",
    formLabel: "EMITS",
    form: ["Source PDFs", "Filing metadata JSON", "Company + fiscal year tags"],
    stats: ["10-K annual", "10-Q quarterly", "8-K current", "Configured in params.yaml"],
    tradeoff: {
      title: "Content-hash the source",
      lines: [
        "Filings are immutable once published",
        "Hash check turns a fetch into a no-op",
        "Risk: a stale hash skips a real change",
      ],
    },
    result: "3 filing types",
    resultNote: "traceable to source",
  },
  {
    title: "TEXT EXTRACTION",
    tool: "Native PDF + OCR fallback",
    formLabel: "EMITS",
    form: ["Page-level text", "Per-page extraction method", "Word Error Rate per page"],
    stats: ["Text layer read first", "OCR only where none exists", "676 pages in ~3 min"],
    tradeoff: {
      title: "Native first, OCR second",
      lines: [
        "Filings are mostly born-digital",
        "OCR on clean text adds errors",
        "Cost: two code paths to maintain",
      ],
    },
    result: "99.56% native",
    resultNote: "OCR on the remainder only",
    accent: true,
  },
  {
    title: "TABLE DETECTION",
    tool: "Camelot + pdfplumber",
    formLabel: "EMITS",
    form: ["Table candidates", "Cell grids", "Precision / recall per page"],
    stats: ["Camelot: ruled tables", "pdfplumber: whitespace-aligned", "Both appear in one filing"],
    tradeoff: {
      title: "Two libraries, not one",
      lines: [
        "Neither covers both table styles",
        "Cost: duplicate candidates to reconcile",
      ],
    },
    result: "187 tables",
    resultNote: "financial statements",
  },
  {
    title: "LAYOUT ANALYSIS",
    tool: "Detectron2 → LayoutLMv3",
    formLabel: "EMITS",
    form: ["Region bounding boxes", "Region classes", "Cell spans + hierarchy"],
    stats: [
      "Detectron2: where tables are",
      "Classes: title, header, body, figure",
      "LayoutLMv3: text + layout jointly",
      "Merged cells, spans, nesting",
    ],
    tradeoff: {
      title: "Both models, chained",
      lines: [
        "Detectron2 finds regions, ignores content",
        "LayoutLMv3 needs coordinates as input",
        "Neither alone parses a merged cell",
        "Cost: two models per page",
      ],
    },
    result: "2 models",
    resultNote: "spatial then structural",
    accent: true,
  },
  {
    title: "DOCUMENT AI",
    tool: "Docling (IBM)",
    formLabel: "EMITS",
    form: ["Docling document model", "Parallel parse of same input"],
    stats: ["Run beside the custom path", "Head-to-head comparison", "Written up as a report"],
    tradeoff: {
      title: "Benchmark against enterprise",
      lines: [
        "Only way to know custom work is justified",
        "The comparison is a deliverable",
        "Cost: two overlapping pipelines",
      ],
    },
    result: "1 comparison",
    resultNote: "custom vs Docling",
  },
  {
    title: "EXPORT + VALIDATE",
    tool: "JSON / Markdown / CSV",
    formLabel: "EMITS",
    form: [
      "One file per table",
      "Tagged filing ID + page",
      "XBRL verification report",
    ],
    stats: [
      "JSON for downstream Python",
      "Markdown for LLM ingestion",
      "CSV for analysts",
      "Regression thresholds enforced",
    ],
    tradeoff: {
      title: "Three formats at export",
      lines: [
        "Each consumer wants a different shape",
        "Negligible next to detect and parse",
        "Cost: three artefacts to keep in sync",
      ],
    },
    result: "2,954 concepts",
    resultNote: "XBRL cross-validated",
    accent: true,
  },
];

/** Data passed between stages, drawn on the connectors. */
const EDGE_LABELS = ["PDF", "text", "grids", "structure", "doc model"];

/** Stage index from which a model change forces reruns. */
const RERUN_FROM = 3;

function x(i: number) {
  return X0 + i * (CARD_W + GAP);
}

export function DocuparseArchitecture() {
  const railRight = x(CARDS.length - 1) + CARD_W;

  return (
    <figure className="m-0 overflow-hidden rounded-brand border border-line bg-bg-elev">
      <div className="overflow-x-auto">
        <svg
          viewBox="0 0 1760 800"
          role="img"
          aria-labelledby="dp-arch-title dp-arch-desc"
          className="h-auto w-full min-w-[1400px]"
        >
          <title id="dp-arch-title">DocuParse pipeline architecture</title>
          <desc id="dp-arch-desc">
            Six DVC-managed stages, grouped into ingestion, structure extraction,
            and understanding and output. Download pulls 10-K, 10-Q and 8-K
            filings from SEC EDGAR and content-hashes them. Text extraction reads
            the native PDF layer first and falls back to OCR only where none
            exists, achieving 99.56 percent native extraction across 676 pages in
            about three minutes. Table detection combines Camelot for ruled tables
            with pdfplumber for whitespace-aligned ones, yielding 187 tables.
            Layout analysis chains Detectron2, which locates region bounding
            boxes, into LayoutLMv3, which reads text and layout jointly to resolve
            merged cells and spans. Docling runs in parallel as an enterprise
            benchmark against the custom path. Export writes JSON, Markdown and
            CSV per table and cross-validates 2,954 XBRL concepts against
            authoritative filings. Because DVC content-hashes every stage,
            changing the LayoutLMv3 version reruns layout, Docling and export
            only, not download or detection.
          </desc>

          {/* DVC rail across all six stages */}
          <rect
            x="14"
            y="52"
            width={railRight + 12 - 14}
            height={CARD_H + 92}
            rx="10"
            className="fill-ink/[0.02] stroke-accent"
            strokeWidth="1.4"
            strokeDasharray="10 5"
          />
          <rect x="14" y="52" width="300" height="24" rx="6" className="fill-accent" />
          <text
            x="26"
            y="69"
            className="fill-bg font-mono"
            fontSize="11"
            fontWeight="700"
            letterSpacing="1.6"
          >
            DVC PIPELINE · CONTENT-HASHED
          </text>
          <text x={railRight - 4} y="69" textAnchor="end" className="fill-accent font-mono" fontSize="9">
            dvc repro · incremental
          </text>

          {/* Concern bands */}
          {BANDS.map((b) => {
            const bx = x(b.from) - 10;
            const bw = (CARD_W + GAP) * b.span - GAP + 20;
            return (
              <g key={b.label}>
                <rect
                  x={bx}
                  y="86"
                  width={bw}
                  height={CARD_H + 44}
                  rx="8"
                  className="fill-none stroke-line"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text x={bx + 10} y="102" className="fill-ink font-mono" fontSize="9" letterSpacing="1.4">
                  {b.label}
                </text>
                <text x={bx + bw - 10} y="102" textAnchor="end" className="fill-ink-faint font-mono" fontSize="8">
                  {b.note}
                </text>
              </g>
            );
          })}

          {/* Stage cards */}
          {CARDS.map((c, i) => {
            const cx = x(i);
            return (
              <g key={c.title}>
                <rect
                  x={cx}
                  y={CARD_Y}
                  width={CARD_W}
                  height={CARD_H}
                  rx="8"
                  className={`fill-bg ${c.accent ? "stroke-accent" : "stroke-line"}`}
                  strokeWidth={c.accent ? "1.8" : "1.2"}
                />
                {/* Header */}
                <rect
                  x={cx}
                  y={CARD_Y}
                  width={CARD_W}
                  height="26"
                  rx="8"
                  className={c.accent ? "fill-accent" : "fill-ink"}
                />
                <rect
                  x={cx}
                  y={CARD_Y + 14}
                  width={CARD_W}
                  height="12"
                  className={c.accent ? "fill-accent" : "fill-ink"}
                />
                <text
                  x={cx + CARD_W / 2}
                  y={CARD_Y + 18}
                  textAnchor="middle"
                  className="fill-bg font-mono"
                  fontSize="9.5"
                  fontWeight="700"
                  letterSpacing="0.6"
                >
                  {String(i + 1).padStart(2, "0")} · {c.title}
                </text>

                {/* Tool chip */}
                <rect
                  x={cx + 10}
                  y={CARD_Y + 36}
                  width={CARD_W - 20}
                  height="22"
                  rx="4"
                  className="fill-ink/[0.05] stroke-line"
                  strokeWidth="1"
                />
                <text
                  x={cx + CARD_W / 2}
                  y={CARD_Y + 51}
                  textAnchor="middle"
                  className="fill-ink font-mono"
                  fontSize="8.5"
                >
                  {c.tool}
                </text>

                {/* Emits */}
                <text x={cx + CARD_W / 2} y={CARD_Y + 76} textAnchor="middle" className="fill-ink-faint font-mono" fontSize="7.5" letterSpacing="0.8">
                  {c.formLabel}
                </text>
                <rect
                  x={cx + 10}
                  y={CARD_Y + 82}
                  width={CARD_W - 20}
                  height={c.form.length * 14 + 12}
                  rx="4"
                  className="fill-ink/[0.03] stroke-line"
                  strokeWidth="1"
                />
                {c.form.map((f, j) => (
                  <text key={f} x={cx + 18} y={CARD_Y + 99 + j * 14} className="fill-ink-soft" fontSize="8">
                    {f}
                  </text>
                ))}

                {/* Stats */}
                {c.stats.map((s, j) => (
                  <text
                    key={s}
                    x={cx + 18}
                    y={CARD_Y + 82 + c.form.length * 14 + 34 + j * 15}
                    className="fill-ink-soft"
                    fontSize="8.5"
                  >
                    &middot; {s}
                  </text>
                ))}

                {/* Tradeoff */}
                <rect
                  x={cx + 10}
                  y={CARD_Y + 300}
                  width={CARD_W - 20}
                  height={c.tradeoff.lines.length * 13 + 32}
                  rx="4"
                  className="fill-accent/[0.07] stroke-accent"
                  strokeWidth="1.1"
                />
                <text x={cx + 18} y={CARD_Y + 317} className="fill-accent font-mono" fontSize="8" fontWeight="700">
                  TRADEOFF
                </text>
                <text x={cx + 18} y={CARD_Y + 330} className="fill-ink" fontSize="8.5">
                  {c.tradeoff.title}
                </text>
                {c.tradeoff.lines.map((l, j) => (
                  <text key={l} x={cx + 18} y={CARD_Y + 344 + j * 13} className="fill-ink-soft" fontSize="7.5">
                    {l}
                  </text>
                ))}

                {/* Result */}
                <rect
                  x={cx + 10}
                  y={CARD_Y + CARD_H - 62}
                  width={CARD_W - 20}
                  height="30"
                  rx="4"
                  className={`${c.accent ? "fill-accent/[0.14] stroke-accent" : "fill-ink/[0.05] stroke-line"}`}
                  strokeWidth="1.2"
                />
                <text
                  x={cx + CARD_W / 2}
                  y={CARD_Y + CARD_H - 42}
                  textAnchor="middle"
                  className={`font-mono ${c.accent ? "fill-accent" : "fill-ink"}`}
                  fontSize="12"
                  fontWeight="700"
                >
                  {c.result}
                </text>
                {c.resultNote && (
                  <text
                    x={cx + CARD_W / 2}
                    y={CARD_Y + CARD_H - 16}
                    textAnchor="middle"
                    className="fill-ink-faint"
                    fontSize="7.5"
                  >
                    {c.resultNote}
                  </text>
                )}

                {/* Connector to the next card, labelled with the data form */}
                {i < CARDS.length - 1 && (
                  <g>
                    <line
                      x1={cx + CARD_W}
                      y1={CARD_Y + CARD_H / 2}
                      x2={cx + CARD_W + GAP - 6}
                      y2={CARD_Y + CARD_H / 2}
                      className="stroke-ink-faint"
                      strokeWidth="1.6"
                    />
                    <polygon
                      points={`${cx + CARD_W + GAP - 6},${CARD_Y + CARD_H / 2 - 4} ${cx + CARD_W + GAP},${CARD_Y + CARD_H / 2} ${cx + CARD_W + GAP - 6},${CARD_Y + CARD_H / 2 + 4}`}
                      className="fill-ink-faint"
                    />
                    <text
                      x={cx + CARD_W + GAP / 2}
                      y={CARD_Y + CARD_H / 2 - 8}
                      textAnchor="middle"
                      className="fill-ink-faint font-mono"
                      fontSize="7"
                    >
                      {EDGE_LABELS[i]}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Rerun boundary: the reason DVC is in the stack */}
          <line
            x1={x(RERUN_FROM) - GAP / 2}
            y1="80"
            x2={x(RERUN_FROM) - GAP / 2}
            y2={CARD_Y + CARD_H + 78}
            className="stroke-accent"
            strokeWidth="1.4"
            strokeDasharray="5 4"
          />
          <text
            x={x(RERUN_FROM) - GAP / 2 + 8}
            y={CARD_Y + CARD_H + 74}
            className="fill-accent font-mono"
            fontSize="9"
          >
            change the LayoutLMv3 version → only stages right of this line rerun
          </text>

          {/* Downstream artefacts */}
          <line
            x1={railRight - CARD_W / 2}
            y1={CARD_Y + CARD_H}
            x2={railRight - CARD_W / 2}
            y2={CARD_Y + CARD_H + 96}
            className="stroke-ink-faint"
            strokeWidth="1.4"
            strokeDasharray="3 3"
          />
          <rect
            x={railRight - CARD_W - 60}
            y={CARD_Y + CARD_H + 96}
            width="300"
            height="58"
            rx="6"
            className="fill-bg stroke-line"
            strokeWidth="1.2"
          />
          <text x={railRight - CARD_W - 48} y={CARD_Y + CARD_H + 116} className="fill-ink font-mono" fontSize="9.5">
            XBRL CROSS-VERIFICATION
          </text>
          <text x={railRight - CARD_W - 48} y={CARD_Y + CARD_H + 131} className="fill-ink-soft" fontSize="8">
            2,954 concepts against authoritative filings
          </text>
          <text x={railRight - CARD_W - 48} y={CARD_Y + CARD_H + 145} className="fill-ink-soft" fontSize="8">
            catches a confident parse of the wrong number
          </text>

          <rect
            x={X0}
            y={CARD_Y + CARD_H + 96}
            width="330"
            height="58"
            rx="6"
            className="fill-bg stroke-line"
            strokeWidth="1.2"
          />
          <text x={X0 + 12} y={CARD_Y + CARD_H + 116} className="fill-ink font-mono" fontSize="9.5">
            BENCHMARKING · BUILD VS BUY
          </text>
          <text x={X0 + 12} y={CARD_Y + CARD_H + 131} className="fill-ink-soft" fontSize="8">
            runtime, memory, bottleneck, drift, regression
          </text>
          <text x={X0 + 12} y={CARD_Y + CARD_H + 145} className="fill-ink-soft" fontSize="8">
            $1.05 / 1,000 pages vs $1.50 cloud floor
          </text>

          {/* Entry / exit */}
          <text x={X0} y="42" className="fill-ink font-mono" fontSize="10">
            SEC EDGAR → 10-K / 10-Q / 8-K
          </text>
          <text x={railRight} y="42" textAnchor="end" className="fill-ink font-mono" fontSize="10">
            JSON · Markdown · CSV
          </text>
        </svg>
      </div>
      <figcaption className="border-t border-line px-4 py-2 font-mono text-[10px] tracking-[0.1em] text-ink-faint uppercase">
        Six content-hashed stages. Each card carries what it emits, the tradeoff taken, and the measured result.
      </figcaption>
    </figure>
  );
}
