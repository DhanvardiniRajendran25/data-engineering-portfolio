"use client";

import { useRef, useState } from "react";
import type { Stage } from "@/content/projects/podcastiq";

const BAND_LABEL: Record<Stage["band"], string> = {
  data: "Data engineering",
  ai: "AI engineering",
  query: "Query pipeline",
};

/**
 * The 11 pipeline stages as a keyboard-driven tablist.
 *
 * Built as a real tablist rather than an accordion because the stages are one
 * sequence the reader steps along, and arrow-key traversal is the expected
 * behaviour there. Roving tabindex: only the selected tab is in the tab order,
 * arrows move selection, Home and End jump to the ends.
 *
 * The detail panel leads with the tradeoff rather than the tooling. Tools are
 * the least interesting thing about a pipeline; the decisions are what a
 * reviewer is actually assessing.
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
    <div>
      {/* Stage rail */}
      <div
        role="tablist"
        aria-label="Pipeline stages"
        onKeyDown={onKeyDown}
        className="flex snap-x gap-2 overflow-x-auto pb-3"
      >
        {stages.map((s, i) => {
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
              className={`group flex shrink-0 snap-start flex-col items-start gap-1 rounded-brand border px-4 py-3 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                selected
                  ? "border-ink bg-ink text-bg"
                  : "border-line bg-bg-elev text-ink-soft hover:border-ink hover:text-ink"
              }`}
            >
              <span
                className={`font-mono text-[10px] tracking-[0.14em] ${
                  selected ? "text-bg/70" : "text-ink-faint"
                }`}
              >
                {s.step}
              </span>
              <span className="text-sm whitespace-nowrap">{s.title}</span>
            </button>
          );
        })}
      </div>

      {/* Detail panel */}
      <div
        role="tabpanel"
        id={`stage-panel-${stage.id}`}
        aria-labelledby={`stage-tab-${stage.id}`}
        tabIndex={0}
        className="mt-6 rounded-brand border border-line bg-bg-elev p-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent sm:p-8"
      >
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="font-mono text-[10px] tracking-[0.18em] text-accent uppercase">
            {BAND_LABEL[stage.band]}
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

        {/* The decision. Given the most visual weight on purpose. */}
        <div className="mt-6 border-l-2 border-accent pl-5">
          <p className="font-mono text-[10px] tracking-[0.18em] text-accent uppercase">
            Tradeoff
          </p>
          <p className="mt-2 text-ink">{stage.tradeoff.title}</p>
          <p className="mt-2 max-w-measure text-sm leading-relaxed text-ink-soft">
            {stage.tradeoff.body}
          </p>
        </div>

        <div className="mt-6 flex items-start gap-3 border-t border-line pt-5">
          <span className="font-mono text-[10px] tracking-[0.14em] text-ink-faint uppercase">
            Output
          </span>
          <span className="font-mono text-xs text-ink">{stage.output}</span>
        </div>
      </div>

      <p className="mt-3 font-mono text-[10px] tracking-[0.1em] text-ink-faint uppercase">
        Arrow keys to step through
      </p>
    </div>
  );
}
