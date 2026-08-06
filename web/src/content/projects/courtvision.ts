/**
 * CourtVision AI deep-dive content.
 *
 * SOURCE: transcribed from the project's own README, including the confidence
 * heuristic, the grounding call configuration and the architectural principles.
 * Nothing here is inferred.
 *
 * FRAMING NOTE: this was built under hackathon constraints (a $25 credit budget,
 * an in-memory session store, no database). Those constraints are stated rather
 * than hidden, because a reviewer who spots an in-memory store and no persistence
 * will read it as an oversight unless the reasoning is on the page.
 */

export type Stat = { value: string; label: string; note?: string };

export const SCALE: Stat[] = [
  { value: "3", label: "Coordinated agents" },
  { value: "2.5 Flash", label: "Gemini model" },
  { value: "4", label: "Model responsibilities" },
  { value: "0.2", label: "Temperature", note: "factual precision" },
  { value: "$25", label: "Credit budget" },
  { value: "Voice", label: "First-class input" },
];

/** What the Scout Agent backend actually does, from the README. */
export const CAPABILITIES = [
  {
    title: "Voice or text in",
    what: "Chirp transcribes spoken questions in real time, so coaches ask the way they actually coach.",
  },
  {
    title: "Grounded before generated",
    what: "The Google Search tool fires before Gemini writes a word, so no statistic is invented.",
  },
  {
    title: "Multi-turn memory",
    what: "Session history is kept per coach, so follow-ups do not need the context restated.",
  },
  {
    title: "Drives the simulation",
    what: "Gemini decides court state updates, pilot dialogue and how the game narrative progresses.",
  },
  {
    title: "Compiles intel",
    what: "Scouting output is structured so the Simulator agent can ingest it directly.",
  },
];

export type Agent = {
  n: string;
  name: string;
  model: string;
  job: string;
  detail: string[];
};

export const AGENTS: Agent[] = [
  {
    n: "01",
    name: "Scout",
    model: "Gemini 2.5 Flash + Search grounding",
    job: "Answers tactical questions anchored to real current-season statistics.",
    detail: [
      "Google Search tool fires before generation",
      "Grounding metadata extracted per response",
      "Confidence derived from source count",
      "Follow-ups parsed from the response",
    ],
  },
  {
    n: "02",
    name: "Video analyzer",
    model: "Gemini 2.5 Flash",
    job: "Plugs into the shared FastAPI app as an independent service module.",
    detail: [
      "Separate concern from scouting",
      "Shares CORS and project structure",
      "Stub endpoint reserved in the backend",
    ],
  },
  {
    n: "03",
    name: "Simulator",
    model: "Gemini 2.5 Flash",
    job: "Runs the live court, taking a compiled intel brief from Scout as input.",
    detail: [
      "Receives structured intel via send-to-sim",
      "Gemini reasons about player instructions",
      "Emits court state plus pilot dialogue",
      "Progresses the game narrative live",
    ],
  },
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
    title: "Grounding before generation",
    chose: "Google Search tool called before the model writes",
    over: ["Let the model answer from parameters", "Retrieve after generating, then check"],
    because: [
      "Scouting needs exact numbers, not impressions",
      "A vague answer is useless: 187th in 3PT defense at 35.2% is actionable",
      "Post-hoc checking means the wrong number was already written",
    ],
    cost: "A search round-trip on every request, so latency is paid up front.",
  },
  {
    id: "D-2",
    title: "Confidence from grounding, not from the model",
    chose: "Derive confidence from how many sources grounded the answer",
    over: ["Ask the model how confident it is"],
    because: [
      "Self-assessed confidence is unreliable and skews overconfident",
      "Source count is observable rather than claimed",
      "3+ sources maps to 0.9, one source to 0.7, none to 0.5",
    ],
    cost: "A heuristic, not a calibrated probability. It counts sources, not their quality.",
  },
  {
    id: "D-3",
    title: "Gemini as the simulation engine",
    chose: "The model decides state updates, not just text",
    over: ["Rules engine for state, model for dialogue only"],
    because: [
      "Player instructions are open-ended natural language",
      "A rules engine would need every instruction enumerated in advance",
      "One model handles interpretation, outcome and narration together",
    ],
    cost: "Simulation outcomes are non-deterministic, so the same instruction can differ between runs.",
  },
  {
    id: "D-4",
    title: "Temperature 0.2",
    chose: "Low temperature across the board",
    over: ["Higher temperature for livelier pilot dialogue"],
    because: [
      "The same call returns statistics and dialogue",
      "Factual precision matters more than varied phrasing",
    ],
    cost: "Pilot dialogue is more consistent and less colourful than it could be.",
  },
  {
    id: "D-5",
    title: "In-memory session store",
    chose: "A Python dict, no database",
    over: ["Redis", "Firestore or a managed database"],
    because: [
      "Multi-turn memory was needed, durability was not",
      "Zero dependencies to provision inside a $25 budget",
      "Cloud Run scales to zero, so idle cost stays nil",
    ],
    cost: "Sessions die with the instance. Correct for a hackathon, wrong for production, and stated as such.",
  },
];

/** The confidence heuristic, verbatim from the README. */
export const CONFIDENCE_CODE = `def calculate_confidence(grounding_metadata) -> float:
    if not grounding_metadata or not grounding_metadata.grounding_chunks:
        return 0.5
    num_sources = len(grounding_metadata.grounding_chunks)
    if num_sources >= 3: return 0.9
    elif num_sources == 2: return 0.8
    elif num_sources == 1: return 0.7
    return 0.5`;

export const CONFIDENCE_TIERS = [
  { sources: "3 or more", score: 0.9 },
  { sources: "2", score: 0.8 },
  { sources: "1", score: 0.7 },
  { sources: "none", score: 0.5 },
];

/** Everything the structured response carries back. */
export const RESPONSE_FIELDS = [
  "answer",
  "confidence",
  "sources",
  "search_queries",
  "suggested_followups",
  "court_state",
  "pilot_dialogue",
];

export const PRINCIPLES = [
  { title: "Voice-first input", what: "Chirp is the primary path; typing is the fallback." },
  { title: "Stateless per request", what: "Every call completes independently; state lives per session." },
  { title: "Grounding before generation", what: "Search fires first, so stats are real." },
  { title: "AI as engine", what: "Gemini drives court state, not just Q&A." },
  { title: "Separation of concerns", what: "Three independent modules on one FastAPI app." },
  { title: "Hackathon-pragmatic", what: "No database, serverless, inside budget." },
];

export const TECH_STACK: { group: string; items: string[] }[] = [
  { group: "Model", items: ["Gemini 2.5 Flash", "google-genai SDK", "Google Search grounding"] },
  { group: "Voice", items: ["Chirp STT", "Real-time transcription"] },
  { group: "Backend", items: ["FastAPI", "Python", "Async endpoints"] },
  { group: "Prompt design", items: ["Google AI Studio", "System prompt tuning"] },
  { group: "Deployment", items: ["Google Cloud Run", "Docker", "Scale to zero"] },
  { group: "State", items: ["In-memory session store"] },
];
