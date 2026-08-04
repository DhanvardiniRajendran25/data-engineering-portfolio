"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { TRACES, type Trace } from "@/content/projects/podcastiq-traces";

/**
 * Replays a recorded run through the 9-agent system.
 *
 * Deliberately framed as a replay, not a live demo. The real system needs a
 * Snowflake account and a Neo4j instance in local Docker, neither of which a
 * static site can reach, and presenting a simulation as live would be a lie a
 * reviewer could catch in one question. So the header says "recorded", each
 * trace is badged with its provenance, and traces with no recorded response body
 * show the shape the agent returns instead of an invented answer.
 *
 * Timings are the measured ones. Playback is compressed to a fixed cadence
 * because waiting 4.7 real seconds to watch a bar fill is not a demo, and each
 * step still displays its true duration.
 */

const STEP_MS = 420;

export function AgentConsole() {
  const [selected, setSelected] = useState(0);
  const [revealed, setRevealed] = useState(0);
  const [running, setRunning] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const prefersReducedMotion = useReducedMotion();

  const trace: Trace = TRACES[selected];

  function clearTimers() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }

  useEffect(() => clearTimers, []);

  function run(index: number) {
    clearTimers();
    setSelected(index);

    const next = TRACES[index];

    // With reduced motion, skip the staged reveal entirely.
    if (prefersReducedMotion) {
      setRevealed(next.steps.length + 1);
      setRunning(false);
      return;
    }

    setRevealed(0);
    setRunning(true);

    next.steps.forEach((_, i) => {
      timers.current.push(
        setTimeout(() => setRevealed(i + 1), STEP_MS * (i + 1)),
      );
    });

    // One extra tick reveals the result block.
    timers.current.push(
      setTimeout(
        () => {
          setRevealed(next.steps.length + 1);
          setRunning(false);
        },
        STEP_MS * (next.steps.length + 1),
      ),
    );
  }

  const resultVisible = revealed > trace.steps.length;

  return (
    <div className="rounded-brand border border-line bg-bg-elev">
      {/* Console header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3">
        <div className="flex items-center gap-2">
          <span aria-hidden="true" className="h-2 w-2 rounded-full bg-accent" />
          <span className="font-mono text-[10px] tracking-[0.16em] text-ink-soft uppercase">
            Agent console
          </span>
        </div>
        <span className="font-mono text-[10px] text-ink-faint">
          recorded runs, not live
        </span>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,17rem)_1fr]">
        {/* Query list */}
        <div className="border-b border-line p-4 lg:border-r lg:border-b-0">
          <p className="px-1 font-mono text-[10px] tracking-[0.14em] text-ink-faint uppercase">
            Pick a query
          </p>
          <ul className="mt-3 grid gap-1.5">
            {TRACES.map((t, i) => {
              const active = i === selected;
              return (
                <li key={t.intent}>
                  <button
                    type="button"
                    onClick={() => run(i)}
                    aria-pressed={active}
                    className={`w-full rounded-brand-sm border px-3 py-2.5 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                      active
                        ? "border-ink bg-ink text-bg"
                        : "border-line text-ink-soft hover:border-ink hover:text-ink"
                    }`}
                  >
                    <span
                      className={`font-mono text-[9px] tracking-[0.14em] uppercase ${
                        active ? "text-bg/70" : "text-accent"
                      }`}
                    >
                      {t.intent}
                    </span>
                    <span className="mt-1 block text-xs leading-snug">
                      {t.query}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Trace */}
        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-mono text-xs text-ink">
              <span className="text-accent">&gt;</span> {trace.query}
            </p>
            <button
              type="button"
              onClick={() => run(selected)}
              className="shrink-0 rounded-full border border-line px-3 py-1 font-mono text-[10px] tracking-[0.12em] text-ink-soft uppercase transition-colors hover:border-ink hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {running ? "Running" : "Replay"}
            </button>
          </div>

          {/* Steps. aria-live so a screen reader hears the trace progress. */}
          <ol className="mt-5 grid gap-2" aria-live="polite">
            {trace.steps.map((s, i) => {
              const shown = i < revealed;
              return (
                <li
                  key={s.label}
                  className={`rounded-brand-sm border px-4 py-3 transition-all duration-300 motion-reduce:transition-none ${
                    shown
                      ? "border-line bg-bg opacity-100"
                      : "border-line/40 bg-bg opacity-30"
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="flex items-baseline gap-2 text-sm text-ink">
                      <span className="font-mono text-[10px] text-ink-faint">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {s.label}
                    </span>
                    <span className="shrink-0 font-mono text-[10px] tabular-nums text-ink-faint">
                      {s.ms < 1000 ? `${s.ms}ms` : `${(s.ms / 1000).toFixed(1)}s`}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-ink-soft">{s.detail}</p>
                  {s.code && shown && (
                    <pre className="mt-2 overflow-x-auto rounded-brand-sm border border-line bg-bg-elev p-3 font-mono text-[10px] leading-relaxed text-ink-soft">
                      {s.code}
                    </pre>
                  )}
                </li>
              );
            })}
          </ol>

          {/* Result */}
          <div
            className={`mt-4 transition-opacity duration-500 motion-reduce:transition-none ${
              resultVisible ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="rounded-brand border-l-2 border-accent bg-bg p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-[10px] tracking-[0.16em] text-accent uppercase">
                  {trace.answer ? "Response" : "Returns"}
                </span>
                <span className="font-mono text-[10px] text-ink-faint">
                  {trace.agent} · {(trace.totalMs / 1000).toFixed(1)}s total
                </span>
              </div>

              {trace.answer ? (
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  {trace.answer}
                </p>
              ) : (
                <ul className="mt-2 grid gap-1.5">
                  {trace.returns?.map((r) => (
                    <li key={r} className="flex gap-2 text-sm text-ink-soft">
                      <span aria-hidden="true" className="text-accent">
                        &middot;
                      </span>
                      {r}
                    </li>
                  ))}
                </ul>
              )}

              {trace.confidence && (
                <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-line px-3 py-1 font-mono text-[10px] text-ink-soft">
                  GPT-4o judge
                  <span className="text-ink">
                    {trace.confidence.score}% {trace.confidence.verdict}
                  </span>
                </p>
              )}

              {/* Provenance, stated plainly rather than buried */}
              <p className="mt-3 border-t border-line pt-3 font-mono text-[10px] text-ink-faint">
                {trace.provenance === "full"
                  ? "Full trace transcribed from a recorded run."
                  : "Guardrail, routing and total latency are measured. No response body was recorded, so the return shape is shown instead."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
