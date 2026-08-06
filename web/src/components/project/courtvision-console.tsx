"use client";

import { useState } from "react";
import { BasketballCourt, type BallPosition } from "./basketball-court";
import { RunSteps } from "./run-steps";
import {
  COACH_DECISIONS,
  SCOUT_SUGGESTIONS,
  SCOUT_TURNS,
  SIM_AFTER,
  SIM_BEFORE,
  SIM_SETUP,
  SURFACES,
  TAPE_RUN,
  TAPE_SOURCE,
} from "@/content/projects/courtvision-traces";

/**
 * Replays recorded runs across CourtVision's three surfaces.
 *
 * Same approach as the PodcastIQ console, and the same `.console-surface` class,
 * so both read as embedded software rather than page content. Framed as a replay:
 * the real backend needs a Gemini key and a running FastAPI service, so a static
 * site cannot reach it.
 *
 * The Simulator tab is the one worth clicking. It shows the score before a coach
 * intervention and after, from the same captured session, which is the only way
 * to demonstrate that the coach decision actually changes the outcome rather than
 * just appearing in the log.
 */

/**
 * What each surface does before it answers. Named after the real pipeline stages
 * from the project README, so the readout describes the actual system rather
 * than inventing a loading animation.
 */
const PIPELINES: Record<string, string[]> = {
  scout: [
    "Loading session history",
    "Injecting coach context",
    "Google Search grounding",
    "Gemini 2.5 Flash generating",
    "Extracting grounding metadata",
    "Scoring confidence from sources",
  ],
  tape: [
    "Reading tape, 21.5 MB",
    "Gemini 2.5 Pro watching",
    "Seeking focus timestamp 0:23",
    "Composing tactical breakdown",
  ],
  sim: [
    "Loading real player stats",
    "Applying coach decision",
    "Gemini reasoning over game state",
    "Advancing possessions",
    "Generating play-by-play",
  ],
};

/** Where the ball sits on the court, per captured state. */
const BALL: Record<string, BallPosition> = {
  before: { x: 200, y: 125 },
  after: { x: 200, y: 46 },
};

const PLAY_MARK: Record<string, string> = {
  score: "●",
  miss: "✕",
  foul: "▲",
};

function Plays({ plays }: { plays: typeof SIM_BEFORE.plays }) {
  return (
    <ol className="grid gap-2">
      {plays.map((p) => (
        <li
          key={p.clock + p.score}
          className="grid grid-cols-[2.6rem_1rem_1fr_3.4rem] items-start gap-2 border-b border-line/60 pb-2 last:border-0"
        >
          <span className="font-mono text-[10px] text-ink-faint">{p.clock}</span>
          <span
            aria-hidden="true"
            className={`text-[10px] ${p.kind === "score" ? "text-accent" : "text-ink-faint"}`}
          >
            {PLAY_MARK[p.kind]}
          </span>
          <span className="text-xs leading-relaxed text-ink-soft">{p.text}</span>
          <span className="text-right font-mono text-[10px] tabular-nums text-ink-faint">
            {p.score}
          </span>
        </li>
      ))}
    </ol>
  );
}

export function CourtvisionConsole() {
  const [view, setView] = useState<"home" | "scout" | "tape" | "sim">("home");
  const [turns, setTurns] = useState(1);
  const [zoneCalled, setZoneCalled] = useState(false);
  // Bumped on every action so the readout replays; `busy` gates the result so
  // output never appears before the pipeline that produced it has finished.
  const [runKey, setRunKey] = useState(0);
  const [busy, setBusy] = useState(true);

  function rerun() {
    setBusy(true);
    setRunKey((n) => n + 1);
  }

  const sim = zoneCalled ? SIM_AFTER : SIM_BEFORE;

  return (
    <div className="console-surface overflow-hidden rounded-[18px] bg-bg ring-1 ring-black/20 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.55)]">
      {/* Title bar, mirroring the application's own header */}
      <div className="flex items-center justify-between gap-4 border-b border-line bg-bg-elev px-5 py-3">
        <div className="flex items-center gap-2">
          <span aria-hidden="true" className="text-accent">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="9" />
              <path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" />
            </svg>
          </span>
          <span className="font-body text-sm font-semibold tracking-tight text-ink">
            CourtVision<span className="text-accent"> AI</span>
          </span>
        </div>

        <div role="tablist" aria-label="Application views" className="flex items-center gap-1">
          {([
            ["home", "Home"],
            ["scout", "Scout"],
            ["tape", "Game Tape"],
            ["sim", "Simulator"],
          ] as const).map(([id, label]) => {
            const current = view === id;
            return (
              <button
                key={id}
                role="tab"
                type="button"
                id={`cv-tab-${id}`}
                aria-selected={current}
                aria-controls={`cv-view-${id}`}
                onClick={() => {
                  setView(id);
                  rerun();
                }}
                className={`rounded-full px-3 py-1 font-mono text-[10px] tracking-[0.1em] uppercase transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                  current ? "bg-accent-soft text-accent" : "text-ink-faint hover:text-ink"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ---------------- Home ---------------- */}
      {view === "home" && (
        <div id="cv-view-home" role="tabpanel" aria-labelledby="cv-tab-home" className="p-6 sm:p-8">
          <div className="text-center">
            <p aria-hidden="true" className="text-3xl">
              &#127936;
            </p>
            <p className="mt-3 font-display text-2xl text-ink sm:text-3xl">
              CourtVision <span className="text-accent">AI</span>
            </p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-ink-soft">
              Your AI coaching staff. Scout, analyze, and simulate before tip-off.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <span className="rounded-full border border-line px-3 py-1 font-mono text-[10px] text-ink-soft">
                Powered by Google Gemini 2.5 Flash
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1 font-mono text-[10px] text-ink-soft">
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-accent" />
                backend online
              </span>
            </div>
          </div>

          <ul className="mt-8 grid gap-4 lg:grid-cols-3">
            {SURFACES.map((s) => (
              <li
                key={s.id}
                className={`relative flex flex-col rounded-brand border bg-bg-elev p-5 ${
                  s.mostUsed ? "border-accent" : "border-line"
                }`}
              >
                {s.mostUsed && (
                  <span className="absolute -top-2.5 right-4 rounded-full bg-accent px-2 py-0.5 font-mono text-[9px] tracking-[0.1em] text-bg uppercase">
                    Most used
                  </span>
                )}
                <p className="text-base text-ink">{s.name}</p>
                <p className="mt-2 flex-1 text-xs leading-relaxed text-ink-soft">{s.blurb}</p>
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {s.tags.map((tag) => (
                    <li
                      key={tag}
                      className="rounded-full border border-line px-2 py-0.5 font-mono text-[9px] text-ink-faint"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => {
                    setView(s.id);
                    rerun();
                  }}
                  className={`mt-4 rounded-full px-4 py-2 font-mono text-[10px] tracking-[0.12em] uppercase transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                    s.mostUsed
                      ? "bg-accent text-bg hover:opacity-90"
                      : "border border-line text-ink-soft hover:border-ink hover:text-ink"
                  }`}
                >
                  Launch
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ---------------- Scout ---------------- */}
      {view === "scout" && (
        <div id="cv-view-scout" role="tabpanel" aria-labelledby="cv-tab-scout" className="p-5 sm:p-6">
          <ul className="flex flex-wrap gap-2">
            {SCOUT_SUGGESTIONS.map((s, i) => (
              <li
                key={s}
                className={`rounded-full border px-3 py-1.5 text-[11px] ${
                  i === 0 ? "border-accent text-accent" : "border-line text-ink-faint"
                }`}
              >
                {s}
              </li>
            ))}
          </ul>

          <div className="mt-5">
            <RunSteps
              steps={PIPELINES.scout}
              key={`scout-${runKey}-${turns}`}
              onDone={() => setBusy(false)}
            />
          </div>

          <div className="mt-5 grid gap-5">
            {!busy &&
              SCOUT_TURNS.slice(0, turns).map((t) => (
              <div key={t.question}>
                <p className="ml-auto w-fit rounded-brand-sm bg-accent-soft px-3 py-2 text-right text-xs text-ink">
                  {t.question}
                </p>

                <div className="mt-3 rounded-brand border border-line bg-bg-elev p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-[10px] tracking-[0.14em] text-ink-faint uppercase">
                      CourtVision AI
                    </span>
                    <span className="rounded-full border border-accent px-2 py-0.5 font-mono text-[9px] text-accent">
                      {t.confidence}
                    </span>
                  </div>

                  <dl className="mt-4 grid gap-4">
                    {t.blocks.map((b) => (
                      <div key={b.label}>
                        <dt className="font-mono text-[10px] tracking-[0.14em] text-accent uppercase">
                          {b.label}
                        </dt>
                        {b.body && (
                          <dd className="mt-1 text-xs leading-relaxed text-ink-soft">{b.body}</dd>
                        )}
                        {b.bullets && (
                          <dd className="mt-1.5">
                            <ul className="grid gap-1">
                              {b.bullets.map((x) => (
                                <li key={x} className="flex gap-2 text-xs leading-relaxed text-ink-soft">
                                  <span aria-hidden="true" className="text-ink-faint">
                                    &middot;
                                  </span>
                                  {x}
                                </li>
                              ))}
                            </ul>
                          </dd>
                        )}
                      </div>
                    ))}
                  </dl>

                  {t.followups && (
                    <ul className="mt-5 flex flex-wrap gap-2 border-t border-line pt-4">
                      {t.followups.map((f) => (
                        <li
                          key={f}
                          className="rounded-full border border-line px-2.5 py-1 text-[10px] text-ink-faint"
                        >
                          {f}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                </div>
              ))}
          </div>

          {!busy && turns < SCOUT_TURNS.length ? (
            <button
              type="button"
              onClick={() => {
                setTurns((n) => n + 1);
                rerun();
              }}
              className="mt-5 rounded-full border border-accent px-4 py-2 font-mono text-[10px] tracking-[0.12em] text-accent uppercase transition-colors hover:bg-accent hover:text-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Ask the follow-up &rarr;
            </button>
          ) : null}
        </div>
      )}

      {/* ---------------- Game Tape ---------------- */}
      {view === "tape" && (
        <div id="cv-view-tape" role="tabpanel" aria-labelledby="cv-tab-tape" className="p-5 sm:p-6">
          <div className="grid gap-5 lg:grid-cols-2">
            <div>
              <div className="flex items-center justify-between gap-3 rounded-brand border border-line bg-bg-elev p-4">
                <div>
                  <p className="text-xs text-ink">{TAPE_RUN.file}</p>
                  <p className="mt-0.5 font-mono text-[10px] text-ink-faint">{TAPE_RUN.size}</p>
                </div>
                <span className="font-mono text-[10px] text-ink-faint">
                  {TAPE_RUN.formats.join(" · ")}
                </span>
              </div>

              <div className="mt-4 rounded-brand border border-line bg-bg-elev p-4">
                <p className="font-mono text-[10px] tracking-[0.14em] text-accent uppercase">
                  Coach message
                </p>
                <p className="mt-2 text-sm text-ink">{TAPE_RUN.question}</p>
                <p className="mt-3 flex flex-wrap items-center gap-2 font-mono text-[10px] text-ink-faint">
                  Focus timestamp
                  {/* Deep-links the source clip at the exact second the coach
                      asked about, so the answer is checkable against the tape. */}
                  <a
                    href={`https://www.youtube.com/watch?v=${TAPE_SOURCE.youtubeId}&t=${TAPE_SOURCE.seconds}s`}
                    target="_blank"
                    rel="noopener"
                    className="inline-flex items-center gap-1.5 rounded-full border border-accent px-2 py-0.5 text-accent transition-colors hover:bg-accent hover:text-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    <span aria-hidden="true">&#9654;</span>
                    @ {TAPE_RUN.focusTimestamp} on YouTube
                  </a>
                </p>
              </div>
            </div>

            {busy ? (
              <RunSteps
                steps={PIPELINES.tape}
                key={`tape-${runKey}`}
                onDone={() => setBusy(false)}
              />
            ) : (
            <div className="rounded-brand border border-line bg-bg-elev p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-[10px] tracking-[0.14em] text-accent uppercase">
                  {TAPE_RUN.heading}
                </span>
                <span className="rounded-full border border-accent px-2 py-0.5 font-mono text-[9px] text-accent">
                  {TAPE_RUN.confidence}
                </span>
              </div>
              <p className="mt-2 font-mono text-[10px] text-ink-faint">
                &ldquo;{TAPE_RUN.question}&rdquo; @ {TAPE_RUN.focusTimestamp}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{TAPE_RUN.answer}</p>
            </div>
            )}
          </div>

          {!busy && (
            <div className="mt-5">
              <p className="font-mono text-[10px] tracking-[0.14em] text-ink-faint uppercase">
                Source clip, cued to {TAPE_RUN.focusTimestamp}
              </p>
              <div className="mt-3 overflow-hidden rounded-brand border border-line bg-black">
                <div className="aspect-video w-full">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${TAPE_SOURCE.youtubeId}?start=${TAPE_SOURCE.seconds}`}
                    title={`${TAPE_SOURCE.title}, cued to ${TAPE_RUN.focusTimestamp}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="h-full w-full"
                  />
                </div>
              </div>
            </div>
          )}

          <p className="mt-5 max-w-measure text-xs leading-relaxed text-ink-faint">
            The timestamp is the interesting part. Asking about 0:23 specifically means
            the model is answering about one moment in the tape rather than the whole
            file, which is what makes the answer checkable against the video.
          </p>
        </div>
      )}

      {/* ---------------- Simulator ---------------- */}
      {view === "sim" && (
        <div id="cv-view-sim" role="tabpanel" aria-labelledby="cv-tab-sim" className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-[10px] tracking-[0.14em] text-ink-faint uppercase">
                {SIM_SETUP.teamA}
              </span>
              <span className="font-display text-3xl text-ink tabular-nums">{sim.score.a}</span>
              <span aria-hidden="true" className="text-ink-faint">
                &ndash;
              </span>
              <span className="font-display text-3xl text-accent tabular-nums">{sim.score.b}</span>
              <span className="font-mono text-[10px] tracking-[0.14em] text-ink-faint uppercase">
                {SIM_SETUP.teamB}
              </span>
            </div>
            <p className="flex items-center gap-2 font-mono text-[10px] text-ink-faint">
              <span className="rounded-full border border-line px-2 py-0.5">{sim.clock}</span>
              {sim.possession}
            </p>
          </div>

          {zoneCalled && (
            <p className="mt-4 rounded-brand-sm border-l-2 border-accent bg-accent-soft px-3 py-2 font-mono text-[10px] tracking-[0.12em] text-accent uppercase">
              Coach: {SIM_AFTER.decision}
            </p>
          )}

          <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,22rem)_1fr]">
            <div>
              <div className="overflow-hidden rounded-brand border border-line">
                <BasketballCourt
                  ball={zoneCalled ? BALL.after : BALL.before}
                  label={`Court with the ball in ${
                    zoneCalled ? "Auburn" : "Duke"
                  } possession at ${sim.clock}`}
                />
              </div>
              <p className="mt-2 font-mono text-[10px] text-ink-faint">
                Ball position follows possession
              </p>
            </div>

            <div>
              <p className="font-mono text-[10px] tracking-[0.14em] text-ink-faint uppercase">
                Play-by-play
              </p>
              {busy ? (
                <div className="mt-3">
                  <RunSteps
                    steps={PIPELINES.sim}
                    key={`sim-${runKey}-${zoneCalled}`}
                    onDone={() => setBusy(false)}
                  />
                </div>
              ) : (
                <div className="mt-3 max-h-[19rem] overflow-y-auto pr-1">
                  <Plays plays={sim.plays} />
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 border-t border-line pt-4">
            <p className="font-mono text-[10px] tracking-[0.14em] text-ink-faint uppercase">
              Coach decisions
            </p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {COACH_DECISIONS.map((d) => {
                const isZone = d === SIM_AFTER.decision;
                return (
                  <li key={d}>
                    <button
                      type="button"
                      onClick={() => {
                        if (!isZone) return;
                        setZoneCalled(true);
                        rerun();
                      }}
                      aria-pressed={isZone ? zoneCalled : undefined}
                      disabled={!isZone || zoneCalled}
                      title={isZone ? undefined : "Only the captured decision can be replayed"}
                      className={`rounded-full border px-3 py-1.5 text-[11px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                        isZone && !zoneCalled
                          ? "border-accent text-accent hover:bg-accent hover:text-bg"
                          : "border-line text-ink-faint"
                      }`}
                    >
                      {d}
                    </button>
                  </li>
                );
              })}
            </ul>
            <p className="mt-3 font-mono text-[10px] text-ink-faint">
              {zoneCalled
                ? "Auburn went from one behind to six ahead across the next seven possessions."
                : "Call zone defense to replay what the captured session did next."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
