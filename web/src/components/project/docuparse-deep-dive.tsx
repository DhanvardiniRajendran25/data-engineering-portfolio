import Link from "next/link";
import {
  ASSURANCE,
  BUILD_BENEFITS,
  COST_COMPARISON,
  QUALITY,
  SCALE,
  STAGES,
  TECH_STACK,
} from "@/content/projects/docuparse";
import { DocuparseArchitecture } from "./docuparse-architecture";
import { StageStepper } from "./stage-stepper";

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

export function DocuparseDeepDive() {
  const maxCost = Math.max(...COST_COMPARISON.map((c) => c.high));

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

      <Section id="problem" label="The problem" kicker="Filings resist parsing">
        <ul className="grid gap-4 md:grid-cols-3">
          {[
            {
              x: "Tables are the value",
              y: "Financial statements live in tables with merged cells, spans and multi-column layouts",
            },
            {
              x: "One tool is not enough",
              y: "Text extractors miss structure; vision models miss content",
            },
            {
              x: "Reprocessing is expensive",
              y: "Long-running stages make a naive rerun costly every time a model changes",
            },
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
      </Section>

      <Section id="pipeline" label="Six stages" kicker="Decisions, not descriptions" wide>
        <StageStepper stages={STAGES} label="Pipeline stages" />
      </Section>

      <Section id="architecture" label="Architecture" kicker="DVC-managed DAG" wide>
        <DocuparseArchitecture />
      </Section>

      {/* The strongest section: the alternative was priced, not dismissed */}
      <Section id="cost" label="Build versus buy" kicker="Per 1,000 pages" wide>
        <ul className="grid gap-3">
          {COST_COMPARISON.map((c) => (
            <li key={c.name} className="grid items-center gap-3 sm:grid-cols-[13rem_1fr_7rem]">
              <span className={`text-sm ${c.ours ? "text-ink" : "text-ink-soft"}`}>
                {c.name}
              </span>
              <span className="relative h-3 rounded-full bg-ink/[0.06]">
                {/* Range bar: cloud services are quoted as a band, not a point */}
                <span
                  className={`absolute inset-y-0 rounded-full ${c.ours ? "bg-accent" : "bg-ink/25"}`}
                  style={{
                    left: `${(c.low / maxCost) * 100}%`,
                    width: `${Math.max(((c.high - c.low) / maxCost) * 100, 1.2)}%`,
                  }}
                />
              </span>
              <span className="font-mono text-xs tabular-nums text-ink">
                {c.low === c.high
                  ? `$${c.low.toFixed(2)}`
                  : `$${c.low.toFixed(2)}–$${c.high.toFixed(0)}`}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div>
            <p className="font-mono text-[10px] tracking-[0.16em] text-ink-faint uppercase">
              What building bought
            </p>
            <ul className="mt-3 grid gap-1.5">
              {BUILD_BENEFITS.map((b) => (
                <li key={b} className="flex gap-2 text-sm text-ink-soft">
                  <span aria-hidden="true" className="text-accent">+</span>
                  {b}
                </li>
              ))}
            </ul>
          </div>
          <p className="max-w-measure text-sm text-ink-soft">
            The three managed services were priced against this pipeline rather
            than dismissed. That is the difference between choosing to build and
            defaulting to it: at 1,000 pages the open-source path costs $1.05
            against a floor of $1.50 and a ceiling of $50, and the privacy and
            rate-limit gains come with it rather than instead of it.
          </p>
        </div>
      </Section>

      <Section id="quality" label="Quality assurance" kicker="Measured, not asserted">
        <div className="grid gap-4 sm:grid-cols-2">
          {ASSURANCE.map((a) => (
            <div key={a.name} className="rounded-brand border border-line bg-bg-elev p-5">
              <p className="text-base">{a.name}</p>
              <p className="mt-2 text-sm text-ink-soft">{a.what}</p>
            </div>
          ))}
        </div>

        <table className="mt-10 w-full border-collapse text-sm">
          <caption className="sr-only">Measured pipeline results</caption>
          <thead>
            <tr className="border-b border-line text-left">
              <th scope="col" className="py-2 pr-4 font-mono text-[10px] tracking-[0.14em] text-ink-faint uppercase">
                Metric
              </th>
              <th scope="col" className="py-2 pr-4 text-right font-mono text-[10px] tracking-[0.14em] text-ink-faint uppercase">
                Result
              </th>
              <th scope="col" className="py-2 font-mono text-[10px] tracking-[0.14em] text-ink-faint uppercase">
                Note
              </th>
            </tr>
          </thead>
          <tbody>
            {QUALITY.map((q) => (
              <tr key={q.metric} className="border-b border-line/60">
                <td className="py-2.5 pr-4">{q.metric}</td>
                <td className="py-2.5 pr-4 text-right font-mono text-xs tabular-nums text-ink">
                  {q.value}
                </td>
                <td className="py-2.5 text-ink-soft">{q.note}</td>
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
