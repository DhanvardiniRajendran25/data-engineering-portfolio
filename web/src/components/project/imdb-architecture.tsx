/**
 * IMDb Analytics architecture: AWS cloud-native.
 *
 * Same register as the DocuParse and PodcastIQ diagrams: banded by layer, one
 * card per stage, each carrying the service, what it emits, the tradeoff taken
 * and the measured result.
 *
 * The star schema is drawn rather than described. A warehouse project is judged
 * on the model and its physical tuning, so the five conformed dimensions, the
 * fact table and the DISTKEY/SORTKEY choices are the centre of the drawing, not
 * a footnote under it.
 */

type Card = {
  title: string;
  tool: string;
  form: string[];
  stats: string[];
  tradeoff: { title: string; lines: string[] };
  result: string;
  resultNote?: string;
  accent?: boolean;
};

const CARD_W = 250;
const CARD_H = 470;
const GAP = 24;
const X0 = 26;
const CARD_Y = 112;

const BANDS = [
  { label: "LAKE", note: "S3, immutable raw", from: 0, span: 2 },
  { label: "TRANSFORM", note: "Glue to curated Parquet", from: 2, span: 2 },
  { label: "WAREHOUSE AND BI", note: "Redshift to QuickSight", from: 4, span: 2 },
];

const CARDS: Card[] = [
  {
    title: "LAND",
    tool: "Amazon S3 · raw",
    form: ["IMDb .tsv.gz", "Partitioned by dataset + date", "Never mutated"],
    stats: ["7 datasets", "190M rows total", "Reload never re-downloads"],
    tradeoff: {
      title: "Land raw, transform later",
      lines: ["Raw is the audit trail", "S3 is the cheapest layer", "Cost: two copies of the data"],
    },
    result: "190M rows",
    resultNote: "7 datasets landed",
  },
  {
    title: "PROFILE",
    tool: "Alteryx",
    form: ["Null density", "Cardinality", "Value distributions"],
    stats: ['Missing encoded as "\\\\N"', "Multi-value genre fields", "Types vs actual values differ"],
    tradeoff: {
      title: "Profile before modelling",
      lines: [
        "Cardinality decides dimension keys",
        "Null density decides NOT NULL",
        "Cost: a pass with no user output",
      ],
    },
    result: "7 profiles",
    resultNote: "before schema design",
    accent: true,
  },
  {
    title: "TRANSFORM",
    tool: "AWS Glue · PySpark",
    form: ["Parquet, columnar", "Bridge tables", "Typed and bounded"],
    stats: ['"\\\\N" to true NULL', "Multi-value fields exploded", "Written to curated S3"],
    tradeoff: {
      title: "Parquet, not raw TSV load",
      lines: [
        "COPY reads only needed columns",
        "Athena can reuse the curated layer",
        "Cost: an extra materialisation",
      ],
    },
    result: "Parquet",
    resultNote: "curated layer",
  },
  {
    title: "MODEL",
    tool: "Star schema",
    form: ["5 conformed dimensions", "1 fact table", "Surrogate + natural keys"],
    stats: ["dim_title, dim_person", "dim_date, dim_genre, dim_region", "fact_title_performance"],
    tradeoff: {
      title: "Star, not wide or 3NF",
      lines: [
        "Wide repeats title text 90M times",
        "3NF needs six joins per question",
        "Cost: joins and surrogate keys",
      ],
    },
    result: "5 dimensions",
    resultNote: "conformed, shared",
    accent: true,
  },
  {
    title: "WAREHOUSE",
    tool: "Redshift Serverless",
    form: ["Tuned physical layout", "Parallel COPY from S3"],
    stats: ["DISTKEY on fact join", "DISTSTYLE ALL on small dims", "SORTKEY on date", "COPY, never INSERT"],
    tradeoff: {
      title: "Serverless over provisioned",
      lines: [
        "Load is bursty, idle between refreshes",
        "No cluster to size in advance",
        "Cost: cold start on first query",
      ],
    },
    result: "Serverless",
    resultNote: "tuning still applies",
    accent: true,
  },
  {
    title: "SERVE",
    tool: "Amazon QuickSight",
    form: ["SPICE datasets", "Direct query where fresh"],
    stats: ["Genre and runtime trends", "Regional reach", "Rating distribution", "RLS via dimension keys"],
    tradeoff: {
      title: "SPICE for most dashboards",
      lines: [
        "Cold starts are visible interactively",
        "Absorbs repeated slicing",
        "Cost: data as old as last refresh",
      ],
    },
    result: "4 themes",
    resultNote: "interactive",
  },
];

const EDGE_LABELS = ["raw files", "profiles", "Parquet", "schema", "COPY"];

function x(i: number) {
  return X0 + i * (CARD_W + GAP);
}

/** The star, drawn below the pipeline. */
const DIMS = ["dim_title", "dim_person", "dim_date", "dim_genre", "dim_region"];

export function ImdbArchitecture() {
  const railRight = x(CARDS.length - 1) + CARD_W;
  const starY = CARD_Y + CARD_H + 96;
  const factX = X0 + 470;
  const factY = starY + 74;

  return (
    <figure className="m-0 overflow-hidden rounded-brand border border-line bg-bg-elev">
      <div
        role="region"
        aria-label="IMDb Analytics architecture diagram"
        tabIndex={0}
        className="overflow-x-auto focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
      >
        <svg
          viewBox="0 0 1700 940"
          role="img"
          aria-labelledby="imdb-arch-title imdb-arch-desc"
          className="h-auto w-full min-w-[1400px]"
        >
          <title id="imdb-arch-title">IMDb Analytics AWS architecture</title>
          <desc id="imdb-arch-desc">
            Six stages across three layers. IMDb tsv.gz files land immutably in an
            S3 raw prefix, 190 million rows across seven datasets. Alteryx
            profiles all seven before any modelling, establishing null density and
            cardinality. AWS Glue with PySpark normalises the IMDb backslash-N
            missing marker to true NULL, explodes multi-value fields into bridge
            tables, and writes Parquet to a curated S3 layer. The model is a star
            schema with five conformed dimensions, dim_title, dim_person,
            dim_date, dim_genre and dim_region, around a fact_title_performance
            table. Redshift Serverless holds it with DISTKEY on the fact join key,
            DISTSTYLE ALL on the small dimensions, and SORTKEY on date, loaded by
            parallel COPY rather than INSERT. Amazon QuickSight serves dashboards
            from SPICE, with direct query retained where freshness matters.
          </desc>

          {/* AWS rail */}
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
          <rect x="14" y="52" width="248" height="24" rx="6" className="fill-accent" />
          <text x="26" y="69" className="fill-bg font-mono" fontSize="11" fontWeight="700" letterSpacing="1.6">
            AWS CLOUD-NATIVE
          </text>
          <text x={railRight - 4} y="69" textAnchor="end" className="fill-accent font-mono" fontSize="9">
            S3 → Glue → Redshift Serverless → QuickSight
          </text>

          {/* Layer bands */}
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
                <rect x={cx} y={CARD_Y} width={CARD_W} height="26" rx="8" className={c.accent ? "fill-accent" : "fill-ink"} />
                <rect x={cx} y={CARD_Y + 14} width={CARD_W} height="12" className={c.accent ? "fill-accent" : "fill-ink"} />
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

                <rect
                  x={cx + 10}
                  y={CARD_Y + 36}
                  width={CARD_W - 20}
                  height="22"
                  rx="4"
                  className="fill-ink/[0.05] stroke-line"
                  strokeWidth="1"
                />
                <text x={cx + CARD_W / 2} y={CARD_Y + 51} textAnchor="middle" className="fill-ink font-mono" fontSize="8.5">
                  {c.tool}
                </text>

                <text x={cx + CARD_W / 2} y={CARD_Y + 76} textAnchor="middle" className="fill-ink-faint font-mono" fontSize="7.5" letterSpacing="0.8">
                  EMITS
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

                {c.stats.map((s, j) => (
                  <text
                    key={s}
                    x={cx + 18}
                    y={CARD_Y + 82 + c.form.length * 14 + 32 + j * 15}
                    className="fill-ink-soft"
                    fontSize="8.5"
                  >
                    &middot; {s}
                  </text>
                ))}

                <rect
                  x={cx + 10}
                  y={CARD_Y + 272}
                  width={CARD_W - 20}
                  height={c.tradeoff.lines.length * 13 + 32}
                  rx="4"
                  className="fill-accent/[0.07] stroke-accent"
                  strokeWidth="1.1"
                />
                <text x={cx + 18} y={CARD_Y + 289} className="fill-accent font-mono" fontSize="8" fontWeight="700">
                  TRADEOFF
                </text>
                <text x={cx + 18} y={CARD_Y + 302} className="fill-ink" fontSize="8.5">
                  {c.tradeoff.title}
                </text>
                {c.tradeoff.lines.map((l, j) => (
                  <text key={l} x={cx + 18} y={CARD_Y + 316 + j * 13} className="fill-ink-soft" fontSize="7.5">
                    {l}
                  </text>
                ))}

                <rect
                  x={cx + 10}
                  y={CARD_Y + CARD_H - 62}
                  width={CARD_W - 20}
                  height="30"
                  rx="4"
                  className={c.accent ? "fill-accent/[0.14] stroke-accent" : "fill-ink/[0.05] stroke-line"}
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
                  <text x={cx + CARD_W / 2} y={CARD_Y + CARD_H - 16} textAnchor="middle" className="fill-ink-faint" fontSize="7.5">
                    {c.resultNote}
                  </text>
                )}

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

          {/* ---- The star schema, drawn ---- */}
          <text x={X0} y={starY - 18} className="fill-ink font-mono" fontSize="10" letterSpacing="1.2">
            STAR SCHEMA IN REDSHIFT · 5 CONFORMED DIMENSIONS
          </text>

          {DIMS.map((d, i) => {
            const dx = X0 + i * 196;
            return (
              <g key={d}>
                <rect x={dx} y={starY} width="176" height="42" rx="5" className="fill-bg stroke-line" strokeWidth="1.2" />
                <text x={dx + 88} y={starY + 20} textAnchor="middle" className="fill-ink font-mono" fontSize="9">
                  {d}
                </text>
                <text x={dx + 88} y={starY + 33} textAnchor="middle" className="fill-ink-faint" fontSize="7" >
                  {i < 2 ? "DISTSTYLE AUTO" : "DISTSTYLE ALL"}
                </text>
                {/* spoke into the fact table */}
                <line
                  x1={dx + 88}
                  y1={starY + 42}
                  x2={factX + 130}
                  y2={factY}
                  className="stroke-ink-faint"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
              </g>
            );
          })}

          <rect x={factX} y={factY} width="260" height="52" rx="6" className="fill-accent/[0.12] stroke-accent" strokeWidth="1.8" />
          <text x={factX + 130} y={factY + 22} textAnchor="middle" className="fill-accent font-mono" fontSize="10.5" fontWeight="700">
            fact_title_performance
          </text>
          <text x={factX + 130} y={factY + 38} textAnchor="middle" className="fill-ink-soft" fontSize="7.5">
            DISTKEY title_key · SORTKEY start_year · grain: one row per title
          </text>

          <text x={X0} y={factY + 84} className="fill-ink-soft" fontSize="8.5">
            Conformed means a new mart reuses dim_date rather than defining its own. Small dimensions
            replicate to every node so joining them never broadcasts at query time.
          </text>
        </svg>
      </div>
      <figcaption className="border-t border-line px-4 py-2 font-mono text-[10px] tracking-[0.1em] text-ink-faint uppercase">
        Six stages, then the model. Physical tuning is shown because that is where warehouse work is judged.
      </figcaption>
    </figure>
  );
}
