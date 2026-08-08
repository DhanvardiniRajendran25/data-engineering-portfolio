# ReflexAI

**Stock and macro risk platform built on reflexivity.**
The most conceptually distinctive project in the set. Its value in an interview is
not the stack, which is modest, but the architectural idea: two independent
retrieval paths that converge at exactly one point, and the reasoning for why they
must stay separate.

Live at `https://reflex-ai-ai-powered-stock-and-macr.vercel.app/`.

---

## Pitch ladder

### 20 seconds
> A stock and macro risk platform built on Soros's reflexivity idea. Two
> independent retrieval paths, one over annual financial statements and one over a
> conceptual corpus, converging at exactly one synthesis point. Keeping them
> separate is what stops a framework quote coming back as though it were a figure.

### 2 minutes
> Most financial tools answer "what happened." This one asks "why is risk
> building, and how might it evolve." That framing drives everything.
>
> There are three data classes with different cognitive roles. Quantitative
> reality is the annual statements, the baseline truth risk is assessed against.
> The narrative layer is a corpus about reflexivity, which is the *lens* the
> numbers are read through, not more numbers. And intent is the user's question,
> routed against both.
>
> The design decision I would defend hardest is keeping those first two in
> separate retrieval paths. Statements are facts; the corpus is a way of reading
> facts. Mixing them into one index lets a framework quote be retrieved as though
> it were a figure, and keeping them apart is what makes the reasoning auditable.
>
> The other deliberate choice is annual data only. Reflexive loops play out over
> years, not sessions, so quarterly and intraday were excluded on purpose.

### 10 minutes
Walk the three data classes, the four risk dimensions, and the four decisions.

---

## The premise

| | |
|---|---|
| **Most tools answer** | What happened? |
| **This one asks** | Why is risk building, and how might it evolve? |

The loop it models:

1. Perceptions influence prices
2. Prices influence fundamentals
3. Narratives influence behaviour
4. Behaviour feeds back into reality

**The framing sentence:** markets are not purely efficient, and the premise is
that these four statements form a cycle where the interesting risk lives in the
cycle rather than in any single reading.

> **Follow-up: "Is this not just a chatbot with a finance prompt?"**
> The difference is architectural rather than promptural. A chatbot with a finance
> prompt has one retrieval path and no separation between fact and framework. Here
> the statements and the corpus are retrieved independently and joined once, which
> means you can always point at which lane produced which part of an answer. That
> auditability is the design, and it is not something a prompt can give you.

---

## The three data classes

| # | Class | Source | Role | Holds |
|---|---|---|---|---|
| 01 | **Quantitative reality** | yfinance | the baseline truth risk is assessed against | annual income statement, balance sheet, cash flow, light market snapshot |
| 02 | **Narrative and conceptual** | Soros knowledge corpus | the lens the numbers are read through | reflexivity as a framework, boom-bust sequence structure, feedback-loop reasoning patterns |
| 03 | **Intent** | user queries | what the analyst actually wants | ticker-aware market context, question routed against both layers |

**This is the most interesting thing about the architecture** and the part to
spend time on. Three sources with three *cognitive* roles, not three sources with
three schemas.

---

## The four risk dimensions

Named risks rather than a ratio table:

| Dimension | What it asks |
|---|---|
| **Liquidity risk** | can it survive stress without external financing; is cash adequate against obligations |
| **Leverage risk** | how much of the balance sheet depends on borrowed capital holding |
| **Profitability risk** | does earnings quality support the valuation being placed on it |
| **Narrative risk** | where has the story about a company detached from what its statements show |

**Narrative risk is the one that makes the project cohere.** It is the dimension
that only exists because of the reflexivity premise, and it is what the second
retrieval lane is for.

> **The line that lands:** a current ratio does not tell you whether a company
> survives stress. Naming the risk makes the output something to act on rather
> than something to read.

---

## Decisions

### D1. Annual data, deliberately

**Chose** annual statements only. **Over** quarterly filings, or intraday market
data.
**Because** it avoids short-term noise entirely; it aligns with macro and
structural analysis rather than trading signals; reflexive loops play out over
years, not sessions.
**Cost:** nothing here can answer a question about this quarter, by design.

> **Follow-up: "Annual data is four filings behind. Is that not useless?"**
> It is useless for trading and appropriate for structural risk, and those are
> different questions. A leverage problem that only appears in the quarterly is
> usually a timing artefact; a leverage problem visible across three annual
> statements is a trend. Choosing the cadence to match the question is the
> decision, and the cost is stated: it cannot answer anything about this quarter.

**Contrast this deliberately with META TradePulse**, which uses intraday
streaming. Two finance projects, opposite cadence choices, each correct for its
question. Being able to explain why is stronger than either alone.

### D2. Separate the corpus from the numbers

**Chose** two distinct data classes, retrieved separately. **Over** one combined
index of everything.
**Because** statements are facts and the corpus is a way of reading facts; mixing
them lets a framework quote be retrieved as though it were a figure; keeping them
apart makes the reasoning auditable.
**Cost:** two retrieval paths to maintain and keep aligned.

> **This is the strongest decision in the project.** It is a real RAG failure mode:
> if a conceptual passage and a financial figure sit in one index, cosine
> similarity will happily return the passage for a numeric question, and the model
> will present it with the same confidence as a fact.

### D3. Risk-focused diagnostics, not a ratio table

**Chose** four named risk dimensions. **Over** the standard ratio set.
**Because** a current ratio does not say whether a company survives stress, and
naming the risk makes the output actionable rather than descriptive.
**Cost:** the dimensions are interpretive, so two analysts could weight them
differently.

### D4. Explain the loop, not just the level

**Chose** model feedback between perception and fundamentals. **Over** reporting
current values and stopping.
**Because** most tools answer what happened, and the gap is why risk is building;
a level tells you where you are, a loop suggests where it goes.
**Cost:** explanations are narrative, so they are harder to validate than a
number.

---

## The five capabilities

| # | Capability | What |
|---|---|---|
| 01 | Fundamentals layer | annual statements normalised for downstream analysis |
| 02 | Risk diagnostics | the four named dimensions |
| 03 | AI market reasoning | retrieval over the reflexivity corpus, so explanations are grounded in a framework rather than improvised |
| 04 | Ticker-aware context | market context attached to the specific company |
| 05 | Pairs trading analysis | **experimental, included as a direction not a finished capability** |

**Labelling #05 as experimental is the right call** and worth pointing out. An
unfinished feature presented as finished is the thing a reviewer finds; an
unfinished feature labelled as a direction is a roadmap.

---

## The honest weakness, and how to handle it

**"How do you validate a narrative explanation?"**

This is the project's genuine soft spot and you should meet it directly.

> You largely cannot, and that is stated as the cost of decision four.
> Quantitative outputs are checkable: liquidity, leverage and profitability
> diagnostics compute from the statements and can be reconciled line by line.
> Narrative risk is interpretive, and two analysts could weight it differently.
>
> What the architecture does give me is **auditability rather than validation.**
> Because the two retrieval lanes are separate, I can always point at which lane
> produced which part of an answer, so a reader can see whether a claim came from
> a filing or from the framework. That is weaker than validation and stronger than
> a single blended index, where you cannot even tell the two apart.
>
> If I wanted validation, the route would be a labelled set of historical cases
> where narrative and fundamentals demonstrably diverged, and scoring the system
> on whether it flagged them. That is a real research project and I did not do it.

**This answer is good because it distinguishes auditability from validation**,
concedes the gap precisely, and describes what closing it would actually take.

---

## Anticipated questions

**"Why Soros specifically?"**
Reflexivity is one of the few frameworks that explicitly models the feedback
between perception and fundamentals, which is the thing a pure ratio analysis
cannot see. It is a lens with a defined structure, boom-bust sequences and
self-reinforcing loops, so it can be encoded rather than gestured at.

**"How large is the corpus?"**
Answer honestly with what you have; if you do not have the figure, say so rather
than guessing, and note that the corpus is deliberately small and curated rather
than scraped, because the lens should be coherent.

**"yfinance is unofficial and breaks. Is that a risk?"**
Yes, and it is the same dependency as TradePulse. It has no SLA and has broken
before. For annual data the mitigation is easier than for streaming: cache
aggressively, because annual statements change four times a decade, so a stale
cache is almost always still correct.

**"What would you build next?"**
Two things. Finish the pairs trading capability, which is currently a direction.
And build the historical validation set described above, because the project's
weakest claim is the one that most needs evidence.

**"What is the relationship between this and TradePulse?"**
Deliberately opposite. TradePulse is intraday, quantitative, and asks what the
price will do. ReflexAI is annual, structural, and asks whether risk is building.
Same domain, opposite time horizon, opposite epistemology.

---

## Adjacent theory

- RAG architecture: multiple indexes, routing, and why blending sources is a
  failure mode
- Retrieval separation and provenance in generated answers
- Financial statement analysis: liquidity, leverage, earnings quality
- Reflexivity and the limits of the efficient market hypothesis
- Auditability vs validation in generative systems
- Cadence selection: matching data frequency to question type

---

## Gaps to concede

- Narrative risk is interpretive and not validated
- Pairs trading is experimental and unfinished
- Depends on yfinance, which is unofficial
- Annual cadence cannot answer anything current, by design
- Two retrieval paths are two things to keep aligned
