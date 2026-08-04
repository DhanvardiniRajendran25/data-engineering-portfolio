import Image from "next/image";
import Link from "next/link";
import {
  AGENTS,
  CORPUS,
  DEMO_VIDEO_ID,
  DRIFT,
  GRAPH_EDGES,
  GRAPH_NODES,
  COST_BY_AGENT,
  EVAL,
  LATENCY_FACTS,
  PHASES,
  ROUTER,
  STAGES,
  TECH_STACK,
} from "@/content/projects/podcastiq";
import { CHANNEL_DRIFT } from "@/content/projects/podcastiq-traces";
import { AgentConsole } from "./agent-console";
import { BarChart } from "./bar-chart";
import { MagnitudeTable } from "./magnitude-table";
import { PipelineStepper } from "./pipeline-stepper";

function Section({
  id,
  label,
  kicker,
  children,
  wide = false,
}: {
  id: string;
  label: string;
  /** A fragment, not a sentence. */
  kicker?: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <section id={id} className={`${wide ? "shell" : "shell-content"} scroll-mt-28 pt-20 lg:pt-28`}>
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

export function PodcastIQDeepDive() {
  return (
    <>
      {/* Scale, no commentary */}
      <section aria-label="Corpus at a glance" className="shell pt-14 lg:pt-16">
        <dl className="grid grid-cols-3 gap-x-6 gap-y-8 border-y border-line py-8 lg:grid-cols-6">
          {CORPUS.map((s) => (
            <div key={s.label}>
              <dd className="font-mono text-xl text-ink sm:text-2xl">{s.value}</dd>
              <dt className="mt-1 text-xs text-ink-soft">{s.label}</dt>
            </div>
          ))}
        </dl>
      </section>

      {/* Problem stated as three impossibilities */}
      <Section id="problem" label="The problem" kicker="Audio is not queryable">
        <ul className="grid gap-4 md:grid-cols-3">
          {[
            { x: "Search", y: "100 episodes = 100 hours of listening" },
            { x: "Track change", y: "No record of a revised prediction" },
            { x: "Attribute", y: "No link from a claim to a speaker" },
          ].map((c) => (
            <li key={c.x} className="rounded-brand border border-line bg-bg-elev p-6">
              <p className="flex items-center gap-2 font-mono text-[11px] tracking-[0.12em] text-ink-faint uppercase">
                <span aria-hidden="true" className="text-accent">&times;</span>
                Cannot {c.x}
              </p>
              <p className="mt-3 text-sm text-ink-soft">{c.y}</p>
            </li>
          ))}
        </ul>
      </Section>

      {/* Three-phase overview: the map before the detail */}
      <Section id="phases" label="Three phases" kicker="11 stages" wide>
        <ol className="grid gap-4 lg:grid-cols-3">
          {PHASES.map((p, i) => (
            <li key={p.id} className="relative rounded-brand border border-line bg-bg-elev p-6">
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-3xl text-accent">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="text-xl">{p.label}</p>
                  <p className="font-mono text-[10px] tracking-[0.14em] text-ink-faint uppercase">
                    {p.sub}
                  </p>
                </div>
              </div>

              <dl className="mt-5 grid gap-2 border-t border-line pt-4 text-sm">
                <div className="flex gap-2">
                  <dt className="w-10 shrink-0 font-mono text-[10px] text-ink-faint uppercase">In</dt>
                  <dd className="text-ink-soft">{p.from}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-10 shrink-0 font-mono text-[10px] text-ink-faint uppercase">Out</dt>
                  <dd className="text-ink">{p.to}</dd>
                </div>
              </dl>

              <p className="mt-4 font-mono text-[10px] text-ink-faint">
                {STAGES.filter((s) => s.phase === p.id).length} stages
              </p>
            </li>
          ))}
        </ol>
      </Section>

      <Section id="pipeline" label="Stage by stage" kicker="Decisions, not descriptions" wide>
        <PipelineStepper stages={STAGES} />
      </Section>

      <Section id="agents" label="Agent runtime" kicker="1 router, 8 specialists" wide>
        {/* Router */}
        <div className="rounded-brand border-2 border-accent bg-bg-elev p-5">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="font-mono text-[10px] tracking-[0.16em] text-accent uppercase">
              Router
            </span>
            <span className="font-mono text-[10px] text-ink-faint">{ROUTER.model}</span>
            <span aria-hidden="true" className="text-ink-faint">/</span>
            <span className="font-mono text-[10px] text-ink-faint">{ROUTER.example}</span>
          </div>
          <p className="mt-2 text-sm text-ink-soft">{ROUTER.job}</p>
        </div>

        {/* Fan-out illustration */}
        <svg
          viewBox="0 0 800 44"
          className="mt-1 h-11 w-full text-line"
          aria-hidden="true"
          preserveAspectRatio="none"
        >
          {[50, 157, 264, 371, 478, 585, 692, 750].map((x) => (
            <path
              key={x}
              d={`M400 0 C400 22 ${x} 22 ${x} 44`}
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            />
          ))}
        </svg>

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {AGENTS.map((a) => (
            <li
              key={a.name}
              className="flex flex-col rounded-brand border border-line bg-bg-elev p-5"
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-mono text-[10px] tracking-[0.12em] text-accent uppercase">
                  {a.intent}
                </span>
                {a.latency && (
                  <span className="font-mono text-[10px] text-ink-faint">{a.latency}</span>
                )}
              </div>

              <p className="mt-2 text-lg">{a.name}</p>
              <p className="mt-0.5 font-mono text-[11px] text-ink-faint">{a.model}</p>
              <p className="mt-3 flex-1 text-sm text-ink-soft">{a.job}</p>
              <p className="mt-4 border-t border-line pt-3 text-xs text-ink-faint italic">
                &ldquo;{a.example}&rdquo;
              </p>
              {a.chained && (
                <p className="mt-2 font-mono text-[9px] tracking-[0.12em] text-accent uppercase">
                  chained pair
                </p>
              )}
            </li>
          ))}
        </ul>

        <div className="mt-12">
          <p className="font-mono text-[10px] tracking-[0.16em] text-ink-faint uppercase">
            Try it
          </p>
          <p className="mt-2 max-w-measure text-sm text-ink-soft">
            Eight queries, one per intent. Each replays the real execution trace:
            guardrails, routing, agent steps and measured timings.
          </p>
          <div className="mt-5">
            <AgentConsole />
          </div>
        </div>
      </Section>

      <Section id="architecture" label="Architecture" kicker="Full system" wide>
        <div className="overflow-hidden rounded-brand border border-line bg-white">
          <div className="overflow-x-auto">
            <Image
              src="/PodcastIQ/podcastiq-architecture.svg"
              alt="PodcastIQ architecture: 25 YouTube channels flow through extraction, quality profiling, Snowflake raw load, dbt staging and 120-second chunking into a curated chunk table, then through speaker attribution, claim extraction, temporal drift analysis and a Neo4j knowledge graph, and finally into a LangGraph router dispatching to eight specialist agents behind four guardrail layers."
              width={1760}
              height={980}
              className="h-auto w-full min-w-[1000px]"
            />
          </div>
        </div>
        <p className="mt-3 font-mono text-[10px] tracking-[0.1em] text-ink-faint uppercase">
          Scroll to follow the flow
        </p>
      </Section>

      <Section id="demo" label="Walkthrough" kicker="Running application" wide>
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

      <Section id="graph" label="Knowledge graph" kicker="Traversal, not similarity">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-10">
          <MagnitudeTable caption="Nodes by type" rows={GRAPH_NODES} total={88823} totalLabel="Total" />
          <MagnitudeTable caption="Relationships by type" rows={GRAPH_EDGES} total={253740} totalLabel="Total" />
        </div>

        {/* Confidence-in-edge-type, as a table rather than a paragraph */}
        <dl className="mt-10 grid gap-3 sm:grid-cols-3">
          {[
            { e: "MADE_CLAIM", c: "High" },
            { e: "LIKELY_MADE_CLAIM", c: "Medium" },
            { e: "DISCUSSED_IN", c: "Speaker unknown" },
          ].map((r) => (
            <div key={r.e} className="rounded-brand-sm border border-line p-4">
              <dt className="font-mono text-[11px] break-all text-ink">{r.e}</dt>
              <dd className="mt-1 text-xs text-ink-faint">{r.c}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section id="drift" label="Claim drift" kicker="823 pairs" wide>
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-10">
          <BarChart data={DRIFT} caption="Evolution pairs by drift type" />

          <div>
            <p className="font-mono text-[11px] tracking-[0.14em] text-ink-faint uppercase">
              Contradictions by channel
            </p>
            <table className="mt-4 w-full border-collapse text-xs">
              <caption className="sr-only">
                Claim evolutions per channel, split by drift type
              </caption>
              <thead>
                <tr className="border-b border-line text-left">
                  <th scope="col" className="py-2 pr-3 font-mono text-[9px] tracking-[0.12em] text-ink-faint uppercase">
                    Channel
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-mono text-[9px] tracking-[0.12em] text-ink-faint uppercase">
                    Total
                  </th>
                  <th scope="col" className="py-2 text-right font-mono text-[9px] tracking-[0.12em] text-ink-faint uppercase">
                    Contradicted
                  </th>
                </tr>
              </thead>
              <tbody>
                {CHANNEL_DRIFT.map((c) => (
                  <tr key={c.channel} className="border-b border-line/60">
                    <td className="py-2 pr-3">{c.channel}</td>
                    <td className="py-2 pr-3 text-right font-mono tabular-nums text-ink-faint">
                      {c.total}
                    </td>
                    <td className="py-2 text-right font-mono tabular-nums text-ink">
                      {c.contradicted}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-4 max-w-measure text-sm text-ink-soft">
              The Diary Of A CEO leads at 52 contradictions, close to half its
              total evolutions. This is the corpus disagreeing with itself,
              measured.
            </p>
          </div>
        </div>
      </Section>

      <Section id="performance" label="Measured results" kicker="110 test queries">
        {/* Scorecard, including what missed. Six evaluation scripts, 17 Apr 2026. */}
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">
            Evaluation results against target, including dimensions below target
          </caption>
          <thead>
            <tr className="border-b border-line text-left">
              <th scope="col" className="py-2 pr-4 font-mono text-[10px] tracking-[0.14em] text-ink-faint uppercase">
                Dimension
              </th>
              <th scope="col" className="py-2 pr-4 text-right font-mono text-[10px] tracking-[0.14em] text-ink-faint uppercase">
                Measured
              </th>
              <th scope="col" className="py-2 pr-4 text-right font-mono text-[10px] tracking-[0.14em] text-ink-faint uppercase">
                Target
              </th>
              <th scope="col" className="py-2 font-mono text-[10px] tracking-[0.14em] text-ink-faint uppercase">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {EVAL.map((e) => (
              <tr key={e.dimension} className="border-b border-line/60">
                <td className="py-2.5 pr-4">{e.dimension}</td>
                <td className="py-2.5 pr-4 text-right font-mono text-xs tabular-nums text-ink">
                  {e.result}
                </td>
                <td className="py-2.5 pr-4 text-right font-mono text-xs tabular-nums text-ink-faint">
                  {e.target}
                </td>
                <td className="py-2.5">
                  {/* Status carries an icon and a word, never colour alone */}
                  <span
                    className={`inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.1em] uppercase ${
                      e.status === "below" ? "text-accent" : "text-ink-soft"
                    }`}
                  >
                    <span aria-hidden="true">
                      {e.status === "below" ? "▲" : "✓"}
                    </span>
                    {e.status === "below" ? "Below target" : e.status === "pass" ? "Pass" : "Exceeds"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Latency stated as measured, with the diagnosis rather than a excuse */}
        <div className="mt-10 rounded-brand border-l-2 border-accent bg-bg-elev p-6">
          <p className="font-mono text-[10px] tracking-[0.16em] text-accent uppercase">
            Why latency misses
          </p>
          <dl className="mt-4 grid gap-4 sm:grid-cols-3">
            {[
              { k: "p95", v: LATENCY_FACTS.p95 },
              { k: "Mean", v: LATENCY_FACTS.mean },
              { k: "Target", v: LATENCY_FACTS.target },
            ].map((x) => (
              <div key={x.k}>
                <dt className="font-mono text-[10px] tracking-[0.14em] text-ink-faint uppercase">
                  {x.k}
                </dt>
                <dd className="font-mono text-2xl text-ink">{x.v}</dd>
              </div>
            ))}
          </dl>
          <dl className="mt-5 grid gap-3 border-t border-line pt-4 text-sm">
            <div className="flex gap-3">
              <dt className="w-20 shrink-0 font-mono text-[10px] text-ink-faint uppercase">Cause</dt>
              <dd className="text-ink-soft">{LATENCY_FACTS.cause}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-20 shrink-0 font-mono text-[10px] text-ink-faint uppercase">Fix</dt>
              <dd className="text-ink">{LATENCY_FACTS.fix}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-20 shrink-0 font-mono text-[10px] text-ink-faint uppercase">Context</dt>
              <dd className="text-ink-soft">{LATENCY_FACTS.context}</dd>
            </div>
          </dl>
        </div>
      </Section>

      <Section id="cost" label="Cost per query" kicker="$1.19 per 1,000">
        <BarChart
          data={COST_BY_AGENT}
          unit=""
          decimals={5}
          caption="Estimated cost by agent, USD"
        />
        <p className="mt-8 max-w-measure text-sm text-ink-soft">
          Search and Graph are effectively free: both retrieve without a
          generation step. Summarize costs the most because it passes 5 to 8
          retrieved chunks into the prompt.
        </p>
      </Section>

      {/* Full stack, at the end, linked through to Skills */}
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
