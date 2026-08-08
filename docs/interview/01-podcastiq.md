# PodcastIQ

**Snowflake-native agentic search over 286 podcast episodes.**
Data engineering, AI engineering and an agent runtime in one system, which is why
it ranks first: it is the only project that demonstrates all three.

---

## Pitch ladder

### 20 seconds
> A nine-agent search platform over 286 podcast episodes. The pipeline pulls
> captions, chunks them on fixed 120-second windows, extracts 84,260 claims with
> an LLM, and builds an 88,823-node graph so you can ask who said what, when, and
> whether they later contradicted themselves. A router picks one of eight
> specialist agents, and it costs about a tenth of a cent per query.

### 2 minutes
Add the three-phase shape and one decision:

> It splits into three phases. **Ingest** is data engineering: yt-dlp pulls
> captions for 25 channels, ydata-profiling gates quality before anything loads,
> then Snowflake holds raw JSON in a VARIANT column and dbt views flatten it into
> 13,807 chunks. **Enrich** is AI engineering: llama3.1-70b through Snowflake
> Cortex extracts 84,260 typed claims, a second pass computes temporal drift, and
> the result exports to a Neo4j graph. **Serve** is the agent runtime: a
> LangGraph router classifies into one of eight intents and dispatches.
>
> The decision I would highlight is model tiering. Extraction runs on 70b because
> its output is a dependency for four later stages, and routing runs on 8b
> because it only picks one of eight labels. That is most of the reason the cost
> per query is $0.0012.

### 10 minutes
Walk the eleven stages below, then the evaluation, and **lead with the three
dimensions that missed target** rather than waiting to be asked.

---

## The problem

A podcast corpus is unusually hostile to search:

| Property | Why it hurts |
|---|---|
| Long-form spoken language | no document structure, no headings, no paragraphs |
| No speaker labels in captions | "he said" is unattributable |
| Claims are scattered | one assertion per ~10 seconds, not per document |
| Positions change over time | the same person contradicts themselves across 44 months |
| Relationship questions | "who appeared with whom" is a traversal, not a similarity |

**The framing that makes the project sound necessary:** vector search answers
"what was said about X." It cannot answer "who has Sam Altman appeared with"
at any top-k, because that is a graph traversal, and it cannot answer "how did
his position change" because that requires comparing two points in time.

---

## Architecture

```
PHASE 1  INGEST                    (data engineering)
  yt-dlp + YouTube Data API v3  ->  286 episodes, 146 MB JSON
  ydata-profiling               ->  5 quality gates, all rated HIGH
  Snowflake PUT + COPY INTO     ->  VARIANT payload, typed VIDEO_ID
  dbt views (LATERAL FLATTEN)   ->  22 typed columns
  GROUP BY FLOOR(start/120)     ->  13,807 chunks, 100% deep-linked

PHASE 2  ENRICH                    (AI engineering)
  regex tier -> llama3.1-70b     ->  speaker attribution, 683 participants
  Snowflake Cortex llama3.1-70b  ->  84,260 claims, 4 types
  pairwise 70b comparison        ->  823 evolution pairs, 5 drift types
  export -> Neo4j Cypher         ->  88,823 nodes, 253,740 relationships

PHASE 3  SERVE                     (agent runtime)
  LangGraph StateGraph
    router (llama3.1-8b)         ->  8 intents
    8 specialist agents          ->  Search chains into Summarize
  4 input guard layers + GPT-4o judge
  Streamlit
```

### Why the storage split

Snowflake holds the corpus and the claims. Neo4j holds the relationships. **You
need both** because "who appeared with whom" is a traversal, and the cost is a
second store to keep consistent with the first.

---

## Decisions

### D1. Captions over audio + Whisper

**Chose** YouTube captions. **Over** downloading audio and transcribing.
**Because** no GPU, no transcription cost, and timestamps come free.
**Cost:** inherits YouTube caption errors, and rules out acoustic diarization
entirely, which is why speaker attribution had to be a text problem.

> **Follow-up: "How bad are the caption errors?"**
> Concede you did not measure WER against a reference. What you did do is track a
> VTT artefact rate in profiling as a proxy. The honest answer is that the
> downstream claim extraction is somewhat robust to transcription noise because
> the LLM reads for meaning, but a mis-transcribed number stays wrong.

### D2. Gate quality before load, every cycle

**Chose** profiling as a blocking gate. **Over** load first, fix later.
**Because** one bad episode contaminates chunks, embeddings, claims and the
graph. **Cost:** a full pass producing no user-facing output.

The five gates: missing transcript, length distribution outliers, temporal
clustering, duplicate video IDs, VTT artefact rate.

### D3. VARIANT plus typed join keys

**Chose** raw JSON in a `VARIANT` column with `VIDEO_ID` typed as a primary key.
**Over** fully typed columns, or fully schemaless.
**Because** fully typed breaks whenever YouTube changes a field, and fully
schemaless lets duplicate episodes through. **Cost:** casting deferred to
staging.

> **Follow-up: "Why is COPY INTO 50-100x faster than INSERT?"**
> COPY parallelises across the warehouse and is the intended bulk path; it also
> stages files and loads them as a set. Row-by-row INSERT round-trips per row and
> produces far more metadata churn. It is the same reason you used COPY into
> Redshift on IMDb.

### D4. dbt views, not materialised tables

**Chose** views. **Over** materialised tables. **Because** zero storage cost and
new episodes appear with no rebuild step. **Cost:** recomputes on every read.

> **Follow-up: "At what scale does that break?"**
> When read frequency times recompute cost exceeds storage cost, which at 286
> episodes is nowhere near. Say the threshold out loud: if the corpus grew to
> tens of thousands of episodes, or if the flatten got expensive, you would
> materialise the silver layer and keep views only at gold.

### D5. Fixed 120-second chunk windows

**Chose** `GROUP BY FLOOR(start / 120)`. **Over** word-count chunking, semantic
chunking, sliding windows.
**Because** word-count breaks timestamp alignment; semantic costs an LLM call per
chunk and still lands imprecisely; sliding windows duplicate content and hurt
MRR; and 120 seconds lands near 120 words, which suits `arctic-embed-m`.
**Cost:** a window edge can split a thought mid-sentence.

Stub chunks under 50 characters are dropped. About 48 chunks per episode.

> **This is the single best "did you decide or did you default" answer you have.**
> Four alternatives, each rejected for a different concrete reason, and a stated
> cost.

### D6. Text-based speaker attribution, two tiers

**Chose** a regex tier on the episode title, falling through to per-claim 70b
inference. **Over** pyannote acoustic diarization.
**Because** no audio was downloaded, and more importantly **diarization separates
speakers but cannot name them.** Text can name the guest.
**Cost:** no labelled set, so coverage is measurable but precision is not.

Result: 683 participant rows, 220 of 286 episodes with named guests. Confidence
banded HIGH / MED / LOW / UNKNOWN.

### D7. Model tiering: 70b for extraction, 8b for routing

**Chose** two models. **Over** one everywhere.
**Because** extraction output is a dependency for four later stages, whereas
routing only picks one of eight labels. 8b routes at 87.5%, 70b at 95.8%.
**Cost:** extraction is the largest single line in the credit budget.

> **Follow-up: "You measured 70b at 95.8% routing. Why ship the 8b at 87.5%?"**
> This is a real tension and worth being precise. The shipped router is 8b for
> latency and cost on the request path; the 95.8% figure shows what the ceiling
> looks like. The honest framing is that an 8.3-point accuracy gap on routing is
> recoverable because an unrecognised label falls back to SEARCH, which is the
> most general agent. A misroute degrades the answer; it does not break it.

### D8. Pre-compute temporal drift

**Chose** compute drift pairs in the pipeline. **Over** comparing at query time.
**Because** it keeps an LLM call out of the request path, lets the temporal agent
answer with plain SQL, and protects the latency budget.
**Cost:** stale between pipeline runs.

Constraints on a valid pair: >30 day gap, claim length >50 chars, UNKNOWN
speakers excluded. Result: 823 pairs across five drift types.

### D9. Add a graph store

**Chose** Neo4j alongside Snowflake. **Over** vector search alone.
**Because** "who appeared with whom" is a traversal, not a similarity, and vector
search cannot answer it at any top-k. **Cost:** a second store to keep consistent.

Confidence is encoded **in the edge type** rather than as a property:
`MADE_CLAIM` (63,274, high confidence) vs `LIKELY_MADE_CLAIM` (7,507, medium) vs
`DISCUSSED_IN` (13,479, unknown speaker).

> **Follow-up: "Why encode confidence in the relationship type instead of a
> property?"**
> Because Cypher traversals filter on type cheaply, and it makes the confidence
> impossible to ignore. A property can be forgotten in a query; a type cannot.
> The cost is that changing the banding means rewriting edges rather than
> updating a field.

### D10. Route first, then dispatch

**Chose** one router plus eight specialists. **Over** one agent holding every
tool. **Because** one prompt per job, routing is measurable against 48 labelled
queries, and failures stay contained.
**Cost:** a misroute sends the query to entirely the wrong specialist.

Only `Search -> Summarize` is chained. Everything else is single-hop.

### D11. Cross-family LLM judge

**Chose** GPT-4o judging llama output. **Over** llama grading llama.
**Because** a model is a weak critic of itself and shared blind spots go
undetected. **Cost:** an external API call, so it runs selectively.

---

## The nine agents

| # | Agent | Intent | Model | Latency |
|---|---|---|---|---|
| 01 | Router | — | llama3.1-8b | — |
| 02 | Search | SEARCH | no LLM | 1.5s |
| 03 | Summarization | SUMMARIZE | llama3.1-70b | 3.5s |
| 04 | Knowledge graph | GRAPH | 70b + Cypher | 4.5s |
| 05 | Temporal | TEMPORAL | SQL + 70b | 3.8s |
| 06 | Fact-check | FACTCHECK | Cortex + Brave | 2.5-5.5s |
| 07 | Comparison | COMPARE | 2 SQL + 70b | 4.0s |
| 08 | Recommendation | RECOMMEND | SQL + 70b | 2.0s |
| 09 | Insight | INSIGHT | 5 SQL + 70b | 4.2s |

Two details worth volunteering:

- **Graph agent self-heals.** Generated Cypher is retried up to 3 times on
  malformed output.
- **Recommendation degrades gracefully.** It falls back through looser filters so
  narrow asks still return something.
- **Fact-check pre-filters.** Cortex answers first; only uncertain claims reach
  the Brave web API, which keeps external calls off the common path.

---

## Numbers

### Corpus
25 channels · 286 episodes · 44 months · 13,807 chunks · 768-dim embeddings · 100% embedded

### Graph
| Node | Count | | Edge | Count |
|---|---|---|---|---|
| Claim | 84,260 | | ABOUT | 84,260 |
| Topic | 3,786 | | SOURCED_FROM | 84,260 |
| Person | 466 | | MADE_CLAIM | 63,274 |
| Episode | 286 | | DISCUSSED_IN | 13,479 |
| Channel | 25 | | LIKELY_MADE_CLAIM | 7,507 |

### Evaluation, 110 test queries across 6 scripts

| Dimension | Result | Target | |
|---|---|---|---|
| Router accuracy (70b) | 95.8% | > 90% | exceeds |
| Retrieval MRR | 0.775 | > 0.70 | exceeds |
| BERTScore F1 | 0.774 | > 0.70 | exceeds |
| LLM relevance | 4.4 / 5 | > 4.0 | exceeds |
| Cost per query | $0.0012 | < $0.01 | exceeds |
| Pipeline KPI checks | 7 / 7 | 7 / 7 | pass |
| **LLM faithfulness** | **2.4 / 5** | > 4.0 | **below** |
| **LLM groundedness** | **2.7 / 5** | > 4.0 | **below** |
| **p95 latency** | **16.3s** | < 5s | **below** |

### Cost per agent
Summarize $0.00218 · Compare $0.00212 · Recommend $0.00146 · Fact-check $0.00140
· Temporal $0.00116 · Insight $0.00115 · Search and Graph $0.000018 (embedding
only, no generation)

---

## Failure modes

| Failure | Handling |
|---|---|
| Router picks the wrong intent | unrecognised label falls back to SEARCH |
| Generated Cypher is malformed | 3-attempt self-healing retry |
| Recommendation filters too narrow | falls back through looser filters |
| Speaker unidentifiable | banded UNKNOWN, excluded from drift analysis |
| Extraction run interrupted | checkpoint JSON makes ingestion resumable |
| Cortex cold start | **unmitigated, and it is why p95 is 16.3s** |

---

## The latency answer

You will be asked. Have this ready and lead with it.

> p95 is 16.3 seconds against a 5-second target. Mean is 12.6. The cause is
> Snowflake Cortex cold start on an X-SMALL warehouse. Scaling to M or L plus
> keep-warm queries brings it to 6-8 seconds, which I did not do because the
> credit budget was the binding constraint. For context, comparable hosted models
> sit in a similar range: GPT-4o at 5-15s and Claude at 8-20s for long
> completions. But I am not going to pretend the target was met.

**Why this answer works:** it names the number, the cause, the fix, the reason
the fix was not applied, and the context, without hiding behind the context.

---

## The faithfulness answer

Harder, and more important.

> Faithfulness scored 2.4 out of 5 and groundedness 2.7, both against a 4.0
> target. That is the weakest part of the system and it is on the page. The
> diagnosis is that the summarization agent synthesises across retrieved chunks
> and the judge penalises synthesis that is not traceable to a single chunk. Two
> fixes I would make: constrain the summarizer to cite per sentence rather than
> per answer, and add a post-generation citation verifier of the kind I built for
> SAGE, which got groundedness to 100% there.

**Cross-referencing your own SAGE work as the fix is a strong move.** It shows
the projects are one body of work rather than nine unrelated repos.

---

## Anticipated questions

**"Why Snowflake Cortex rather than calling OpenAI directly?"**
The data is already in Snowflake. Cortex runs the model next to the data, so no
egress and no separate credential path, and claim extraction over 13,807 chunks
is a bulk SQL operation rather than 13,807 API calls. The cost is being tied to
the models Snowflake offers, and the cold-start latency that shows up in p95.

**"84,260 claims from 13,807 chunks is 6.1 per chunk. Is that plausible?"**
It is about one assertion per 20 seconds of speech, which is reasonable for
conversational content when you count FACT, PREDICTION, OPINION and STATISTIC as
separate claims. Worth conceding that no precision audit was run on extraction
quality, only volume.

**"How do you know the graph is consistent with Snowflake?"**
It is exported, not synced. Concede this: it is a batch export, so the graph is
as fresh as the last pipeline run. A production version would need CDC or a
scheduled reconciliation, and the correct answer is that a second store is a
consistency liability you take on deliberately.

**"What would you do differently?"**
Three things: measure extraction precision against a hand-labelled sample rather
than only counting volume; add per-sentence citation to fix faithfulness; and
size the warehouse for the latency target rather than the credit budget.

**"Which part was hardest?"**
Speaker attribution. There is no signal in the captions themselves, the acoustic
route was closed by the decision not to download audio, and there is no ground
truth to measure against. It is the one part of the system where you can measure
coverage but not correctness.

---

## Adjacent theory to be ready for

- Chunking strategies and why fixed beat semantic here (fundamentals §7)
- MRR vs recall@k vs NDCG
- Why LLM-as-judge needs a different model family
- Graph vs vector: what each can and cannot answer
- Snowflake VARIANT, LATERAL FLATTEN, micro-partitions
- dbt views vs tables vs incremental models
- LangGraph StateGraph, and how it differs from a plain chain

---

## Gaps to concede

- p95 latency 3x over target
- Faithfulness and groundedness both below target
- Speaker attribution precision unmeasured
- Claim extraction precision unmeasured
- Graph and warehouse consistency is batch, not CDC
- Shipped router is 8b at 87.5%, not the 70b at 95.8%
