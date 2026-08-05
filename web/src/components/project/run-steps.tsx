"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Staged pipeline readout, used to make a replay feel like a run.
 *
 * Deliberately shows no durations. The PodcastIQ console displays per-step
 * timings because they were measured; nothing equivalent was captured here, and
 * inventing plausible millisecond figures would dress a guess up as telemetry.
 * A pending / active / done marker conveys progress without claiming a number.
 *
 * Steps render only once reached, never dimmed into place: near-transparent text
 * stays in the accessibility tree and fails contrast, a bug this codebase has
 * already hit twice.
 *
 * Re-runs happen by remounting (the caller passes a changing `key`) rather than
 * by resetting state inside an effect, which keeps setState out of the effect
 * body. The effect only schedules timers; every state change happens in a timer
 * callback.
 */

const STEP_MS = 620;

export function RunSteps({
  steps,
  onDone,
}: {
  steps: string[];
  onDone?: () => void;
}) {
  const prefersReducedMotion = useReducedMotion();
  // Correct from the first render, so nothing needs resetting later.
  const [reached, setReached] = useState(() =>
    prefersReducedMotion ? steps.length : 0,
  );
  // Held in a ref so the timer effect below does not restart every time the
  // parent re-renders with a fresh inline callback. Synced in its own effect
  // rather than during render, since refs must not be written while rendering.
  const doneRef = useRef(onDone);
  useEffect(() => {
    doneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    if (prefersReducedMotion) {
      // Still deferred, so the parent's state update does not land during this
      // component's own commit.
      timers.push(setTimeout(() => doneRef.current?.(), 0));
    } else {
      steps.forEach((_, i) => {
        timers.push(setTimeout(() => setReached(i + 1), STEP_MS * (i + 1)));
      });
      timers.push(
        setTimeout(() => doneRef.current?.(), STEP_MS * (steps.length + 1)),
      );
    }

    return () => timers.forEach(clearTimeout);
  }, [steps, prefersReducedMotion]);

  const finished = reached >= steps.length;

  return (
    <div className="rounded-brand border border-line bg-bg p-4">
      <p className="flex items-center gap-2 font-mono text-[10px] tracking-[0.14em] uppercase">
        <span
          aria-hidden="true"
          className={`h-1.5 w-1.5 rounded-full ${
            finished
              ? "bg-ink-faint"
              : "animate-pulse bg-accent motion-reduce:animate-none"
          }`}
        />
        <span className={finished ? "text-ink-faint" : "text-accent"}>
          {finished ? "Complete" : "Running"}
        </span>
      </p>

      <ol className="mt-3 grid gap-1.5" aria-live="polite">
        {steps.map((s, i) => {
          const done = i < reached;
          const active = i === reached;
          if (!done && !active) {
            // Placeholder keeps the block from resizing as steps arrive.
            return <li key={s} aria-hidden="true" className="h-[1.15rem]" />;
          }
          return (
            <li key={s} className="flex items-center gap-2 font-mono text-[11px]">
              <span
                aria-hidden="true"
                className={active ? "text-accent" : "text-ink-faint"}
              >
                {active ? "▸" : "✓"}
              </span>
              <span className={active ? "text-ink" : "text-ink-soft"}>{s}</span>
              {active && (
                <span aria-hidden="true" className="inline-flex gap-0.5">
                  <span className="h-1 w-1 animate-pulse rounded-full bg-accent motion-reduce:animate-none" />
                  <span className="h-1 w-1 animate-pulse rounded-full bg-accent [animation-delay:150ms] motion-reduce:animate-none" />
                  <span className="h-1 w-1 animate-pulse rounded-full bg-accent [animation-delay:300ms] motion-reduce:animate-none" />
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
