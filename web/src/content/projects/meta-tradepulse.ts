/**
 * META TradePulse deep-dive content.
 *
 * SOURCE: the project README plus the resume line describing the real-time
 * platform (Dockerised Kafka producer, PySpark Structured Streaming, Snowflake
 * Streams and Tasks, Streamlit alerts). The README documents the research and
 * modelling side; the resume line documents the streaming side. Both are the
 * same project at different stages, so the page covers ingest through serving.
 */

export type Stat = { value: string; label: string };

export const SCALE: Stat[] = [
  { value: "70+", label: "Features engineered" },
  { value: "12+", label: "Models compared" },
  { value: "4", label: "Live API sources" },
  { value: "5", label: "Years of OHLCV" },
  { value: "Streaming", label: "Architecture" },
  { value: "Nov 2025", label: "Delivered" },
];

/** The four live sources feeding the feature mart. */
export const SOURCES = [
  { name: "Yahoo Finance", via: "yfinance", gives: "Historical OHLCV, 2020 to 2024" },
  { name: "FRED", via: "FRED API", gives: "Yields, VIX, oil, FX, inflation, crypto series" },
  { name: "Google Trends", via: "PyTrends", gives: "Search interest across Meta ecosystem keywords" },
  { name: "News", via: "NewsAPI + TextBlob", gives: "Headline sentiment scores" },
];

/** Feature families, roughly ordered by how much they contribute. */
export const FEATURES = [
  { group: "Technical indicators", items: ["SMA / EMA", "MACD", "RSI", "ATR", "Bollinger Bands", "OBV", "CCI", "ROC", "MFI"] },
  { group: "Lagged", items: ["Closes, 1 to 5 days", "Returns, 1 to 5 days"] },
  { group: "Rolling", items: ["20-day volatility", "Rolling max", "Rolling min"] },
  { group: "Macro factors", items: ["Fama-French 5-factor", "ADS Business Conditions Index"] },
  { group: "Alternative", items: ["Search trends", "Headline sentiment"] },
  { group: "Signals", items: ["RSI plus MACD rules", "Composite score"] },
];

/** Model families, with what each was there to test. */
export const MODELS = [
  { family: "Baseline", items: ["OLS", "AR(1)", "CAPM", "Fama-French 3-factor"], tests: "Does anything beat the simplest defensible model" },
  { family: "Regularised", items: ["Ridge", "Lasso", "ElasticNet"], tests: "Whether 70+ features need shrinking" },
  { family: "Tree-based", items: ["Random Forest", "Gradient Boosting"], tests: "Whether non-linearity helps" },
  { family: "Dimensionality reduction", items: ["PCA plus OLS", "Factor augmentation", "PLS"], tests: "Whether the features collapse to fewer factors" },
  { family: "Econometric", items: ["GARCH(1,1)", "Kalman filter"], tests: "Volatility clustering and latent state" },
];

export const METRICS = [
  { metric: "Signal accuracy", value: "> 59%", note: "buy / hold / sell on test data" },
  { metric: "Predictive R²", value: "> 0.99", note: "regression on test data, see caveat" },
  { metric: "Risk measures", value: "CAGR, Sharpe, Sortino, max drawdown", note: "strategy level" },
  { metric: "Error measures", value: "RMSE, MAE, R²", note: "model level" },
];

export type Stage = {
  id: string;
  step: string;
  title: string;
  tool: string;
  facts: string[];
  decision: { chose: string; over: string[]; because: string[]; cost: string };
  output: { value: string; label: string }[];
};

export const STAGES: Stage[] = [
  {
    id: "ingest",
    step: "01",
    title: "Ingest",
    tool: "Dockerised Kafka producer",
    facts: [
      "Producer containerised, so it runs identically anywhere",
      "4 live sources into one topic",
      "Replay possible from the log",
    ],
    decision: {
      chose: "Kafka between source and compute",
      over: ["Poll each API directly from the transform job"],
      because: [
        "Four APIs with different rate limits and failure modes",
        "The log decouples producer failures from consumer failures",
        "A consumer bug is fixable by replaying rather than re-fetching",
      ],
      cost: "A broker to run and monitor for a single-ticker project.",
    },
    output: [{ value: "4", label: "sources" }],
  },
  {
    id: "stream",
    step: "02",
    title: "Compute",
    tool: "PySpark Structured Streaming",
    facts: [
      "Technical indicators computed in-stream",
      "Windowed aggregations for rolling stats",
      "Same code shape as the batch feature build",
    ],
    decision: {
      chose: "Structured Streaming over a cron batch",
      over: ["Recompute every indicator on a schedule"],
      because: [
        "Indicators are windowed by nature, which is what the API is for",
        "Late-arriving data is handled by watermarking rather than a full recompute",
        "The batch research code carried over with little change",
      ],
      cost: "Streaming state to size and checkpoint; harder to debug than a batch job.",
    },
    output: [{ value: "9", label: "indicator families" }],
  },
  {
    id: "persist",
    step: "03",
    title: "Persist",
    tool: "Snowflake · Streams and Tasks",
    facts: [
      "Streams capture change on landing tables",
      "Tasks transform on arrival, not on a clock",
      "Feature mart materialised for modelling",
    ],
    decision: {
      chose: "Streams and Tasks inside the warehouse",
      over: ["An external scheduler triggering SQL"],
      because: [
        "A Stream fires on actual change rather than on a guess about timing",
        "No orchestrator to keep running for warehouse-local work",
        "Transformation stays next to the data it reads",
      ],
      cost: "Pipeline logic lives in the warehouse, so it is invisible to the repo unless exported.",
    },
    output: [{ value: "70+", label: "features" }],
  },
  {
    id: "model",
    step: "04",
    title: "Model",
    tool: "statsmodels · scikit-learn · arch",
    facts: [
      "12+ models across 5 families",
      "Feature correlation analysis first",
      "Baselines included on purpose",
    ],
    decision: {
      chose: "Compare families, not tune one model",
      over: ["Pick gradient boosting and optimise it"],
      because: [
        "A baseline OLS is the only way to know whether complexity earned anything",
        "Tree models and econometric models fail differently, which is informative",
        "Interpretability matters when the output is a trade signal",
      ],
      cost: "Breadth over depth: no single model is tuned to its ceiling.",
    },
    output: [
      { value: "12+", label: "models" },
      { value: "5", label: "families" },
    ],
  },
  {
    id: "backtest",
    step: "05",
    title: "Backtest",
    tool: "Walk-forward evaluation",
    facts: [
      "Signals generated from buy and sell conditions",
      "CAGR, Sharpe, Sortino, max drawdown",
      "Equity curves with trade markers",
      "Confusion matrix on signal accuracy",
    ],
    decision: {
      chose: "Walk-forward, not a single split",
      over: ["One train/test split across the whole period"],
      because: [
        "A single split leaks regime information into training",
        "Rolling re-fit is closer to how the model would actually be used",
        "Drawdown only means something across sequential time",
      ],
      cost: "Many more fits to run, and results vary by window.",
    },
    output: [{ value: "4", label: "risk measures" }],
  },
  {
    id: "serve",
    step: "06",
    title: "Serve",
    tool: "Streamlit",
    facts: [
      "Interactive dashboard over the feature mart",
      "Signal alerts surfaced live",
      "Equity curve and trade markers",
    ],
    decision: {
      chose: "Streamlit over a notebook",
      over: ["Ship the analysis as notebooks"],
      because: [
        "A signal nobody sees in time is not a signal",
        "Alerts need a surface that is running, not one that is re-executed",
      ],
      cost: "Streamlit is single-process; it would not survive real concurrent users.",
    },
    output: [{ value: "Live", label: "alerts" }],
  },
];

/**
 * The R² figure needs its caveat stated on the page, not buried. An R² above
 * 0.99 predicting price levels is almost always the previous close doing the
 * work, and the honest read is that the signal accuracy above 59% is the
 * meaningful number.
 */
export const R2_CAVEAT =
  "R² above 0.99 on a price-level target is a warning sign rather than a result: a lagged close alone explains almost all variance. The number that carries information here is the directional signal accuracy above 59%, because getting direction right is what a trade depends on.";

export const TECH_STACK: { group: string; items: string[] }[] = [
  { group: "Streaming", items: ["Apache Kafka", "Docker", "PySpark Structured Streaming"] },
  { group: "Warehouse", items: ["Snowflake", "Streams", "Tasks"] },
  { group: "Sources", items: ["yfinance", "FRED API", "PyTrends", "NewsAPI"] },
  { group: "Modelling", items: ["statsmodels", "scikit-learn", "arch", "GARCH", "Kalman filter"] },
  { group: "Features", items: ["ta", "pandas", "numpy"] },
  { group: "Serving", items: ["Streamlit", "plotly", "matplotlib"] },
];
