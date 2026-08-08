# Interview preparation

Deep technical breakdowns of every project, written to survive an engineer
probing them for forty minutes rather than a recruiter skimming for keywords.

## How to use this

Each project file follows the same structure, so you can rehearse the same
shapes across all nine:

| Section | What it gives you |
|---|---|
| **Pitch ladder** | 20-second, 2-minute and 10-minute versions of the same project |
| **The problem** | why it was hard, stated so the difficulty is obvious |
| **Architecture** | the data flow, component by component |
| **Decisions** | every fork in the road: chose / over / because / cost |
| **Numbers** | what was measured, and what each number does and does not prove |
| **Failure modes** | what breaks, what you did about it, what you did not |
| **Questions** | anticipated probes with answers, from shallow to hostile |
| **Adjacent theory** | the concepts an interviewer will pivot to from here |
| **Gaps** | what you should be ready to concede |

## Reading order

If you have limited time, prepare in this order. It matches the ranked order on
the site, which is ranked by how much each project moves a hiring decision.

| # | Project | Strongest for | File |
|---|---|---|---|
| 1 | PodcastIQ | AI / data platform hybrid | [01-podcastiq.md](01-podcastiq.md) |
| 2 | Food Inspection | data engineering, and the only live one | [02-food-inspection.md](02-food-inspection.md) |
| 3 | SAGE | AI safety, evaluation rigour | [03-sage.md](03-sage.md) |
| 4 | DocuParse | ML on unstructured data, build-vs-buy | [04-docuparse.md](04-docuparse.md) |
| 5 | IMDb Analytics | warehouse internals, physical tuning | [05-imdb.md](05-imdb.md) |
| 6 | META TradePulse | streaming, quantitative modelling | [06-meta-tradepulse.md](06-meta-tradepulse.md) |
| 7 | ReflexAI | RAG architecture, domain reasoning | [07-reflexai.md](07-reflexai.md) |
| 8 | NYPD Crime | dimensional modelling, SCD | [08-nypd.md](08-nypd.md) |
| 9 | CourtVision | multi-agent, pragmatic constraints | [09-courtvision.md](09-courtvision.md) |

Two supporting files:

- **[00-fundamentals.md](00-fundamentals.md)** — the concepts these projects sit
  on. Read this first. Most follow-up questions land here rather than on the
  project itself.
- **[10-platform.md](10-platform.md)** — the portfolio site and its live
  pipeline as an engineering artifact. Frontend, infrastructure, security and
  accessibility decisions, which is the material for a full-stack or platform
  conversation.

## The pitch ladder, all nine

Memorise the 20-second version. It is what you say when someone asks "tell me
about a project you're proud of," and it has to end somewhere the interviewer
wants to ask a follow-up.

**PodcastIQ**
> A nine-agent search platform over 286 podcast episodes. The pipeline pulls
> captions, chunks them on fixed 120-second windows, extracts 84,260 claims with
> an LLM, and builds an 88,823-node graph so you can ask who said what, when, and
> whether they later contradicted themselves. A router picks one of eight
> specialist agents. It costs about a tenth of a cent per query.

**Food Inspection**
> Three cities publish restaurant inspections in three incompatible shapes:
> Chicago packs violations into one delimited string, Dallas spreads them across
> 25 numbered columns, New York already emits one row per violation. I unified
> them at violation grain in a star schema. It is running live right now on a
> scheduled job into Postgres, and the site reads from that database.

**SAGE**
> An enterprise compliance assistant on GPT-4o that answers policy questions with
> citations. The interesting part is the security: I designed nine families of
> prompt-injection attack against it, then built eight defensive layers, and the
> final suite blocks 37 of 37 attacks while passing 25 of 25 legitimate queries.

**DocuParse**
> A document intelligence pipeline for SEC filings. Detectron2 finds table
> regions, LayoutLMv3 reads structure, and 676 pages process in about three
> minutes at $1.05 per thousand pages against a cloud floor of $1.50. I priced
> the build-versus-buy rather than asserting it.

**IMDb Analytics**
> An AWS warehouse over 190 million rows from seven IMDb datasets. S3 to Glue to
> a Redshift Serverless star schema with five conformed dimensions. The part I
> would want to talk about is the physical tuning: DISTKEY on the fact join,
> DISTSTYLE ALL on the small dimensions, SORTKEY on date.

**META TradePulse**
> A real-time trading signal platform. A Dockerised Kafka producer feeds PySpark
> Structured Streaming that computes technical indicators in-stream, persisted to
> Snowflake through Streams and Tasks. On top of that, 70-plus features and
> twelve models across five families, evaluated walk-forward.

**ReflexAI**
> A stock and macro risk platform built on Soros's reflexivity idea. Two
> independent retrieval paths, one over annual financial statements and one over
> a conceptual corpus, converging at exactly one synthesis point. Keeping them
> separate is what stops a framework quote coming back as though it were a
> figure.

**NYPD Crime**
> An end-to-end dimensional model for NYPD arrest data. Seven dimensions, two of
> them SCD Type 2, orchestrated incrementally through Azure Data Factory into
> Snowflake. The Type 2 choice is the one worth explaining: precinct boundaries
> and demographic coding change, and a Type 1 overwrite would silently rewrite
> history.

**CourtVision**
> Three coordinated Gemini agents for basketball coaching. The design decision I
> like is confidence: instead of asking the model how sure it is, I derive
> confidence from how many sources grounded the answer, because source count is
> observable and self-assessment is not.

## Question taxonomy

Interviewers probe in four escalating modes. Each project file answers all four.

| Mode | Looks like | What they are testing |
|---|---|---|
| **Clarifying** | "What does the router actually do?" | can you explain your own work |
| **Depth** | "Why 120-second windows and not 90?" | did you decide or did you default |
| **Alternative** | "Why not Airflow here?" | do you know the landscape |
| **Hostile** | "R² of 0.99 on a price target sounds wrong." | do you defend or concede honestly |

**The hostile mode is where offers are won.** The correct response is almost
never a defence. On that R² question the answer is *"You're right, and I say so
on the page: a lagged close explains nearly all of it. The number that carries
information is the 59% directional accuracy."* Conceding a real weakness before
being pushed reads as senior. Defending it reads as junior.

## Things to concede rather than defend

Have these ready. Volunteering them is a strength.

| Project | Concede |
|---|---|
| PodcastIQ | p95 latency is 16.3s against a 5s target; faithfulness and groundedness both scored below target |
| PodcastIQ | speaker attribution has no labelled set, so coverage is measurable but precision is not |
| Food Inspection | severity is not comparable across cities and the dashboard says so |
| SAGE | every defensive layer is somewhere a legitimate query can be wrongly blocked |
| DocuParse | two extraction code paths and two overlapping pipelines to maintain |
| IMDb | the published repo still documents the older Azure build, so the page omits the link |
| TradePulse | the R² is measuring the wrong target |
| ReflexAI | risk dimensions are interpretive, so two analysts could weight them differently |
| NYPD | cleaning logic lives in Alteryx, so it is not version controlled |
| CourtVision | in-memory session store, no persistence, correct for a hackathon and wrong for production |

## Open items to fill in before interviewing

Things only you can answer. They are marked **VERIFY** in the project files.

- **TradePulse**: Spark `processingTime` trigger interval; whether Snowflake used
  triggered tasks or `SCHEDULE = '1 MINUTE'`; how many Kafka topics and what each
  carried.
- **DocuParse**: hardware the 676 pages in ~3 minutes was measured on.
- **NYPD**: total row count of the arrest fact table.
- **SAGE**: size of the policy corpus in documents and chunks.
