"use client";

import { useEffect, useState } from "react";
import type { PipelineSnapshot, PipelineUnavailable } from "@/lib/pipeline-db";

/**
 * Live readout of the running pipeline.
 *
 * Client-side on purpose. The project page stays statically generated, and the
 * database never sits on the critical path of a page render: if Neon is asleep
 * or the free tier is exhausted, this panel degrades and the rest of the page
 * is untouched.
 *
 * All three states are implemented, not just the happy one. Loading is a
 * skeleton at the panel's real height so nothing below it jumps; unavailable
 * says so plainly rather than rendering zeroes, because a confident "0 rows" is
 * a lie that a portfolio cannot afford.
 */

type Snapshot = PipelineSnapshot | PipelineUnavailable;

const CITY_LABEL: Record<string, string> = {
  chicago: "Chicago",
  nyc: "New York City",
  dallas: "Dallas",
};

/** Dallas stopped publishing in Feb 2024. Shown, not hidden. */
const FROZEN = new Set(["dallas"]);

function ago(iso: string | null): string {
  if (!iso) return "unknown";
  const ms = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(ms / 3_600_000);
  if (hours < 1) return `${Math.max(1, Math.floor(ms / 60_000))}m ago`;
  if (hours < 48) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const fmt = (n: number) => n.toLocaleString("en-US");

/**
 * dt/dd, not p. A <dl> may only contain dt, dd, div, script and template, and
 * a div inside it must itself hold dt/dd pairs. Paragraphs here trip axe's
 * definition-list rule, which is how this was caught.
 */
function Figure({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <dd className="font-mono text-2xl text-ink sm:text-3xl">{value}</dd>
      <dt className="mt-1 text-xs text-ink-soft">{label}</dt>
    </div>
  );
}

/** Inline bar chart. SVG rather than a chart library: one series, no axes. */
function Sparkline({ data }: { data: { day: string; violations: number }[] }) {
  if (data.length < 2) return null;
  const max = Math.max(...data.map((d) => d.violations), 1);
  const w = 100 / data.length;

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="font-mono text-[10px] tracking-[0.16em] text-ink-faint uppercase">
          Violations per inspection day
        </p>
        <p className="font-mono text-[10px] text-ink-faint">
          last {data.length} days with data
        </p>
      </div>
      <svg
        viewBox="0 0 100 26"
        preserveAspectRatio="none"
        role="img"
        aria-label={`Daily violation counts across the last ${data.length} days with data. Peak ${fmt(max)} on ${data.reduce((a, b) => (b.violations > a.violations ? b : a)).day}.`}
        className="mt-3 h-20 w-full"
      >
        {data.map((d, i) => {
          const h = (d.violations / max) * 24;
          return (
            <rect
              key={d.day}
              x={i * w}
              y={26 - h}
              width={Math.max(w - 0.35, 0.3)}
              height={h}
              className="fill-accent/70"
            />
          );
        })}
      </svg>
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
      <div className="mt-6 grid h-[7.5rem] grid-cols-2 gap-6 sm:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="self-start">
            <div className="h-8 w-24 rounded bg-ink/[0.06]" />
            <div className="mt-2 h-3 w-16 rounded bg-ink/[0.04]" />
          </div>
        ))}
      </div>
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
      <div className="rounded-brand border border-line bg-bg-elev p-6 sm:p-8">
        <p className="font-mono text-[10px] tracking-[0.16em] text-ink-faint uppercase">
          Live readout unavailable
        </p>
        <p className="mt-3 max-w-measure text-sm text-ink-soft">
          The pipeline database is not responding right now. The architecture
          below is unaffected, and the scheduled job keeps running whether or not
          this panel can reach it.
        </p>
      </div>
    );
  }

  if (!data) return <Skeleton />;

  const snap = data as PipelineSnapshot;
  const { run, totals, cities, daily, profile, rejects } = snap;

  // Empty is distinct from unavailable: the database answered, it just has
  // nothing yet. That happens between a fresh deploy and the first run.
  if (totals.violations === 0) {
    return (
      <div className="rounded-brand border border-line bg-bg-elev p-6 sm:p-8">
        <p className="font-mono text-[10px] tracking-[0.16em] text-ink-faint uppercase">
          No data loaded yet
        </p>
        <p className="mt-3 max-w-measure text-sm text-ink-soft">
          The database is reachable but empty. The next scheduled run will
          populate it.
        </p>
      </div>
    );
  }

  const dallasProfile = profile.filter((p) => p.city === "dallas");

  return (
    <div className="grid gap-5">
      {/* Headline */}
      <div className="rounded-brand border-2 border-accent bg-bg-elev p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
          <p className="flex items-center gap-2.5 font-mono text-[10px] tracking-[0.16em] text-accent uppercase">
            <span
              aria-hidden="true"
              className="inline-block h-2 w-2 rounded-full bg-accent"
            />
            Live pipeline
          </p>
          <p className="font-mono text-[11px] text-ink-faint">
            last run {ago(run?.finishedAt ?? null)}
            {run?.durationMs ? ` · ${(run.durationMs / 1000).toFixed(1)}s` : ""}
          </p>
        </div>

        <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-7 sm:grid-cols-4">
          <Figure value={fmt(totals.violations)} label="Violations in warehouse" />
          <Figure value={fmt(totals.inspections)} label="Inspections" />
          <Figure value={fmt(totals.establishments)} label="Establishments" />
          <Figure
            value={run ? fmt(run.rowsFetched) : "—"}
            label="Source rows read last run"
          />
        </dl>

        {daily.length > 1 && (
          <div className="mt-8 border-t border-line pt-6">
            <Sparkline data={daily} />
          </div>
        )}
      </div>

      {/* Per city */}
      <div className="rounded-brand border border-line bg-bg-elev p-6 sm:p-8">
        <p className="font-mono text-[10px] tracking-[0.16em] text-ink-faint uppercase">
          Three cities, one grain
        </p>
        <table className="mt-5 w-full border-collapse text-sm">
          <caption className="sr-only">
            Rows held per city, with the most recent inspection date in each
          </caption>
          <thead>
            <tr className="border-b border-line text-left">
              {["City", "Violations", "Inspections", "Latest inspection"].map((h) => (
                <th
                  key={h}
                  scope="col"
                  className="py-2 pr-4 font-mono text-[10px] tracking-[0.14em] text-ink-faint uppercase"
                >
                  {h}
                </th>
              ))}
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
                <td className="py-2.5 font-mono text-xs text-ink-soft">
                  {c.latest ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-4 max-w-measure text-xs text-ink-faint">
          Dallas stopped publishing to its open data portal in February 2024, so
          that lane is historical while the other two refresh. A source going
          dark is a normal thing to have to carry, and hiding it would make the
          other two less believable.
        </p>
      </div>

      {/* Profiling: the real measured null rates */}
      {dallasProfile.length > 0 && (
        <div className="rounded-brand border border-line bg-bg-elev p-6 sm:p-8">
          <p className="font-mono text-[10px] tracking-[0.16em] text-ink-faint uppercase">
            Measured this run · Dallas violation block sparsity
          </p>
          <ul className="mt-5 grid gap-2.5">
            {dallasProfile
              .filter((p) => p.column.startsWith("violation"))
              .map((p) => (
                <li key={p.column} className="grid grid-cols-[9rem_1fr_4rem] items-center gap-3">
                  <span className="font-mono text-xs text-ink-soft">
                    {p.column.replace("_description", "")}
                  </span>
                  <span
                    aria-hidden="true"
                    className="h-1.5 rounded-full bg-ink/[0.07]"
                  >
                    <span
                      className="block h-1.5 rounded-full bg-accent"
                      style={{ width: `${Math.max(100 - p.nullPct, 0.4)}%` }}
                    />
                  </span>
                  <span className="text-right font-mono text-xs text-ink">
                    {(100 - p.nullPct).toFixed(1)}%
                  </span>
                </li>
              ))}
          </ul>
          <p className="mt-4 max-w-measure text-xs text-ink-faint">
            Percentage populated, computed against the live feed on the last run.
            This is what decides how many blocks the unpivot touches.
          </p>
        </div>
      )}

      {/* Rejections, published */}
      <div className="rounded-brand border border-line bg-bg-elev p-6 sm:p-8">
        <p className="font-mono text-[10px] tracking-[0.16em] text-ink-faint uppercase">
          Rows rejected last run
        </p>
        {rejects.length === 0 ? (
          <p className="mt-3 text-sm text-ink-soft">
            None. Every source row that was read produced at least one violation
            row.
          </p>
        ) : (
          <ul className="mt-4 grid gap-2">
            {rejects.map((r) => (
              <li
                key={`${r.city}-${r.reason}`}
                className="grid gap-1 text-sm sm:grid-cols-[7rem_1fr_5rem] sm:items-baseline sm:gap-4"
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
        <p className="mt-4 max-w-measure text-xs text-ink-faint">
          Published rather than swallowed. A pipeline that only reports what it
          accepted is not telling you what it did.
        </p>
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
