/**
 * ReflexAI deep-dive content.
 *
 * SOURCE: transcribed from the project README, including the three data classes,
 * the risk dimensions and the design choice to use annual rather than intraday
 * data.
 */

export type Stat = { value: string; label: string };

export const SCALE: Stat[] = [
  { value: "3", label: "Data classes" },
  { value: "3", label: "Financial statements" },
  { value: "5", label: "Core capabilities" },
  { value: "Annual", label: "Data cadence" },
  { value: "RAG", label: "Reasoning layer" },
  { value: "2025", label: "Delivered" },
];

/** The framing that separates this from a metrics dashboard. */
export const PREMISE = {
  most: "What happened?",
  this: "Why is risk building, and how might it evolve?",
  loops: [
    "Perceptions influence prices",
    "Prices influence fundamentals",
    "Narratives influence behaviour",
    "Behaviour feeds back into reality",
  ],
};

/**
 * Three data classes, each with a different cognitive role. This is the
 * project's own framing and the most interesting thing about its architecture.
 */
export const LAYERS = [
  {
    n: "01",
    name: "Quantitative reality",
    source: "yfinance",
    role: "The baseline truth risk is assessed against",
    holds: [
      "Annual income statement",
      "Annual balance sheet",
      "Annual cash flow statement",
      "Lightweight market snapshot",
    ],
  },
  {
    n: "02",
    name: "Narrative and conceptual",
    source: "Soros knowledge corpus",
    role: "The lens the numbers are read through",
    holds: [
      "Reflexivity as a framework",
      "Boom and bust sequence structure",
      "Feedback-loop reasoning patterns",
    ],
  },
  {
    n: "03",
    name: "Intent",
    source: "User queries",
    role: "What the analyst actually wants to know",
    holds: [
      "Ticker-aware market context",
      "Question routed against both layers above",
    ],
  },
];

export const CAPABILITIES = [
  {
    n: "01",
    name: "Fundamentals layer",
    what: "Annual income statement, balance sheet and cash flow, normalised for downstream analysis.",
  },
  {
    n: "02",
    name: "Risk diagnostics",
    what: "Liquidity, leverage, profitability and narrative risk, rather than generic ratio output.",
  },
  {
    n: "03",
    name: "AI market reasoning",
    what: "Retrieval over the reflexivity corpus, so explanations are grounded in a framework rather than improvised.",
  },
  {
    n: "04",
    name: "Ticker-aware context",
    what: "Market context attached to the specific company being examined.",
  },
  {
    n: "05",
    name: "Pairs trading analysis",
    what: "Experimental. Included as a direction, not a finished capability.",
  },
];

export const RISK_DIMENSIONS = [
  { name: "Liquidity risk", what: "Ability to survive stress without external financing, and cash adequacy against obligations." },
  { name: "Leverage risk", what: "How much of the balance sheet depends on borrowed capital holding." },
  { name: "Profitability risk", what: "Whether earnings quality supports the valuation being placed on it." },
  { name: "Narrative risk", what: "Where the story about a company has detached from what its statements show." },
];

export type Decision = {
  id: string;
  title: string;
  chose: string;
  over: string[];
  because: string[];
  cost: string;
};

export const DECISIONS: Decision[] = [
  {
    id: "D-1",
    title: "Annual data, deliberately",
    chose: "Annual statements only",
    over: ["Quarterly filings", "Intraday market data"],
    because: [
      "Avoids short-term noise entirely",
      "Aligns with macro and structural analysis rather than trading signals",
      "Reflexive loops play out over years, not sessions",
    ],
    cost: "Nothing here can answer a question about this quarter, by design.",
  },
  {
    id: "D-2",
    title: "Separate the corpus from the numbers",
    chose: "Two distinct data classes, retrieved separately",
    over: ["One combined index of everything"],
    because: [
      "Statements are facts; the corpus is a way of reading facts",
      "Mixing them lets a framework quote be retrieved as though it were a figure",
      "Keeping them apart makes the reasoning auditable",
    ],
    cost: "Two retrieval paths to maintain and keep aligned.",
  },
  {
    id: "D-3",
    title: "Risk-focused diagnostics, not a ratio table",
    chose: "Four named risk dimensions",
    over: ["The standard ratio set"],
    because: [
      "A current ratio does not say whether a company survives stress",
      "Naming the risk makes the output actionable rather than descriptive",
    ],
    cost: "The dimensions are interpretive, so two analysts could weight them differently.",
  },
  {
    id: "D-4",
    title: "Explain the loop, not just the level",
    chose: "Model feedback between perception and fundamentals",
    over: ["Report current values and stop"],
    because: [
      "Most tools answer what happened; the gap is why risk is building",
      "A level tells you where you are, a loop suggests where it goes",
    ],
    cost: "Explanations are narrative, so they are harder to validate than a number.",
  },
];

export const TECH_STACK: { group: string; items: string[] }[] = [
  { group: "Reasoning", items: ["RAG", "LLM synthesis", "Retrieval over corpus"] },
  { group: "Data", items: ["yfinance", "Annual statements", "Market snapshot"] },
  { group: "Analysis", items: ["Python", "pandas", "Risk diagnostics"] },
  { group: "Framework", items: ["Reflexivity model", "Boom-bust sequence"] },
  { group: "Interface", items: ["Structured dashboard"] },
  { group: "Experimental", items: ["Pairs trading analysis"] },
];
