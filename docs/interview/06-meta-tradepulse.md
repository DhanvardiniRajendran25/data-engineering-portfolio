# META TradePulse

**Real-time trading signal platform: Kafka, PySpark Structured Streaming,
Snowflake Streams and Tasks.**
The only streaming project in the set, which makes it the one to lead with for any
role that mentions Kafka, Spark or real-time. It also contains the single most
likely hostile question in your whole portfolio, and you should welcome it.

---

## Before you interview: three things to VERIFY

These numbers should be yours, not approximations. Fill them in.

1. **Spark trigger interval** — what was `trigger(processingTime=...)` set to?
2. **Snowflake tasks** — triggered tasks, or scheduled with `SCHEDULE = '1 MINUTE'`?
3. **Kafka topics** — how many, and what did each carry?

**Why #2 matters:** standard scheduled tasks have a **one-minute floor**.
Triggered tasks fire at most every 30 seconds by default, tunable to 10 via
`USER_TASK_MINIMUM_TRIGGER_INTERVAL_IN_SECONDS`. If you used scheduled tasks, the
"sub-minute" claim belongs to the Spark layer, not to the Snowflake hop, and you
should say so before someone else works it out.

---

## Pitch ladder

### 20 seconds
> A real-time trading signal platform. A Dockerised Kafka producer feeds PySpark
> Structured Streaming that computes technical indicators in-stream, persisted to
> Snowflake through Streams and Tasks. On top of that, 70-plus features and twelve
> models across five families, evaluated walk-forward.

### 2 minutes
> Four live sources with different rate limits and failure modes, so Kafka sits
> between source and compute. The log decouples producer failures from consumer
> failures, and a consumer bug is fixable by replaying rather than re-fetching.
>
> Structured Streaming rather than a cron batch because indicators are windowed by
> nature, which is what the API is for, and late-arriving data is handled by
> watermarking rather than a full recompute. The batch research code carried over
> with little change.
>
> Persistence uses Snowflake Streams and Tasks so transformation fires on actual
> change rather than on a guess about timing, and there is no external
> orchestrator to keep running for warehouse-local work.
>
> Then twelve models across five families including deliberate baselines, because
> an OLS and an AR(1) are the only way to know whether the tree models earned
> their complexity.

### 10 minutes
Walk the six stages, then **volunteer the R² problem before being asked.**

---

## The problem

| Property | Why it hurts |
|---|---|
| Four sources, four clocks | price, macro, search interest and sentiment all arrive differently |
| Different rate limits and failure modes | one API down should not stall the others |
| A stale signal is not a signal | latency is a correctness property here, not a nicety |
| Indicators are windowed | rolling means, volatility, MACD all need state |
| Financial ML leaks trivially | a lagged close explains almost all price variance |

---

## Architecture

```
01 INGEST      Dockerised Kafka producer   4 sources -> topic(s), replayable
02 COMPUTE     PySpark Structured Streaming  indicators in-stream, windowed,
                                             watermarked
03 PERSIST     Snowflake Streams + Tasks     fires on change, feature mart
04 MODEL       statsmodels / sklearn / arch  12+ models, 5 families
05 BACKTEST    walk-forward                  CAGR, Sharpe, Sortino, max drawdown
06 SERVE       Streamlit                     live alerts, equity curve
```

### The four sources

| Source | Via | Gives |
|---|---|---|
| Yahoo Finance | yfinance | historical OHLCV, 2020 to 2024 |
| FRED | FRED API | yields, VIX, oil, FX, inflation, crypto |
| Google Trends | PyTrends | search interest across Meta ecosystem keywords |
| News | NewsAPI + TextBlob | headline sentiment scores |

---

## Decisions

### D1. Kafka between source and compute

**Chose** a broker. **Over** polling each API directly from the transform job.
**Because** four APIs with different rate limits and failure modes; the log
decouples producer failures from consumer failures; a consumer bug is fixable by
replaying rather than re-fetching.
**Cost:** a broker to run and monitor for a single-ticker project.

> **Follow-up: "Is Kafka over-engineering for one ticker?"**
> Welcome this and concede partly. For one ticker at daily cadence, yes, a script
> would do. The properties that earn it are replay and decoupling, and those are
> about the *number of sources* rather than the number of tickers. The honest
> framing is that it was built to demonstrate the pattern at a scale where the
> pattern is not yet strictly necessary, and I would say the same in a design
> review.

### D2. Structured Streaming over cron batch

**Chose** micro-batch streaming. **Over** recomputing every indicator on a
schedule.
**Because** indicators are windowed by nature, which is what the API is for; late
data is handled by watermarking rather than a full recompute; the batch research
code carried over with little change.
**Cost:** streaming state to size and checkpoint, and harder to debug than a batch
job.

> **Follow-up: "What does watermarking actually protect you from here?"**
> A trade or a macro print arriving out of order. Without a watermark you either
> hold every window open forever, which grows state without bound, or you close
> windows on arrival order and silently drop late records. The watermark makes the
> tradeoff explicit: wait this long, then finalise.

### D3. Streams and Tasks inside the warehouse

**Chose** in-warehouse CDC and scheduling. **Over** an external scheduler
triggering SQL.
**Because** a Stream fires on actual change rather than a guess about timing; no
orchestrator to keep running for warehouse-local work; transformation stays next
to the data it reads.
**Cost:** pipeline logic lives in the warehouse, so it is invisible to the repo
unless exported.

**That cost is a real one and worth volunteering.** Logic that is not in version
control is logic nobody can review.

### D4. Compare model families, not tune one model

**Chose** breadth across five families. **Over** picking gradient boosting and
optimising it.
**Because** a baseline OLS is the only way to know whether complexity earned
anything; tree models and econometric models fail differently, which is
informative; interpretability matters when the output is a trade signal.
**Cost:** breadth over depth, so no single model is tuned to its ceiling.

| Family | Members | Tests |
|---|---|---|
| Baseline | OLS, AR(1), CAPM, Fama-French 3-factor | does anything beat the simplest defensible model |
| Regularised | Ridge, Lasso, ElasticNet | whether 70+ features need shrinking |
| Tree-based | Random Forest, Gradient Boosting | whether non-linearity helps |
| Dimensionality reduction | PCA+OLS, factor augmentation, PLS | whether features collapse to fewer factors |
| Econometric | GARCH(1,1), Kalman filter | volatility clustering and latent state |

**Shipping baselines is the mature choice** and the thing most ML portfolios omit.

### D5. Walk-forward, not a single split

**Chose** rolling re-fit. **Over** one train/test split across the period.
**Because** a single split leaks regime information into training; rolling re-fit
is closer to how the model would be used; drawdown only means something across
sequential time.
**Cost:** many more fits, and results vary by window.

### D6. Streamlit over notebooks

**Chose** a running app. **Over** shipping the analysis as notebooks.
**Because** a signal nobody sees in time is not a signal, and alerts need a
surface that is running rather than one that is re-executed.
**Cost:** Streamlit is single-process and would not survive concurrent users.

---

## The features

| Family | Members |
|---|---|
| Technical indicators | SMA/EMA, MACD, RSI, ATR, Bollinger Bands, OBV, CCI, ROC, MFI |
| Lagged | closes 1-5 days, returns 1-5 days |
| Rolling | 20-day volatility, rolling max, rolling min |
| Macro factors | Fama-French 5-factor, ADS Business Conditions Index |
| Alternative | search trends, headline sentiment |
| Signals | RSI + MACD rules, composite score |

---

## The R² problem: volunteer it

**This is the most likely hostile question in your entire portfolio.** Say it
first.

> One number needs a caveat before I quote it. The predictive R² is above 0.99,
> and that is a warning sign rather than a result. Predicting a **price level**
> from lagged prices is trivially easy: the previous close explains almost all the
> variance, and any model will score high without learning anything useful.
>
> The number that carries information is the directional signal accuracy above
> 59%, because getting direction right is what a trade actually depends on. 59%
> against a 50% coin flip is a real edge, and it is a far less impressive-looking
> number than 0.99, which is exactly why it is the one to trust.
>
> If I rebuilt it I would predict returns rather than levels, where honest R² is
> near zero and the interesting metrics are directional accuracy, Sharpe after
> transaction costs, and hit rate against a persistence baseline.

**Why this works:** you identify the flaw, explain the mechanism, redirect to the
defensible metric, and state the fix. There is nothing left for the interviewer to
catch you on.

---

## Metrics

| Metric | Value | Note |
|---|---|---|
| Signal accuracy | > 59% | buy/hold/sell on test data |
| Predictive R² | > 0.99 | **see caveat above** |
| Risk measures | CAGR, Sharpe, Sortino, max drawdown | strategy level |
| Error measures | RMSE, MAE, R² | model level |

---

## The sub-minute question

Also likely, given the resume wording. The facts:

| Component | Latency floor |
|---|---|
| Kafka producer | continuous, no interval |
| **Spark Structured Streaming** | `processingTime='10s'` normal; micro-batch floor ~100ms |
| Spark continuous mode | ~1ms |
| Snowpipe Streaming | ~1s flush |
| Snowflake **triggered** tasks | 30s default, 10s tunable |
| Snowflake **scheduled** tasks | **1 minute floor** |

**The answer:** sub-minute is what a streaming architecture is for. There is no
scheduler in the compute path. The one place to be precise is the Snowflake hop,
and which variant you used determines whether the claim attaches to the whole
chain or only to the Spark layer.

---

## Anticipated questions

**"Why Spark for a single ticker? Pandas would do."**
For the volume, yes. Spark earns its place through the streaming API, watermarking
and windowing, not through distribution. Concede that the cluster is doing nothing
a single machine could not, and that the reason to choose it is the programming
model rather than the parallelism.

**"How do you prevent lookahead bias in the features?"**
Every feature at time *t* uses only data available at *t*: lagged closes,
backward-looking rolling windows, indicators computed on trailing data. The place
lookahead sneaks in is the macro series, because FRED revises figures and a
revised value is not what was known at the time. That is a real risk and the
honest answer is that point-in-time macro data is the correct fix and was not
implemented.

**"Were transaction costs in the backtest?"**
Be truthful. If not, say so and name the consequence: a strategy profitable at
zero cost and unprofitable at five basis points is unprofitable, and cost-aware
backtesting is the first thing to add.

**"What does GARCH give you that a rolling standard deviation does not?"**
GARCH models volatility clustering explicitly: the fact that high-volatility
periods follow high-volatility periods. A rolling standard deviation is a
descriptive summary; GARCH gives a forecast with a conditional variance you can
use for sizing and risk limits.

**"Sentiment from TextBlob is very simple."**
Agreed. It is a lexicon-based polarity score, not a financial-domain model. The
right upgrade is FinBERT or similar, trained on financial text where "beat
expectations" and "missed" carry meaning that a general lexicon does not capture.

**"What would you rebuild?"**
Predict returns rather than levels; put transaction costs in every backtest; use
point-in-time macro data; and replace TextBlob with a domain sentiment model. The
architecture I would keep.

---

## Adjacent theory

- Micro-batch vs continuous streaming, watermarking, delivery semantics
  (fundamentals §4)
- Kafka: topics, partitions, offsets, consumer groups, replay
- Snowflake Streams and Tasks, standard vs triggered
- Walk-forward validation, purging, embargo (fundamentals §9)
- Why R² is the wrong metric for financial prediction
- Sharpe vs Sortino, and what max drawdown adds
- Fama-French factor models, CAPM as a baseline
- GARCH and volatility clustering

---

## Gaps to concede

- R² measures the wrong target
- Transaction costs likely absent from the backtest **(VERIFY)**
- Macro features may use revised rather than point-in-time data
- TextBlob sentiment is not domain-specific
- Warehouse-resident pipeline logic is not version controlled
- Streamlit will not survive concurrent users
- Kafka is more infrastructure than one ticker strictly needs
