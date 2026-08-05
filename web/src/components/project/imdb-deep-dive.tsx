import Link from "next/link";
import {
  DATASETS,
  SCALE,
  STAGES,
  TECH_STACK,
  TUNING,
} from "@/content/projects/imdb";
import { ImdbArchitecture } from "./imdb-architecture";
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

export function ImdbDeepDive() {
  const maxRows = Math.max(...DATASETS.map((d) => d.rows));

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

      <Section id="problem" label="The problem" kicker="Scale breaks naive loads">
        <ul className="grid gap-4 md:grid-cols-3">
          {[
            {
              x: "Volume",
              y: "190M rows across 7 datasets, one of them 91M on its own",
            },
            {
              x: "Dirty by design",
              y: "IMDb encodes missing values as a literal string, and packs multiple values into single fields",
            },
            {
              x: "Query shape",
              y: "Analysts ask by year and genre, which a raw load cannot answer without scanning everything",
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

      {/* Extreme range (59:1), so a table with proportional bars, not a bar chart */}
      <Section id="datasets" label="The corpus" kicker="7 datasets, 190M rows">
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">
            The seven IMDb datasets with record counts and their role in the model
          </caption>
          <thead>
            <tr className="border-b border-line text-left">
              <th scope="col" className="py-2 pr-4 font-mono text-[10px] tracking-[0.14em] text-ink-faint uppercase">
                Dataset
              </th>
              <th scope="col" className="py-2 pr-4 font-mono text-[10px] tracking-[0.14em] text-ink-faint uppercase">
                Share
              </th>
              <th scope="col" className="py-2 pr-4 text-right font-mono text-[10px] tracking-[0.14em] text-ink-faint uppercase">
                Rows
              </th>
              <th scope="col" className="py-2 font-mono text-[10px] tracking-[0.14em] text-ink-faint uppercase">
                Role
              </th>
            </tr>
          </thead>
          <tbody>
            {DATASETS.map((d) => (
              <tr key={d.name} className="border-b border-line/60">
                <td className="py-2.5 pr-4 font-mono text-xs text-ink">{d.name}</td>
                <td className="w-[22%] py-2.5 pr-4">
                  <span className="block h-1.5 w-full rounded-full bg-ink/[0.06]">
                    <span
                      className="block h-full rounded-full bg-accent"
                      style={{ width: `${Math.max((d.rows / maxRows) * 100, 0.6)}%` }}
                    />
                  </span>
                </td>
                <td className="py-2.5 pr-4 text-right font-mono text-xs tabular-nums text-ink">
                  {d.rows.toLocaleString("en-US")}
                </td>
                <td className="py-2.5 text-ink-soft">
                  {d.role}
                  <span className="mt-0.5 block text-[11px] text-ink-faint">{d.note}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-6 max-w-measure text-sm text-ink-soft">
          One dataset carries 48% of the corpus.{" "}
          <span className="font-mono text-xs text-ink">title.principals</span> is the
          many-to-many bridge between titles and people, which is why it is both
          the largest table and the one whose join strategy decides warehouse
          performance.
        </p>
      </Section>

      <Section id="pipeline" label="Six stages" kicker="Decisions, not descriptions" wide>
        <StageStepper stages={STAGES} label="Pipeline stages" />
      </Section>

      <Section id="architecture" label="Architecture" kicker="S3 to QuickSight" wide>
        <ImdbArchitecture />
      </Section>

      {/* The section a warehouse engineer will actually read */}
      <Section id="tuning" label="Physical tuning" kicker="Where warehouses are won">
        <div className="grid gap-4">
          {TUNING.map((t) => (
            <div
              key={t.key}
              className="grid gap-2 rounded-brand border border-line bg-bg-elev p-5 sm:grid-cols-[8rem_1fr] sm:gap-6"
            >
              <div>
                <p className="font-mono text-xs text-accent">{t.key}</p>
                <p className="mt-1 font-mono text-[11px] break-words text-ink-faint">
                  {t.on}
                </p>
              </div>
              <p className="text-sm leading-relaxed text-ink-soft">{t.why}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 max-w-measure text-sm text-ink-soft">
          A star schema is the easy half. The distribution and sort choices are
          what decide whether a 90M-row join runs on-node or redistributes across
          slices, and they are the first thing worth asking about in a warehouse
          review.
        </p>
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
