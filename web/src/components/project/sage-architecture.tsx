/**
 * SAGE system architecture.
 *
 * Inline SVG rather than an exported image on purpose: it inherits the theme
 * tokens through currentColor and Tailwind classes, so it is legible in light
 * and dark without maintaining two files, and the text stays real text, which
 * means it is selectable, searchable and readable by a screen reader through the
 * description below.
 *
 * Left to right is the request path. The three security gates come first
 * because that is the actual execution order: a query is sanitised, matched
 * against the pattern set and scope-checked before retrieval ever runs.
 */

type Box = {
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  lines: string[];
  accent?: boolean;
};

const BAND_Y = 30;
const ROW_Y = 62;

const BANDS: { x: number; w: number; label: string }[] = [
  { x: 8, w: 208, label: "Security gates" },
  { x: 232, w: 208, label: "Retrieval" },
  { x: 456, w: 232, label: "Agent" },
  { x: 704, w: 208, label: "Post-processing" },
];

const BOXES: Box[] = [
  // Security gates
  { x: 16, y: ROW_Y, w: 192, h: 62, title: "L0 sanitize_query()", lines: ["Strip [INST] <sys> [OVERRIDE]", "Cap at 1,200 chars"] },
  { x: 16, y: ROW_Y + 76, w: 192, h: 62, title: "L1 is_injection()", lines: ["52 patterns", "9 attack families"], accent: true },
  { x: 16, y: ROW_Y + 152, w: 192, h: 62, title: "L2 _is_out_of_scope()", lines: ["Policy grounding gate", "Contact queries pass"] },

  // Retrieval
  { x: 240, y: ROW_Y, w: 192, h: 62, title: "_expand_query()", lines: ["57 synonym mappings", "work abroad to remote"] },
  { x: 240, y: ROW_Y + 76, w: 192, h: 62, title: "ChromaDB", lines: ["text-embedding-3-small", "Section-boundary chunks"] },
  { x: 240, y: ROW_Y + 152, w: 192, h: 62, title: "Re-rank", lines: ["0.6 semantic", "0.4 keyword overlap"], accent: true },

  // Agent
  { x: 464, y: ROW_Y, w: 216, h: 62, title: "LangGraph ReAct", lines: ["GPT-4o, StateGraph", "ToolNode + tools_condition"], accent: true },
  { x: 464, y: ROW_Y + 76, w: 104, h: 46, title: "search_policy", lines: ["top-7"] },
  { x: 576, y: ROW_Y + 76, w: 104, h: 46, title: "cross_refs", lines: ["triggered"] },
  { x: 464, y: ROW_Y + 130, w: 104, h: 46, title: "conflicts", lines: ["CF-001..005"] },
  { x: 576, y: ROW_Y + 130, w: 104, h: 46, title: "assess_risk", lines: ["H / M / L"] },
  { x: 464, y: ROW_Y + 190, w: 216, h: 24, title: "Structured response", lines: [] },

  // Post-processing
  { x: 712, y: ROW_Y, w: 192, h: 46, title: "CitationVerifier", lines: ["Every section cross-checked"] },
  { x: 712, y: ROW_Y + 60, w: 192, h: 46, title: "ConfidenceScorer", lines: ["0-100"] },
  { x: 712, y: ROW_Y + 120, w: 192, h: 46, title: "SeverityScorer", lines: ["0-100 weighted"] },
  { x: 712, y: ROW_Y + 180, w: 192, h: 46, title: "AuditLogger", lines: ["JSON per query"] },
];

/** Arrows between bands, plus the blocked-path exits from each gate. */
const FLOWS: [number, number, number, number][] = [
  [208, 155, 240, 155], // security -> retrieval
  [432, 155, 464, 155], // retrieval -> agent
  [680, 155, 712, 155], // agent -> post
];

export function SageArchitecture() {
  return (
    <figure className="m-0 overflow-hidden rounded-brand border border-line bg-bg-elev">
      <div
        role="region"
        aria-label="SAGE architecture diagram"
        tabIndex={0}
        className="overflow-x-auto focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
      >
        <svg
          viewBox="0 0 920 300"
          role="img"
          aria-labelledby="sage-arch-title sage-arch-desc"
          className="h-auto w-full min-w-[860px]"
        >
          <title id="sage-arch-title">SAGE system architecture</title>
          <desc id="sage-arch-desc">
            A query passes three security gates in order: sanitisation strips role
            tokens and caps length, a 52-pattern injection check across nine
            attack families, then a policy-grounding scope gate. It is then
            expanded through 57 synonym mappings, retrieved from ChromaDB over
            section-boundary chunks, and re-ranked at 0.6 semantic to 0.4 keyword.
            A LangGraph ReAct agent on GPT-4o calls four tools, search_policy,
            check_cross_references, detect_policy_conflicts and assess_risk, then
            emits a structured response. Post-processing verifies every citation
            against source text, scores confidence and severity out of 100, and
            writes a JSON audit record.
          </desc>

          {/* Band labels */}
          {BANDS.map((b) => (
            <g key={b.label}>
              <rect
                x={b.x}
                y={BAND_Y - 18}
                width={b.w}
                height={280}
                rx="8"
                className="fill-ink/[0.02] stroke-line"
                strokeWidth="1"
                strokeDasharray="4 3"
              />
              <text
                x={b.x + 8}
                y={BAND_Y - 5}
                className="fill-ink-faint font-mono"
                fontSize="8"
                letterSpacing="1.4"
              >
                {b.label.toUpperCase()}
              </text>
            </g>
          ))}

          {/* Flow arrows */}
          {FLOWS.map(([x1, y1, x2, y2]) => (
            <g key={`${x1}-${y1}`}>
              <line
                x1={x1}
                y1={y1}
                x2={x2 - 5}
                y2={y2}
                className="stroke-ink-faint"
                strokeWidth="1.2"
              />
              <polygon
                points={`${x2 - 5},${y2 - 3} ${x2},${y2} ${x2 - 5},${y2 + 3}`}
                className="fill-ink-faint"
              />
            </g>
          ))}

          {/* Blocked exits: what the gates reject */}
          {[ROW_Y + 31, ROW_Y + 107, ROW_Y + 183].map((y, i) => (
            <g key={`block-${i}`}>
              <line
                x1="16"
                y1={y}
                x2="6"
                y2={y}
                className="stroke-accent"
                strokeWidth="1.2"
              />
              <text
                x="4"
                y={y - 4}
                textAnchor="end"
                className="fill-accent font-mono"
                fontSize="6.5"
              >
                blocked
              </text>
            </g>
          ))}

          {/* Boxes */}
          {BOXES.map((b) => (
            <g key={b.title}>
              <rect
                x={b.x}
                y={b.y}
                width={b.w}
                height={b.h}
                rx="5"
                className={`fill-bg ${b.accent ? "stroke-accent" : "stroke-line"}`}
                strokeWidth={b.accent ? "1.4" : "1"}
              />
              <text
                x={b.x + 8}
                y={b.y + 15}
                className={`font-mono ${b.accent ? "fill-accent" : "fill-ink"}`}
                fontSize="8.5"
              >
                {b.title}
              </text>
              {b.lines.map((l, i) => (
                <text
                  key={l}
                  x={b.x + 8}
                  y={b.y + 29 + i * 11}
                  className="fill-ink-soft"
                  fontSize="7.5"
                >
                  {l}
                </text>
              ))}
            </g>
          ))}

          {/* Entry and exit */}
          <text x="8" y={ROW_Y - 26} className="fill-ink font-mono" fontSize="8.5">
            User query
          </text>
          <text
            x="904"
            y={ROW_Y + 240}
            textAnchor="end"
            className="fill-ink font-mono"
            fontSize="8.5"
          >
            Streamlit UI
          </text>
        </svg>
      </div>
      <figcaption className="border-t border-line px-4 py-2 font-mono text-[10px] tracking-[0.1em] text-ink-faint uppercase">
        Request path, left to right. Gates run before retrieval.
      </figcaption>
    </figure>
  );
}
