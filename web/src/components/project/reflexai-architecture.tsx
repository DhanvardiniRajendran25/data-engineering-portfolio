/**
 * ReflexAI architecture.
 *
 * Drawn to argue the project's central claim rather than just list services: the
 * quantitative layer and the conceptual corpus are retrieved through separate
 * paths, and only converge at synthesis. That separation is what keeps a
 * framework quote from coming back as though it were a reported figure, so the
 * diagram makes the two lanes visually distinct and marks the single point where
 * they meet.
 *
 * The feedback arrow along the bottom is the reflexivity loop itself, which is
 * the reason the system exists at all.
 */

const W = 1560;
const H = 860;

type Box = {
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  tool?: string;
  lines: string[];
  accent?: boolean;
};

/** Lane 1: statements. The accounting reality risk is measured against. */
const QUANT: Box[] = [
  {
    x: 40,
    y: 150,
    w: 250,
    h: 150,
    title: "SOURCE",
    tool: "yfinance",
    lines: ["Annual income statement", "Annual balance sheet", "Annual cash flow", "Market snapshot"],
  },
  {
    x: 330,
    y: 150,
    w: 250,
    h: 150,
    title: "NORMALISE",
    tool: "pandas",
    lines: ["Line items aligned", "Periods reconciled", "Units standardised", "Ready for diagnostics"],
  },
  {
    x: 620,
    y: 150,
    w: 250,
    h: 150,
    title: "DIAGNOSTICS",
    tool: "Risk engine",
    lines: ["Liquidity", "Leverage", "Profitability", "Narrative divergence"],
    accent: true,
  },
];

/** Lane 2: the corpus. A way of reading the statements, not a source of facts. */
const CONCEPT: Box[] = [
  {
    x: 40,
    y: 430,
    w: 250,
    h: 150,
    title: "CORPUS",
    tool: "Soros knowledge base",
    lines: ["Reflexivity framework", "Boom and bust sequence", "Feedback-loop patterns"],
  },
  {
    x: 330,
    y: 430,
    w: 250,
    h: 150,
    title: "CHUNK + EMBED",
    tool: "Vector index",
    lines: ["Concept-level chunks", "Embedded for retrieval", "Framework, not figures"],
  },
  {
    x: 620,
    y: 430,
    w: 250,
    h: 150,
    title: "RETRIEVE",
    tool: "Semantic search",
    lines: ["Top-k concepts", "Scoped to the question", "Kept separate from numbers"],
    accent: true,
  },
];

export function ReflexaiArchitecture() {
  const joinX = 960;
  const joinY = 290;

  return (
    <figure className="m-0 overflow-hidden rounded-brand border border-line bg-bg-elev">
      <div
        role="region"
        aria-label="ReflexAI architecture diagram"
        tabIndex={0}
        className="overflow-x-auto focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
      >
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-labelledby="rx-title rx-desc"
          className="h-auto w-full min-w-[1240px]"
        >
          <title id="rx-title">ReflexAI architecture</title>
          <desc id="rx-desc">
            Two independent retrieval lanes converging at synthesis. The
            quantitative lane pulls annual income statement, balance sheet and
            cash flow data from yfinance, normalises it, and computes four risk
            diagnostics: liquidity, leverage, profitability and narrative
            divergence. The conceptual lane holds a Soros knowledge corpus of
            reflexivity theory, boom and bust sequences and feedback-loop
            patterns, chunked and embedded for semantic retrieval. The two never
            mix during retrieval, which is what prevents a framework passage
            being returned as though it were a reported figure. A user query
            routes into both lanes, and only the synthesis step sees them
            together, producing a risk narrative that cites which statement
            drove it and which concept framed it. A feedback arrow returns from
            the narrative to the market snapshot, representing the reflexive loop
            the system models: perception influences price, price influences
            fundamentals, and the next reading starts from the changed state.
          </desc>

          {/* Lane backdrops */}
          <rect x="24" y="112" width="860" height="226" rx="10" className="fill-ink/[0.02] stroke-line" strokeWidth="1" strokeDasharray="5 4" />
          <text x="36" y="132" className="fill-ink font-mono" fontSize="10" letterSpacing="1.5">
            QUANTITATIVE REALITY
          </text>
          <text x="874" y="132" textAnchor="end" className="fill-ink-faint font-mono" fontSize="8">
            what the statements say
          </text>

          <rect x="24" y="392" width="860" height="226" rx="10" className="fill-ink/[0.02] stroke-line" strokeWidth="1" strokeDasharray="5 4" />
          <text x="36" y="412" className="fill-ink font-mono" fontSize="10" letterSpacing="1.5">
            NARRATIVE AND CONCEPTUAL
          </text>
          <text x="874" y="412" textAnchor="end" className="fill-ink-faint font-mono" fontSize="8">
            how to read them
          </text>

          {/* Boxes */}
          {[...QUANT, ...CONCEPT].map((b) => (
            <g key={b.title + b.y}>
              <rect
                x={b.x}
                y={b.y}
                width={b.w}
                height={b.h}
                rx="7"
                className={`fill-bg ${b.accent ? "stroke-accent" : "stroke-line"}`}
                strokeWidth={b.accent ? "1.7" : "1.2"}
              />
              <rect x={b.x} y={b.y} width={b.w} height="24" rx="7" className={b.accent ? "fill-accent" : "fill-ink"} />
              <rect x={b.x} y={b.y + 12} width={b.w} height="12" className={b.accent ? "fill-accent" : "fill-ink"} />
              <text x={b.x + b.w / 2} y={b.y + 16} textAnchor="middle" className="fill-bg font-mono" fontSize="9" fontWeight="700" letterSpacing="0.7">
                {b.title}
              </text>
              {b.tool && (
                <text x={b.x + b.w / 2} y={b.y + 40} textAnchor="middle" className="fill-ink-soft font-mono" fontSize="8.5">
                  {b.tool}
                </text>
              )}
              {b.lines.map((l, j) => (
                <text key={l} x={b.x + 14} y={b.y + 60 + j * 15} className="fill-ink-soft" fontSize="8.5">
                  &middot; {l}
                </text>
              ))}
            </g>
          ))}

          {/* Lane arrows */}
          {[QUANT, CONCEPT].map((lane) =>
            lane.slice(0, -1).map((b, i) => {
              const next = lane[i + 1];
              const y = b.y + b.h / 2;
              return (
                <g key={`${b.title}-arrow`}>
                  <line x1={b.x + b.w} y1={y} x2={next.x - 6} y2={y} className="stroke-ink-faint" strokeWidth="1.5" />
                  <polygon
                    points={`${next.x - 6},${y - 4} ${next.x},${y} ${next.x - 6},${y + 4}`}
                    className="fill-ink-faint"
                  />
                </g>
              );
            }),
          )}

          {/* Query enters both lanes */}
          <rect x="40" y="40" width="250" height="52" rx="7" className="fill-bg stroke-line" strokeWidth="1.2" />
          <text x="165" y="62" textAnchor="middle" className="fill-ink font-mono" fontSize="9.5">
            USER QUERY · INTENT LAYER
          </text>
          <text x="165" y="78" textAnchor="middle" className="fill-ink-faint" fontSize="8">
            ticker-aware, routed to both lanes
          </text>
          <line x1="165" y1="92" x2="165" y2="144" className="stroke-ink-faint" strokeWidth="1.3" strokeDasharray="3 3" />
          <polygon points="161,144 165,150 169,144" className="fill-ink-faint" />
          <path d="M 300 66 H 940 V 424 H 296" fill="none" className="stroke-ink-faint" strokeWidth="1.3" strokeDasharray="3 3" />
          <polygon points="296,420 290,424 296,428" className="fill-ink-faint" />

          {/* Convergence: the only point the lanes meet */}
          <line x1="870" y1="225" x2={joinX - 6} y2={joinY - 30} className="stroke-accent" strokeWidth="1.7" />
          <line x1="870" y1="505" x2={joinX - 6} y2={joinY + 90} className="stroke-accent" strokeWidth="1.7" />

          <rect x={joinX} y={joinY - 60} width="270" height="180" rx="7" className="fill-bg stroke-accent" strokeWidth="2" />
          <rect x={joinX} y={joinY - 60} width="270" height="24" rx="7" className="fill-accent" />
          <rect x={joinX} y={joinY - 48} width="270" height="12" className="fill-accent" />
          <text x={joinX + 135} y={joinY - 44} textAnchor="middle" className="fill-bg font-mono" fontSize="9" fontWeight="700" letterSpacing="0.7">
            SYNTHESIS
          </text>
          <text x={joinX + 135} y={joinY - 20} textAnchor="middle" className="fill-ink-soft font-mono" fontSize="8.5">
            RAG over both lanes
          </text>
          {[
            "Numbers grounded in statements",
            "Framing grounded in corpus",
            "Cites which drove which",
            "Explains the loop, not the level",
          ].map((l, j) => (
            <text key={l} x={joinX + 14} y={joinY + 2 + j * 15} className="fill-ink-soft" fontSize="8.5">
              &middot; {l}
            </text>
          ))}

          <text x={joinX + 135} y={joinY + 90} textAnchor="middle" className="fill-accent font-mono" fontSize="8" letterSpacing="0.8">
            THE ONLY JOIN POINT
          </text>

          {/* Output */}
          <line x1={joinX + 270} y1={joinY + 30} x2="1320" y2={joinY + 30} className="stroke-ink-faint" strokeWidth="1.5" />
          <polygon points={`1320,${joinY + 26} 1326,${joinY + 30} 1320,${joinY + 34}`} className="fill-ink-faint" />
          <rect x="1330" y={joinY - 40} width="196" height="140" rx="7" className="fill-bg stroke-line" strokeWidth="1.2" />
          <text x="1428" y={joinY - 20} textAnchor="middle" className="fill-ink font-mono" fontSize="9.5">
            RISK NARRATIVE
          </text>
          {["Where risk is building", "Which loop is active", "What would confirm it", "Dashboard + statements"].map((l, j) => (
            <text key={l} x="1344" y={joinY + 2 + j * 15} className="fill-ink-soft" fontSize="8.5">
              &middot; {l}
            </text>
          ))}

          {/* The reflexive loop: output feeds back into the next reading */}
          <path
            d={`M 1428 ${joinY + 100} V 700 H 165 V 302`}
            fill="none"
            className="stroke-accent"
            strokeWidth="1.6"
            strokeDasharray="7 5"
          />
          <polygon points="161,308 165,300 169,308" className="fill-accent" />
          <rect x="560" y="676" width="470" height="26" rx="6" className="fill-bg stroke-accent" strokeWidth="1.3" />
          <text x="795" y="693" textAnchor="middle" className="fill-accent font-mono" fontSize="9">
            REFLEXIVE LOOP · perception moves price, price moves fundamentals
          </text>

          {/* Design note: why annual */}
          <rect x="40" y="748" width="620" height="72" rx="7" className="fill-bg stroke-line" strokeWidth="1.2" />
          <text x="54" y="770" className="fill-ink font-mono" fontSize="9.5">
            WHY ANNUAL DATA
          </text>
          <text x="54" y="787" className="fill-ink-soft" fontSize="8.5">
            Reflexive loops play out over years, not sessions. Annual statements strip the noise
          </text>
          <text x="54" y="802" className="fill-ink-soft" fontSize="8.5">
            intraday data would add. The cost is stated: nothing here answers a question about this quarter.
          </text>

          <rect x="690" y="748" width="620" height="72" rx="7" className="fill-bg stroke-accent" strokeWidth="1.3" />
          <text x="704" y="770" className="fill-accent font-mono" fontSize="9.5">
            WHY TWO LANES
          </text>
          <text x="704" y="787" className="fill-ink-soft" fontSize="8.5">
            Statements are facts; the corpus is a way of reading facts. One combined index lets a
          </text>
          <text x="704" y="802" className="fill-ink-soft" fontSize="8.5">
            framework passage return as though it were a reported figure. Separate paths stay auditable.
          </text>
        </svg>
      </div>
      <figcaption className="border-t border-line px-4 py-2 font-mono text-[10px] tracking-[0.1em] text-ink-faint uppercase">
        Two retrieval lanes, one join point, and the feedback loop that motivates the whole design.
      </figcaption>
    </figure>
  );
}
