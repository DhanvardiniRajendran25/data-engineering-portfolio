"use client";

/**
 * Chart primitives for the live pipeline dashboard.
 *
 * Hand-built SVG rather than a charting library. Six small charts do not
 * justify shipping 40kB of runtime to a portfolio page, and these need to
 * inherit the site's CSS custom properties so they re-theme with everything
 * else instead of carrying a second hardcoded palette.
 *
 * Colour rules followed here, deliberately rather than by taste:
 *
 *   Sequential (one hue, light to dark) wherever the job is magnitude: the
 *   calendar heatmap and the weekday bars. Never a rainbow ramp, and never a
 *   value-ramp over nominal categories, which would burn the only free channel
 *   re-encoding the bar length the reader can already see.
 *
 *   Categorical only where the series ARE the subject: the stacked monthly
 *   chart and the ZIP scatter, both of which are exactly three cities. The
 *   three steps were validated in OKLab for lightness band, chroma floor,
 *   colourblind separation and contrast, per theme, and live in globals.css as
 *   --viz-1..3. Colour follows the city, never its current rank, so a series
 *   that drops out never repaints the others.
 *
 *   Blue and green separate poorly under tritanopia, so every series is also
 *   direct-labelled or legended. Identity is never carried by colour alone.
 *
 * No dual axes anywhere. Where two measures of different scale need comparing
 * they get two charts, not two y-scales on one.
 */

export const CITY_ORDER = ["chicago", "nyc", "dallas"] as const;
export type CityKey = (typeof CITY_ORDER)[number];

export const CITY_LABEL: Record<string, string> = {
  chicago: "Chicago",
  nyc: "New York City",
  dallas: "Dallas",
};

/** Fixed slot per city, assigned by identity and never by rank. */
export const CITY_COLOR: Record<string, string> = {
  chicago: "var(--viz-1)",
  nyc: "var(--viz-2)",
  dallas: "var(--viz-3)",
};

const fmt = (n: number) => n.toLocaleString("en-US");

export function Legend({ cities }: { cities: string[] }) {
  return (
    <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
      {cities.map((c) => (
        <li key={c} className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: CITY_COLOR[c] }}
          />
          <span className="font-mono text-[11px] text-ink-soft">
            {CITY_LABEL[c] ?? c}
          </span>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* Calendar heatmap: 7 weekday rows by N week columns.                 */
/* Job is magnitude over a date grid, so one hue, light to dark.       */
/* ------------------------------------------------------------------ */

export function CalendarHeatmap({
  data,
}: {
  data: { day: string; violations: number }[];
}) {
  if (data.length < 14) return null;

  const byDay = new Map(data.map((d) => [d.day, d.violations]));
  const max = Math.max(...data.map((d) => d.violations), 1);

  // Walk from the Sunday on or before the first date through the last date, so
  // every column is a real calendar week rather than an arbitrary 7-day bucket.
  const first = new Date(`${data[0].day}T00:00:00`);
  const last = new Date(`${data[data.length - 1].day}T00:00:00`);
  const start = new Date(first);
  start.setDate(start.getDate() - start.getDay());

  const weeks: (string | null)[][] = [];
  const cursor = new Date(start);
  while (cursor <= last) {
    const week: (string | null)[] = [];
    for (let d = 0; d < 7; d++) {
      const pad = (n: number) => String(n).padStart(2, "0");
      const key = `${cursor.getFullYear()}-${pad(cursor.getMonth() + 1)}-${pad(cursor.getDate())}`;
      week.push(cursor >= first && cursor <= last ? key : null);
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }

  const CELL = 11;
  const GAP = 2.5;
  const w = weeks.length * (CELL + GAP);
  const h = 7 * (CELL + GAP);

  // Five steps of one hue. Alpha over the surface is a genuine single-hue
  // lightness ramp, and it re-themes for free.
  const step = (v: number | undefined) => {
    if (v === undefined) return "var(--line)";
    const t = v / max;
    if (t > 0.75) return "color-mix(in oklab, var(--accent) 100%, transparent)";
    if (t > 0.5) return "color-mix(in oklab, var(--accent) 74%, transparent)";
    if (t > 0.25) return "color-mix(in oklab, var(--accent) 48%, transparent)";
    if (t > 0) return "color-mix(in oklab, var(--accent) 24%, transparent)";
    return "var(--line)";
  };

  return (
    <div>
      <div
        role="region"
        aria-label={`Inspection activity by day over ${weeks.length} weeks. Busiest day ${fmt(max)} violations.`}
        tabIndex={0}
        className="overflow-x-auto focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
      >
        <svg
          viewBox={`0 0 ${w} ${h}`}
          className="h-[104px]"
          style={{ minWidth: w }}
          aria-hidden="true"
        >
          {weeks.map((week, wi) =>
            week.map((key, di) => {
              const value = key ? byDay.get(key) : undefined;
              return (
                <rect
                  key={`${wi}-${di}`}
                  x={wi * (CELL + GAP)}
                  y={di * (CELL + GAP)}
                  width={CELL}
                  height={CELL}
                  rx="2.5"
                  fill={key ? step(value ?? 0) : "transparent"}
                >
                  {key && (
                    <title>
                      {key}: {fmt(value ?? 0)} violations
                    </title>
                  )}
                </rect>
              );
            }),
          )}
        </svg>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="font-mono text-[10px] text-ink-faint">
          {data[0].day}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[10px] text-ink-faint">less</span>
          {[0, 0.2, 0.4, 0.6, 0.9].map((t) => (
            <span
              key={t}
              aria-hidden="true"
              className="block h-2.5 w-2.5 rounded-[2px]"
              style={{ backgroundColor: step(t * max) }}
            />
          ))}
          <span className="font-mono text-[10px] text-ink-faint">more</span>
        </div>
        <span className="font-mono text-[10px] text-ink-faint">
          {data[data.length - 1].day}
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Stacked columns by city over months. Part-to-whole plus trend.      */
/* ------------------------------------------------------------------ */

export function StackedMonthly({
  data,
  cities,
}: {
  data: { month: string; city: string; violations: number }[];
  cities: string[];
}) {
  const months = Array.from(new Set(data.map((d) => d.month))).sort();
  if (months.length < 2) return null;

  const lookup = new Map(data.map((d) => [`${d.month}|${d.city}`, d.violations]));
  const totals = months.map((m) =>
    cities.reduce((sum, c) => sum + (lookup.get(`${m}|${c}`) ?? 0), 0),
  );
  const max = Math.max(...totals, 1);

  const W = 100;
  const H = 44;
  const slot = W / months.length;
  const barW = Math.max(slot - 0.9, 0.5);

  return (
    <div>
      <Legend cities={cities} />
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={`Violations per month, stacked by city, across ${months.length} months. Peak ${fmt(max)}.`}
        className="mt-4 h-40 w-full"
      >
        {months.map((m, i) => {
          let y = H;
          return (
            <g key={m}>
              {cities.map((c) => {
                const v = lookup.get(`${m}|${c}`) ?? 0;
                if (v === 0) return null;
                const segH = (v / max) * H;
                // 0.4 of surface between segments so adjacent fills read as
                // separate bands rather than one blended block.
                y -= segH;
                return (
                  <rect
                    key={c}
                    x={i * slot}
                    y={y}
                    width={barW}
                    height={Math.max(segH - 0.4, 0.3)}
                    fill={CITY_COLOR[c]}
                  >
                    <title>
                      {m} · {CITY_LABEL[c] ?? c}: {fmt(v)}
                    </title>
                  </rect>
                );
              })}
            </g>
          );
        })}
      </svg>
      <div className="mt-2 flex justify-between font-mono text-[10px] text-ink-faint">
        <span>{months[0]}</span>
        <span>peak {fmt(max)}</span>
        <span>{months[months.length - 1]}</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Scatter: establishments against violations, one dot per ZIP.        */
/* ------------------------------------------------------------------ */

export function ZipScatter({
  data,
  cities,
}: {
  data: { zip: string; city: string; establishments: number; violations: number }[];
  cities: string[];
}) {
  if (data.length < 8) return null;

  const maxX = Math.max(...data.map((d) => d.establishments), 1);
  const maxY = Math.max(...data.map((d) => d.violations), 1);
  const W = 100;
  const H = 62;
  const PAD = 4;

  const x = (v: number) => PAD + (v / maxX) * (W - PAD * 2);
  const y = (v: number) => H - PAD - (v / maxY) * (H - PAD * 2);

  return (
    <div>
      <Legend cities={cities} />
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Scatter of ${data.length} ZIP codes. Horizontal axis is establishments inspected, up to ${fmt(maxX)}. Vertical axis is violations recorded, up to ${fmt(maxY)}. Points above the diagonal have more violations per establishment.`}
        className="mt-4 h-56 w-full"
      >
        {/* Hairline frame, no gridlines. Dashing would add noise. */}
        <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD}
              stroke="var(--line)" strokeWidth="0.25" />
        <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD}
              stroke="var(--line)" strokeWidth="0.25" />

        {data.map((d) => (
          <circle
            key={`${d.city}-${d.zip}`}
            cx={x(d.establishments)}
            cy={y(d.violations)}
            r="0.85"
            fill={CITY_COLOR[d.city]}
            fillOpacity="0.72"
            // A hairline ring in the surface colour so overlapping dots stay
            // countable instead of merging into a blob.
            stroke="var(--bg-elev)"
            strokeWidth="0.18"
          >
            <title>
              {d.zip} · {CITY_LABEL[d.city] ?? d.city}: {fmt(d.violations)} violations
              across {fmt(d.establishments)} establishments
            </title>
          </circle>
        ))}
      </svg>
      <div className="mt-2 flex justify-between font-mono text-[10px] text-ink-faint">
        <span>establishments per ZIP &rarr;</span>
        <span>violations &uarr; up to {fmt(maxY)}</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Weekday columns. Single series, so one colour and no legend.        */
/* ------------------------------------------------------------------ */

const DAY_NAME = ["", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function WeekdayBars({
  data,
}: {
  data: { weekday: number; inspections: number }[];
}) {
  if (data.length < 3) return null;
  const max = Math.max(...data.map((d) => d.inspections), 1);
  const busiest = data.reduce((a, b) => (b.inspections > a.inspections ? b : a));

  return (
    <div>
      {/* The bar sits in its own fixed-height track. A percentage height needs
          a parent with a definite height to resolve against, and hanging it off
          the flex column directly meant every bar computed to zero and the
          chart rendered as labels with nothing between them. */}
      <ul
        className="flex items-end gap-2"
        aria-label={`Inspections by weekday. Busiest is ${DAY_NAME[busiest.weekday]} with ${fmt(busiest.inspections)}.`}
      >
        {data.map((d) => (
          <li key={d.weekday} className="flex flex-1 flex-col items-center gap-2">
            <span className="font-mono text-[10px] text-ink-soft">
              {d.inspections >= 1000
                ? `${(d.inspections / 1000).toFixed(0)}k`
                : d.inspections}
            </span>
            <div className="flex h-32 w-full items-end">
              <span
                aria-hidden="true"
                className="w-full rounded-t bg-accent"
                style={{
                  height: `${Math.max((d.inspections / max) * 100, 1.5)}%`,
                  // Emphasis rather than a value ramp: the busiest day is the
                  // point, the rest are context.
                  opacity: d.weekday === busiest.weekday ? 1 : 0.5,
                }}
              />
            </div>
            <span className="font-mono text-[10px] text-ink-faint">
              {DAY_NAME[d.weekday]}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Meter: one ratio against a hard limit. Not a two-slice pie.         */
/* ------------------------------------------------------------------ */

export function StorageMeter({
  bytes,
  limitBytes,
}: {
  bytes: number;
  limitBytes: number;
}) {
  const pct = Math.min((bytes / limitBytes) * 100, 100);
  const mb = (n: number) => `${(n / 1024 / 1024).toFixed(0)} MB`;

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="font-mono text-2xl text-ink">{mb(bytes)}</p>
        <p className="font-mono text-xs text-ink-faint">of {mb(limitBytes)}</p>
      </div>
      <div
        role="meter"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Database size against the free tier limit"
        className="mt-3 h-2 w-full overflow-hidden rounded-full bg-ink/[0.07]"
      >
        <div
          className="h-2 rounded-full bg-accent"
          style={{ width: `${Math.max(pct, 0.8)}%` }}
        />
      </div>
      <p className="mt-3 text-xs text-ink-faint">
        {pct.toFixed(0)}% of the Neon free tier. The 24-month rolling window and
        the prune step exist to keep this bounded rather than creeping toward the
        cap and failing quietly.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Dot plot. For ranked categories with long names, where a full bar    */
/* is a lot of ink to say what a dot on a rule says as clearly.         */
/* ------------------------------------------------------------------ */

export function DotPlot({
  items,
}: {
  items: { label: string; sub?: string; value: number }[];
}) {
  const max = Math.max(...items.map((i) => i.value), 1);

  return (
    <ul className="grid gap-4">
      {items.map((it) => (
        <li key={`${it.sub}-${it.label}`} className="grid min-w-0 gap-2">
          <div className="flex min-w-0 items-baseline justify-between gap-4">
            <span className="min-w-0 flex-1 truncate text-sm text-ink" title={it.label}>
              {it.label}
              {it.sub && (
                <span className="ml-2 font-mono text-[10px] text-ink-faint">
                  {it.sub}
                </span>
              )}
            </span>
            <span className="shrink-0 font-mono text-xs text-ink">
              {fmt(it.value)}
            </span>
          </div>
          {/* Hairline rule to the dot: position carries the magnitude, the rule
              only guides the eye there. Less ink than a filled bar for the
              same reading. */}
          <span aria-hidden="true" className="relative block h-2">
            <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-line" />
            <span
              className="absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-accent"
              style={{ left: `calc(${(it.value / max) * 100}% - 4px)` }}
            />
          </span>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* Composition bar. One horizontal 100% stack for part-to-whole,        */
/* rather than N separate bars that make the reader add up the shares.  */
/* ------------------------------------------------------------------ */

const RAMP = [1, 0.78, 0.6, 0.46, 0.35, 0.26, 0.19, 0.13];

const rampStep = (i: number) =>
  `color-mix(in oklab, var(--accent) ${(RAMP[Math.min(i, RAMP.length - 1)] ?? 0.13) * 100}%, transparent)`;

export function CompositionBar({
  items,
  caption,
}: {
  items: { label: string; value: number }[];
  caption?: string;
}) {
  const total = items.reduce((a, b) => a + b.value, 0);
  if (total === 0) return null;

  return (
    <div>
      {/* An ordered share, so one hue stepped light to dark rather than eight
          categorical colours. These categories do have a natural order: they
          are ranked by size, and the ramp encodes that rank. */}
      <div className="flex h-7 w-full gap-[2px] overflow-hidden rounded-full">
        {items.map((it, i) => (
          <span
            key={it.label}
            className="h-7"
            style={{
              width: `${(it.value / total) * 100}%`,
              backgroundColor: rampStep(i),
            }}
            title={`${it.label}: ${fmt(it.value)}`}
          />
        ))}
      </div>

      <ul className="mt-5 grid gap-2.5">
        {items.map((it, i) => (
          <li key={it.label} className="flex min-w-0 items-baseline gap-3">
            <span
              aria-hidden="true"
              className="block h-2.5 w-2.5 shrink-0 rounded-[2px]"
              style={{ backgroundColor: rampStep(i) }}
            />
            <span
              className="min-w-0 flex-1 truncate text-sm text-ink-soft"
              title={it.label}
            >
              {it.label}
            </span>
            <span className="shrink-0 font-mono text-xs text-ink">
              {((it.value / total) * 100).toFixed(1)}%
            </span>
            <span className="w-16 shrink-0 text-right font-mono text-xs text-ink-faint">
              {fmt(it.value)}
            </span>
          </li>
        ))}
      </ul>
      {caption && <p className="mt-4 text-xs text-ink-faint">{caption}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Severity as a stacked composition per city, so "not graded" is a     */
/* visible third state rather than a missing bar.                       */
/* ------------------------------------------------------------------ */

export function SeverityStacks({
  data,
}: {
  data: { city: string; critical: number; notCritical: number; unknown: number }[];
}) {
  return (
    <ul className="grid gap-5">
      {data.map((s) => {
        const total = s.critical + s.notCritical + s.unknown;
        if (total === 0) return null;
        const graded = s.critical + s.notCritical;
        const pct = (n: number) => (n / total) * 100;

        return (
          <li key={s.city} className="grid gap-2">
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-sm text-ink">
                {CITY_LABEL[s.city] ?? s.city}
              </span>
              <span className="font-mono text-xs text-ink-soft">
                {graded === 0
                  ? "not graded per violation"
                  : `${((s.critical / graded) * 100).toFixed(1)}% critical of graded`}
              </span>
            </div>
            <div className="flex h-6 w-full gap-[2px] overflow-hidden rounded-full">
              {s.critical > 0 && (
                <span
                  className="h-6 bg-accent"
                  style={{ width: `${pct(s.critical)}%` }}
                  title={`Critical: ${fmt(s.critical)}`}
                />
              )}
              {s.notCritical > 0 && (
                <span
                  className="h-6"
                  style={{
                    width: `${pct(s.notCritical)}%`,
                    backgroundColor:
                      "color-mix(in oklab, var(--accent) 34%, transparent)",
                  }}
                  title={`Not critical: ${fmt(s.notCritical)}`}
                />
              )}
              {s.unknown > 0 && (
                <span
                  className="h-6 bg-ink/[0.08]"
                  style={{ width: `${pct(s.unknown)}%` }}
                  title={`Not graded by this source: ${fmt(s.unknown)}`}
                />
              )}
            </div>
          </li>
        );
      })}

      <li className="flex flex-wrap gap-x-5 gap-y-2 pt-1">
        {[
          ["Critical", "var(--accent)"],
          ["Not critical", "color-mix(in oklab, var(--accent) 34%, transparent)"],
          ["Not graded by source", "color-mix(in oklab, var(--ink) 8%, transparent)"],
        ].map(([label, color]) => (
          <span key={label} className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="block h-2.5 w-2.5 rounded-[2px]"
              style={{ backgroundColor: color }}
            />
            <span className="font-mono text-[10px] text-ink-faint">{label}</span>
          </span>
        ))}
      </li>
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* Decay curve. Block sparsity is an ORDERED sequence 1..25, so it is   */
/* an area chart. Rendering it as ranked bars threw the order away, and */
/* the order is the whole finding.                                      */
/* ------------------------------------------------------------------ */

export function DecayCurve({
  points,
  threshold = 1,
}: {
  points: { n: number; pct: number }[];
  /** Percent-populated line below which a block stops being worth unpivoting. */
  threshold?: number;
}) {
  if (points.length < 4) return null;

  const sorted = [...points].sort((a, b) => a.n - b.n);
  const lastN = sorted[sorted.length - 1].n;
  const W = 100;
  const H = 40;
  const x = (n: number) => (lastN === 1 ? 0 : ((n - 1) / (lastN - 1)) * W);
  const y = (pct: number) => H - (pct / 100) * H;

  const line = sorted
    .map((p, i) => `${i === 0 ? "M" : "L"} ${x(p.n)} ${y(p.pct)}`)
    .join(" ");
  const area = `${line} L ${x(lastN)} ${H} L ${x(sorted[0].n)} ${H} Z`;

  const crossing = sorted.find((p) => p.pct < threshold);

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={`Percentage populated across violation blocks 1 to ${lastN}, falling from ${sorted[0].pct.toFixed(1)} percent to ${sorted[sorted.length - 1].pct.toFixed(2)} percent.${crossing ? ` Drops below ${threshold} percent at block ${crossing.n}.` : ""}`}
        className="h-44 w-full"
      >
        <path d={area} fill="var(--accent)" fillOpacity="0.16" />
        <path
          d={line}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
        {crossing && (
          <line
            x1={x(crossing.n)}
            y1="0"
            x2={x(crossing.n)}
            y2={H}
            stroke="var(--ink-faint)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>

      <div className="mt-2 flex justify-between font-mono text-[10px] text-ink-faint">
        <span>block 1 · {sorted[0].pct.toFixed(0)}%</span>
        {crossing && (
          <span className="text-ink-soft">
            crosses {threshold}% at block {crossing.n}
          </span>
        )}
        <span>
          block {lastN} · {sorted[sorted.length - 1].pct.toFixed(2)}%
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Dot map. Real coordinates, one dot per roughly 1km grid cell.        */
/* ------------------------------------------------------------------ */

export function DotMap({
  points,
  cities,
}: {
  points: { city: string; lat: number; lon: number; violations: number }[];
  cities: string[];
}) {
  const present = cities.filter((c) => points.some((p) => p.city === c));
  if (present.length === 0) return null;

  return (
    <div>
      <Legend cities={present} />
      {/* Small multiples, one panel per city. Three cities on one pair of axes
          would be three tiny clusters separated by empty space, because on a
          map position means something and these places are far apart. */}
      <div className="mt-5 grid gap-5 sm:grid-cols-3">
        {present.map((city) => {
          const pts = points.filter((p) => p.city === city);

          // Extent from the 1st to 99th percentile, not min to max. A single
          // mis-geocoded point is enough to stretch the frame until every real
          // one collapses into a corner, which is what a lone 0,0 in the NYC
          // feed did. Percentiles make the frame robust to that class of bad
          // row no matter what is already stored.
          const pct = (values: number[], q: number) => {
            const sorted = [...values].sort((a, b) => a - b);
            const i = Math.min(
              sorted.length - 1,
              Math.max(0, Math.round(q * (sorted.length - 1))),
            );
            return sorted[i];
          };
          const lats = pts.map((p) => p.lat);
          const lons = pts.map((p) => p.lon);
          const minLat = pct(lats, 0.01);
          const maxLat = pct(lats, 0.99);
          const minLon = pct(lons, 0.01);
          const maxLon = pct(lons, 0.99);
          const maxV = Math.max(...pts.map((p) => p.violations), 1);

          const spanLat = maxLat - minLat || 0.01;
          const spanLon = maxLon - minLon || 0.01;
          const W = 100;
          const H = 100;
          const PAD = 6;
          // Clamped, because a percentile extent by definition leaves ~2% of
          // points outside it and an unclamped projection would draw them
          // beyond the panel border.
          const clamp = (v: number) => Math.min(1, Math.max(0, v));
          const px = (lon: number) =>
            PAD + clamp((lon - minLon) / spanLon) * (W - PAD * 2);
          const py = (lat: number) =>
            H - PAD - clamp((lat - minLat) / spanLat) * (H - PAD * 2);

          return (
            <figure key={city} className="m-0">
              <svg
                viewBox={`0 0 ${W} ${H}`}
                role="img"
                aria-label={`${CITY_LABEL[city] ?? city}: ${pts.length} locations plotted by coordinate. Dot size is violation count, up to ${fmt(maxV)}.`}
                className="w-full rounded-brand-sm border border-line"
              >
                {pts.map((p, i) => (
                  <circle
                    key={`${p.lat}-${p.lon}-${i}`}
                    cx={px(p.lon)}
                    cy={py(p.lat)}
                    r={0.9 + (p.violations / maxV) * 2.2}
                    fill={CITY_COLOR[city]}
                    fillOpacity="0.45"
                    stroke="var(--bg-elev)"
                    strokeWidth="0.15"
                  >
                    <title>{fmt(p.violations)} violations</title>
                  </circle>
                ))}
              </svg>
              <figcaption className="mt-2 flex items-baseline justify-between font-mono text-[10px] text-ink-faint">
                <span>{CITY_LABEL[city] ?? city}</span>
                <span>{fmt(pts.length)} cells</span>
              </figcaption>
            </figure>
          );
        })}
      </div>
    </div>
  );
}
