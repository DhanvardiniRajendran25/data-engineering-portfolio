"use client";

import { useEffect, useState } from "react";
import type { PipelineSnapshot, PipelineUnavailable } from "@/lib/pipeline-db";
import {
  CITY_LABEL,
  CITY_ORDER,
  CalendarHeatmap,
  CompositionBar,
  DecayCurve,
  DotMap,
  DotPlot,
  SeverityStacks,
  StackedMonthly,
  StorageMeter,
  WeekdayBars,
  ZipScatter,
} from "./pipeline-charts";

/**
 * Live dashboard for the running pipeline.
 *
 * Deliberately answers the same questions the retired Tableau workbook did:
 * inspection outcome distribution, risk hotspots, violation frequency and
 * severity, geographic clustering, cross-city comparison. Showing numbers is
 * easy; showing that the rebuild does the job the original did is the point.
 *
 * Client-side on purpose. The project page stays statically generated and the
 * database never sits on the critical path of a page render: if Neon is asleep
 * or the free tier is exhausted, this degrades and the rest of the page is
 * untouched.
 *
 * Four states, not one. Empty is distinct from unavailable: a database that
 * answers with nothing is a different fact from one that does not answer, and
 * rendering zeroes for either would be a lie.
 */

type Snapshot = PipelineSnapshot | PipelineUnavailable;

/** Dallas stopped publishing in Feb 2024. Labelled, never hidden. */
const FROZEN = new Set(["dallas"]);

function ago(iso: string | null): string {
  if (!iso) return "unknown";
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(ms / 60_000);
  if (mins < 60) return `${Math.max(1, mins)}m ago`;
  const hours = Math.floor(ms / 3_600_000);
  if (hours < 48) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const fmt = (n: number) => n.toLocaleString("en-US");

function Block({
  label,
  kicker,
  children,
  span,
}: {
  label: string;
  kicker?: string;
  children: React.ReactNode;
  span?: boolean;
}) {
  return (
    // min-w-0 because a grid item defaults to min-width:auto, which lets a long
    // violation description push the card wider than its column instead of
    // letting the truncation inside it do its job.
    <section
      className={`min-w-0 rounded-brand border border-line bg-bg-elev p-5 sm:p-6 ${
        span ? "lg:col-span-2" : ""
      }`}
    >
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="font-mono text-[10px] tracking-[0.16em] text-ink-faint uppercase">
          {label}
        </h3>
        {kicker && (
          <span className="font-mono text-[10px] text-ink-faint">{kicker}</span>
        )}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Skeleton() {
  return (
    <div
      className="rounded-brand border border-line bg-bg-elev p-6 sm:p-8"
      aria-busy="true"
      aria-live="polite"
    >
      <p className="font-mono text-[10px] tracking-[0.16em] text-ink-faint uppercase">
        Reading the pipeline database
      </p>
      {/* Sized to the loaded panel so the page does not shift underneath. */}
      <div className="mt-6 grid h-[7.5rem] grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="self-start">
            <div className="h-8 w-20 rounded bg-ink/[0.06]" />
            <div className="mt-2 h-3 w-14 rounded bg-ink/[0.04]" />
          </div>
        ))}
      </div>
    </div>
  );
}

function Notice({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-brand border border-line bg-bg-elev p-6 sm:p-8">
      <p className="font-mono text-[10px] tracking-[0.16em] text-ink-faint uppercase">
        {title}
      </p>
      <p className="mt-3 max-w-measure text-sm text-ink-soft">{body}</p>
    </div>
  );
}

export function LivePipelinePanel() {
  const [data, setData] = useState<Snapshot | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/pipeline")
      .then((r) => r.json())
      .then((json: Snapshot) => {
        if (!cancelled) setData(json);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (failed || (data && data.status === "unavailable")) {
    return (
      <Notice
        title="Live readout unavailable"
        body="The pipeline database is not responding right now. The architecture below is unaffected, and the scheduled job keeps running whether or not this panel can reach it."
      />
    );
  }

  if (!data) return <Skeleton />;

  const snap = data as PipelineSnapshot;
  const {
    run, totals, cities, daily, monthlyByCity, weekday, zipScatter,
    geo, cityRows, storage, topViolations, hotspots, outcomes, severity, stages, profile,
    rejects, history, risk,
  } = snap;

  if (totals.violations === 0) {
    return (
      <Notice
        title="No data loaded yet"
        body="The database is reachable but empty. The next scheduled run will populate it."
      />
    );
  }

  // Canonical order, filtered to what is actually loaded. Ordering by row
  // count instead would repaint every series whenever the ranking changed.
  const presentCities = CITY_ORDER.filter((c) =>
    cities.some((row) => row.city === c),
  ) as string[];

  // Numeric block order, not the alphabetical order the column names sort in.
  // "violation10" sorts before "violation2" as a string, which is how the
  // sparsity chart ended up displaying its blocks scrambled.
  const dallasPoints = profile
    .filter((p) => p.city === "dallas" && /^violation\d+_description$/.test(p.column))
    .map((p) => ({
      n: Number(p.column.replace(/\D/g, "")),
      pct: 100 - p.nullPct,
    }))
    .sort((a, b) => a.n - b.n);
  const stageTotals = ["bronze", "silver", "gold"].map((stage) => ({
    stage,
    rows: stages.filter((s) => s.stage === stage).reduce((a, b) => a + b.rows, 0),
  }));

  return (
    <div className="grid gap-5">
      {/* ---- Headline. Accent border so it reads as the live thing. ---- */}
      <div className="rounded-brand border-2 border-accent bg-bg-elev p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
          <p className="flex items-center gap-2.5 font-mono text-[11px] tracking-[0.16em] text-accent uppercase">
            <span
              aria-hidden="true"
              className="inline-block h-2 w-2 rounded-full bg-accent"
            />
            Live warehouse
          </p>
          <p className="font-mono text-[11px] text-ink-faint">
            last successful run {ago(run?.finishedAt ?? null)}
            {run?.durationMs ? ` · ${(run.durationMs / 1000).toFixed(0)}s` : ""}
            {run ? ` · ${fmt(run.rowsFetched)} source rows read` : ""}
          </p>
        </div>

        <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-7 sm:grid-cols-3 lg:grid-cols-6">
          {[
            [fmt(totals.violations), "Violations"],
            [fmt(totals.inspections), "Inspections"],
            [fmt(totals.establishments), "Establishments"],
            [fmt(totals.locations), "Locations"],
            [fmt(totals.violationTypes), "Violation types"],
            [totals.criticalPct ? `${totals.criticalPct}%` : "—", "Critical share"],
          ].map(([value, label]) => (
            <div key={label}>
              <dd className="font-mono text-2xl text-ink sm:text-3xl">{value}</dd>
              <dt className="mt-1 text-xs text-ink-soft">{label}</dt>
            </div>
          ))}
        </dl>
      </div>

      {/* ---- Medallion flow, if a run has recorded stage counts ---- */}
      {stageTotals.every((s) => s.rows > 0) && (
        <div className="rounded-brand border border-line bg-bg-elev p-5 sm:p-6">
          <p className="font-mono text-[10px] tracking-[0.16em] text-ink-faint uppercase">
            Last run through the medallion
          </p>
          <ol className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-4">
            {stageTotals.map((s, i) => (
              <li key={s.stage} className="flex items-center gap-3">
                <div className="rounded-brand-sm border border-line bg-bg px-4 py-2.5">
                  <p className="font-mono text-[10px] tracking-[0.14em] text-accent uppercase">
                    {s.stage}
                  </p>
                  <p className="mt-0.5 font-mono text-base text-ink">{fmt(s.rows)}</p>
                </div>
                {i < stageTotals.length - 1 && (
                  <span aria-hidden="true" className="text-ink-faint">
                    &rarr;
                  </span>
                )}
              </li>
            ))}
          </ol>
          <p className="mt-4 max-w-measure text-xs text-ink-faint">
            Bronze counts source rows as published. Silver is those rows after
            each city&apos;s transform, which is where one Chicago row becomes
            several. Gold is what actually landed in the fact table.
          </p>
        </div>
      )}

      {/* ---- Two-column analytics grid ---- */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Block label="Cross-city comparison" kicker="one violation per row" span>
          <table className="w-full border-collapse text-sm">
            <caption className="sr-only">
              Rows held per city with violations per inspection and the latest
              inspection date
            </caption>
            <thead>
              <tr className="border-b border-line text-left">
                {["City", "Violations", "Inspections", "Per inspection", "Latest"].map(
                  (h) => (
                    <th
                      key={h}
                      scope="col"
                      className="py-2 pr-4 font-mono text-[10px] tracking-[0.14em] text-ink-faint uppercase"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {cities.map((c) => (
                <tr key={c.city} className="border-b border-line/60">
                  <td className="py-2.5 pr-4 text-ink">
                    {CITY_LABEL[c.city] ?? c.city}
                    {FROZEN.has(c.city) && (
                      <span className="ml-2 rounded-full border border-line px-2 py-0.5 font-mono text-[9px] tracking-[0.1em] text-ink-faint uppercase">
                        frozen
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 pr-4 font-mono text-xs text-ink">
                    {fmt(c.violations)}
                  </td>
                  <td className="py-2.5 pr-4 font-mono text-xs text-ink-soft">
                    {fmt(c.inspections)}
                  </td>
                  <td className="py-2.5 pr-4 font-mono text-xs text-accent">
                    {c.perInspection.toFixed(2)}
                  </td>
                  <td className="py-2.5 font-mono text-xs text-ink-soft">
                    {c.latest ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-4 max-w-measure text-xs text-ink-faint">
            Violations per inspection is the number the shared grain buys. It is
            not comparable across cities in any raw feed, because one publishes a
            string, one publishes columns and one publishes rows.
          </p>
        </Block>

        {monthlyByCity.length > 1 && (
          <Block label="Violations by month" kicker="stacked by city" span>
            <StackedMonthly data={monthlyByCity} cities={presentCities} />
          </Block>
        )}

        {daily.length > 14 && (
          <Block label="Inspection activity" kicker="26 weeks, one cell per day" span>
            <CalendarHeatmap data={daily} />
            <p className="mt-4 max-w-measure text-xs text-ink-faint">
              The weekly rhythm is visible without being told about it: rows six
              and seven are near empty because inspectors work weekdays.
            </p>
          </Block>
        )}

        {zipScatter.length > 8 && (
          <Block label="Violations against establishments" kicker="one dot per ZIP">
            <ZipScatter data={zipScatter} cities={presentCities} />
            <p className="mt-4 text-xs text-ink-faint">
              A ZIP high on the vertical axis but left on the horizontal has few
              establishments generating many violations, which is a different
              problem from a dense district generating many in total.
            </p>
          </Block>
        )}

        {weekday.length > 2 && (
          <Block label="Inspections by weekday" kicker="whole warehouse">
            <WeekdayBars data={weekday} />
            <p className="mt-4 text-xs text-ink-faint">
              One series, so one colour. Shading the bars by their own height
              would re-encode length as hue and say nothing new.
            </p>
          </Block>
        )}

        {storage.bytes > 0 && (
          <Block label="Warehouse size" kicker="against the free tier">
            <StorageMeter bytes={storage.bytes} limitBytes={storage.limitBytes} />
            {cityRows.length > 1 && (
              <div className="mt-7 border-t border-line pt-6">
                <p className="font-mono text-[10px] tracking-[0.16em] text-ink-faint uppercase">
                  Row share by city
                </p>
                <div className="mt-4">
                  <CompositionBar
                    items={presentCities
                      .map((c) => ({
                        label: CITY_LABEL[c] ?? c,
                        value: cityRows.find((r) => r.city === c)?.rows ?? 0,
                      }))
                      .filter((r) => r.value > 0)}
                  />
                </div>
              </div>
            )}
          </Block>
        )}

        {topViolations.length > 0 && (
          <Block label="Most frequent violations" kicker="top 8">
            <DotPlot
              items={topViolations.map((v) => ({
                label: v.description,
                sub: CITY_LABEL[v.city] ?? v.city,
                value: v.count,
              }))}
            />
            <p className="mt-5 text-xs text-ink-faint">
              A dot on a rule rather than a filled bar. These labels are long
              enough that eight full-width bars become the loudest thing on the
              page for no extra information.
            </p>
          </Block>
        )}

        {geo.length > 0 && (
          <Block label="Geographic clustering" kicker="plotted by coordinate" span>
            <DotMap points={geo} cities={presentCities} />
            <p className="mt-5 max-w-measure text-xs text-ink-faint">
              Actual latitude and longitude, aggregated to a roughly 1km grid so
              the browser draws a few hundred dots instead of 400,000
              overlapping ones. Dot size is violation count. Dallas has
              coordinates at all only because they are nested inside a
              lat_long object rather than published as plain columns, and were
              being dropped until this was noticed.
            </p>
          </Block>
        )}

        {hotspots.length > 0 && (
          <Block label="Densest ZIPs" kicker="top 10">
            <ol className="grid gap-2.5">
              {hotspots.map((h, i) => (
                <li
                  key={`${h.city}-${h.zip}`}
                  className="grid grid-cols-[1.5rem_4.5rem_1fr_auto] items-baseline gap-3 border-b border-line/50 pb-2 text-sm last:border-0"
                >
                  <span className="font-mono text-[10px] text-ink-faint">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-mono text-xs text-ink">{h.zip}</span>
                  <span className="truncate text-xs text-ink-soft">
                    {CITY_LABEL[h.city] ?? h.city} · {fmt(h.establishments)} establishments
                  </span>
                  <span className="font-mono text-xs text-accent">
                    {fmt(h.violations)}
                  </span>
                </li>
              ))}
            </ol>
          </Block>
        )}

        {outcomes.length > 0 && (
          <Block label="Inspection outcomes" kicker="share of inspections">
            <CompositionBar
              items={outcomes.map((o) => ({ label: o.result, value: o.count }))}
              caption="Part-to-whole, so one stacked bar rather than eight separate ones. Ranked by size, which is a real order, so the ramp is one hue stepped light to dark instead of eight competing colours."
            />
          </Block>
        )}

        {risk.length > 0 && (
          <Block label="How each city grades danger" kicker="its own scale">
            <ul className="grid gap-6">
              {presentCities
                .filter((c) => risk.some((r) => r.city === c))
                .map((c) => {
                  const rows = risk.filter((r) => r.city === c);
                  const total = rows.reduce((a, b) => a + b.inspections, 0);
                  return (
                    <li key={c}>
                      <p className="font-mono text-[11px] text-ink-soft">
                        {CITY_LABEL[c] ?? c}
                        <span className="ml-2 text-ink-faint">
                          {c === "chicago"
                            ? "establishment risk tier"
                            : "inspection letter grade"}
                        </span>
                      </p>
                      <div className="mt-3">
                        <CompositionBar
                          items={rows.map((r) => ({
                            label: r.risk,
                            value: r.inspections,
                          }))}
                        />
                      </div>
                      <p className="mt-2 font-mono text-[10px] text-ink-faint">
                        {total.toLocaleString("en-US")} inspections
                      </p>
                    </li>
                  );
                })}
            </ul>
            <p className="mt-6 max-w-measure text-xs text-ink-faint">
              This is why the per-violation chart below is empty for Chicago. It
              does grade danger, but at the establishment rather than the
              violation, so there is no per-violation value to show. Dallas
              grades neither and issues point deductions instead.
            </p>
          </Block>
        )}

        {severity.length > 0 && (
          <Block label="Severity per violation" kicker="where the source grades it">
            <SeverityStacks data={severity} />
            <p className="mt-5 text-xs text-ink-faint">
              Not normalised across cities, and the ungraded share is drawn
              rather than omitted. Chicago grades establishment risk, NYC flags
              violations critical, Dallas assigns point deductions. Forcing
              those onto one scale would invent a comparison the sources do not
              support.
            </p>
          </Block>
        )}

        {dallasPoints.length > 3 && (
          <Block label="Dallas block sparsity" kicker="measured this run">
            <DecayCurve points={dallasPoints} threshold={1} />
            <p className="mt-5 text-xs text-ink-faint">
              An ordered sequence, so a curve. Rendered as ranked bars this read
              as violation10, violation17, violation1, violation25, which is
              alphabetical order and throws away the only thing the series is
              about. The shape is what decides how many of the 25 blocks the
              unpivot touches, recomputed every run.
            </p>
          </Block>
        )}

        <Block label="Rows rejected last run" kicker="published, not swallowed">
          {rejects.length === 0 ? (
            <p className="text-sm text-ink-soft">
              None. Every source row read produced at least one violation row.
            </p>
          ) : (
            <ul className="grid gap-2.5">
              {rejects.map((r) => (
                <li
                  key={`${r.city}-${r.reason}`}
                  className="grid gap-1 text-sm sm:grid-cols-[7rem_1fr_5rem] sm:items-baseline sm:gap-3"
                >
                  <span className="font-mono text-xs text-accent">
                    {CITY_LABEL[r.city] ?? r.city}
                  </span>
                  <span className="text-ink-soft">{r.reason}</span>
                  <span className="font-mono text-xs text-ink sm:text-right">
                    {fmt(r.rows)}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 text-xs text-ink-faint">
            A pipeline that reports only what it accepted is not telling you what
            it did.
          </p>
        </Block>

        {history.length > 0 && (
          <Block label="Run history" kicker="failures included">
            <ul className="grid gap-2">
              {history.map((h, i) => (
                <li
                  key={`${h.startedAt}-${i}`}
                  className="grid grid-cols-[5.5rem_1fr_auto] items-baseline gap-3 border-b border-line/50 pb-2 text-sm last:border-0"
                >
                  <span
                    className={`font-mono text-[10px] tracking-[0.1em] uppercase ${
                      h.status === "success" ? "text-accent" : "text-ink-faint"
                    }`}
                  >
                    {h.status}
                  </span>
                  <span className="font-mono text-xs text-ink-soft">
                    {ago(h.startedAt)}
                  </span>
                  <span className="font-mono text-xs text-ink">
                    {h.rowsAccepted ? `${fmt(h.rowsAccepted)} rows` : "—"}
                    {h.durationMs ? ` · ${(h.durationMs / 1000).toFixed(0)}s` : ""}
                  </span>
                </li>
              ))}
            </ul>
          </Block>
        )}
      </div>

      <p className="text-xs text-ink-faint">
        Raw payload at{" "}
        <a
          href="/api/pipeline"
          className="underline decoration-line underline-offset-4 hover:text-ink"
        >
          /api/pipeline
        </a>
        . Job source in{" "}
        <a
          href="https://github.com/DhanvardiniRajendran25/data-engineering-portfolio/blob/main/pipeline/ingest.py"
          target="_blank"
          rel="noopener"
          className="underline decoration-line underline-offset-4 hover:text-ink"
        >
          pipeline/ingest.py
        </a>
        , schema in{" "}
        <a
          href="https://github.com/DhanvardiniRajendran25/data-engineering-portfolio/blob/main/pipeline/schema.sql"
          target="_blank"
          rel="noopener"
          className="underline decoration-line underline-offset-4 hover:text-ink"
        >
          schema.sql
        </a>
        , run history in{" "}
        <a
          href="https://github.com/DhanvardiniRajendran25/data-engineering-portfolio/actions/workflows/pipeline.yml"
          target="_blank"
          rel="noopener"
          className="underline decoration-line underline-offset-4 hover:text-ink"
        >
          GitHub Actions
        </a>
        .
      </p>
    </div>
  );
}
