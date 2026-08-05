import Link from "next/link";
import {
  AGENTS,
  CAPABILITIES,
  DECISIONS,
  SCALE,
  TECH_STACK,
} from "@/content/projects/courtvision";
import { YOUTUBE_ID } from "@/content/projects/courtvision-traces";
import { CourtvisionConsole } from "./courtvision-console";

function Section({
  id,
  label,
  kicker,
  children,
  wide = false,
}: {
  id: string;
  label: string;
  kicker?: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <section
      id={id}
      className={`${wide ? "shell" : "shell-content"} scroll-mt-28 pt-20 lg:pt-28`}
    >
      <div className="flex items-baseline gap-4 sm:gap-6">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl">{label}</h2>
        <span aria-hidden="true" className="h-px flex-1 bg-line" />
        {kicker && (
          <span className="font-mono text-[10px] tracking-[0.14em] text-ink-faint uppercase">
            {kicker}
          </span>
        )}
      </div>
      <div className="mt-8 lg:mt-10">{children}</div>
    </section>
  );
}

export function CourtvisionDeepDive() {
  return (
    <>
      <section aria-label="At a glance" className="shell pt-14 lg:pt-16">
        <dl className="grid grid-cols-3 gap-x-6 gap-y-8 border-y border-line py-8 lg:grid-cols-6">
          {SCALE.map((s) => (
            <div key={s.label}>
              <dd className="font-mono text-xl text-ink sm:text-2xl">{s.value}</dd>
              <dt className="mt-1 text-xs text-ink-soft">{s.label}</dt>
            </div>
          ))}
        </dl>
      </section>

      <Section id="problem" label="The problem" kicker="Vague scouting is useless">
        <div className="rounded-brand border border-line bg-bg-elev p-6 sm:p-8">
          <div className="grid gap-6 sm:grid-cols-2 sm:gap-10">
            <div>
              <p className="font-mono text-[10px] tracking-[0.14em] text-ink-faint uppercase">
                Useless
              </p>
              <p className="mt-2 text-sm text-ink-faint line-through decoration-ink-faint/50">
                &ldquo;They struggle defensively.&rdquo;
              </p>
            </div>
            <div>
              <p className="font-mono text-[10px] tracking-[0.14em] text-accent uppercase">
                Actionable
              </p>
              <p className="mt-2 text-sm text-ink">
                &ldquo;They rank 187th nationally in 3PT defense, allowing 35.2%
                from deep.&rdquo;
              </p>
            </div>
          </div>
          <p className="mt-6 max-w-measure border-t border-line pt-5 text-sm text-ink-soft">
            The gap between those two sentences is the whole project. A model
            answering from its parameters produces the first. Only a model that
            searches before it writes produces the second.
          </p>
        </div>
      </Section>

      <Section id="what" label="What it does" kicker="5 responsibilities">
        <ol className="grid gap-3">
          {CAPABILITIES.map((c, i) => (
            <li
              key={c.title}
              className="grid gap-1 rounded-brand-sm border border-line bg-bg-elev p-5 sm:grid-cols-[13rem_1fr] sm:gap-6"
            >
              <p className="flex items-baseline gap-2">
                <span className="font-mono text-[10px] text-accent">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-ink">{c.title}</span>
              </p>
              <p className="text-sm text-ink-soft">{c.what}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section id="agents" label="Three agents" kicker="One FastAPI app" wide>
        <ul className="grid gap-4 lg:grid-cols-3">
          {AGENTS.map((a) => (
            <li key={a.name} className="flex flex-col rounded-brand border border-line bg-bg-elev p-6">
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-[10px] text-accent">{a.n}</span>
                <p className="text-xl">{a.name}</p>
              </div>
              <p className="mt-1 font-mono text-[11px] text-ink-faint">{a.model}</p>
              <p className="mt-4 flex-1 text-sm text-ink-soft">{a.job}</p>
              <ul className="mt-4 grid gap-1.5 border-t border-line pt-4">
                {a.detail.map((d) => (
                  <li key={d} className="flex gap-2 text-xs text-ink-soft">
                    <span aria-hidden="true" className="text-accent">&middot;</span>
                    {d}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
        <p className="mt-6 max-w-measure text-sm text-ink-soft">
          Scout compiles a structured brief and hands it to Simulator through a
          single endpoint. The three stay independent modules on one app rather
          than one agent doing everything, so each has one prompt and one job.
        </p>
      </Section>

      <Section id="demo" label="Walkthrough" kicker="Running application" wide>
        <p className="font-mono text-[10px] tracking-[0.16em] text-ink-faint uppercase">
          Try it
        </p>
        <p className="mt-2 max-w-measure text-sm text-ink-soft">
          All three surfaces, replaying real captured runs. The Simulator tab is
          the one to click: calling zone defense replays what the session actually
          did next.
        </p>
        <div className="mt-5">
          <CourtvisionConsole />
        </div>

        {/* Video sits under the console: the interactive replay is the thing
            worth reaching first, and the recording backs it up. */}
        <p className="mt-14 font-mono text-[10px] tracking-[0.16em] text-ink-faint uppercase">
          Full walkthrough
        </p>
        <div className="mt-5 overflow-hidden rounded-brand border border-line bg-black">
          <div className="aspect-video w-full">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${YOUTUBE_ID}`}
              title="CourtVision AI walkthrough"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
        </div>
      </Section>

      <Section id="decisions" label="Decisions" kicker="5 named tradeoffs" wide>
        <div className="grid gap-4">
          {DECISIONS.map((d) => (
            <div key={d.id} className="rounded-brand border border-line bg-bg-elev p-6">
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-[10px] text-accent">{d.id}</span>
                <p className="text-lg">{d.title}</p>
              </div>

              <dl className="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                  <dt className="font-mono text-[10px] tracking-[0.14em] text-ink-faint uppercase">
                    Chose
                  </dt>
                  <dd className="mt-1 text-sm text-ink">{d.chose}</dd>
                </div>
                <div>
                  <dt className="font-mono text-[10px] tracking-[0.14em] text-ink-faint uppercase">
                    Over
                  </dt>
                  <dd className="mt-1">
                    <ul className="grid gap-0.5">
                      {d.over.map((o) => (
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

              <div className="mt-5 border-t border-line pt-4">
                <p className="font-mono text-[10px] tracking-[0.14em] text-ink-faint uppercase">
                  Because
                </p>
                <ul className="mt-2 grid gap-1.5">
                  {d.because.map((b) => (
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
                  {d.cost}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section id="stack" label="Stack" kicker="Everything used" wide>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {TECH_STACK.map((g) => (
            <div key={g.group}>
              <p className="font-mono text-[10px] tracking-[0.16em] text-ink-faint uppercase">
                {g.group}
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {g.items.map((i) => (
                  <li
                    key={i}
                    className="rounded-full border border-line bg-bg-elev px-3 py-1 font-mono text-[11px] text-ink-soft"
                  >
                    {i}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Link
          href="/about#skills"
          className="mt-10 inline-flex items-center gap-2 rounded-full border border-ink px-5 py-2.5 font-mono text-[11px] tracking-[0.14em] text-ink uppercase transition-colors hover:bg-ink hover:text-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          See these across every project
          <span aria-hidden="true">&rarr;</span>
        </Link>
      </Section>
    </>
  );
}
