"use client";

import { useId, useState } from "react";

/**
 * Horizontal bar chart for a single nominal series.
 *
 * Every bar takes the same accent hue on purpose. These categories (drift types,
 * agent names, node labels) have no natural order, and colouring them by value
 * would re-encode bar length as hue, spending the identity channel on
 * information the length already carries.
 *
 * Values are always readable without hovering: each bar is directly labelled.
 * The tooltip adds context, it never gates the number. A table twin sits behind
 * a toggle so nothing depends on seeing colour or length at all.
 */
export type Datum = { label: string; value: number; note?: string };

export function BarChart({
  data,
  unit = "",
  decimals = 0,
  target,
  targetLabel,
  caption,
}: {
  data: Datum[];
  unit?: string;
  decimals?: number;
  /** Optional threshold rule, e.g. a latency budget. */
  target?: number;
  targetLabel?: string;
  caption?: string;
}) {
  const [showTable, setShowTable] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const tableId = useId();

  const max = Math.max(...data.map((d) => d.value), target ?? 0);
  const fmt = (n: number) =>
    n.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });

  return (
    <figure className="m-0">
      <div className="flex items-center justify-between gap-4">
        {caption && (
          <figcaption className="font-mono text-[11px] tracking-[0.14em] text-ink-faint uppercase">
            {caption}
          </figcaption>
        )}
        <button
          type="button"
          onClick={() => setShowTable((v) => !v)}
          aria-expanded={showTable}
          aria-controls={tableId}
          className="rounded-full border border-line px-3 py-1 font-mono text-[10px] tracking-[0.12em] text-ink-soft uppercase transition-colors hover:border-ink hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {showTable ? "Chart" : "Table"}
        </button>
      </div>

      {showTable ? (
        <table id={tableId} className="mt-5 w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-line text-left">
              <th scope="col" className="py-2 pr-4 font-mono text-[10px] tracking-[0.14em] text-ink-faint uppercase">
                Category
              </th>
              <th scope="col" className="py-2 pr-4 text-right font-mono text-[10px] tracking-[0.14em] text-ink-faint uppercase">
                Value
              </th>
              <th scope="col" className="py-2 font-mono text-[10px] tracking-[0.14em] text-ink-faint uppercase">
                Note
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.label} className="border-b border-line/60">
                <td className="py-2 pr-4">{d.label}</td>
                <td className="py-2 pr-4 text-right font-mono tabular-nums">
                  {fmt(d.value)}
                  {unit}
                </td>
                <td className="py-2 text-ink-soft">{d.note ?? ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="mt-5 grid gap-3">
          {data.map((d) => {
            const pct = (d.value / max) * 100;
            const isHovered = hovered === d.label;
            return (
              <div
                key={d.label}
                className="grid grid-cols-[minmax(7rem,10rem)_1fr] items-center gap-4"
                onMouseEnter={() => setHovered(d.label)}
                onMouseLeave={() => setHovered(null)}
              >
                <span className="text-sm text-ink-soft">{d.label}</span>

                <div className="relative flex items-center gap-3">
                  {/* Track: one shade off the surface, solid hairline, never dashed */}
                  <div className="relative h-2.5 flex-1 rounded-full bg-ink/[0.06]">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-accent transition-[width] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
                      style={{ width: `${Math.max(pct, 0.6)}%` }}
                    />
                    {target !== undefined && (
                      <span
                        aria-hidden="true"
                        className="absolute -top-1 -bottom-1 w-px bg-ink/40"
                        style={{ left: `${(target / max) * 100}%` }}
                      />
                    )}
                  </div>

                  {/* Direct label: the value never depends on hover */}
                  <span className="w-20 shrink-0 font-mono text-xs tabular-nums text-ink">
                    {fmt(d.value)}
                    {unit}
                  </span>

                  {d.note && (
                    <span
                      className={`pointer-events-none absolute -top-6 left-0 rounded-brand-sm border border-line bg-bg-elev px-2 py-1 font-mono text-[10px] text-ink-soft shadow-brand transition-opacity ${
                        isHovered ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      {d.note}
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {target !== undefined && targetLabel && (
            <p className="mt-1 flex items-center gap-2 font-mono text-[10px] tracking-[0.1em] text-ink-faint uppercase">
              <span aria-hidden="true" className="inline-block h-3 w-px bg-ink/40" />
              {targetLabel}
            </p>
          )}
        </div>
      )}
    </figure>
  );
}
