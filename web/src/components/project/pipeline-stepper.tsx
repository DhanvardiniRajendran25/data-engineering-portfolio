"use client";

import { useRef, useState } from "react";
import { PHASES, type Stage } from "@/content/projects/podcastiq";
import {
  CaptionsIcon,
  ClockIcon,
  DatabaseIcon,
  GridIcon,
  LayersIcon,
  MagnifierIcon,
  NetworkIcon,
  QuoteIcon,
  RouteIcon,
  ShieldIcon,
  SpeakerIcon,
} from "@/components/icons";

/**
 * One mark per stage, used only as a watermark. Purely decorative: each is
 * aria-hidden, so nothing here is information a reader could miss.
 */
const STAGE_ICON: Record<string, (p: { className?: string }) => React.ReactElement> = {
  extract: CaptionsIcon,
  profile: MagnifierIcon,
  load: DatabaseIcon,
  transform: LayersIcon,
  chunk: GridIcon,
  speakers: SpeakerIcon,
  claims: QuoteIcon,
  temporal: ClockIcon,
  graph: NetworkIcon,
  agents: RouteIcon,
  safety: ShieldIcon,
};

/**
 * The pipeline as three named phases.
 *
 * The detail panel is deliberately structured rather than written: the decision
 * renders as chose / over / because / cost, so a reader takes it in at a glance.
 * An earlier version used prose paragraphs, which read like a report.
 *
 * One tablist, so arrow keys traverse all eleven stages across phase
 * boundaries. Phase wrappers take role="presentation" to stay out of the
 * accessibility tree, keeping the tabs as the tablist's semantic children.
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
  const phase = PHASES.find((p) => p.id === stage.phase);
  const StageMark = STAGE_ICON[stage.id] ?? LayersIcon;

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,20rem)_1fr] lg:gap-12">
      <div
        role="tablist"
        aria-label="Pipeline stages"
        aria-orientation="vertical"
        onKeyDown={onKeyDown}
        className="grid gap-8 self-start"
      >
        {PHASES.map((p) => {
          const inPhase = stages.filter((s) => s.phase === p.id);
          if (inPhase.length === 0) return null;

          return (
            <div key={p.id} role="presentation">
              {/* Phase header: what goes in, what comes out. No sentences. */}
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-[10px] tracking-[0.16em] text-ink-faint uppercase">
                  {p.n}
                </span>
                <span className="font-mono text-[10px] tracking-[0.16em] text-accent uppercase">
                  {p.label}
                </span>
                <span aria-hidden="true" className="h-px flex-1 bg-line" />
              </div>
              <p className="mt-1 font-mono text-[10px] text-ink-faint">
                {p.sub}
              </p>
              <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-ink-soft">
                {p.from}
                <span aria-hidden="true" className="text-accent">&rarr;</span>
                {p.to}
              </p>

              <div className="mt-3 grid gap-1.5" role="presentation">
                {inPhase.map((s) => {
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
          Arrow keys to step
        </p>
      </div>

      {/* Detail panel */}
      <div
        role="tabpanel"
        id={`stage-panel-${stage.id}`}
        aria-labelledby={`stage-tab-${stage.id}`}
        tabIndex={0}
        className="relative overflow-hidden rounded-brand border border-line bg-bg-elev p-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent sm:p-8 lg:sticky lg:top-28"
      >
        {/* Fills the dead space under the sticky panel, matching the
            watermark treatment on the homepage impact tiles. */}
        <StageMark
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 -bottom-12 h-56 w-56 text-ink opacity-[0.045]"
        />

        <div className="relative flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-ink/[0.05] text-ink-soft">
            <StageMark className="h-4 w-4" />
          </span>
          <span className="font-mono text-[10px] tracking-[0.16em] text-accent uppercase">
            {phase?.label}
          </span>
          <span aria-hidden="true" className="text-ink-faint">/</span>
          <span className="font-mono text-[10px] text-ink-faint">
            {stage.step} of 11
          </span>
        </div>

        <h3 className="relative mt-2 text-2xl sm:text-3xl">{stage.title}</h3>
        <p className="relative mt-1.5 font-mono text-xs text-ink-soft">{stage.tool}</p>

        {/* Facts as chips, not a paragraph */}
        <ul className="relative mt-5 flex flex-wrap gap-2">
          {stage.facts.map((f) => (
            <li
              key={f}
              className="rounded-full border border-line px-3 py-1 text-[11px] text-ink-soft"
            >
              {f}
            </li>
          ))}
        </ul>

        {/* The decision, as a structure rather than prose */}
        <div className="relative mt-7 rounded-brand border border-line bg-bg p-5">
          <p className="font-mono text-[10px] tracking-[0.16em] text-accent uppercase">
            Decision
          </p>

          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="font-mono text-[10px] tracking-[0.14em] text-ink-faint uppercase">
                Chose
              </dt>
              <dd className="mt-1 text-ink">{stage.decision.chose}</dd>
            </div>

            <div>
              <dt className="font-mono text-[10px] tracking-[0.14em] text-ink-faint uppercase">
                Over
              </dt>
              <dd className="mt-1">
                <ul className="grid gap-0.5">
                  {stage.decision.over.map((o) => (
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
            <dt className="font-mono text-[10px] tracking-[0.14em] text-ink-faint uppercase">
              Because
            </dt>
            <ul className="mt-2 grid gap-1.5">
              {stage.decision.because.map((b) => (
                <li key={b} className="flex gap-2 text-sm text-ink-soft">
                  <span aria-hidden="true" className="text-accent">+</span>
                  {b}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4 border-t border-line pt-4">
            <dt className="font-mono text-[10px] tracking-[0.14em] text-ink-faint uppercase">
              Cost
            </dt>
            <p className="mt-1.5 flex gap-2 text-sm text-ink-soft">
              <span aria-hidden="true" className="text-ink-faint">&minus;</span>
              {stage.decision.cost}
            </p>
          </div>
        </div>

        {/* Output as figures */}
        <dl className="relative mt-6 flex flex-wrap gap-x-8 gap-y-3 border-t border-line pt-5">
          {stage.output.map((o) => (
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
