# Fundamentals

The concepts your projects sit on. **Most follow-up questions land here rather
than on the project itself**, because an interviewer who believes you built the
thing then wants to know whether you understand what you built.

Each section gives the answer, then the follow-up they will ask next.

---

## 1. Dimensional modelling

### Star schema vs snowflake vs one wide table

| Shape | What it is | Cost |
|---|---|---|
| **Star** | one fact table, dimensions one join away, dimensions denormalised | some redundancy inside dimensions |
| **Snowflake** | dimensions further normalised into sub-dimensions | more joins per query |
| **One wide table** | everything flattened into one | text repeats per row, updates rewrite everything |
| **3NF** | fully normalised | six joins to answer a business question |

**Your answer, from IMDb:** a wide table repeats title text 90 million times in
the principals join. 3NF needs six joins for a genre-by-year question. A star is
the compromise, and the cost is joins at query time plus surrogate keys to
maintain.

**Follow-up: "When would you NOT use a star schema?"**
When the access pattern is not analytical. An OLTP system serving single-record
lookups wants normalisation. A feature store serving a model wants a wide table
because the model reads every column at once. A star is for slice-and-dice
aggregation, which is what BI does.

### Grain

The grain is what one row of the fact table means. **Declare it before anything
else.** Every design error downstream traces back to an undeclared grain.

- NYPD: one row per arrest event
- IMDb: one row per title
- Food Inspection: one row per violation per inspection

**Follow-up: "Why violation grain and not inspection grain for food?"**
Because Dallas carries many violations per inspection and Chicago packs them
into one string. Inspection grain would need an array column and would block
every violation-level question. Violation grain is the only grain all three
cities can reach without inventing data. The cost is that inspection-level
counts now need a `DISTINCT`, which is easy to forget.

### Conformed dimensions

A dimension is conformed when multiple facts or marts share the same one.
`dim_date` is the canonical example: every mart reuses it rather than defining
its own calendar.

**Why it matters:** without conformance you cannot join across marts. Two marts
with two different `dim_date` tables cannot be compared, and the difference will
be discovered by someone reconciling two numbers that should match.

### Slowly Changing Dimensions

| Type | Behaviour | Use when |
|---|---|---|
| **Type 0** | never changes | true immutables |
| **Type 1** | overwrite in place | corrections, where history is wrong not different |
| **Type 2** | expire the old row, insert a new one with validity dates | the past must stay attributed to the world it happened in |
| **Type 3** | keep a "previous value" column | exactly one prior state matters |
| **Type 4** | history in a separate table | history is queried rarely |
| **Type 6** | 1 + 2 + 3 combined | you need both current and historical views |

**Your answer, from NYPD:** Type 2 on location and perpetrator. Precinct
boundaries and demographic coding change over time. A Type 1 overwrite would
silently rewrite the past, so an arrest from 2019 would report under a geography
that did not exist then, and year-over-year comparisons would break without
anyone noticing.

**Follow-up: "What does Type 2 cost you?"**
Every dimension read needs a validity predicate, so a forgotten
`WHERE current_flag = true` silently double-counts. Rows multiply per change.
And the MERGE that maintains it is long and easy to get subtly wrong, which is
why it needs its own tests.

**Follow-up: "Why MERGE and not truncate-and-reload?"**
Truncating destroys the surrogate keys the fact table points at. Every fact row
becomes an orphan. MERGE expires the old row and inserts the new one atomically,
and it is the only pattern that makes Type 2 correct.

**Follow-up: "How do you handle a late-arriving dimension?"**
Insert an inferred member with the natural key and unknown attributes, so the
fact row has something to point at, then update it when the real record arrives.
The alternative, holding the fact row back, means your fact table silently
under-reports.

---

## 2. Medallion architecture

Bronze (raw, as published) → Silver (cleaned, conformed) → Gold (modelled,
serving).

**Why the layering exists, in your own terms:** separation of concerns,
reprocessing without data loss, scalability to more sources, and an audit trail.

**The argument that lands:** bronze is never rewritten, so a wrong regex costs a
rerun rather than a re-download and a lost original. If you conform on ingest and
your parse is wrong, you have destroyed the evidence.

**Follow-up: "Isn't that three copies of the same data?"**
Yes, and storage is the cheapest thing in the stack. The expensive things are
re-fetching from a source that may have changed, and being unable to prove where
a number came from.

**Follow-up: "How is this different from a data lake?"**
A lake is a storage pattern; medallion is an organisational one. You can
implement medallion on a lake, a warehouse, or a lakehouse. The layering is about
what guarantees each layer offers, not where the bytes sit.

---

## 3. Warehouse internals

### Distribution and sort keys (Redshift)

| Choice | What it does | When |
|---|---|---|
| `DISTKEY` | co-locates rows with the same key on the same slice | the large join key |
| `DISTSTYLE ALL` | replicates the whole table to every node | small dimensions |
| `DISTSTYLE EVEN` | round-robin | no obvious join key |
| `SORTKEY` | physically orders blocks, enables zone-map skipping | the common filter column |

**Your answer, from IMDb:** DISTKEY on the fact join key so the largest join
happens on-node instead of redistributing 90 million rows across slices.
DISTSTYLE ALL on the small dimensions so joining them never broadcasts. SORTKEY
on the date column because nearly every question is bounded by year.

**Follow-up: "What happens if you get DISTKEY wrong?"**
Redshift redistributes at query time. You see it in the query plan as
`DS_BCAST_INNER` or `DS_DIST_BOTH`. The query still returns, it is just slow in a
way that gets worse as the table grows.

**Follow-up: "Why COPY and not INSERT?"**
COPY loads in parallel across slices and is the intended bulk path. Row-by-row
INSERT at 190M rows is orders of magnitude slower and generates far more WAL.

### Snowflake equivalents

Snowflake has no DISTKEY. It uses **micro-partitions**, roughly 50 to 500 MB of
compressed columnar data, with automatically maintained metadata (min, max,
distinct counts) per partition. Pruning happens off that metadata.

**Clustering keys** are the closest analogue to SORTKEY, and you generally do not
need one until a table is in the multi-terabyte range.

**Follow-up: "So what do you tune in Snowflake?"**
Warehouse size, which is compute, and the clustering key on very large tables.
Most Snowflake performance work is actually query shape and avoiding
`SELECT *` on wide tables, because it is columnar and you pay for the columns you
touch.

**Follow-up: "Explain Streams and Tasks."**
A Stream is change-data-capture on a table: it records the delta since you last
consumed it, as an offset rather than a copy. A Task is a scheduled or triggered
piece of SQL. Together they give you an in-warehouse pipeline with no external
orchestrator. Standard tasks have a one-minute minimum schedule; triggered tasks
fire at most every 30 seconds by default, tunable to 10.

---

## 4. Streaming

### Batch vs micro-batch vs continuous

| Model | Latency | Example |
|---|---|---|
| Batch | minutes to hours | nightly job |
| **Micro-batch** | ~100ms floor, typically seconds | Spark Structured Streaming default |
| Continuous | ~1ms | Spark continuous mode, Flink |

**Key point for your TradePulse answer:** Structured Streaming with
`trigger(processingTime='10 seconds')` is genuinely sub-minute. Cron is not
streaming, and cron bottoms out at one minute everywhere.

### Watermarking and late data

A watermark tells the engine how long to wait for late events before finalising a
window. Set it too tight and you drop legitimate late data. Set it too loose and
state grows without bound.

**Follow-up: "What is the tradeoff you actually made?"**
Late-arriving data is handled by watermarking rather than a full recompute, which
is the reason to use Structured Streaming over a cron batch in the first place.
The cost is streaming state to size and checkpoint, and it is harder to debug
than a batch job.

### Delivery semantics

| Guarantee | Meaning |
|---|---|
| At-most-once | may lose, never duplicates |
| **At-least-once** | never loses, may duplicate |
| Exactly-once | neither, and expensive |

Exactly-once in Kafka is really *effectively-once*: idempotent producers plus
transactional writes plus an idempotent sink. If your sink upserts on a natural
key, at-least-once plus idempotency gets you the same outcome more cheaply.

**Your food inspection pipeline does exactly this:** the fact table upserts on
`(city, inspection_id, violation_seq)`, so re-processing the same row is a no-op.

### Why Kafka at all

**Your answer, from TradePulse:** four APIs with different rate limits and
failure modes. The log decouples producer failures from consumer failures, and a
consumer bug is fixable by replaying rather than re-fetching. The cost is a broker
to run and monitor for a single-ticker project.

**Follow-up: "Why not Kinesis or Pub/Sub?"**
Kafka is portable across clouds and has the richer ecosystem. Kinesis is simpler
to operate if you are already all-in on AWS. Pub/Sub is the easiest of the three
but has no log-replay semantics in the same shape. For a project meant to
demonstrate the pattern, Kafka is the one worth knowing.

---

## 5. Orchestration and idempotency

### Incremental vs full refresh

Full refresh is simpler and always correct. Incremental is cheaper and
introduces watermark state, which is the classic source of silent data loss.

**Your answer, from NYPD:** the source is year-to-date and grows continuously, so
incremental. One parameterised pipeline serves every dimension instead of one
each, and a failed run resumes rather than restarting. The cost is watermark
state, and a subtle watermark bug can skip rows silently.

**Follow-up: "How do you protect against that?"**
Rewind the watermark by a safety margin on each run and rely on an idempotent
upsert to absorb the overlap. Your food pipeline rewinds seven days before the
high-water mark because Socrata amends recently published records, so resuming
exactly at the watermark would silently miss late edits.

### Idempotency

A job is idempotent if running it twice produces the same result as running it
once. This is the single most useful property in data engineering, because it
makes retries safe and turns "did this half-run?" into a non-question.

Ways to get it: upsert on a natural key, content-hash the source and skip
unchanged inputs, partition-overwrite rather than append, or make the whole run
transactional.

### Advisory locks

Two concurrent runs of the same pipeline will deadlock or double-write. A
Postgres advisory lock is the cheapest guard: the second run sees the lock held
and exits cleanly rather than corrupting state.

**This is not theoretical for you.** Your food pipeline hit a real
`DeadlockDetected` on `dim_establishment` because two of your own runs
overlapped, which is exactly what the advisory lock now prevents.

---

## 6. Data quality and profiling

### Why profile before modelling

**Your answer, used in three projects:** documented types and actual values
disagree in public data. Cardinality decides what can be a dimension key. Null
density decides what can be `NOT NULL`. The cost is a pass that produces no
user-facing output, which is why it gets skipped.

**Concrete payoffs you can cite:**
- IMDb encodes missing as the literal string `\N`, not as null
- ZIP codes arrive as floats (`60614.0`) in more than one feed
- Dallas violation blocks past number five are over 99% empty, which is what
  made the unpivot selective

### Test classes worth naming

| Class | Catches |
|---|---|
| Schema | column added, removed, retyped |
| Not-null / uniqueness | key integrity |
| Referential | orphan fact rows |
| Range / domain | impossible values |
| Distribution | drift, where nothing is invalid but everything shifted |
| Freshness | the pipeline succeeded but the data is stale |

**Follow-up: "Which of those is most often missing?"**
Freshness and distribution. Most teams test that rows are valid and never test
that new rows arrived, so a silently-stopped pipeline looks healthy.

---

## 7. RAG and agents

### Chunking strategies

| Strategy | Good | Bad |
|---|---|---|
| Fixed size | predictable, cheap | splits mid-thought |
| Semantic | respects meaning | costs an LLM call, still imprecise |
| Structural (section boundary) | preserves citations | needs parseable structure |
| Sliding window | recovers edge context | duplicates content, hurts MRR |

**PodcastIQ chose fixed 120-second windows** because word-count chunking breaks
timestamp alignment, semantic chunking costs an LLM call and still lands
imprecisely, sliding windows duplicate content and hurt MRR, and 120 seconds
lands near 120 words which suits the embedding model. Cost: a window edge can
split a thought.

**SAGE chose section-boundary chunking** because the citation has to stay intact.
Different problem, different answer, and being able to explain why the two
differ is the point.

### Hybrid retrieval

Dense (embedding) retrieval finds semantic matches. Sparse (BM25 / keyword)
finds exact tokens. Hybrid re-ranks a weighted blend.

**SAGE used 0.6 semantic + 0.4 keyword** because policy language repeats, so
cosine similarity alone confuses adjacent clauses, and keyword overlap catches
exact section and policy IDs.

**Follow-up: "How did you pick 0.6/0.4?"**
Concede it: chosen by hand against the evaluation suite, not learned. A tuned
weight or a learned re-ranker would be the improvement.

### Retrieval metrics

- **MRR** (mean reciprocal rank): how high the first correct result ranks
- **Recall@k**: is the right chunk in the top k at all
- **NDCG**: rank-weighted, handles multiple relevant results
- **Faithfulness**: does the answer follow from retrieved context
- **Groundedness**: is every claim traceable to a source

**PodcastIQ measured MRR 0.775 against a 0.70 target**, and faithfulness 2.4/5
and groundedness 2.7/5 against a 4.0 target. **Volunteer the second pair.**

### Agent architecture

**Router-then-dispatch vs one agent with every tool.**

PodcastIQ routes first: one prompt per job, routing measurable against 48
labelled queries, failures stay contained. Cost: a misroute sends the query to
entirely the wrong specialist.

**Follow-up: "Why not let one agent hold all the tools?"**
It works until it does not, and then you cannot tell whether the failure was tool
selection, tool use, or synthesis. Routing makes the first of those three
measurable on its own.

### LLM-as-judge

Using a model to grade model output. **Use a different family than the one being
graded**: a model is a weak critic of itself and shared blind spots go
undetected. PodcastIQ grades llama with GPT-4o for exactly this reason.

---

## 8. Prompt injection and LLM security

Nine attack families, from SAGE:

1. Classic overrides ("ignore previous instructions")
2. Prompt exfiltration (reveal the system prompt)
3. Persona override ("you are now ClearBot")
4. Embedded injection (instructions hidden in a document)
5. Constraint bypass
6. Pipeline exfiltration
7. False attribution
8. Hypothetical framing ("in a story where...")
9. Social-engineering pretext (claimed authority)

**Defence in depth, because each layer misses something the next catches:**
regex alone misses semantic attacks like authority pretexts; a prompt-level
identity lock catches what patterns do not; post-generation citation checks catch
what both miss.

**Follow-up: "What is the cost of eight layers?"**
Every layer is a place a legitimate query can be wrongly blocked, which is why
the false-positive rate is tracked alongside the block rate. SAGE found and fixed
exactly one false positive with a word-boundary lookahead.

**Follow-up: "How do you know 100% block rate is real?"**
Concede the limit honestly: it is 37 of 37 *designed* vectors. It means the
attacks you thought of are covered. It does not mean the system is unbreakable,
and a red-teamer who has not seen your pattern list is the real test.

---

## 9. Evaluation honesty

The single most senior-sounding thing in your whole portfolio is that you publish
numbers that missed target.

- PodcastIQ: p95 16.3s against a 5s target, faithfulness 2.4/5, groundedness 2.7/5
- TradePulse: R² > 0.99 flagged as a warning sign rather than a result
- CourtVision: confidence described as a heuristic, not a calibrated probability

**The general principle:** a metric that cannot fail is not a metric. If every
number in your evaluation exceeds target, the targets were set after the fact.

### Time-series evaluation specifically

Random train/test splits leak. For anything temporal you need:

- **Walk-forward**: train on the past, test on the immediate future, roll forward
- **Purging**: drop training samples whose label window overlaps the test set
- **Embargo**: additionally drop samples immediately after the test set

**Follow-up: "Why does a random split leak on time series?"**
Because a row from 2024 in your training set tells the model about the market
regime that the 2023 test row lives in. The model does not learn a rule, it
learns the period. Performance collapses out of sample.

---

## 10. Cost engineering

**The pattern across your projects: price the alternative rather than asserting
it is expensive.**

- DocuParse: $1.05 per 1,000 pages against Azure Form Recognizer at $10 to $50,
  Google Document AI and AWS Textract at $1.50 to $50
- PodcastIQ: $0.0012 per query, with 70b for extraction and 8b for routing,
  because extraction output feeds four later stages and routing only picks one of
  eight labels
- CourtVision: a $25 credit budget drove the in-memory store and scale-to-zero

**Follow-up: "How would you decide build vs buy in general?"**
Total cost including your time, then the three things money does not buy: data
privacy, rate limits, and whether the tool is optimised for your specific
document type. DocuParse listed exactly those.

---

## 11. Questions to ask them

Asking good questions is scored. These come from your actual experience, which
makes them land.

- "How do you handle schema changes from upstream sources you do not control?"
- "What does your data quality testing cover beyond not-null and uniqueness? Do
  you test freshness?"
- "When a pipeline fails at 3am, what does the on-call person actually see?"
- "How do you evaluate LLM features? Is there a held-out set, or is it vibes?"
- "What is the oldest pipeline still running, and would anyone rewrite it the
  same way today?"
