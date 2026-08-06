import Link from "next/link";
import {
  AUDIT_COLUMNS,
  CITIES,
  FINDINGS,
  MEDALLION_WHY,
  SCALE,
  STAGES,
  TECH_STACK,
} from "@/content/projects/food-inspection";
import { StageStepper } from "./stage-stepper";
import { FoodInspectionArchitecture } from "./food-inspection-architecture";
import { LivePipelinePanel } from "./live-pipeline-panel";
import { ProjectSection as Section } from "./project-section";

export function FoodInspectionDeepDive() {
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

      {/* Demo first, and here the demo is real infrastructure rather than a
          replay. Every other console on this site is honest about being a
          recording; this one is a scheduled job writing to a database that the
          page reads on load. */}
      <Section id="live" label="Running now" kicker="Not a replay" wide>
        <p className="max-w-measure text-sm leading-relaxed text-ink-soft">
          The architecture below was built on Azure and Snowflake, which cannot
          be left running for a portfolio. So it was rebuilt on free
          infrastructure and pointed at the same problem, plus a third city. A
          GitHub Actions job ingests Chicago, New York and Dallas twice a day
          into Neon Postgres. These numbers come from that database.
        </p>
        <div className="mt-8">
          <LivePipelinePanel />
        </div>
      </Section>

      {/* The mismatch is the entire problem, so it leads. */}
      <Section id="problem" label="The problem" kicker="Same domain, no shared shape" wide>
        <div className="grid gap-4 lg:grid-cols-2">
          {CITIES.map((c) => (
            <div key={c.city} className="rounded-brand border border-line bg-bg-elev p-6">
              <div className="flex items-baseline justify-between gap-4">
                <p className="text-xl">{c.city}</p>
                <span className="rounded-full border border-accent px-3 py-0.5 font-mono text-[10px] tracking-[0.14em] text-accent uppercase">
                  {c.shape}
                </span>
              </div>
              <p className="mt-1 font-mono text-[11px] text-ink-faint">{c.source}</p>

              <p className="mt-5 font-mono text-[10px] tracking-[0.16em] text-ink-faint uppercase">
                Violations arrive as
              </p>
              <p className="mt-1.5 text-sm text-ink">{c.violations}</p>

              <ul className="mt-5 grid gap-1.5 border-t border-line pt-4">
                {c.quirks.map((q) => (
                  <li key={q} className="flex gap-2 text-sm text-ink-soft">
                    <span aria-hidden="true" className="text-accent">
                      &middot;
                    </span>
                    {q}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-6 max-w-measure text-sm leading-relaxed text-ink-soft">
          Both cities publish restaurant inspections. Neither publishes them the
          same way. Chicago packs every violation into one delimited string,
          Dallas spreads them across 25 numbered columns, and nothing about
          reading one helps you read the other. Every design choice below follows
          from that.
        </p>
      </Section>

      <Section id="architecture" label="Architecture" kicker="Two lanes, one join" wide>
        <FoodInspectionArchitecture />
      </Section>

      <Section id="profiling" label="Profiling" kicker="What it changed" wide>
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">
            Profiling findings and the action each one led to
          </caption>
          <thead>
            <tr className="border-b border-line text-left">
              <th
                scope="col"
                className="py-2 pr-4 font-mono text-[10px] tracking-[0.14em] text-ink-faint uppercase"
              >
                Found
              </th>
              <th
                scope="col"
                className="py-2 pr-4 font-mono text-[10px] tracking-[0.14em] text-ink-faint uppercase"
              >
                Detail
              </th>
              <th
                scope="col"
                className="py-2 font-mono text-[10px] tracking-[0.14em] text-ink-faint uppercase"
              >
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {FINDINGS.map((f) => (
              <tr key={f.finding} className="border-b border-line/60">
                <td className="py-2.5 pr-4 text-ink">{f.finding}</td>
                <td className="py-2.5 pr-4 font-mono text-xs text-accent">{f.detail}</td>
                <td className="py-2.5 text-ink-soft">{f.action}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="mt-6 max-w-measure text-sm leading-relaxed text-ink-soft">
          Profiling ran before any transformation was written, which is the only
          reason the Dallas unpivot is selective. Melting all 25 blocks would
          have multiplied row count for columns that are over 99% empty.
        </p>
      </Section>

      <Section id="pipeline" label="Six stages" kicker="Decisions, not descriptions" wide>
        <StageStepper stages={STAGES} label="Pipeline stages" />
      </Section>

      <Section id="governance" label="Governance" kicker="Layers and lineage" wide>
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-10">
          <div className="rounded-brand border border-line bg-bg-elev p-6">
            <p className="font-mono text-[10px] tracking-[0.16em] text-ink-faint uppercase">
              Why three layers
            </p>
            <ul className="mt-4 grid gap-2.5">
              {MEDALLION_WHY.map((w) => (
                <li key={w} className="flex gap-2.5 text-sm text-ink-soft">
                  <span aria-hidden="true" className="text-accent">
                    +
                  </span>
                  {w}
                </li>
              ))}
            </ul>
            <p className="mt-5 border-t border-line pt-4 text-sm text-ink-soft">
              Bronze is never rewritten, so a wrong regex costs a rerun rather
              than a re-download and a lost original.
            </p>
          </div>

          <div className="rounded-brand border-2 border-accent bg-bg-elev p-6">
            <p className="font-mono text-[10px] tracking-[0.16em] text-accent uppercase">
              Stamped on every record
            </p>
            <dl className="mt-4 grid gap-3">
              {AUDIT_COLUMNS.map((a) => (
                <div key={a.col} className="grid gap-1 sm:grid-cols-[7rem_1fr] sm:gap-4">
                  <dt className="font-mono text-sm text-ink">{a.col}</dt>
                  <dd className="text-sm text-ink-soft">{a.what}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-5 border-t border-line pt-4 text-sm text-ink-soft">
              Three columns are the difference between rerunning a job and
              opening an investigation into which one produced a bad row.
            </p>
          </div>
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
