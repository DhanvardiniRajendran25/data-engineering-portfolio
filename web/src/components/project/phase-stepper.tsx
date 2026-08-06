"use client";

import { useRef, useState } from "react";
import type { Phase } from "@/content/projects/sage";

/**
 * The five development phases as a keyboard-driven tablist.
 *
 * Same interaction model as the PodcastIQ pipeline stepper, and same reason for
 * the shape of the detail panel: the decision renders as chose / over / because
 * / cost so it can be taken in at a glance rather than read as prose.
 *
 * Kept as a separate component rather than generalised with PipelineStepper.
 * The two take different data (phases have a `goal`, stages have a `tool` and a
 * band) and premature sharing would mean a props union that serves neither.
 */
export function PhaseStepper({ phases }: { phases: Phase[] }) {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(event: React.KeyboardEvent) {
    const last = phases.length - 1;
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

  const phase = phases[active];

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,18rem)_1fr] lg:gap-12">
      <div
        role="tablist"
        aria-label="Development phases"
        aria-orientation="vertical"
        onKeyDown={onKeyDown}
        className="grid gap-1.5 self-start"
      >
        {phases.map((p, i) => {
          const selected = i === active;
          return (
            <button
              key={p.id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              role="tab"
              id={`phase-tab-${p.id}`}
              aria-selected={selected}
              aria-controls={`phase-panel-${p.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(i)}
              className={`flex items-center gap-3 rounded-brand-sm border px-3 py-3 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
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
                {p.step}
              </span>
              <span className="text-sm">{p.title}</span>
            </button>
          );
        })}

        <p className="mt-2 font-mono text-[10px] tracking-[0.1em] text-ink-faint uppercase">
          Arrow keys to step
        </p>
      </div>

      <div
        role="tabpanel"
        id={`phase-panel-${phase.id}`}
        aria-labelledby={`phase-tab-${phase.id}`}
        tabIndex={0}
        className="rounded-brand border border-line bg-bg-elev p-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent sm:p-8 lg:sticky lg:top-28"
      >
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-mono text-[10px] tracking-[0.16em] text-accent uppercase">
            Phase {phase.step}
          </span>
          <span aria-hidden="true" className="text-ink-faint">/</span>
          <span className="font-mono text-[10px] text-ink-faint">
            of {String(phases.length).padStart(2, "0")}
          </span>
        </div>

        <h3 className="mt-2 text-2xl sm:text-3xl">{phase.title}</h3>
        <p className="mt-2 max-w-measure text-sm text-ink-soft">{phase.goal}</p>

        <ul className="mt-5 flex flex-wrap gap-2">
          {phase.facts.map((f) => (
            <li
              key={f}
              className="rounded-full border border-line px-3 py-1 text-[11px] text-ink-soft"
            >
              {f}
            </li>
          ))}
        </ul>

        <div className="mt-7 rounded-brand border border-line bg-bg p-5">
          <p className="font-mono text-[10px] tracking-[0.16em] text-accent uppercase">
            Decision
          </p>

          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="font-mono text-[10px] tracking-[0.14em] text-ink-faint uppercase">
                Chose
              </dt>
              <dd className="mt-1 text-ink">{phase.decision.chose}</dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] tracking-[0.14em] text-ink-faint uppercase">
                Over
              </dt>
              <dd className="mt-1">
                <ul className="grid gap-0.5">
                  {phase.decision.over.map((o) => (
                    <li
                      key={o}
                      className="text-sm text-ink-faint line-through decoration-ink-faint/50"
                    >
                      {o}
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          </dl>

          <div className="mt-4 border-t border-line pt-4">
            <p className="font-mono text-[10px] tracking-[0.14em] text-ink-faint uppercase">
              Because
            </p>
            <ul className="mt-2 grid gap-1.5">
              {phase.decision.because.map((b) => (
                <li key={b} className="flex gap-2 text-sm text-ink-soft">
                  <span aria-hidden="true" className="text-accent">+</span>
                  {b}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4 border-t border-line pt-4">
            <p className="font-mono text-[10px] tracking-[0.14em] text-ink-faint uppercase">
              Cost
            </p>
            <p className="mt-1.5 flex gap-2 text-sm text-ink-soft">
              <span aria-hidden="true" className="text-ink-faint">&minus;</span>
              {phase.decision.cost}
            </p>
          </div>
        </div>

        <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 border-t border-line pt-5">
          {phase.output.map((o) => (
            <div key={o.label}>
              <dd className="font-mono text-lg text-ink">{o.value}</dd>
              <dt className="text-[11px] text-ink-faint">{o.label}</dt>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
