/**
 * DocuParse architecture: a DVC-managed DAG.
 *
 * Inline SVG so it inherits the theme tokens and keeps its labels as real,
 * selectable text, with a full description for screen readers.
 *
 * The DVC band across the top is the point of the drawing. Each stage is
 * content-hashed, so changing the LayoutLMv3 version reruns parsing and export
 * only, not download and detection. A flat left-to-right arrow chain would not
 * show that, so the incremental-rerun boundary is drawn explicitly.
 */

type Node = { x: number; title: string; sub: string; accent?: boolean };

const ROW_Y = 96;
const W = 128;
const H = 58;
const GAP = 22;

const NODES: Node[] = [
  { x: 16, title: "Download", sub: "SEC EDGAR" },
  { x: 16 + (W + GAP), title: "Text", sub: "native + OCR" },
  { x: 16 + (W + GAP) * 2, title: "Tables", sub: "Camelot + pdfplumber" },
  { x: 16 + (W + GAP) * 3, title: "Layout", sub: "Detectron2 + LayoutLMv3", accent: true },
  { x: 16 + (W + GAP) * 4, title: "Docling", sub: "IBM document AI" },
  { x: 16 + (W + GAP) * 5, title: "Export", sub: "JSON / MD / CSV" },
];

/** Where a model change stops forcing upstream reruns. */
const RERUN_FROM = 3;

export function DocuparseArchitecture() {
  const lastRight = NODES[NODES.length - 1].x + W;

  return (
    <figure className="m-0 overflow-hidden rounded-brand border border-line bg-bg-elev">
      <div className="overflow-x-auto">
        <svg
          viewBox="0 0 940 250"
          role="img"
          aria-labelledby="dp-arch-title dp-arch-desc"
          className="h-auto w-full min-w-[880px]"
        >
          <title id="dp-arch-title">DocuParse pipeline architecture</title>
          <desc id="dp-arch-desc">
            Six DVC-managed stages run left to right: download from SEC EDGAR,
            text extraction with native parsing and OCR fallback, table detection
            with Camelot and pdfplumber, layout analysis chaining Detectron2 into
            LayoutLMv3, document understanding with Docling, and export to JSON,
            Markdown and CSV. DVC content-hashes every stage, so changing the
            LayoutLMv3 version reruns only layout, Docling and export. Exported
            tables are cross-validated against official XBRL filings, and
            benchmarking measures runtime, cost and drift.
          </desc>

          {/* DVC band */}
          <rect
            x="8"
            y="34"
            width="924"
            height="118"
            rx="8"
            className="fill-ink/[0.02] stroke-line"
            strokeWidth="1"
            strokeDasharray="4 3"
          />
          <text x="18" y="49" className="fill-ink-faint font-mono" fontSize="8" letterSpacing="1.4">
            DVC PIPELINE, CONTENT-HASHED PER STAGE
          </text>

          {/* Incremental-rerun boundary: the reason DVC is here at all */}
          <line
            x1={NODES[RERUN_FROM].x - GAP / 2}
            y1="58"
            x2={NODES[RERUN_FROM].x - GAP / 2}
            y2="228"
            className="stroke-accent"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
          <text
            x={NODES[RERUN_FROM].x - GAP / 2 + 6}
            y="222"
            className="fill-accent font-mono"
            fontSize="7.5"
          >
            change a model, only stages to the right rerun
          </text>

          {/* Stage boxes and arrows */}
          {NODES.map((n, i) => (
            <g key={n.title}>
              <rect
                x={n.x}
                y={ROW_Y}
                width={W}
                height={H}
                rx="5"
                className={`fill-bg ${n.accent ? "stroke-accent" : "stroke-line"}`}
                strokeWidth={n.accent ? "1.4" : "1"}
              />
              <text
                x={n.x + 10}
                y={ROW_Y + 22}
                className={`font-mono ${n.accent ? "fill-accent" : "fill-ink"}`}
                fontSize="10"
              >
                {String(i + 1).padStart(2, "0")} {n.title}
              </text>
              <text x={n.x + 10} y={ROW_Y + 38} className="fill-ink-soft" fontSize="7.5">
                {n.sub}
              </text>

              {i < NODES.length - 1 && (
                <g>
                  <line
                    x1={n.x + W}
                    y1={ROW_Y + H / 2}
                    x2={n.x + W + GAP - 5}
                    y2={ROW_Y + H / 2}
                    className="stroke-ink-faint"
                    strokeWidth="1.2"
                  />
                  <polygon
                    points={`${n.x + W + GAP - 5},${ROW_Y + H / 2 - 3} ${n.x + W + GAP},${ROW_Y + H / 2} ${n.x + W + GAP - 5},${ROW_Y + H / 2 + 3}`}
                    className="fill-ink-faint"
                  />
                </g>
              )}
            </g>
          ))}

          {/* Validation and benchmarking hang off the export stage */}
          <line
            x1={lastRight - W / 2}
            y1={ROW_Y + H}
            x2={lastRight - W / 2}
            y2={ROW_Y + H + 22}
            className="stroke-ink-faint"
            strokeWidth="1.2"
          />
          <rect
            x={lastRight - W - 40}
            y={ROW_Y + H + 22}
            width="168"
            height="42"
            rx="5"
            className="fill-bg stroke-line"
            strokeWidth="1"
          />
          <text x={lastRight - W - 30} y={ROW_Y + H + 38} className="fill-ink font-mono" fontSize="8.5">
            XBRL cross-validation
          </text>
          <text x={lastRight - W - 30} y={ROW_Y + H + 52} className="fill-ink-soft" fontSize="7.5">
            2,954 concepts checked
          </text>

          <rect
            x="16"
            y={ROW_Y + H + 22}
            width="196"
            height="42"
            rx="5"
            className="fill-bg stroke-line"
            strokeWidth="1"
          />
          <text x="26" y={ROW_Y + H + 38} className="fill-ink font-mono" fontSize="8.5">
            Benchmarking
          </text>
          <text x="26" y={ROW_Y + H + 52} className="fill-ink-soft" fontSize="7.5">
            runtime, cost, drift, regression
          </text>

          <text x="16" y={ROW_Y - 18} className="fill-ink font-mono" fontSize="8.5">
            10-K / 10-Q / 8-K
          </text>
        </svg>
      </div>
      <figcaption className="border-t border-line px-4 py-2 font-mono text-[10px] tracking-[0.1em] text-ink-faint uppercase">
        Six stages, content-hashed. The dashed line is the rerun boundary.
      </figcaption>
    </figure>
  );
}
