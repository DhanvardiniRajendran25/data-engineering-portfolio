import Image from "next/image";
import {
  CORPUS,
  DRIFT,
  GRAPH_EDGES,
  GRAPH_NODES,
  HEADLINE,
  KPIS,
  LATENCY,
  LATENCY_TARGET,
  RETROSPECTIVE,
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
      {lead && <p className="mt-5 max-w-measure text-lg text-ink-soft">{lead}</p>}
      <div className="mt-8 lg:mt-10">{children}</div>
    </section>
  );
}

function StatGrid({
  stats,
  cols = 4,
}: {
  stats: { value: string; label: string; note?: string }[];
  cols?: 3 | 4;
}) {
  return (
    <dl
      className={`grid grid-cols-2 gap-x-6 gap-y-8 ${
        cols === 4 ? "lg:grid-cols-4" : "sm:grid-cols-3"
      }`}
    >
      {stats.map((s) => (
        <div key={s.label}>
          {/* Proportional figures, not tabular: these do not align in a column */}
          <dd className="font-mono text-2xl text-ink sm:text-3xl">{s.value}</dd>
          <dt className="mt-1 text-sm text-ink-soft">{s.label}</dt>
          {s.note && (
            <p className="mt-0.5 text-[11px] text-ink-faint">{s.note}</p>
          )}
        </div>
      ))}
    </dl>
  );
}

export function PodcastIQDeepDive() {
  return (
    <>
      <Section
        id="problem"
        label="The problem"
        lead="Podcasts hold an enormous amount of expert reasoning and none of it is queryable. The audio is the archive, so the knowledge inside it may as well not exist."
      >
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              t: "You cannot search it",
              b: "Finding every expert view on AI safety across 100 episodes means listening to 100 episodes. There is no index.",
            },
            {
              t: "You cannot track change",
              b: "Nothing tells you whether a guest revised a prediction between 2022 and 2026, doubled down on it, or quietly contradicted it.",
            },
            {
              t: "You cannot verify it",
              b: "Claims are asserted in passing and never checked, and there is no way to attribute a specific claim to a specific speaker at scale.",
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
        id="corpus"
        label="The corpus"
        lead="A deliberately time-spread corpus, because tracking how a position moves needs range, not volume."
      >
        <StatGrid stats={CORPUS} cols={3} />
        <p className="mt-8 max-w-measure text-sm leading-relaxed text-ink-soft">
          The first extraction pass sorted by view count and returned almost
          nothing but 2024 and 2025 episodes, which made temporal analysis
          impossible. Re-running it stratified by publish date widened the span
          from 12 months to 44 and is what made drift detection viable at all.
        </p>
      </Section>

      <Section
        id="pipeline"
        label="How it was built"
        lead="Eleven stages from caption files to a guarded answer. Each one carries the decision behind it and what that decision cost."
        wide
      >
        <PipelineStepper stages={STAGES} />
      </Section>

      <Section
        id="architecture"
        label="Architecture"
        lead="The full system: data engineering ending at the chunk table, AI engineering building the intelligence layer on top, and the query pipeline serving it."
        wide
      >
        <div className="overflow-hidden rounded-brand border border-line bg-white">
          {/* Intrinsic 1760x980. Sized by width so it scales down cleanly, and
              scrollable on small screens rather than shrunk to illegibility. */}
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
        id="graph"
        label="The knowledge graph"
        lead="Vector search retrieves passages that resemble a query. It cannot answer who appeared with whom, because that is a traversal. Hence a second store."
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
          Attribution confidence is encoded in the edge type rather than a
          property, so a query picks its own certainty bar:{" "}
          <span className="font-mono text-xs text-ink">MADE_CLAIM</span> for high
          confidence,{" "}
          <span className="font-mono text-xs text-ink">LIKELY_MADE_CLAIM</span>{" "}
          for medium, and{" "}
          <span className="font-mono text-xs text-ink">DISCUSSED_IN</span> where
          the speaker could not be established at all.
        </p>
      </Section>

      <Section
        id="drift"
        label="Claim drift"
        lead="823 pairs where the same speaker returned to the same topic more than 30 days later. Nearly half the time their position had moved against itself."
      >
        <BarChart data={DRIFT} caption="Evolution pairs by drift type" />
        <p className="mt-8 max-w-measure text-sm leading-relaxed text-ink-soft">
          Contradiction being the largest class is the finding, not a bug: people
          revise more often than they signal. Drift is computed during the
          pipeline rather than at query time, which keeps an LLM call out of the
          request path and lets the temporal agent answer with plain SQL.
        </p>
      </Section>

      <Section
        id="agents"
        label="Agents and latency"
        lead="A router classifies intent, then one specialist answers. Measured against a 5-second p95 budget."
      >
        <BarChart
          data={LATENCY}
          unit="s"
          decimals={1}
          target={LATENCY_TARGET}
          targetLabel="p95 target, 5 seconds"
          caption="Mean latency by agent"
        />
        <p className="mt-8 max-w-measure text-sm leading-relaxed text-ink-soft">
          Only the web-search fact-check path exceeds the budget, and it does so
          because of an external round-trip rather than anything in the system.
          That is why fact-checking is two-stage: a Cortex pre-filter resolves a
          third of claims without leaving Snowflake, and only genuinely uncertain
          ones pay the network cost.
        </p>
      </Section>

      <Section
        id="evaluation"
        label="Evaluation"
        lead="Six evaluation scripts and seven corpus health checks, run against the live warehouse rather than asserted."
      >
        <table className="w-full border-collapse text-sm">
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
          Router accuracy was measured on 48 labelled queries, six per intent:
          87.5% on llama3.1-8b against 93.75% on the 70b model. The 8b model
          ships, because six points of routing accuracy did not justify paying
          70b prices on every single query.
        </p>
      </Section>

      <Section
        id="demo"
        label="Demo"
        lead="A walkthrough of the running application: chat interface, graph explorer, and channel dashboard."
      >
        <a
          href="https://drive.google.com/file/d/1d0jUIje5mElE8_u1BpUbYwlpnGoE9ZgP/view"
          target="_blank"
          rel="noopener"
          className="inline-flex items-center gap-3 rounded-full border border-ink px-6 py-3 font-mono text-[11px] tracking-[0.14em] text-ink uppercase transition-colors hover:bg-ink hover:text-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Watch the walkthrough
          <span aria-hidden="true">&#8599;</span>
        </a>
      </Section>

      <Section
        id="retrospective"
        label="What I would do differently"
        lead="Three things I would change, stated plainly."
      >
        <ol className="grid gap-5">
          {RETROSPECTIVE.map((r, i) => (
            <li key={i} className="flex gap-5 border-l border-line pl-5">
              <span className="font-mono text-[10px] text-ink-faint">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="max-w-measure text-sm leading-relaxed text-ink-soft">
                {r}
              </p>
            </li>
          ))}
        </ol>
      </Section>

      <Section id="numbers" label="By the numbers">
        <StatGrid stats={HEADLINE} />
      </Section>
    </>
  );
}
