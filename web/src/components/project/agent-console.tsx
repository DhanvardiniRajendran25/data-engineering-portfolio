"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import {
  APP_DISCLAIMER,
  GRAPH_EXPLORER,
  TRACES,
  type Trace,
} from "@/content/projects/podcastiq-traces";

/**
 * Replays recorded runs through the 9-agent system.
 *
 * Queries, answers, sources, verdicts and deep links come from screen captures
 * of the running Streamlit application.
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
  const [view, setView] = useState<"chat" | "graph">("chat");
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
    /* A dark application window, not a page section.
       `console-surface` rebinds the theme tokens locally, so every utility
       inside resolves dark regardless of the page theme. That is what makes it
       read as embedded software rather than more content, and it matches how
       the real PodcastIQ application looks. */
    <div className="console-surface overflow-hidden rounded-[18px] bg-bg ring-1 ring-black/20 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.55)]">
      {/* Title bar, mirroring the application's own header */}
      <div className="flex items-center justify-between gap-4 border-b border-line bg-bg-elev px-5 py-3">
        <div className="flex items-center gap-2">
          <span aria-hidden="true" className="text-accent">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect x="9" y="2" width="6" height="11" rx="3" />
              <path d="M5 11a7 7 0 0 0 14 0M12 18v4" />
            </svg>
          </span>
          {/* Sans, not the display serif: Playfair's italic capital I and Q
              render as "1" and "2" at this size, so the wordmark read PodcastI2. */}
          <span className="font-body text-sm font-semibold tracking-tight text-ink">
            Podcast<span className="text-accent">IQ</span>
          </span>
        </div>
        {/* Real tabs. Dashboard is absent on purpose: no capture exists for it,
            and a tab that does nothing is worse than one that is not there. */}
        <div role="tablist" aria-label="Application views" className="flex items-center gap-1">
          {([
            ["chat", "Chat"],
            ["graph", "Graph"],
          ] as const).map(([id, label]) => {
            const current = view === id;
            return (
              <button
                key={id}
                role="tab"
                type="button"
                id={`tab-${id}`}
                aria-selected={current}
                aria-controls={`console-view-${id}`}
                onClick={() => setView(id)}
                className={`rounded-full px-3 py-1 font-mono text-[10px] tracking-[0.1em] uppercase transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                  current
                    ? "bg-accent-soft text-accent"
                    : "text-ink-faint hover:text-ink"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {view === "chat" ? (
      <div id="console-view-chat" role="tabpanel" aria-labelledby="tab-chat">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-2.5">
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
                        {s.url && (
                          <a
                            href={s.url}
                            target="_blank"
                            rel="noopener"
                            className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 font-mono text-[9px] tracking-[0.1em] text-ink-soft uppercase transition-colors hover:border-accent hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                          >
                            <span aria-hidden="true">&#9654;</span>
                            Watch on YouTube
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}


              {/* Provenance first, then the app's own standing disclaimer */}
              <div className="mt-4 grid gap-2 border-t border-line pt-3">
                <p className="font-mono text-[10px] leading-relaxed text-ink-faint">
                  {APP_DISCLAIMER}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
      ) : (
        /* Graph view, from the explorer capture. Same window, second surface of
           the app, so the graph reads as browsable rather than only reachable
           through an agent. */
        <div id="console-view-graph" role="tabpanel" aria-labelledby="tab-graph" className="p-5 sm:p-6">
          <p className="font-display text-lg text-ink">Knowledge Graph Explorer</p>
          <p className="mt-1 text-xs text-ink-soft">
            Relationships between speakers, topics, episodes, channels and claims.
          </p>

          <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {[
              ["25", "Channels"],
              ["286", "Episodes"],
              ["466", "Persons"],
              ["3,786", "Topics"],
              ["84,260", "Claims"],
            ].map(([v, k]) => (
              <div key={k} className="rounded-brand-sm border border-line bg-bg-elev p-3">
                <dd className="font-mono text-lg text-ink">{v}</dd>
                <dt className="mt-0.5 font-mono text-[9px] tracking-[0.12em] text-ink-faint uppercase">
                  {k}
                </dt>
              </div>
            ))}
          </dl>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="rounded-brand-sm border border-accent/50 bg-bg-elev px-3 py-2 font-mono text-xs text-ink">
              {GRAPH_EXPLORER.searchTerm}
            </span>
            <span className="font-mono text-[10px] text-ink-faint">
              {GRAPH_EXPLORER.nodesFound} nodes found &middot; {GRAPH_EXPLORER.loaded}
            </span>
          </div>

          <ul className="mt-4 flex flex-wrap gap-4 border-t border-line pt-4">
            {["Person", "Topic", "Channel", "Episode", "Claim"].map((k) => (
              <li key={k} className="flex items-center gap-1.5 font-mono text-[10px] text-ink-faint">
                <span aria-hidden="true" className="h-2 w-2 rounded-full bg-ink/40" />
                {k}
              </li>
            ))}
          </ul>

          <ul className="mt-4 grid gap-1.5">
            {GRAPH_EXPLORER.results.map((r) => (
              <li
                key={r.label}
                className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-line/60 pb-2"
              >
                <span className="text-sm text-ink">{r.label}</span>
                <span className="font-mono text-[10px] whitespace-nowrap text-ink-faint">
                  {r.kind} &middot; {r.connections.toLocaleString("en-US")} connections
                </span>
              </li>
            ))}
          </ul>

          <p className="mt-5 text-sm text-ink-soft">
            Searching a person returns every node touching them, ranked by degree.
            Sam Altman alone carries 601 connections; selecting a claim collapses
            the view to its own neighbourhood, which is how one assertion gets
            traced back to the episode and topic it came from.
          </p>
        </div>
      )}
    </div>
  );
}
