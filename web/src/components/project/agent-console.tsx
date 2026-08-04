"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import {
  APP_DISCLAIMER,
  TRACES,
  type Trace,
} from "@/content/projects/podcastiq-traces";

/**
 * Replays recorded runs through the 9-agent system.
 *
 * Every query, answer, source, verdict and URL is transcribed from screen
 * captures of the running Streamlit application, so what appears here is what
 * the system actually produced rather than a reconstruction.
 *
 * Framed as a replay, not a live demo. The real system needs a Snowflake account
 * and Neo4j in local Docker, neither of which a static site can reach, and
 * presenting a simulation as live is a claim a reviewer disproves in one
 * question.
 *
 * Playback is compressed to a fixed cadence because waiting 4.7 real seconds to
 * watch a bar fill is not a demo; each step still shows its measured duration.
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
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3">
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className={`h-2 w-2 rounded-full bg-accent ${
              running ? "animate-pulse motion-reduce:animate-none" : ""
            }`}
          />
          <span className="font-mono text-[10px] tracking-[0.16em] text-ink-soft uppercase">
            Agent console
          </span>
          <span
            role="status"
            className="font-mono text-[10px] tracking-[0.14em] text-accent uppercase"
          >
            {running ? "Running" : ""}
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
                <li key={t.query}>
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
                    {t.provenance === "reconstructed" && (
                      <span
                        className={`mt-1 block font-mono text-[8px] tracking-[0.12em] uppercase ${
                          active ? "text-bg/60" : "text-ink-faint"
                        }`}
                      >
                        reconstructed
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Trace */}
        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-3">
            <p className="font-mono text-xs text-ink">
              <span className="text-accent">&gt;</span> {trace.query}
            </p>
            {running && (
              <span className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.12em] text-ink-faint uppercase">
                <span aria-hidden="true" className="inline-flex gap-0.5">
                  <span className="h-1 w-1 animate-pulse rounded-full bg-accent motion-reduce:animate-none" />
                  <span className="h-1 w-1 animate-pulse rounded-full bg-accent [animation-delay:150ms] motion-reduce:animate-none" />
                  <span className="h-1 w-1 animate-pulse rounded-full bg-accent [animation-delay:300ms] motion-reduce:animate-none" />
                </span>
                executing
              </span>
            )}
          </div>

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
                  Response
                </span>
                <span className="font-mono text-[10px] text-ink-faint">
                  {trace.agent} &middot; {(trace.totalMs / 1000).toFixed(1)}s
                </span>
              </div>

              <p className="mt-2 text-sm leading-relaxed whitespace-pre-line text-ink-soft">
                {trace.answer}
              </p>

              {/* Fact-check verdict */}
              {trace.verdict && (
                <div
                  className={`mt-4 rounded-brand-sm border p-4 ${
                    trace.verdict.state === "VERIFIED"
                      ? "border-ink/30 bg-ink/[0.03]"
                      : "border-accent/40 bg-accent-soft"
                  }`}
                >
                  <p className="flex items-center gap-2 font-mono text-[10px] tracking-[0.16em] uppercase">
                    <span aria-hidden="true">
                      {trace.verdict.state === "VERIFIED" ? "✓" : "✕"}
                    </span>
                    {trace.verdict.state}
                  </p>
                  <p className="mt-2 text-sm text-ink italic">
                    &ldquo;{trace.verdict.claim}&rdquo;
                  </p>
                  <p className="mt-2 font-mono text-[10px] text-ink-faint">
                    {trace.verdict.basis}
                  </p>
                  {trace.verdict.evidence && (
                    <ul className="mt-3 grid gap-1.5 border-t border-line pt-3">
                      {trace.verdict.evidence.map((u) => (
                        <li key={u}>
                          <a
                            href={u}
                            target="_blank"
                            rel="noopener"
                            className="font-mono text-[10px] break-all text-ink-soft underline decoration-line hover:text-ink"
                          >
                            {u}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Claim evolution, before against after */}
              {trace.evolution && (
                <div className="mt-4">
                  <p className="font-mono text-[10px] tracking-[0.16em] text-accent uppercase">
                    Claim evolution
                  </p>
                  <ul className="mt-3 grid gap-3">
                    {trace.evolution.map((e) => (
                      <li
                        key={e.before}
                        className="grid items-center gap-2 rounded-brand-sm border border-line bg-bg-elev p-3 sm:grid-cols-[1fr_auto_1fr]"
                      >
                        <div>
                          <p className="text-xs text-ink-soft">{e.before}</p>
                          <p className="mt-1 font-mono text-[9px] text-ink-faint">
                            {e.beforeDate}
                          </p>
                        </div>
                        <div className="text-center">
                          <span className="rounded-full border border-accent px-2 py-0.5 font-mono text-[9px] tracking-[0.1em] text-accent uppercase">
                            {e.drift}
                          </span>
                          <p className="mt-1 font-mono text-[9px] text-ink-faint">
                            {e.gap}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-ink">{e.after}</p>
                          <p className="mt-1 font-mono text-[9px] text-ink-faint">
                            {e.afterDate}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Claim cards from the compare view */}
              {trace.claims && (
                <div className="mt-4">
                  <p className="font-mono text-[10px] tracking-[0.16em] text-accent uppercase">
                    Claims compared
                  </p>
                  <ul className="mt-3 grid gap-2">
                    {trace.claims.map((c) => (
                      <li
                        key={c.text}
                        className="rounded-brand-sm border border-line bg-bg-elev p-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-mono text-[9px] text-ink-faint">
                            {c.channel}
                          </span>
                          <span className="font-mono text-[9px] tracking-[0.1em] text-ink-soft uppercase">
                            {c.type}
                          </span>
                        </div>
                        <p className="mt-1.5 text-xs text-ink">{c.text}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Retrieved sources */}
              {trace.sources && (
                <div className="mt-4">
                  <p className="font-mono text-[10px] tracking-[0.16em] text-accent uppercase">
                    Sources
                  </p>
                  <ul className="mt-3 grid gap-2">
                    {trace.sources.map((s, i) => (
                      <li
                        key={s.title}
                        className="rounded-brand-sm border-l-2 border-line bg-bg-elev p-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-xs text-ink">{s.title}</p>
                          <span className="shrink-0 font-mono text-[9px] text-ink-faint">
                            #{String(i + 1).padStart(2, "0")}
                          </span>
                        </div>
                        <p className="mt-1 flex flex-wrap items-center gap-2 font-mono text-[9px] text-ink-faint">
                          <span className="rounded-full border border-line px-1.5">
                            {s.channel}
                          </span>
                          {s.date}
                          {s.match && (
                            <span className="text-ink-soft">{s.match}</span>
                          )}
                        </p>
                        {s.quote && (
                          <p className="mt-2 text-[11px] leading-relaxed text-ink-faint">
                            {s.quote}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Deep links the app emitted */}
              {trace.links && (
                <ul className="mt-3 grid gap-1">
                  {trace.links.map((u) => (
                    <li key={u}>
                      <a
                        href={u}
                        target="_blank"
                        rel="noopener"
                        className="font-mono text-[10px] break-all text-ink-soft underline decoration-line hover:text-ink"
                      >
                        {u}
                      </a>
                    </li>
                  ))}
                </ul>
              )}

              {/* Provenance first, then the app's own standing disclaimer */}
              <div className="mt-4 grid gap-2 border-t border-line pt-3">
                {trace.provenance === "reconstructed" && (
                  <p className="font-mono text-[10px] leading-relaxed text-accent">
                    Reconstructed. No screen capture existed for this agent, so
                    the response describes its documented behaviour rather than
                    reproducing a recorded run.
                  </p>
                )}
                <p className="font-mono text-[10px] leading-relaxed text-ink-faint">
                  {APP_DISCLAIMER}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
