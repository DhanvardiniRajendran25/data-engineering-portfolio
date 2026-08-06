"use client";

import { useEffect, useState } from "react";
import type { PipelineSnapshot, PipelineUnavailable } from "@/lib/pipeline-db";

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

const CITY_LABEL: Record<string, string> = {
  chicago: "Chicago",
  nyc: "New York City",
  dallas: "Dallas",
};

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

/** Horizontal proportional bar. Used anywhere a ranking needs weight. */
function Bar({
  label,
  sub,
  value,
  max,
  right,
}: {
  label: string;
  sub?: string;
  value: number;
  max: number;
  right: string;
}) {
  return (
    <li className="grid min-w-0 gap-1.5">
      <div className="flex min-w-0 items-baseline justify-between gap-4">
        <span className="min-w-0 flex-1 truncate text-sm text-ink" title={label}>
          {label}
          {sub && (
            <span className="ml-2 font-mono text-[10px] text-ink-faint">{sub}</span>
          )}
        </span>
        <span className="shrink-0 font-mono text-xs text-ink-soft">{right}</span>
      </div>
      <span aria-hidden="true" className="block h-1.5 rounded-full bg-ink/[0.07]">
        <span
          className="block h-1.5 rounded-full bg-accent"
          style={{ width: `${Math.max((value / max) * 100, 0.6)}%` }}
        />
      </span>
    </li>
  );
}

function MonthlyChart({
  data,
}: {
  data: { month: string; violations: number }[];
}) {
  if (data.length < 2) return null;
  const max = Math.max(...data.map((d) => d.violations), 1);
  const w = 100 / data.length;
  const peak = data.reduce((a, b) => (b.violations > a.violations ? b : a));

  return (
    <div>
      <svg
        viewBox="0 0 100 30"
        preserveAspectRatio="none"
        role="img"
        aria-label={`Violations per month across ${data.length} months. Peak ${fmt(peak.violations)} in ${peak.month}.`}
        className="h-28 w-full"
      >
        {data.map((d, i) => {
          const h = (d.violations / max) * 28;
          return (
            <rect
              key={d.month}
              x={i * w}
              y={30 - h}
              width={Math.max(w - 0.5, 0.4)}
              height={h}
              className="fill-accent/70"
            />
          );
        })}
      </svg>
      <div className="mt-2 flex justify-between font-mono text-[10px] text-ink-faint">
        <span>{data[0].month}</span>
        <span>peak {fmt(max)}</span>
        <span>{data[data.length - 1].month}</span>
      </div>
    </div>
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
    run, totals, cities, monthly, topViolations, hotspots,
    outcomes, severity, stages, profile, rejects, history,
  } = snap;

  if (totals.violations === 0) {
    return (
      <Notice
        title="No data loaded yet"
        body="The database is reachable but empty. The next scheduled run will populate it."
      />
    );
  }

  const dallasProfile = profile.filter(
    (p) => p.city === "dallas" && p.column.startsWith("violation"),
  );
  const maxViolation = Math.max(...topViolations.map((v) => v.count), 1);
  const maxHotspot = Math.max(...hotspots.map((h) => h.violations), 1);
  const maxOutcome = Math.max(...outcomes.map((o) => o.count), 1);
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

        {monthly.length > 1 && (
          <Block label="Violation frequency" kicker={`${monthly.length} months`} span>
            <MonthlyChart data={monthly} />
          </Block>
        )}

        {topViolations.length > 0 && (
          <Block label="Most frequent violations" kicker="top 8">
            <ul className="grid gap-3.5">
              {topViolations.map((v) => (
                <Bar
                  key={`${v.city}-${v.description}`}
                  label={v.description}
                  sub={CITY_LABEL[v.city] ?? v.city}
                  value={v.count}
                  max={maxViolation}
                  right={fmt(v.count)}
                />
              ))}
            </ul>
          </Block>
        )}

        {hotspots.length > 0 && (
          <Block label="Geographic hotspots" kicker="violations by ZIP">
            <ul className="grid gap-3.5">
              {hotspots.map((h) => (
                <Bar
                  key={`${h.city}-${h.zip}`}
                  label={h.zip}
                  sub={`${CITY_LABEL[h.city] ?? h.city} · ${fmt(h.establishments)} establishments`}
                  value={h.violations}
                  max={maxHotspot}
                  right={fmt(h.violations)}
                />
              ))}
            </ul>
          </Block>
        )}

        {outcomes.length > 0 && (
          <Block label="Inspection outcomes" kicker="distinct inspections">
            <ul className="grid gap-3.5">
              {outcomes.map((o) => (
                <Bar
                  key={o.result}
                  label={o.result}
                  value={o.count}
                  max={maxOutcome}
                  right={fmt(o.count)}
                />
              ))}
            </ul>
          </Block>
        )}

        {severity.some((s) => s.critical + s.notCritical > 0) && (
          <Block label="Severity" kicker="where the source grades it">
            <ul className="grid gap-4">
              {severity.map((s) => {
                const known = s.critical + s.notCritical;
                if (known === 0) {
                  return (
                    <li key={s.city} className="text-sm">
                      <span className="text-ink">
                        {CITY_LABEL[s.city] ?? s.city}
                      </span>
                      <span className="ml-2 text-xs text-ink-faint">
                        not graded per violation by this source
                      </span>
                    </li>
                  );
                }
                const pct = (s.critical / known) * 100;
                return (
                  <li key={s.city} className="grid gap-1.5">
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm text-ink">
                        {CITY_LABEL[s.city] ?? s.city}
                      </span>
                      <span className="font-mono text-xs text-accent">
                        {pct.toFixed(1)}% critical
                      </span>
                    </div>
                    <span
                      aria-hidden="true"
                      className="block h-1.5 rounded-full bg-ink/[0.07]"
                    >
                      <span
                        className="block h-1.5 rounded-full bg-accent"
                        style={{ width: `${Math.max(pct, 0.6)}%` }}
                      />
                    </span>
                  </li>
                );
              })}
            </ul>
            <p className="mt-4 text-xs text-ink-faint">
              Not normalised across cities. Chicago grades establishment risk,
              NYC flags violations critical, Dallas assigns point deductions.
              These are not the same measurement and forcing them onto one scale
              would invent a comparison the sources do not support.
            </p>
          </Block>
        )}

        {dallasProfile.length > 0 && (
          <Block label="Dallas block sparsity" kicker="measured this run">
            <ul className="grid gap-3">
              {dallasProfile.map((p) => (
                <Bar
                  key={p.column}
                  label={p.column.replace("_description", "")}
                  value={100 - p.nullPct}
                  max={100}
                  right={`${(100 - p.nullPct).toFixed(1)}%`}
                />
              ))}
            </ul>
            <p className="mt-4 text-xs text-ink-faint">
              Percentage populated. This is what decides how many of the 25
              blocks the unpivot touches, recomputed every run rather than
              trusting a threshold written down once.
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
