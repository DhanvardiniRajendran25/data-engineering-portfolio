import Link from "next/link";
import {
  DIMENSIONS,
  FACT,
  INSIGHTS,
  SCALE,
  STAGES,
  TECH_STACK,
  TOP_OFFENCES,
} from "@/content/projects/nypd";
import { StageStepper } from "./stage-stepper";
import { ProjectSection as Section } from "./project-section";

export function NypdDeepDive() {
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

      <Section id="problem" label="The problem" kicker="No single source of truth">
        <ul className="grid gap-4 md:grid-cols-3">
          {[
            { x: "Fragmented", y: "Crime questions span time, geography and demographics, with no one place to ask all three" },
            { x: "Shifting", y: "Precinct boundaries and demographic coding change, so last year's numbers stop matching" },
            { x: "Dirty", y: "Missing law categories, inconsistent age formats, geolocation gaps in the source" },
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

      <Section id="model" label="The model" kicker="Star schema, 2 SCD2" wide>
        <div className="grid gap-6 lg:grid-cols-[1fr_20rem] lg:gap-10">
          <table className="w-full border-collapse text-sm">
            <caption className="sr-only">Dimensions with their contents and SCD type</caption>
            <thead>
              <tr className="border-b border-line text-left">
                <th scope="col" className="py-2 pr-4 font-mono text-[10px] tracking-[0.14em] text-ink-faint uppercase">
                  Dimension
                </th>
                <th scope="col" className="py-2 pr-4 font-mono text-[10px] tracking-[0.14em] text-ink-faint uppercase">
                  Contents
                </th>
                <th scope="col" className="py-2 font-mono text-[10px] tracking-[0.14em] text-ink-faint uppercase">
                  History
                </th>
              </tr>
            </thead>
            <tbody>
              {DIMENSIONS.map((d) => (
                <tr key={d.name} className="border-b border-line/60">
                  <td className="py-2.5 pr-4 font-mono text-xs text-ink">{d.name}</td>
                  <td className="py-2.5 pr-4 text-ink-soft">{d.detail}</td>
                  <td className="py-2.5">
                    {d.scd ? (
                      <span className="rounded-full border border-accent px-2 py-0.5 font-mono text-[10px] text-accent">
                        SCD {d.scd}
                      </span>
                    ) : (
                      <span className="font-mono text-[10px] text-ink-faint">Type 1</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="self-start rounded-brand border-2 border-accent bg-bg-elev p-5">
            <p className="font-mono text-[10px] tracking-[0.16em] text-accent uppercase">
              Fact table
            </p>
            <p className="mt-2 font-mono text-sm text-ink">{FACT.name}</p>
            <p className="mt-2 text-sm text-ink-soft">{FACT.grain}</p>
          </div>
        </div>

        <p className="mt-8 max-w-measure text-sm leading-relaxed text-ink-soft">
          Two dimensions carry history. Precinct boundaries and demographic coding
          both change over time, and a Type 1 overwrite would silently rewrite the
          past, so an arrest from 2019 would report under a geography that did not
          exist then. Validity date ranges keep each arrest attributed to the world
          it happened in.
        </p>
      </Section>

      <Section id="pipeline" label="Six stages" kicker="Decisions, not descriptions" wide>
        <StageStepper stages={STAGES} label="Pipeline stages" />
      </Section>

      <Section id="insights" label="What it surfaced" kicker="From the dashboard">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* A <dl> may only contain dt, dd and div, so the note lives inside
              the <dd> rather than as a sibling <p>. */}
          {INSIGHTS.map((i) => (
            <div key={i.label} className="rounded-brand border border-line bg-bg-elev p-5">
              <dd className="font-mono text-2xl text-ink">
                {i.value}
                <span className="mt-1 block font-mono text-[10px] text-ink-faint">
                  {i.note}
                </span>
              </dd>
              <dt className="mt-1 text-sm text-ink-soft">{i.label}</dt>
            </div>
          ))}
        </dl>

        <div className="mt-8">
          <p className="font-mono text-[10px] tracking-[0.16em] text-ink-faint uppercase">
            Top offence categories
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {TOP_OFFENCES.map((o) => (
              <li key={o} className="rounded-full border border-line px-3 py-1 text-[11px] text-ink-soft">
                {o}
              </li>
            ))}
          </ul>
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
