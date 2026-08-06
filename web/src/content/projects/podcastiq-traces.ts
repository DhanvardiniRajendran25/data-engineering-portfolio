/**
 * Recorded runs for the agent console.
 *
 * SOURCE: transcribed from screen captures of the running Streamlit
 * application, down to match scores, verdicts and deep links. Where a capture
 * cut a line off, the text stops there rather than being completed.
 *
 * Every YouTube link here uses a video id that appeared in a capture. No id is
 * constructed, because a wrong one is a broken link rather than a cosmetic
 * problem.
 *
 * This console replays those runs; it is not connected to anything. The live
 * system needs a Snowflake account and Neo4j in local Docker, neither of which a
 * static site can reach.
 */

export type Step = {
  label: string;
  detail: string;
  ms: number;
  code?: string;
};

export type Source = {
  title: string;
  channel: string;
  date?: string;
  match?: string;
  quote?: string;
  /** Deep link, opening at the cited second. */
  url?: string;
};

export type ClaimPair = {
  before: string;
  after: string;
  drift: "CONTRADICTED" | "ESCALATED" | "SOFTENED" | "REVISED" | "CONFIRMED";
  gap: string;
  beforeDate: string;
  afterDate: string;
};

export type Trace = {
  intent: string;
  agent: string;
  query: string;
  steps: Step[];
  totalMs: number;
  answer: string;
  /** Retrieved chunks, as the app rendered them. */
  sources?: Source[];
  /** Claim cards, as the compare view rendered them. */
  claims?: { speaker: string; text: string; type: string; channel: string }[];
  /** Before/after pairs from the temporal view. */
  evolution?: ClaimPair[];
  /** Fact-check verdict block. */
  verdict?: {
    state: "VERIFIED" | "FALSE" | "DISPUTED";
    claim: string;
    basis: string;
    evidence?: string[];
  };
  /** Deep links the app emitted under the answer. */
  links?: string[];
};

const GUARDRAIL: Step = {
  label: "Input guardrails",
  detail: "Length, injection patterns, language, scope, then an 8b semantic check",
  ms: 1,
};

const ROUTER = (intent: string): Step => ({
  label: "Router",
  detail: `llama3.1-8b classified as ${intent}`,
  ms: 150,
});

export const TRACES: Trace[] = [
  {
    intent: "SUMMARIZE",
    agent: "Search + Summarization",
    query: "What did experts say about AGI?",
    steps: [
      GUARDRAIL,
      ROUTER("SUMMARIZE"),
      {
        label: "Search agent",
        detail: "Cortex Search returned ranked chunks with match scores",
        ms: 1200,
        code: "SNOWFLAKE.CORTEX.SEARCH_PREVIEW(\n  'PODCASTIQ.SEMANTIC.PODCASTIQ_SEARCH', ...\n)",
      },
      {
        label: "Summarization agent",
        detail: "llama3.1-70b synthesised across sources with inline citations",
        ms: 2500,
      },
      {
        label: "GPT-4o judge",
        detail: "Cross-family validation, run after the answer",
        ms: 800,
      },
    ],
    totalMs: 4700,
    answer:
      "According to Sam Altman, 5 years ago, most experts thought AGI was not a plausible thing to work towards, but now it has come a long way [Sam Altman talks the NYT lawsuit, Meta's talent poaching, and Trump on AI | Interview - Hard Fork]. In fact, Altman himself was considered crazy for pursuing AGI, with 99% of the world thinking it was impossible [Sam Altman: The Future of OpenAI, ChatGPT's Origins, and Building AI Hardware - Y Combinator]. However, he believes that in 10 or 20 years, we'll have unimaginable super intelligence.\n\nDr. Roman Yampolski, a leading voice in AI safety, believes that superintelligence has a significant chance of wiping out humanity [Why 99.999% of Us Won't Survive Artificial Superintelligence - Tom Bilyeu]. In 2023, nearly half of all AI researchers said advanced AI carries at least a 10% chance of causing human extinction.\n\nDr. Fei-Fei Li, the “Godmother of AI,” is more cautious, saying that AGI is a term people throw around, and it's unclear how far we are from achieving it [The Godmother of AI on jobs, robots & why world models are next | Dr. Fei-Fei Li - Lenny's Podcast]. She questions whether we'll get there on the current trajectory and if we need more breakthroughs.",
    sources: [
      {
        title: "Sam Altman talks the NYT lawsuit, Meta's talent poaching, and Trump on AI | Interview",
        channel: "Hard Fork",
        date: "2025-06-25",
        match: "52% match",
        url: "https://www.youtube.com/watch?v=cT63mvqN54o&t=482",
        quote:
          "of like man you know 5 years ago most of the experts made fun of anyone who said AI AGI might be even a plausible thing to to work towards and now here we are with this",
      },
      {
        title: "Sam Altman: The Future of OpenAI, ChatGPT's Origins, and Building AI Hardware",
        channel: "Y Combinator",
        date: "2025-06-21",
        match: "49% match",
        url: "https://www.youtube.com/watch?v=V979Wd1gmTU&t=0",
        quote:
          "We said, “Okay, we're going to go for AGI.” 99% of the world thought we were crazy. 1% of the world they really resonated with. You know, in 10 or 20 resonate",
      },
      {
        title: "Why 99.999% of Us Won't Survive Artificial Superintelligence",
        channel: "Tom Bilyeu",
        url: "https://www.youtube.com/watch?v=2bbSgSIQsac&t=0",
      },
      {
        title:
          "The Godmother of AI on jobs, robots & why world models are next | Dr. Fei-Fei Li",
        channel: "Lenny's Podcast",
        url: "https://www.youtube.com/watch?v=Ctjiatnd6Xk&t=1441",
      },
    ],
  },
  {
    intent: "COMPARE",
    agent: "Comparison",
    query: "Compare Sam Altman and Lex Fridman on AI",
    steps: [
      GUARDRAIL,
      ROUTER("COMPARE"),
      {
        label: "Comparison agent",
        detail: "Each side retrieved independently, then contrasted",
        ms: 3850,
      },
    ],
    totalMs: 4000,
    answer:
      "After analyzing the viewpoints of Sam Altman and Lex Fridman on AI, it's clear that they share a common enthusiasm for the potential of AI to drive breakthroughs and advancements. Both individuals acknowledge the rapid progress being made in the field, with Altman highlighting the capabilities of OpenAI's models and Fridman showcasing the use of AI voice cloning in his podcast. However, their perspectives diverge when it comes to the global landscape of AI development. Altman focuses on the capabilities and future potential of AI, while Fridman emphasizes the importance of international involvement, specifically highlighting India's limitations and the need for its participation in AI development.\n\nA unique aspect of Altman's perspective is his emphasis on the scientific applications of AI, citing GPT5 as an example of AI doing science. In contrast, Fridman's perspective is more geopolitically focused, drawing on his experiences speaking with Ukrainians and discussing the country's history and politics. Fridman takes a stronger stance on the need for international cooperation in AI development, while Altman's views are more centered on the technological advancements and potential of AI. Overall, Altman's perspective is more optimistic and focused on the possibilities of AI, while Fridman's is more nuanced and highlights the complexities of AI development in a global context.",
    claims: [
      {
        speaker: "Sam Altman",
        text: "OpenAI's revenue run rate is $20 billion by the end of the year.",
        type: "VERIFIABLE_FACT",
        channel: "All-In Podcast",
      },
      {
        speaker: "Sam Altman",
        text: "In 2 years, AI models will be doing bigger chunks of science and making important discoveries.",
        type: "PREDICTION",
        channel: "a16z",
      },
      {
        speaker: "Sam Altman",
        text: "The text interface style can go very far even if for the chitchat use case the models are already very good.",
        type: "OPINION",
        channel: "a16z",
      },
      {
        speaker: "Sam Altman",
        text: "The models have already saturated the chat use case.",
        type: "OPINION",
        channel: "a16z",
      },
      {
        speaker: "Sam Altman",
        text: "Deep learning has been a miracle that keeps on giving and has led to breakthrough after breakthrough.",
        type: "OPINION",
        channel: "a16z",
      },
      {
        speaker: "Lex Fridman",
        text: "AI systems developed without India's involvement will have limitations.",
        type: "OPINION",
        channel: "Lex Fridman",
      },
      {
        speaker: "Lex Fridman",
        text: "India lags behind the United States in the space of AI.",
        type: "VERIFIABLE_FACT",
        channel: "Lex Fridman",
      },
      {
        speaker: "Lex Fridman",
        text: "The podcast uses AI voice cloning to bring the Prime Minister's voice to life in English.",
        type: "VERIFIABLE_FACT",
        channel: "Lex Fridman",
      },
    ],
  },
  {
    intent: "TEMPORAL",
    agent: "Temporal analysis",
    query: "How has Marc Andreessen changed his views on innovation?",
    steps: [
      GUARDRAIL,
      ROUTER("TEMPORAL"),
      {
        label: "Temporal agent",
        detail: "SQL over pre-computed drift pairs, then 70b synthesis",
        ms: 3650,
      },
    ],
    totalMs: 3800,
    answer:
      "Marc Andreessen has undergone a significant shift in his views on innovation over the past few years. In 2022, he emphasized the importance of building and investing in the future, implying progress and innovation. However, by 2026, he had contradicted this stance, suggesting a lack of technological innovation. This reversal is notable, as it indicates a change in Andreessen's perspective on the pace of progress. Additionally, his views on startups, capitalism, and cloud computing have also escalated, with him taking more extreme and confident positions over time. For instance, he has expanded his scope from a single office to entire companies and from a specific era to a broader industry trend.",
    evolution: [
      {
        before: "It is essential today that we continue to build and invest in the future.",
        after:
          "There has been very little technological innovation in most of the economy in the last 50 years.",
        drift: "CONTRADICTED",
        gap: "1177d",
        beforeDate: "2022-11-09",
        afterDate: "2026-01-29",
      },
      {
        before: "The a16z office in San Francisco was a hybrid activity between 2010 and 2020.",
        after:
          "Leading edge founders are thinking about having entire companies where the founder does everything.",
        drift: "ESCALATED",
        gap: "1177d",
        beforeDate: "2022-11-09",
        afterDate: "2026-01-29",
      },
      {
        before:
          "The Bourgeois capitalism era was the era of iconic business builders like Henry Ford and Thomas Edison.",
        after:
          "The capitalist system's great virtue is that it allows for many determinate optimists to try and succeed.",
        drift: "ESCALATED",
        gap: "1177d",
        beforeDate: "2022-11-09",
        afterDate: "2026-01-29",
      },
    ],
  },
  {
    intent: "GRAPH",
    agent: "Knowledge graph",
    query: "Who has Sam Altman appeared with across podcasts?",
    steps: [
      GUARDRAIL,
      ROUTER("GRAPH"),
      {
        label: "Cypher generation",
        detail: "llama3.1-70b given the graph schema",
        ms: 1000,
        code: "MATCH (p:Person {name: 'Sam Altman'})-[:APPEARED_ON]->(e:Episode)\n      <-[:APPEARED_ON]-(other:Person)\nWHERE other.name <> 'Sam Altman'\nRETURN other.name AS co_guest, COUNT(e) AS appearances\nORDER BY appearances DESC LIMIT 20",
      },
      { label: "Neo4j execution", detail: "Co-guest rows returned", ms: 300 },
      {
        label: "Synthesis",
        detail: "llama3.1-70b turned rows into prose",
        ms: 1500,
      },
    ],
    totalMs: 3200,
    answer:
      "Sam Altman has appeared as a guest on various podcasts alongside several notable individuals. He has co-appeared with Casey Newton and Kevin Roose on three episodes each, discussing topics such as technology and entrepreneurship. He has also shared the mic with Harj Taggar and Garry Tan on two episodes each, as well as with Kathryn Zealand, Brad Lightcap, Patrick Collison, a16z Partners, Marc Andreessen, and Ben Horowitz on one episode each. These conversations likely covered a range of topics related to the tech industry and startup ecosystem.",
  },
  {
    intent: "FACTCHECK",
    agent: "Fact-check, stage 1 only",
    query: "Fact check: GPT-5 was released in 2024",
    steps: [
      GUARDRAIL,
      ROUTER("FACTCHECK"),
      {
        label: "Stage 1: Cortex pre-filter",
        detail: "Resolved without a web call, so stage 2 never fired",
        ms: 2350,
      },
    ],
    totalMs: 2500,
    answer:
      "There is no publicly known release of GPT-5 in 2024 or any other year, and the latest known model is GPT-3.",
    verdict: {
      state: "FALSE",
      claim: "GPT-5 was released in 2024",
      basis: "Verified from AI training knowledge",
    },
  },
  {
    intent: "FACTCHECK",
    agent: "Fact-check, stages 1 to 3",
    query: "Fact check: Sam Altman was fired from OpenAI in November 2023",
    steps: [
      GUARDRAIL,
      ROUTER("FACTCHECK"),
      {
        label: "Stage 1: Cortex pre-filter",
        detail: "Returned uncertain, so the claim escalates to the web",
        ms: 1000,
      },
      { label: "Stage 2: Brave Search", detail: "5 web sources retrieved", ms: 800 },
      {
        label: "Stage 3: Verdict synthesis",
        detail: "llama3.1-70b weighed evidence against the claim",
        ms: 1500,
      },
    ],
    totalMs: 4100,
    answer:
      "Multiple sources confirm that Sam Altman was fired from OpenAI in November 2023, including Wikipedia's article on the removal and The Verge's report on the circumstances surrounding his ousting. The Verge cites a deposition from Ilya Sutskever, a co-founder of OpenAI, as evidence of the events leading up to Altman's firing. Livemint also reports on the firing, citing internal allegations of deception as the reason.",
    verdict: {
      state: "VERIFIED",
      claim: "Sam Altman was fired from OpenAI in November 2023",
      basis: "Verified via 5 web sources",
      evidence: [
        "https://en.wikipedia.org/wiki/Removal_of_Sam_Altman_from_OpenAI",
        "https://www.theverge.com/ai-artificial-intelligence/814876/ilya-sutskever-deposition-openai-sam-altman-elon-musk-lawsuit",
        "https://www.livemint.com/technology/tech-news/why-was-sam-altman-fired-by-openai-in-2023-new-report-points-to-sociopathic-pattern-of-deception-11775564192075.html",
      ],
    },
  },
  {
    intent: "INSIGHT",
    agent: "Insight",
    query: "Which podcast channel has the most contradicted claims?",
    steps: [
      GUARDRAIL,
      ROUTER("INSIGHT"),
      {
        label: "Insight agent",
        detail: "Five aggregate SQL queries across the corpus, then synthesis",
        ms: 4050,
      },
    ],
    totalMs: 4200,
    answer:
      "The podcast channel with the most contradicted claims is “The Diary Of A CEO”, with a staggering 52 instances of contradictions, accounting for nearly half of its total evolutions. This is closely followed by “Andrew Huberman” with 50 contradictions, highlighting a concerning trend of frequent reversals in their claims. This pattern suggests that these popular podcast channels may be prioritizing provocative discussions over fact-checking and consistency, potentially contributing to a culture of misinformation in the podcasting sphere.",
  },
  {
    intent: "SEARCH",
    agent: "Search",
    query: "What did Sam Altman say about GPT-5?",
    steps: [
      GUARDRAIL,
      ROUTER("SEARCH"),
      {
        label: "Search agent",
        detail: "Cortex Search only. No LLM in this path, which is why it is the fastest agent",
        ms: 1350,
      },
    ],
    totalMs: 1500,
    answer:
      "Returns ranked transcript chunks rather than a synthesised answer. Each carries its relevance score, the episode and channel it came from, and a YouTube link that opens at the exact second the passage begins.",
    sources: [
      {
        title: "Sam Altman: The Future of OpenAI, ChatGPT's Origins, and Building AI Hardware",
        channel: "Y Combinator",
        date: "2025-06-21",
        url: "https://www.youtube.com/watch?v=V979Wd1gmTU&t=0",
      },
      {
        title:
          "Sam Altman talks the NYT lawsuit, Meta's talent poaching, and Trump on AI | Interview",
        channel: "Hard Fork",
        date: "2025-06-25",
        url: "https://www.youtube.com/watch?v=cT63mvqN54o&t=482",
      },
    ],
  },
  {
    intent: "RECOMMEND",
    agent: "Recommendation",
    query: "Suggest episodes about AI",
    steps: [
      GUARDRAIL,
      ROUTER("RECOMMEND"),
      {
        label: "Recommendation agent",
        detail: "SQL fallback chain, loosening filters until results return, then 70b synthesis",
        ms: 1850,
      },
    ],
    totalMs: 2000,
    answer:
      "Ranks episodes by topic match and returns them with channel and publish date, plus the reason each surfaced. The fallback chain matters here: a narrow request degrades to broader topic matches rather than returning an empty list, so the agent never answers a reasonable question with nothing.",
    sources: [
      {
        title:
          "The Godmother of AI on jobs, robots & why world models are next | Dr. Fei-Fei Li",
        channel: "Lenny's Podcast",
        url: "https://www.youtube.com/watch?v=Ctjiatnd6Xk&t=1441",
      },
      {
        title: "Why 99.999% of Us Won't Survive Artificial Superintelligence",
        channel: "Tom Bilyeu",
        url: "https://www.youtube.com/watch?v=2bbSgSIQsac&t=0",
      },
      {
        title: "Sam Altman: The Future of OpenAI, ChatGPT's Origins, and Building AI Hardware",
        channel: "Y Combinator",
        url: "https://www.youtube.com/watch?v=V979Wd1gmTU&t=0",
      },
    ],
  },
];

/**
 * Per-channel drift, transcribed from the Insight agent's analysis table.
 * The most interesting artefact in the whole capture: it is the corpus
 * disagreeing with itself, measured.
 */
export const CHANNEL_DRIFT = [
  { channel: "The Diary Of A CEO", total: 110, contradicted: 52, revised: 0, confirmed: 25, escalated: 26, softened: 7 },
  { channel: "Andrew Huberman", total: 121, contradicted: 50, revised: 10, confirmed: 23, escalated: 32, softened: 6 },
  { channel: "All-In Podcast", total: 80, contradicted: 43, revised: 0, confirmed: 7, escalated: 28, softened: 2 },
  { channel: "PowerfulJRE", total: 70, contradicted: 36, revised: 1, confirmed: 10, escalated: 19, softened: 4 },
  { channel: "Acquired", total: 65, contradicted: 34, revised: 0, confirmed: 10, escalated: 21, softened: 0 },
  { channel: "Lex Fridman", total: 66, contradicted: 34, revised: 0, confirmed: 8, escalated: 22, softened: 2 },
  { channel: "a16z", total: 62, contradicted: 31, revised: 2, confirmed: 6, escalated: 20, softened: 3 },
  { channel: "Wondery", total: 41, contradicted: 27, revised: 0, confirmed: 3, escalated: 10, softened: 1 },
  { channel: "FoundMyFitness", total: 46, contradicted: 13, revised: 6, confirmed: 13, escalated: 13, softened: 1 },
  { channel: "My First Million", total: 19, contradicted: 13, revised: 0, confirmed: 2, escalated: 2, softened: 2 },
];

/** Graph explorer, as captured. */
export const GRAPH_EXPLORER = {
  searchTerm: "sam altman",
  nodesFound: 30,
  loaded: "150 nodes, 82 edges loaded",
  results: [
    { label: "Hard Fork Live, with Patrick Collison, Kathryn Zealand, Sam Altman & Brad Lightcap", kind: "Episode", connections: 686 },
    { label: "Sam Altman", kind: "Person", connections: 601 },
    { label: "How To Build The Future: Sam Altman", kind: "Episode", connections: 291 },
    { label: "Are We in an A.I. Bubble? Debriefing Dinner with Sam Altman. | EP 150", kind: "Episode", connections: 146 },
    { label: "Sam Altman on Sora, Energy, and Building an AI Empire", kind: "Episode", connections: 105 },
    { label: "Sam Altman: The Future of OpenAI, ChatGPT's Origins, and Building AI Hardware", kind: "Episode", connections: 91 },
    { label: "Sam Altman talks the NYT lawsuit, Meta's talent poaching, and Trump on AI | Interview", kind: "Episode", connections: 73 },
  ],
};

/** The app's own standing disclaimer, shown under every response. */
export const APP_DISCLAIMER =
  "PodcastIQ uses AI to extract and analyze podcast content. Speaker attributions and fact-check verdicts are AI-generated and may contain errors. Always verify important claims by watching the linked source.";
