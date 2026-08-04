import Image from "next/image";
import {
  AGENTS,
  CORPUS,
  DEMO_VIDEO_ID,
  DRIFT,
  GRAPH_EDGES,
  GRAPH_NODES,
  KPIS,
  LATENCY,
  LATENCY_TARGET,
  ROUTER,
  STAGES,
} from "@/content/projects/podcastiq";
import { BarChart } from "./bar-chart";
import { MagnitudeTable } from "./magnitude-table";
import { PipelineStepper } from "./pipeline-stepper";

function Section({
  id,
  label,
  lead,
  children,
  wide = false,
}: {
  id: string;
  label: string;
  lead?: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <section id={id} className={`${wide ? "shell" : "shell-content"} scroll-mt-28 pt-20 lg:pt-28`}>
      <div className="flex items-baseline gap-4 sm:gap-6">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl">{label}</h2>
        <span aria-hidden="true" className="h-px flex-1 bg-line" />
      </div>
      {lead && <p className="mt-4 max-w-measure text-lg text-ink-soft">{lead}</p>}
      <div className="mt-8 lg:mt-10">{children}</div>
    </section>
  );
}

export function PodcastIQDeepDive() {
  return (
    <>
      {/* Corpus scale, compact. Sets the stakes before any explanation. */}
      <section aria-label="Corpus at a glance" className="shell pt-16 lg:pt-20">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-8 border-y border-line py-8 sm:grid-cols-3 lg:grid-cols-6">
          {CORPUS.map((s) => (
            <div key={s.label}>
              <dd className="font-mono text-xl text-ink sm:text-2xl">{s.value}</dd>
              <dt className="mt-1 text-xs text-ink-soft">{s.label}</dt>
            </div>
          ))}
        </dl>
      </section>

      <Section
        id="problem"
        label="The problem"
        lead="Podcasts hold an enormous amount of expert reasoning and none of it is queryable. The audio is the archive."
      >
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              t: "Cannot search it",
              b: "Every expert view on AI safety across 100 episodes means listening to 100 episodes.",
            },
            {
              t: "Cannot track change",
              b: "Nothing shows whether a guest revised a 2022 prediction or quietly contradicted it.",
            },
            {
              t: "Cannot attribute it",
              b: "Claims pass by unverified, with no way to tie one to a specific speaker at scale.",
            },
          ].map((c) => (
            <div key={c.t} className="rounded-brand border border-line bg-bg-elev p-6">
              <p className="text-ink">{c.t}</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{c.b}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section
        id="pipeline"
        label="How it was built"
        lead="Three phases, eleven stages. Each one carries the decision behind it and what that decision cost."
        wide
      >
        <PipelineStepper stages={STAGES} />
      </Section>

      <Section
        id="agents"
        label="The agent system"
        lead="A router classifies intent, then one specialist answers it. Nine agents, eight intents, one chained pair."
        wide
      >
        {/* Router, called out above the specialists it dispatches to */}
        <div className="rounded-brand border-2 border-accent bg-bg-elev p-6">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="font-mono text-[10px] tracking-[0.18em] text-accent uppercase">
              Router
            </span>
            <span aria-hidden="true" className="text-ink-faint">/</span>
            <span className="font-mono text-[10px] text-ink-faint">{ROUTER.model}</span>
            <span aria-hidden="true" className="text-ink-faint">/</span>
            <span className="font-mono text-[10px] text-ink-faint">{ROUTER.example}</span>
          </div>
          <p className="mt-3 max-w-measure text-ink-soft">{ROUTER.job}</p>
        </div>

        <p
          aria-hidden="true"
          className="py-3 text-center font-mono text-xs text-ink-faint"
        >
          dispatches to one of eight
        </p>

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {AGENTS.map((a) => (
            <li
              key={a.name}
              className="flex flex-col rounded-brand border border-line bg-bg-elev p-5"
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-mono text-[10px] tracking-[0.14em] text-accent uppercase">
                  {a.intent}
                </span>
                {a.latency && (
                  <span className="font-mono text-[10px] text-ink-faint">
                    {a.latency}
                  </span>
                )}
              </div>

              <p className="mt-2 text-lg">{a.name}</p>
              <p className="mt-0.5 font-mono text-[11px] text-ink-faint">{a.model}</p>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">
                {a.job}
              </p>

              <p className="mt-4 border-t border-line pt-3 text-xs text-ink-faint italic">
                &ldquo;{a.example}&rdquo;
              </p>

              {a.chained && (
                <p className="mt-2 font-mono text-[9px] tracking-[0.14em] text-accent uppercase">
                  chained pair
                </p>
              )}
            </li>
          ))}
        </ul>

        <p className="mt-6 max-w-measure text-sm leading-relaxed text-ink-soft">
          Search hands off to Summarization and nothing else chains. Keeping every
          other agent independent means one prompt per job, routing that can be
          measured directly, and a failure that stays contained instead of
          cascading.
        </p>
      </Section>

      <Section
        id="architecture"
        label="Architecture"
        lead="The whole system on one page: warehouse on the left, intelligence layer beneath it, query path on the right."
        wide
      >
        <div className="overflow-hidden rounded-brand border border-line bg-white">
          <div className="overflow-x-auto">
            <Image
              src="/PodcastIQ/podcastiq-architecture.svg"
              alt="PodcastIQ architecture: 25 YouTube channels flow through extraction, quality profiling, Snowflake raw load, dbt staging and 120-second chunking into a curated chunk table, then through speaker attribution, claim extraction, temporal drift analysis and a Neo4j knowledge graph, and finally into a LangGraph router that dispatches to eight specialist agents behind four guardrail layers."
              width={1760}
              height={980}
              className="h-auto w-full min-w-[1000px]"
            />
          </div>
        </div>
        <p className="mt-3 font-mono text-[10px] tracking-[0.1em] text-ink-faint uppercase">
          Scroll horizontally to follow the flow
        </p>
      </Section>

      <Section
        id="demo"
        label="Walkthrough"
        lead="The running application: chat, graph explorer, and channel dashboard."
        wide
      >
        <div className="overflow-hidden rounded-brand border border-line bg-black">
          <div className="aspect-video w-full">
            <iframe
              src={`https://drive.google.com/file/d/${DEMO_VIDEO_ID}/preview`}
              title="PodcastIQ application walkthrough"
              allow="autoplay"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
        </div>
      </Section>

      <Section
        id="graph"
        label="The knowledge graph"
        lead="Vector search retrieves passages that resemble a query. It cannot answer who appeared with whom, because that is a traversal."
      >
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-10">
          <MagnitudeTable
            caption="Nodes by type"
            rows={GRAPH_NODES}
            total={88823}
            totalLabel="Total nodes"
          />
          <MagnitudeTable
            caption="Relationships by type"
            rows={GRAPH_EDGES}
            total={253740}
            totalLabel="Total relationships"
          />
        </div>
        <p className="mt-8 max-w-measure text-sm leading-relaxed text-ink-soft">
          Confidence lives in the edge type, not a property, so a query picks its
          own certainty bar:{" "}
          <span className="font-mono text-xs text-ink">MADE_CLAIM</span> for high,{" "}
          <span className="font-mono text-xs text-ink">LIKELY_MADE_CLAIM</span> for
          medium,{" "}
          <span className="font-mono text-xs text-ink">DISCUSSED_IN</span> where the
          speaker could not be established.
        </p>
      </Section>

      <Section
        id="drift"
        label="Claim drift"
        lead="823 pairs where a speaker returned to the same topic 30 days or more later. Nearly half the time their position had moved against itself."
      >
        <BarChart data={DRIFT} caption="Evolution pairs by drift type" />
      </Section>

      <Section
        id="performance"
        label="Latency and evaluation"
        lead="Measured against a 5-second p95 budget, and checked against the live warehouse rather than asserted."
      >
        <BarChart
          data={LATENCY}
          unit="s"
          decimals={1}
          target={LATENCY_TARGET}
          targetLabel="p95 target, 5 seconds"
          caption="Mean latency by agent"
        />

        <table className="mt-14 w-full border-collapse text-sm">
          <caption className="sr-only">
            Domain KPI thresholds and measured results
          </caption>
          <thead>
            <tr className="border-b border-line text-left">
              <th scope="col" className="py-2 pr-4 font-mono text-[10px] tracking-[0.14em] text-ink-faint uppercase">
                Check
              </th>
              <th scope="col" className="py-2 pr-4 font-mono text-[10px] tracking-[0.14em] text-ink-faint uppercase">
                Threshold
              </th>
              <th scope="col" className="py-2 text-right font-mono text-[10px] tracking-[0.14em] text-ink-faint uppercase">
                Measured
              </th>
            </tr>
          </thead>
          <tbody>
            {KPIS.map((k) => (
              <tr key={k.check} className="border-b border-line/60">
                <td className="py-2.5 pr-4">{k.check}</td>
                <td className="py-2.5 pr-4 font-mono text-xs text-ink-faint">
                  {k.threshold}
                </td>
                <td className="py-2.5 text-right font-mono text-xs tabular-nums text-ink">
                  {k.actual}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="mt-8 max-w-measure text-sm leading-relaxed text-ink-soft">
          The 8b router ships at 87.5% against the 70b model&rsquo;s 93.75%. Six
          points of routing accuracy did not justify paying 70b prices on every
          query, and the whole system runs at $0.0012 per query as a result.
        </p>
      </Section>
    </>
  );
}
