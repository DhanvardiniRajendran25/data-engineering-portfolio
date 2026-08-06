import Link from "next/link";
import {
  FEATURES,
  METRICS,
  MODELS,
  R2_CAVEAT,
  SCALE,
  SOURCES,
  STAGES,
  TECH_STACK,
} from "@/content/projects/meta-tradepulse";
import { StageStepper } from "./stage-stepper";
import { ProjectSection as Section } from "./project-section";

export function MetaTradepulseDeepDive() {
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

      <Section id="problem" label="The problem" kicker="Signals go stale">
        <ul className="grid gap-4 md:grid-cols-3">
          {[
            { x: "Latency", y: "A signal computed on yesterday's batch is not a signal, it is history" },
            { x: "Fragmentation", y: "Price, macro, search and sentiment each arrive from a different API on a different clock" },
            { x: "Overfitting", y: "70+ features on one ticker will fit noise unless baselines are kept honest" },
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

      <Section id="sources" label="Four sources" kicker="Different clocks">
        <ul className="grid gap-3">
          {SOURCES.map((s) => (
            <li
              key={s.name}
              className="grid gap-1 rounded-brand-sm border border-line bg-bg-elev p-5 sm:grid-cols-[10rem_9rem_1fr] sm:items-baseline sm:gap-5"
            >
              <p className="text-ink">{s.name}</p>
              <p className="font-mono text-[11px] text-accent">{s.via}</p>
              <p className="text-sm text-ink-soft">{s.gives}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="pipeline" label="Six stages" kicker="Kafka to Streamlit" wide>
        <StageStepper stages={STAGES} label="Pipeline stages" />
      </Section>

      <Section id="features" label="The feature mart" kicker="70+ features" wide>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.group}>
              <p className="font-mono text-[10px] tracking-[0.16em] text-accent uppercase">
                {f.group}
              </p>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {f.items.map((i) => (
                  <li
                    key={i}
                    className="rounded-full border border-line px-2.5 py-1 font-mono text-[10px] text-ink-soft"
                  >
                    {i}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section id="models" label="Model comparison" kicker="12+ across 5 families" wide>
        <div className="grid gap-4">
          {MODELS.map((m) => (
            <div
              key={m.family}
              className="grid gap-3 rounded-brand border border-line bg-bg-elev p-5 lg:grid-cols-[12rem_1fr_18rem] lg:items-center lg:gap-6"
            >
              <p className="text-ink">{m.family}</p>
              <ul className="flex flex-wrap gap-1.5">
                {m.items.map((i) => (
                  <li
                    key={i}
                    className="rounded-full border border-line px-2.5 py-1 font-mono text-[10px] text-ink-soft"
                  >
                    {i}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-ink-faint">{m.tests}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 max-w-measure text-sm leading-relaxed text-ink-soft">
          Baselines are in the list on purpose. An OLS and an AR(1) are the only way
          to know whether the tree models and the factor models earned their
          complexity, and reporting only the winner hides that question.
        </p>
      </Section>

      <Section id="results" label="Results" kicker="And one caveat">
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">Evaluation measures</caption>
          <thead>
            <tr className="border-b border-line text-left">
              <th scope="col" className="py-2 pr-4 font-mono text-[10px] tracking-[0.14em] text-ink-faint uppercase">
                Measure
              </th>
              <th scope="col" className="py-2 pr-4 font-mono text-[10px] tracking-[0.14em] text-ink-faint uppercase">
                Value
              </th>
              <th scope="col" className="py-2 font-mono text-[10px] tracking-[0.14em] text-ink-faint uppercase">
                Scope
              </th>
            </tr>
          </thead>
          <tbody>
            {METRICS.map((m) => (
              <tr key={m.metric} className="border-b border-line/60">
                <td className="py-2.5 pr-4 text-ink">{m.metric}</td>
                <td className="py-2.5 pr-4 font-mono text-xs text-ink">{m.value}</td>
                <td className="py-2.5 text-ink-soft">{m.note}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Stated rather than buried: a suspiciously high R² is worth flagging
            yourself before a reviewer flags it for you. */}
        <div className="mt-8 rounded-brand border-l-2 border-accent bg-bg-elev p-5">
          <p className="font-mono text-[10px] tracking-[0.16em] text-accent uppercase">
            Reading the R² honestly
          </p>
          <p className="mt-2 max-w-measure text-sm leading-relaxed text-ink-soft">
            {R2_CAVEAT}
          </p>
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
