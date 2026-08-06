import Link from "next/link";
import {
  LIVE_URL,
  PHASES,
  RESULTS,
  SAMPLE,
  SCALE,
  TECH_STACK,
} from "@/content/projects/sage";
import { PhaseStepper } from "./phase-stepper";
import { SageArchitecture } from "./sage-architecture";

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

export function SageDeepDive() {
  return (
    <>
      {/* Scale, no commentary */}
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

      <Section id="demo" label="Try it" kicker="Live deployment">
        <a
          href={LIVE_URL}
          target="_blank"
          rel="noopener"
          className="inline-flex items-center gap-3 rounded-full border border-ink px-6 py-3 font-mono text-[11px] tracking-[0.14em] text-ink uppercase transition-colors hover:bg-ink hover:text-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Open SAGE
          <span aria-hidden="true">&#8599;</span>
        </a>
        <p className="mt-4 max-w-measure text-sm text-ink-soft">
          Load one of the five demo organisations, or upload your own policy
          documents. Then try an edge case: &ldquo;Can I store encrypted customer
          data on my personal laptop since it is encrypted?&rdquo;
        </p>
      </Section>

      <Section id="problem" label="The problem" kicker="Policy is unreadable">
        <ul className="grid gap-4 md:grid-cols-3">
          {[
            { x: "Ask legal", y: "Slow and expensive for every routine question" },
            { x: "Ask a chatbot", y: "Hallucinates policy detail, which is worse than no answer" },
            { x: "Guess", y: "Informal verbal guidance creates regulatory exposure" },
          ].map((c) => (
            <li key={c.x} className="rounded-brand border border-line bg-bg-elev p-6">
              <p className="flex items-center gap-2 font-mono text-[11px] tracking-[0.12em] text-ink-faint uppercase">
                <span aria-hidden="true" className="text-accent">&times;</span>
                {c.x}
              </p>
              <p className="mt-3 text-sm text-ink-soft">{c.y}</p>
            </li>
          ))}
        </ul>
        <p className="mt-8 max-w-measure text-sm text-ink-soft">
          SAGE sits between the three: grounded in the actual policy text,
          automated, auditable, and hardened against people trying to talk it out
          of its own rules.
        </p>
      </Section>

      {/* A real structured response, which explains the product faster than prose */}
      <Section id="output" label="What it returns" kicker="Structured, cited, scored">
        <div className="rounded-brand border border-line bg-bg-elev p-6 sm:p-8">
          <p className="font-mono text-xs text-ink">
            <span className="text-accent">&gt;</span> {SAMPLE.question}
          </p>
          <dl className="mt-6 grid gap-4">
            {[
              ["Answer", SAMPLE.answer],
              ["Citations", SAMPLE.citations.join(", ")],
              ["Risk level", SAMPLE.risk],
              ["Reasoning", SAMPLE.reasoning],
              ["Confidence", SAMPLE.confidence],
              ["Policy tension", SAMPLE.tension],
            ].map(([k, v]) => (
              <div key={k} className="grid gap-1 border-l-2 border-line pl-4 sm:grid-cols-[9rem_1fr] sm:gap-4 sm:border-l-0 sm:pl-0">
                <dt className="font-mono text-[10px] tracking-[0.14em] text-ink-faint uppercase">
                  {k}
                </dt>
                <dd className="text-sm text-ink-soft">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>

      <Section id="phases" label="Five phases" kicker="Prompt to production" wide>
        <PhaseStepper phases={PHASES} />
      </Section>

      <Section id="architecture" label="Architecture" kicker="Full request path" wide>
        <SageArchitecture />
      </Section>

      <Section id="results" label="Results" kicker="Target against actual">
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">Measured results against target</caption>
          <thead>
            <tr className="border-b border-line text-left">
              <th scope="col" className="py-2 pr-4 font-mono text-[10px] tracking-[0.14em] text-ink-faint uppercase">
                Metric
              </th>
              <th scope="col" className="py-2 pr-4 text-right font-mono text-[10px] tracking-[0.14em] text-ink-faint uppercase">
                Target
              </th>
              <th scope="col" className="py-2 text-right font-mono text-[10px] tracking-[0.14em] text-ink-faint uppercase">
                Actual
              </th>
            </tr>
          </thead>
          <tbody>
            {RESULTS.map((r) => (
              <tr key={r.metric} className="border-b border-line/60">
                <td className="py-2.5 pr-4">{r.metric}</td>
                <td className="py-2.5 pr-4 text-right font-mono text-xs tabular-nums text-ink-faint">
                  {r.target}
                </td>
                <td className="py-2.5 text-right font-mono text-xs tabular-nums text-ink">
                  {r.actual}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
