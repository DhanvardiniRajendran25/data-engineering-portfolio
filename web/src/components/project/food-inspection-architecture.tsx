/**
 * Food Inspection architecture.
 *
 * The drawing is organised around the actual difficulty: two cities publish the
 * same domain in incompatible shapes, so the pipeline runs as two lanes that
 * converge at exactly one point. A single left-to-right flow would hide that,
 * which is the only interesting thing about this pipeline.
 *
 * Columns are layers. Rows are cities. The profiling column sits between bronze
 * and silver because profiling is what decided how much of Dallas to unpivot.
 */

const COL = {
  source: { x: 30, w: 236 },
  bronze: { x: 296, w: 196 },
  profile: { x: 522, w: 196 },
  silver: { x: 748, w: 266 },
  unify: { x: 1044, w: 206 },
  gold: { x: 1280, w: 250 },
};

const LANE_H = 150;
const LANE_Y = { chi: 120, dal: 320 };
const MID_Y = 295;

type Lane = {
  key: "chi" | "dal";
  city: string;
  agency: string;
  shape: string;
  quirks: string[];
  transform: string;
  steps: string[];
};

const LANES: Lane[] = [
  {
    key: "chi",
    city: "CHICAGO",
    agency: "Dept of Public Health",
    shape: "LONG",
    quirks: [
      "Violations in one pipe-separated string",
      "Risk categories 1 to 3",
      "Geographic fields incomplete",
    ],
    transform: "PARSE",
    steps: [
      "Regex split on the pipe delimiter",
      "Code, description, comment separated",
      "Risk 1 to 3 mapped to standard levels",
      "Result: one row per violation",
    ],
  },
  {
    key: "dal",
    city: "DALLAS",
    agency: "Code Compliance Services",
    shape: "WIDE",
    quirks: [
      "Up to 25 violation blocks per row",
      "Coordinates buried in a text field",
      "Address split across columns",
    ],
    transform: "UNPIVOT",
    steps: [
      "Wide blocks melted into rows",
      "Only populated blocks unpivoted",
      "Coordinates regex-extracted from text",
      "Result: one row per violation",
    ],
  },
];

const PROFILE_FINDINGS = [
  "Blocks past Violation 5:",
  "over 99% null",
  "ZIP codes stored as floats",
  "Dates in mixed formats",
  "Scores typed inconsistently",
];

const DIMS = ["dim_establishment", "dim_location", "dim_violation", "dim_date"];

const STAR_Y = 566;
const FACT_Y = STAR_Y + 96;

export function FoodInspectionArchitecture() {
  return (
    <figure className="m-0 overflow-hidden rounded-brand border border-line bg-bg-elev">
      <div
        role="region"
        aria-label="Food Inspection architecture diagram"
        tabIndex={0}
        className="overflow-x-auto focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
      >
        <svg
          viewBox="0 0 1580 880"
          role="img"
          aria-labelledby="food-arch-title food-arch-desc"
          className="h-auto w-full min-w-[1400px]"
        >
          <title id="food-arch-title">
            Multi-city food inspection medallion architecture
          </title>
          <desc id="food-arch-desc">
            Two independent lanes converging once. Chicago publishes inspections
            in long form with every violation packed into a single
            pipe-separated string, risk categories one to three, and incomplete
            geographic fields. Dallas publishes the same domain in wide form
            with up to twenty-five violation blocks per inspection, coordinates
            buried inside a text field, and the address split across columns.
            Azure Data Factory lands both unchanged in Azure Data Lake Gen2 as
            the bronze layer. Alteryx and ydata-profiling then profile both,
            finding that Dallas violation blocks past number five are over
            ninety-nine percent null, that ZIP codes are stored as floats, and
            that dates and scores use mixed formats. Those findings decide the
            silver transformations, which run separately per city: Chicago
            strings are regex-parsed into code, description and comment, while
            Dallas wide blocks are unpivoted, but only the populated ones. Both
            lanes reach one row per violation, which is the grain they are
            unioned at in a single unified staging table, the only convergence
            point in the pipeline. Snowflake Dynamic Tables materialise the gold
            layer, a star schema of fact_inspections around dim_establishment,
            dim_location, dim_violation and dim_date, with refresh and
            dependency order declared rather than orchestrated. Tableau serves
            outcome distributions, risk hotspots, violation severity trends and
            geographic clustering. Every record in every layer carries a job_id,
            a load_dt and a source city.
          </desc>

          {/* Medallion rail */}
          <rect
            x="14"
            y="52"
            width="1552"
            height="418"
            rx="10"
            className="fill-ink/[0.02] stroke-accent"
            strokeWidth="1.4"
            strokeDasharray="10 5"
          />
          <rect x="14" y="52" width="286" height="24" rx="6" className="fill-accent" />
          <text
            x="26"
            y="69"
            className="fill-bg font-mono"
            fontSize="11"
            fontWeight="700"
            letterSpacing="1.6"
          >
            MEDALLION · BRONZE SILVER GOLD
          </text>
          <text
            x="1554"
            y="69"
            textAnchor="end"
            className="fill-accent font-mono"
            fontSize="9"
          >
            ADF → ADLS Gen2 → Databricks → Snowflake → Tableau
          </text>

          {/* Column headers */}
          {[
            { c: COL.source, label: "01 · SOURCE", note: "two open portals" },
            { c: COL.bronze, label: "02 · BRONZE", note: "landed unchanged" },
            { c: COL.profile, label: "03 · PROFILE", note: "decides the rules" },
            { c: COL.silver, label: "04 · SILVER", note: "one lane per city" },
            { c: COL.unify, label: "05 · UNIFY", note: "single grain" },
            { c: COL.gold, label: "06 · GOLD", note: "star schema" },
          ].map((h) => (
            <text
              key={h.label}
              x={h.c.x}
              y="102"
              className="fill-ink font-mono"
              fontSize="9"
              letterSpacing="1.2"
            >
              {h.label}
              <tspan className="fill-ink-faint" fontSize="8" letterSpacing="0">
                {"  "}
                {h.note}
              </tspan>
            </text>
          ))}

          {/* ---- Per-city lanes ---- */}
          {LANES.map((l) => {
            const y = LANE_Y[l.key];
            const cy = y + LANE_H / 2;
            return (
              <g key={l.key}>
                {/* Lane label down the left edge */}
                <rect
                  x="14"
                  y={y}
                  width="10"
                  height={LANE_H}
                  rx="3"
                  className={l.key === "chi" ? "fill-accent" : "fill-ink"}
                />

                {/* SOURCE */}
                <rect
                  x={COL.source.x}
                  y={y}
                  width={COL.source.w}
                  height={LANE_H}
                  rx="8"
                  className="fill-bg stroke-line"
                  strokeWidth="1.2"
                />
                <text
                  x={COL.source.x + 14}
                  y={y + 24}
                  className="fill-ink font-mono"
                  fontSize="12"
                  fontWeight="700"
                  letterSpacing="1"
                >
                  {l.city}
                </text>
                <rect
                  x={COL.source.x + COL.source.w - 62}
                  y={y + 11}
                  width="48"
                  height="18"
                  rx="4"
                  className="fill-accent/[0.14] stroke-accent"
                  strokeWidth="1.1"
                />
                <text
                  x={COL.source.x + COL.source.w - 38}
                  y={y + 24}
                  textAnchor="middle"
                  className="fill-accent font-mono"
                  fontSize="8.5"
                  fontWeight="700"
                >
                  {l.shape}
                </text>
                <text
                  x={COL.source.x + 14}
                  y={y + 40}
                  className="fill-ink-faint font-mono"
                  fontSize="8"
                >
                  {l.agency}
                </text>
                {l.quirks.map((q, j) => (
                  <text
                    key={q}
                    x={COL.source.x + 14}
                    y={y + 68 + j * 16}
                    className="fill-ink-soft"
                    fontSize="8.5"
                  >
                    &middot; {q}
                  </text>
                ))}
                <text
                  x={COL.source.x + 14}
                  y={y + LANE_H - 14}
                  className="fill-ink-faint font-mono"
                  fontSize="7.5"
                >
                  Same domain, no shared schema
                </text>

                {/* BRONZE */}
                <rect
                  x={COL.bronze.x}
                  y={y}
                  width={COL.bronze.w}
                  height={LANE_H}
                  rx="8"
                  className="fill-bg stroke-line"
                  strokeWidth="1.2"
                />
                <rect
                  x={COL.bronze.x}
                  y={y}
                  width={COL.bronze.w}
                  height="26"
                  rx="8"
                  className="fill-ink"
                />
                <rect
                  x={COL.bronze.x}
                  y={y + 14}
                  width={COL.bronze.w}
                  height="12"
                  className="fill-ink"
                />
                <text
                  x={COL.bronze.x + COL.bronze.w / 2}
                  y={y + 18}
                  textAnchor="middle"
                  className="fill-bg font-mono"
                  fontSize="9.5"
                  fontWeight="700"
                  letterSpacing="0.6"
                >
                  ADLS GEN2 · RAW
                </text>
                {[
                  "Written byte-for-byte",
                  "No conform on ingest",
                  "Partitioned by city and load",
                  "Reprocessing never re-downloads",
                ].map((t, j) => (
                  <text
                    key={t}
                    x={COL.bronze.x + 12}
                    y={y + 50 + j * 15}
                    className="fill-ink-soft"
                    fontSize="8.5"
                  >
                    &middot; {t}
                  </text>
                ))}
                <text
                  x={COL.bronze.x + 12}
                  y={y + LANE_H - 14}
                  className="fill-ink-faint font-mono"
                  fontSize="7.5"
                >
                  Azure Data Factory
                </text>

                {/* SILVER */}
                <rect
                  x={COL.silver.x}
                  y={y}
                  width={COL.silver.w}
                  height={LANE_H}
                  rx="8"
                  className="fill-bg stroke-accent"
                  strokeWidth="1.8"
                />
                <rect
                  x={COL.silver.x}
                  y={y}
                  width={COL.silver.w}
                  height="26"
                  rx="8"
                  className="fill-accent"
                />
                <rect
                  x={COL.silver.x}
                  y={y + 14}
                  width={COL.silver.w}
                  height="12"
                  className="fill-accent"
                />
                <text
                  x={COL.silver.x + COL.silver.w / 2}
                  y={y + 18}
                  textAnchor="middle"
                  className="fill-bg font-mono"
                  fontSize="9.5"
                  fontWeight="700"
                  letterSpacing="0.6"
                >
                  {l.transform} · {l.city}
                </text>
                {l.steps.map((s, j) => (
                  <text
                    key={s}
                    x={COL.silver.x + 14}
                    y={y + 50 + j * 15}
                    className={
                      j === l.steps.length - 1 ? "fill-ink" : "fill-ink-soft"
                    }
                    fontSize="8.5"
                  >
                    &middot; {s}
                  </text>
                ))}
                <text
                  x={COL.silver.x + 14}
                  y={y + LANE_H - 14}
                  className="fill-ink-faint font-mono"
                  fontSize="7.5"
                >
                  Databricks · PySpark notebook
                </text>

                {/* source → bronze */}
                <g>
                  <line
                    x1={COL.source.x + COL.source.w}
                    y1={cy}
                    x2={COL.bronze.x - 6}
                    y2={cy}
                    className="stroke-ink-faint"
                    strokeWidth="1.6"
                  />
                  <polygon
                    points={`${COL.bronze.x - 6},${cy - 4} ${COL.bronze.x},${cy} ${COL.bronze.x - 6},${cy + 4}`}
                    className="fill-ink-faint"
                  />
                  <text
                    x={(COL.source.x + COL.source.w + COL.bronze.x) / 2}
                    y={cy - 8}
                    textAnchor="middle"
                    className="fill-ink-faint font-mono"
                    fontSize="7"
                  >
                    extract
                  </text>
                </g>

                {/* bronze → profile */}
                <g>
                  <line
                    x1={COL.bronze.x + COL.bronze.w}
                    y1={cy}
                    x2={COL.profile.x - 6}
                    y2={cy}
                    className="stroke-ink-faint"
                    strokeWidth="1.6"
                  />
                  <polygon
                    points={`${COL.profile.x - 6},${cy - 4} ${COL.profile.x},${cy} ${COL.profile.x - 6},${cy + 4}`}
                    className="fill-ink-faint"
                  />
                </g>

                {/* profile → silver */}
                <g>
                  <line
                    x1={COL.profile.x + COL.profile.w}
                    y1={cy}
                    x2={COL.silver.x - 6}
                    y2={cy}
                    className="stroke-accent"
                    strokeWidth="1.6"
                  />
                  <polygon
                    points={`${COL.silver.x - 6},${cy - 4} ${COL.silver.x},${cy} ${COL.silver.x - 6},${cy + 4}`}
                    className="fill-accent"
                  />
                  <text
                    x={(COL.profile.x + COL.profile.w + COL.silver.x) / 2}
                    y={cy - 8}
                    textAnchor="middle"
                    className="fill-accent font-mono"
                    fontSize="7"
                  >
                    rules
                  </text>
                </g>

                {/* silver → unify, converging */}
                <g>
                  <path
                    d={`M ${COL.silver.x + COL.silver.w} ${cy} H ${COL.silver.x + COL.silver.w + 16} L ${COL.unify.x - 8} ${MID_Y}`}
                    className="fill-none stroke-accent"
                    strokeWidth="1.8"
                  />
                  <polygon
                    points={`${COL.unify.x - 8},${MID_Y - 4} ${COL.unify.x},${MID_Y} ${COL.unify.x - 8},${MID_Y + 4}`}
                    className="fill-accent"
                  />
                </g>
              </g>
            );
          })}

          {/* ---- PROFILE, spanning both lanes ---- */}
          <rect
            x={COL.profile.x}
            y={LANE_Y.chi}
            width={COL.profile.w}
            height={LANE_Y.dal + LANE_H - LANE_Y.chi}
            rx="8"
            className="fill-accent/[0.06] stroke-accent"
            strokeWidth="1.4"
          />
          <text
            x={COL.profile.x + COL.profile.w / 2}
            y={LANE_Y.chi + 24}
            textAnchor="middle"
            className="fill-accent font-mono"
            fontSize="10"
            fontWeight="700"
            letterSpacing="0.8"
          >
            PROFILE BOTH
          </text>
          <text
            x={COL.profile.x + COL.profile.w / 2}
            y={LANE_Y.chi + 40}
            textAnchor="middle"
            className="fill-ink-faint font-mono"
            fontSize="7.5"
          >
            Alteryx · ydata-profiling
          </text>
          <line
            x1={COL.profile.x + 14}
            y1={LANE_Y.chi + 54}
            x2={COL.profile.x + COL.profile.w - 14}
            y2={LANE_Y.chi + 54}
            className="stroke-line"
            strokeWidth="1"
          />
          {PROFILE_FINDINGS.map((f, j) => (
            <text
              key={f}
              x={COL.profile.x + 14}
              y={LANE_Y.chi + 76 + j * 16}
              className={j === 1 ? "fill-accent font-mono" : "fill-ink-soft"}
              fontSize={j === 1 ? "9" : "8.5"}
              fontWeight={j === 1 ? "700" : undefined}
            >
              {j === 1 ? f : `· ${f}`}
            </text>
          ))}
          <text
            x={COL.profile.x + 14}
            y={LANE_Y.chi + 190}
            className="fill-ink font-mono"
            fontSize="8"
            fontWeight="700"
          >
            SO:
          </text>
          {[
            "Unpivot only the populated",
            "blocks, not all 25.",
            "",
            "Profiling replaced a guess",
            "about cost with a number.",
          ].map((t, j) => (
            <text
              key={`${t}-${j}`}
              x={COL.profile.x + 14}
              y={LANE_Y.chi + 206 + j * 14}
              className="fill-ink-soft"
              fontSize="8.5"
            >
              {t}
            </text>
          ))}
          <text
            x={COL.profile.x + COL.profile.w / 2}
            y={LANE_Y.dal + LANE_H - 14}
            textAnchor="middle"
            className="fill-ink-faint font-mono"
            fontSize="7.5"
          >
            No user-facing output
          </text>

          {/* ---- UNIFY, the single convergence point ---- */}
          <rect
            x={COL.unify.x}
            y="180"
            width={COL.unify.w}
            height="230"
            rx="8"
            className="fill-accent/[0.1] stroke-accent"
            strokeWidth="2.2"
          />
          <rect
            x={COL.unify.x}
            y="180"
            width={COL.unify.w}
            height="26"
            rx="8"
            className="fill-accent"
          />
          <rect
            x={COL.unify.x}
            y="194"
            width={COL.unify.w}
            height="12"
            className="fill-accent"
          />
          <text
            x={COL.unify.x + COL.unify.w / 2}
            y="198"
            textAnchor="middle"
            className="fill-bg font-mono"
            fontSize="9.5"
            fontWeight="700"
            letterSpacing="0.6"
          >
            UNIFIED STAGING
          </text>
          <text
            x={COL.unify.x + COL.unify.w / 2}
            y="228"
            textAnchor="middle"
            className="fill-accent font-mono"
            fontSize="8"
            fontWeight="700"
            letterSpacing="1"
          >
            THE ONLY JOIN POINT
          </text>
          <line
            x1={COL.unify.x + 14}
            y1="240"
            x2={COL.unify.x + COL.unify.w - 14}
            y2="240"
            className="stroke-accent"
            strokeWidth="1"
          />
          <text
            x={COL.unify.x + 14}
            y="262"
            className="fill-ink font-mono"
            fontSize="8.5"
            fontWeight="700"
          >
            GRAIN: one violation
          </text>
          {[
            "Both lanes already share it",
            "Risk levels standardised",
            "Results standardised",
            "source column stamped",
          ].map((t, j) => (
            <text
              key={t}
              x={COL.unify.x + 14}
              y={280 + j * 15}
              className="fill-ink-soft"
              fontSize="8.5"
            >
              &middot; {t}
            </text>
          ))}
          <text
            x={COL.unify.x + 14}
            y="356"
            className="fill-ink-faint"
            fontSize="7.5"
          >
            Inspection grain would need an
          </text>
          <text
            x={COL.unify.x + 14}
            y="368"
            className="fill-ink-faint"
            fontSize="7.5"
          >
            array column and block every
          </text>
          <text
            x={COL.unify.x + 14}
            y="380"
            className="fill-ink-faint"
            fontSize="7.5"
          >
            violation-level question.
          </text>
          <text
            x={COL.unify.x + COL.unify.w / 2}
            y="400"
            textAnchor="middle"
            className="fill-ink-faint font-mono"
            fontSize="7.5"
          >
            PySpark union
          </text>

          {/* ---- GOLD ---- */}
          <rect
            x={COL.gold.x}
            y="140"
            width={COL.gold.w}
            height="310"
            rx="8"
            className="fill-bg stroke-accent"
            strokeWidth="1.8"
          />
          <rect
            x={COL.gold.x}
            y="140"
            width={COL.gold.w}
            height="26"
            rx="8"
            className="fill-accent"
          />
          <rect
            x={COL.gold.x}
            y="154"
            width={COL.gold.w}
            height="12"
            className="fill-accent"
          />
          <text
            x={COL.gold.x + COL.gold.w / 2}
            y="158"
            textAnchor="middle"
            className="fill-bg font-mono"
            fontSize="9.5"
            fontWeight="700"
            letterSpacing="0.6"
          >
            SNOWFLAKE · DYNAMIC TABLES
          </text>
          <text
            x={COL.gold.x + 14}
            y="186"
            className="fill-ink font-mono"
            fontSize="8.5"
            fontWeight="700"
          >
            5 GOLD ENTITIES
          </text>
          {["fact_inspections", ...DIMS].map((e, j) => (
            <text
              key={e}
              x={COL.gold.x + 14}
              y={204 + j * 15}
              className={j === 0 ? "fill-accent font-mono" : "fill-ink-soft font-mono"}
              fontSize="8.5"
            >
              {e}
            </text>
          ))}
          <line
            x1={COL.gold.x + 14}
            y1="288"
            x2={COL.gold.x + COL.gold.w - 14}
            y2="288"
            className="stroke-line"
            strokeWidth="1"
          />
          <text
            x={COL.gold.x + 14}
            y="306"
            className="fill-accent font-mono"
            fontSize="8"
            fontWeight="700"
          >
            TRADEOFF
          </text>
          <text x={COL.gold.x + 14} y="320" className="fill-ink" fontSize="8.5">
            Dynamic Tables, not MERGE
          </text>
          {[
            "Refresh declared, not scheduled",
            "Dependency order inferred",
            "Less pipeline code to keep right",
            "Cost: latency tunes as lag",
            "targets, not as logic",
          ].map((t, j) => (
            <text
              key={t}
              x={COL.gold.x + 14}
              y={336 + j * 13}
              className="fill-ink-soft"
              fontSize="7.5"
            >
              {t}
            </text>
          ))}
          <text
            x={COL.gold.x + COL.gold.w / 2}
            y="436"
            textAnchor="middle"
            className="fill-ink-faint font-mono"
            fontSize="7.5"
          >
            Modelled in ER Studio
          </text>

          {/* unify → gold */}
          <line
            x1={COL.unify.x + COL.unify.w}
            y1={MID_Y}
            x2={COL.gold.x - 8}
            y2={MID_Y}
            className="stroke-accent"
            strokeWidth="1.8"
          />
          <polygon
            points={`${COL.gold.x - 8},${MID_Y - 4} ${COL.gold.x},${MID_Y} ${COL.gold.x - 8},${MID_Y + 4}`}
            className="fill-accent"
          />
          <text
            x={(COL.unify.x + COL.unify.w + COL.gold.x) / 2}
            y={MID_Y - 8}
            textAnchor="middle"
            className="fill-accent font-mono"
            fontSize="7"
          >
            model
          </text>

          {/* ---- The star, drawn ---- */}
          <text
            x="30"
            y={STAR_Y - 18}
            className="fill-ink font-mono"
            fontSize="10"
            letterSpacing="1.2"
          >
            GOLD LAYER · STAR SCHEMA AT VIOLATION GRAIN
          </text>

          {DIMS.map((d, i) => {
            const dx = 30 + i * 212;
            return (
              <g key={d}>
                <rect
                  x={dx}
                  y={STAR_Y}
                  width="192"
                  height="44"
                  rx="5"
                  className="fill-bg stroke-line"
                  strokeWidth="1.2"
                />
                <text
                  x={dx + 96}
                  y={STAR_Y + 20}
                  textAnchor="middle"
                  className="fill-ink font-mono"
                  fontSize="9"
                >
                  {d}
                </text>
                <text
                  x={dx + 96}
                  y={STAR_Y + 34}
                  textAnchor="middle"
                  className="fill-ink-faint"
                  fontSize="7"
                >
                  {
                    [
                      "name, type, risk category",
                      "address, ZIP, coordinates",
                      "code, description, severity",
                      "calendar, fiscal, weekday",
                    ][i]
                  }
                </text>
                <line
                  x1={dx + 96}
                  y1={STAR_Y + 44}
                  x2={455}
                  y2={FACT_Y}
                  className="stroke-ink-faint"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
              </g>
            );
          })}

          <rect
            x="320"
            y={FACT_Y}
            width="270"
            height="52"
            rx="6"
            className="fill-accent/[0.12] stroke-accent"
            strokeWidth="1.8"
          />
          <text
            x="455"
            y={FACT_Y + 22}
            textAnchor="middle"
            className="fill-accent font-mono"
            fontSize="10.5"
            fontWeight="700"
          >
            fact_inspections
          </text>
          <text
            x="455"
            y={FACT_Y + 38}
            textAnchor="middle"
            className="fill-ink-soft"
            fontSize="7.5"
          >
            one row per violation per inspection
          </text>

          {/* gold column → star */}
          <path
            d={`M ${COL.gold.x + COL.gold.w / 2} 450 V 500 H 455 V ${STAR_Y - 34}`}
            className="fill-none stroke-ink-faint"
            strokeWidth="1.2"
            strokeDasharray="5 4"
          />
          <polygon
            points={`451,${STAR_Y - 34} 459,${STAR_Y - 34} 455,${STAR_Y - 26}`}
            className="fill-ink-faint"
          />

          {/* ---- Serving ---- */}
          <rect
            x="920"
            y={STAR_Y}
            width="286"
            height="142"
            rx="8"
            className="fill-bg stroke-line"
            strokeWidth="1.2"
          />
          <text
            x="934"
            y={STAR_Y + 22}
            className="fill-ink font-mono"
            fontSize="10"
            fontWeight="700"
            letterSpacing="0.8"
          >
            07 · TABLEAU
          </text>
          <text
            x="934"
            y={STAR_Y + 38}
            className="fill-ink-faint"
            fontSize="7.5"
          >
            Built for public health officials
          </text>
          {[
            "Inspection outcome distributions",
            "Risk-based hotspot analysis",
            "Violation frequency and severity",
            "Geographic clustering of failures",
            "Cross-city comparison",
          ].map((t, j) => (
            <text
              key={t}
              x="934"
              y={STAR_Y + 60 + j * 15}
              className="fill-ink-soft"
              fontSize="8.5"
            >
              &middot; {t}
            </text>
          ))}

          <line
            x1="590"
            y1={FACT_Y + 26}
            x2="912"
            y2={FACT_Y + 26}
            className="stroke-ink-faint"
            strokeWidth="1.6"
          />
          <polygon
            points={`912,${FACT_Y + 22} 920,${FACT_Y + 26} 912,${FACT_Y + 30}`}
            className="fill-ink-faint"
          />
          <text
            x="751"
            y={FACT_Y + 18}
            textAnchor="middle"
            className="fill-ink-faint font-mono"
            fontSize="7"
          >
            live connection
          </text>

          {/* ---- Audit columns, every layer ---- */}
          <rect
            x="1240"
            y={STAR_Y}
            width="316"
            height="142"
            rx="8"
            className="fill-accent/[0.06] stroke-accent"
            strokeWidth="1.4"
          />
          <text
            x="1254"
            y={STAR_Y + 22}
            className="fill-accent font-mono"
            fontSize="9"
            fontWeight="700"
            letterSpacing="1"
          >
            STAMPED ON EVERY RECORD
          </text>
          {[
            ["job_id", "which run produced the row"],
            ["load_dt", "when it was ingested"],
            ["source", "which city it came from"],
          ].map(([col, what], j) => (
            <g key={col}>
              <text
                x="1254"
                y={STAR_Y + 48 + j * 26}
                className="fill-ink font-mono"
                fontSize="9"
              >
                {col}
              </text>
              <text
                x="1330"
                y={STAR_Y + 48 + j * 26}
                className="fill-ink-soft"
                fontSize="8.5"
              >
                {what}
              </text>
            </g>
          ))}
          <text
            x="1254"
            y={STAR_Y + 128}
            className="fill-ink-faint"
            fontSize="7.5"
          >
            Three columns are the difference between a rerun and an
          </text>
          <text
            x="1254"
            y={STAR_Y + 139}
            className="fill-ink-faint"
            fontSize="7.5"
          >
            investigation.
          </text>

          <text x="30" y="852" className="fill-ink-soft" fontSize="8.5">
            Two lanes exist because wide-to-long and free-text parsing share no
            logic. A single generic pipeline would branch on city at every step,
            so the branch is made explicit and pushed to the top. The cost is
            real: a third city means writing a third transformation, not adding a
            config entry.
          </text>
        </svg>
      </div>
      <figcaption className="border-t border-line px-4 py-2 font-mono text-[10px] tracking-[0.1em] text-ink-faint uppercase">
        Two lanes, one convergence point. The shape mismatch is the project, so it is drawn rather than described.
      </figcaption>
    </figure>
  );
}
