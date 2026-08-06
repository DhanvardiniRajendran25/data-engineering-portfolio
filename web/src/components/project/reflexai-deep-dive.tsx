import Link from "next/link";
import {
  CAPABILITIES,
  DECISIONS,
  LAYERS,
  PREMISE,
  RISK_DIMENSIONS,
  SCALE,
  TECH_STACK,
} from "@/content/projects/reflexai";
import { ReflexaiArchitecture } from "./reflexai-architecture";
import { ProjectSection as Section } from "./project-section";

export function ReflexaiDeepDive() {
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

      {/* Demo first. This page had no demo section at all despite the app being
          deployed and public, so the only route to it was the small header
          button. A live URL is the strongest evidence on any project page and
          it should not be the easiest thing to miss. */}
      <Section id="demo" label="Try it" kicker="Live deployment" wide>
        <div className="rounded-brand border-2 border-accent bg-bg-elev p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="font-mono text-[10px] tracking-[0.16em] text-accent uppercase">
                Running now
              </p>
              <p className="mt-2 max-w-measure text-sm text-ink-soft">
                Pick a ticker. The app pulls the financial statements, runs the
                four risk diagnostics, and retrieves against the reflexivity
                corpus separately before it writes anything.
              </p>
            </div>
            <a
              href="https://reflex-ai-ai-powered-stock-and-macr.vercel.app/"
              target="_blank"
              rel="noopener"
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-ink bg-ink px-5 py-2.5 font-mono text-[11px] tracking-[0.14em] text-bg uppercase transition-colors hover:bg-accent hover:border-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Open the app
              <span aria-hidden="true">&rarr;</span>
            </a>
          </div>

          <dl className="mt-7 grid gap-5 border-t border-line pt-6 sm:grid-cols-3">
            {[
              ["Ask it", "Whether a balance sheet survives stress"],
              ["Not", "Whether the stock goes up"],
              ["Watch for", "Where the two lanes disagree"],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="font-mono text-[10px] tracking-[0.14em] text-ink-faint uppercase">
                  {k}
                </dt>
                <dd className="mt-1 text-sm text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>

      {/* The premise is the project. Lead with the question, not the stack. */}
      <Section id="premise" label="The premise" kicker="A different question">
        <div className="rounded-brand border border-line bg-bg-elev p-6 sm:p-8">
          <div className="grid gap-6 sm:grid-cols-2 sm:gap-10">
            <div>
              <p className="font-mono text-[10px] tracking-[0.14em] text-ink-faint uppercase">
                Most tools answer
              </p>
              <p className="mt-2 text-lg text-ink-faint">{PREMISE.most}</p>
            </div>
            <div>
              <p className="font-mono text-[10px] tracking-[0.14em] text-accent uppercase">
                This one asks
              </p>
              <p className="mt-2 text-lg text-ink">{PREMISE.this}</p>
            </div>
          </div>

          <div className="mt-8 border-t border-line pt-6">
            <p className="font-mono text-[10px] tracking-[0.16em] text-ink-faint uppercase">
              The loop it models
            </p>
            <ol className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {PREMISE.loops.map((l, i) => (
                <li key={l} className="flex items-start gap-2 text-sm text-ink-soft">
                  <span aria-hidden="true" className="font-mono text-[10px] text-accent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {l}
                </li>
              ))}
            </ol>
            <p className="mt-4 max-w-measure text-sm text-ink-soft">
              Markets are not purely efficient. The premise is that these four
              statements form a cycle, and that the interesting risk lives in the
              cycle rather than in any single reading.
            </p>
          </div>
        </div>
      </Section>

      {/* The most distinctive architectural idea here */}
      <Section id="layers" label="Three data classes" kicker="Different cognitive roles" wide>
        <ul className="grid gap-4 lg:grid-cols-3">
          {LAYERS.map((l) => (
            <li key={l.name} className="flex flex-col rounded-brand border border-line bg-bg-elev p-6">
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-[10px] text-accent">{l.n}</span>
                <p className="text-lg">{l.name}</p>
              </div>
              <p className="mt-1 font-mono text-[11px] text-ink-faint">{l.source}</p>
              <p className="mt-3 text-sm text-ink">{l.role}</p>
              <ul className="mt-4 grid gap-1.5 border-t border-line pt-4">
                {l.holds.map((h) => (
                  <li key={h} className="flex gap-2 text-xs text-ink-soft">
                    <span aria-hidden="true" className="text-accent">&middot;</span>
                    {h}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
        <p className="mt-6 max-w-measure text-sm leading-relaxed text-ink-soft">
          Statements are facts. The corpus is a way of reading facts. Keeping them
          in separate retrieval paths is what stops a framework quote coming back
          as though it were a figure, and it is what makes the reasoning auditable.
        </p>
      </Section>

      <Section id="architecture" label="Architecture" kicker="Two lanes, one join" wide>
        <ReflexaiArchitecture />
      </Section>

      <Section id="risk" label="Risk diagnostics" kicker="4 named dimensions">
        <ul className="grid gap-3">
          {RISK_DIMENSIONS.map((r) => (
            <li
              key={r.name}
              className="grid gap-1 rounded-brand-sm border border-line bg-bg-elev p-5 sm:grid-cols-[11rem_1fr] sm:gap-6"
            >
              <p className="text-ink">{r.name}</p>
              <p className="text-sm text-ink-soft">{r.what}</p>
            </li>
          ))}
        </ul>
        <p className="mt-6 max-w-measure text-sm leading-relaxed text-ink-soft">
          A current ratio does not tell you whether a company survives stress.
          Naming the risk makes the output something to act on rather than
          something to read.
        </p>
      </Section>

      <Section id="capabilities" label="Capabilities" kicker="5 layers" wide>
        <ol className="grid gap-3">
          {CAPABILITIES.map((c) => (
            <li
              key={c.name}
              className="grid gap-1 rounded-brand-sm border border-line bg-bg-elev p-5 sm:grid-cols-[14rem_1fr] sm:gap-6"
            >
              <p className="flex items-baseline gap-2">
                <span className="font-mono text-[10px] text-accent">{c.n}</span>
                <span className="text-ink">{c.name}</span>
              </p>
              <p className="text-sm text-ink-soft">{c.what}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section id="decisions" label="Decisions" kicker="4 named tradeoffs" wide>
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
