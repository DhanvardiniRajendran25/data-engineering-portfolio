"use client";

import { useRef, useState } from "react";
import type { Stage } from "@/content/projects/podcastiq";

const BANDS: { id: Stage["band"]; label: string; blurb: string }[] = [
  {
    id: "data",
    label: "Data engineering",
    blurb: "Captions to a queryable chunk table",
  },
  {
    id: "ai",
    label: "AI engineering",
    blurb: "Chunks to attributed, linked claims",
  },
  {
    id: "query",
    label: "Query pipeline",
    blurb: "Claims to a guarded answer",
  },
];

/**
 * The pipeline as three labelled phases.
 *
 * An earlier version put all eleven stages in one horizontally scrolling rail.
 * That was wrong twice over: two thirds of the pipeline sat off-screen behind a
 * scrollbar, and flattening the stages into one strip erased the three-phase
 * structure, which is the part worth understanding. Phases are now stacked and
 * named, and every stage is visible at once on any width.
 *
 * Still one tablist, so arrow keys traverse all eleven stages across phase
 * boundaries. The phase wrappers take role="presentation" to keep themselves out
 * of the accessibility tree, so the tabs remain the tablist's semantic children.
 */
export function PipelineStepper({ stages }: { stages: Stage[] }) {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(event: React.KeyboardEvent) {
    const last = stages.length - 1;
    let next: number | null = null;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = active === last ? 0 : active + 1;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = active === 0 ? last : active - 1;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = last;

    if (next !== null) {
      event.preventDefault();
      setActive(next);
      tabRefs.current[next]?.focus();
    }
  }

  const stage = stages[active];

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,22rem)_1fr] lg:gap-12">
      {/* Phase groups */}
      <div
        role="tablist"
        aria-label="Pipeline stages"
        aria-orientation="vertical"
        onKeyDown={onKeyDown}
        className="grid gap-7 self-start"
      >
        {BANDS.map((band) => {
          const inBand = stages.filter((s) => s.band === band.id);
          if (inBand.length === 0) return null;

          return (
            <div key={band.id} role="presentation">
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-[10px] tracking-[0.18em] text-accent uppercase">
                  {band.label}
                </span>
                <span aria-hidden="true" className="h-px flex-1 bg-line" />
                <span className="font-mono text-[10px] text-ink-faint">
                  {String(inBand.length).padStart(2, "0")}
                </span>
              </div>
              <p className="mt-1.5 text-xs text-ink-faint">{band.blurb}</p>

              <div className="mt-3 grid gap-1.5" role="presentation">
                {inBand.map((s) => {
                  const i = stages.indexOf(s);
                  const selected = i === active;
                  return (
                    <button
                      key={s.id}
                      ref={(el) => {
                        tabRefs.current[i] = el;
                      }}
                      role="tab"
                      id={`stage-tab-${s.id}`}
                      aria-selected={selected}
                      aria-controls={`stage-panel-${s.id}`}
                      tabIndex={selected ? 0 : -1}
                      onClick={() => setActive(i)}
                      className={`flex items-center gap-3 rounded-brand-sm border px-3 py-2.5 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                        selected
                          ? "border-ink bg-ink text-bg"
                          : "border-line bg-bg-elev text-ink-soft hover:border-ink hover:text-ink"
                      }`}
                    >
                      <span
                        className={`font-mono text-[10px] ${
                          selected ? "text-bg/70" : "text-ink-faint"
                        }`}
                      >
                        {s.step}
                      </span>
                      <span className="text-sm">{s.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        <p className="font-mono text-[10px] tracking-[0.1em] text-ink-faint uppercase">
          Arrow keys to step through
        </p>
      </div>

      {/* Detail panel */}
      <div
        role="tabpanel"
        id={`stage-panel-${stage.id}`}
        aria-labelledby={`stage-tab-${stage.id}`}
        tabIndex={0}
        className="rounded-brand border border-line bg-bg-elev p-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent sm:p-8 lg:sticky lg:top-28"
      >
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="font-mono text-[10px] tracking-[0.18em] text-accent uppercase">
            {BANDS.find((b) => b.id === stage.band)?.label}
          </span>
          <span aria-hidden="true" className="text-ink-faint">
            /
          </span>
          <span className="font-mono text-[10px] tracking-[0.14em] text-ink-faint">
            Step {stage.step} of {String(stages.length).padStart(2, "0")}
          </span>
        </div>

        <h3 className="mt-3 text-2xl sm:text-3xl">{stage.title}</h3>
        <p className="mt-2 font-mono text-xs text-ink-soft">{stage.tool}</p>
        <p className="mt-5 max-w-measure text-ink-soft">{stage.what}</p>

        {/* The decision carries the most visual weight on purpose. */}
        <div className="mt-6 border-l-2 border-accent pl-5">
          <p className="font-mono text-[10px] tracking-[0.18em] text-accent uppercase">
            Tradeoff
          </p>
          <p className="mt-2 text-ink">{stage.tradeoff.title}</p>
          <p className="mt-2 max-w-measure text-sm leading-relaxed text-ink-soft">
            {stage.tradeoff.body}
          </p>
        </div>

        <div className="mt-6 flex flex-wrap items-start gap-x-3 gap-y-1 border-t border-line pt-5">
          <span className="font-mono text-[10px] tracking-[0.14em] text-ink-faint uppercase">
            Output
          </span>
          <span className="font-mono text-xs text-ink">{stage.output}</span>
        </div>
      </div>
    </div>
  );
}
