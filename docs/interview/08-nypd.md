# NYPD Crime Analytics Pipeline

**End-to-end dimensional model: ADF, Alteryx, Snowflake, SCD Type 2, Power BI and
Tableau.**
The purest classic-data-engineering project in the set. If an interviewer wants to
test dimensional modelling and slowly changing dimensions, this is the one to
reach for, and the SCD Type 2 decision is the best answer in your portfolio for
"why does history matter."

---

## Pitch ladder

### 20 seconds
> An end-to-end dimensional model for NYPD arrest data. Seven dimensions, two of
> them SCD Type 2, orchestrated incrementally through Azure Data Factory into
> Snowflake. The Type 2 choice is the one worth explaining: precinct boundaries and
> demographic coding change, and a Type 1 overwrite would silently rewrite history.

### 2 minutes
> Six stages. Profiling first, which found missing law category codes, inconsistent
> age group formats and geolocation gaps, all of which changed the model: missing
> law category decides whether `DIM_LAW` can be `NOT NULL`, and geolocation gaps
> decide whether location can be a conformed key.
>
> Then modelling in ER/Studio: `FACT_ARRESTS` at arrest-event grain with seven
> dimensions. Two carry history as SCD Type 2.
>
> Cleaning is deterministic rules in Alteryx rather than ad-hoc notebook code,
> because the same input must always produce the same output and a reload must
> reproduce the identical result.
>
> ADF orchestrates incrementally with parameterised pipelines, Snowflake loads via
> MERGE because truncate-and-reload would destroy the surrogate keys the fact table
> points at, and the same star schema is served through both Power BI and Tableau.

### 10 minutes
Walk the six stages, then spend most of the time on SCD Type 2 and MERGE.

---

## The problem

| Property | Why it hurts |
|---|---|
| Fragmented questions | crime questions span time, geography and demographics with no single place to ask all three |
| **Shifting reference data** | precinct boundaries and demographic coding change, so last year's numbers stop matching |
| Dirty source | missing law categories, inconsistent age formats, geolocation gaps |
| Continuously growing | the source is year-to-date and never stops |

**The sentence that frames it:** the hard part is not the volume, it is that the
*dimensions* change. A borough is stable; a precinct boundary is not.

---

## Architecture

```
01 PROFILE       Python / ydata-profiling   before modelling, not after
02 MODEL         ER/Studio                  star schema, 7 dims, 2 SCD2
03 CLEAN         Alteryx                    deterministic rules
04 ORCHESTRATE   Azure Data Factory         parameterised, incremental, ADLS
05 WAREHOUSE     Snowflake                  MERGE for SCD1 and SCD2
06 SERVE         Power BI + Tableau         both, deliberately
```

---

## The model

**Fact:** `FACT_ARRESTS`, one row per arrest event, keyed on `ARREST_KEY`.

| Dimension | Contents | History |
|---|---|---|
| `DIM_DATE` | calendar attributes: day, week, month, year | Type 1 |
| `DIM_BOROUGH` | borough lookup, codes standardised in Alteryx | Type 1 |
| `DIM_PRECINCT` | precinct lookup for hotspot analysis | Type 1 |
| **`DIM_LOCATION`** | geography, with validity date ranges | **Type 2** |
| `DIM_OFFENSE` | offense description and level | Type 1 |
| `DIM_LAW` | law category code | Type 1 |
| **`DIM_PERPETRATOR`** | age group, race, sex | **Type 2** |

Surrogate keys throughout, with natural keys retained for lineage.

---

## Decisions

### D1. Profile before modelling

**Chose** profile first. **Over** modelling from the published column list.
**Because** open data documentation and actual values disagree; missing law
category decides whether `DIM_LAW` can be `NOT NULL`; geolocation gaps decide
whether location can be a conformed key.
**Cost:** a pass that produces no user-facing output.

**Note how specific the payoffs are.** "Profiling is good practice" is a platitude.
"Missing law category decides whether `DIM_LAW` can be `NOT NULL`" is an engineer
talking.

### D2. SCD Type 2 on location and perpetrator

**Chose** Type 2 on two dimensions. **Over** Type 1 overwrite everywhere.
**Because** precinct boundaries and demographic coding change over time; Type 1
would silently rewrite history and break year-over-year comparisons; validity date
ranges keep an arrest attributed to the geography it happened in.
**Cost:** every dimension read needs a validity predicate, and rows multiply per
change.

> **The concrete failure this prevents:** an arrest from 2019 reporting under a
> precinct boundary that did not exist in 2019. Nobody notices, because the query
> succeeds and returns a plausible number. That is the worst class of data bug.

> **Follow-up: "Why only two dimensions and not all seven?"**
> Type 2 is not free, so it goes where history is genuinely *different* rather
> than merely *corrected*. A misspelled offense description is a correction, and
> overwriting it is right. A precinct boundary redraw is a genuine change of
> state, and both versions are true for their period. The test I applied is
> whether an old fact row should keep pointing at the old value; if yes, Type 2.

> **Follow-up: "How do you query a Type 2 dimension?"**
> Join on the surrogate key that was current at the fact's event date, or filter
> on `WHERE effective_from <= event_date AND event_date < effective_to`. The
> common bug is joining on the natural key and forgetting the predicate, which
> silently multiplies rows by the number of historical versions.

### D3. Deterministic rules in Alteryx

**Chose** Alteryx workflows. **Over** ad-hoc cleaning in notebooks.
**Because** the same input must always produce the same output; rules are
inspectable by someone who does not read Python; a reload reproduces the identical
result.
**Cost:** logic lives in a visual tool rather than in version-controlled code.

> **Follow-up: "Would you make that choice again?"**
> Honest answer: the determinism argument holds, the version control cost is real,
> and today I would put the transforms in dbt, which gives determinism *and*
> version control *and* tests, while keeping the SQL readable by an analyst. The
> Alteryx choice made sense in that stack and would not be my default now.

**Being willing to say "I would not do that again" about your own choice is a
strength**, provided you explain the reasoning that made it right at the time.

### D4. Incremental and parameterised

**Chose** incremental loads through parameterised ADF pipelines. **Over** full
reload on every run.
**Because** the source is year-to-date and grows continuously; one parameterised
pipeline serves every dimension instead of one each; a failed run resumes rather
than restarting.
**Cost:** watermark state to manage, and a subtle watermark bug can skip rows
silently.

> **Cross-reference:** you hit exactly that class of bug in the live food
> inspection pipeline, where a window boundary silently excluded an entire city.
> Mentioning it shows the stated cost is not theoretical to you.

### D5. MERGE, not truncate and reload

**Chose** MERGE. **Over** truncating the dimension and reloading.
**Because** truncating destroys the surrogate keys the fact table points at; MERGE
expires the old row and inserts the new one atomically; **it is the only pattern
that makes Type 2 correct.**
**Cost:** MERGE statements are long and easy to get subtly wrong, so they need
their own tests.

> **Follow-up: "Walk me through the Type 2 MERGE."**
> Two logical operations. Match on natural key where the row is current and the
> tracked attributes have changed: set `effective_to` and clear the current flag.
> Then insert the new version with a fresh surrogate key, the new attributes,
> `effective_from` as of now and an open `effective_to`. Snowflake cannot both
> update and insert for the same source row in one MERGE, so the usual pattern is
> a two-step: a MERGE that expires, then an INSERT for the new versions, or a
> single MERGE fed by a union that duplicates changed rows with a flag.

**That last detail is the one that separates people who have written a Type 2
MERGE from people who have read about one.**

### D6. Build in both Power BI and Tableau

**Chose** both. **Over** picking one and standardising.
**Because** the same star schema had to prove it serves either tool, and a model
that only works in one BI tool is coupled to that tool.
**Cost:** two dashboards to keep in sync when the model changes.

---

## Findings from the dashboard

| Figure | Meaning |
|---|---|
| 152,034 | arrests, ages 25 to 44, largest age group |
| 122,049 | largest race category of the recorded distribution |
| 72,325 | Brooklyn arrests, highest borough |
| 22,957 | peak month, August 2024 |
| 9,887 | Precinct 14, highest single precinct |

**Top offences:** Assault 3 and related · Petit larceny · Felony assault ·
Dangerous drugs

**A caution worth voicing unprompted:** these are *arrest* counts, not crime
counts, and arrest data reflects policing activity as well as underlying
behaviour. A demographic distribution in arrest data is a statement about arrests.
Saying this before being asked signals that you understand what the data can and
cannot support, which matters a great deal in this domain.

---

## Validation

Three classes, run in DBeaver:

1. **Referential integrity** — no orphan fact rows
2. **Null checks** — required fields populated
3. **Conformance** — standardised codes match the dimension domain

---

## Anticipated questions

**"How many rows in the fact table?"** **(VERIFY)** — know this number.

**"How do you handle a late-arriving dimension?"**
Insert an inferred member with the natural key and unknown attributes so the fact
row has something to point at, then update it when the real record arrives. The
alternative, holding the fact back, means the fact table silently under-reports.

**"What if the source reissues a corrected arrest record?"**
The fact is keyed on `ARREST_KEY`, so a correction is an update to an existing
row rather than an insert. That is Type 1 behaviour on the fact, which is right:
a corrected arrest record does not mean two arrests happened.

**"Why Snowflake and not Synapse, given the Azure stack?"**
Fair challenge given ADF is Azure. Snowflake's separation of storage and compute
and its MERGE semantics suited the SCD work, and staying vendor-neutral in the
warehouse is defensible. Concede that Synapse would have been the more coherent
choice for a purely Azure pipeline.

**"What is the weakest part?"**
Cleaning logic in Alteryx, because it is not version controlled and cannot be code
reviewed. That is the piece I would move to dbt.

---

## Adjacent theory

- SCD types 0 through 6, and when each applies (fundamentals §1)
- Surrogate vs natural keys, and why the fact points at the surrogate
- MERGE semantics and the two-step Type 2 pattern
- Fact grain and additivity
- Incremental loading, watermarks, and silent row loss
- Conformed dimensions across marts
- Star schema portability across BI tools

---

## Gaps to concede

- Alteryx logic is not version controlled
- Fact row count not stated **(VERIFY)**
- Arrest data measures policing activity, not crime
- Two dashboards to keep in sync
- Snowflake inside an otherwise-Azure stack is a defensible but debatable choice
