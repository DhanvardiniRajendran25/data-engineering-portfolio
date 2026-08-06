/**
 * Channel Dashboard and graph-neighbourhood data.
 *
 * Transcribed from screen captures of the running application.
 *
 * One internal check worth noting: the episode counts below sum to exactly 286,
 * which is the corpus total reported everywhere else on the page (18+18+16+16+16
 * +12, then nineteen channels at 10). The capture is self-consistent, so the
 * table is complete at 25 channels rather than truncated.
 */

export type ChannelRow = {
  channel: string;
  genre: string;
  episodes: number;
  from: string;
  to: string;
};

export const CHANNELS: ChannelRow[] = [
  { channel: "All-In Podcast", genre: "Technology & AI", episodes: 18, from: "2022-05-16", to: "2026-01-17" },
  { channel: "a16z", genre: "Technology & AI", episodes: 18, from: "2022-11-09", to: "2026-02-11" },
  { channel: "Andrew Huberman", genre: "Science & Health", episodes: 16, from: "2022-03-28", to: "2026-01-19" },
  { channel: "The Diary Of A CEO", genre: "Education & Self-Improvement", episodes: 16, from: "2022-01-03", to: "2026-01-19" },
  { channel: "My First Million", genre: "Business & Entrepreneurship", episodes: 16, from: "2022-07-14", to: "2026-02-16" },
  { channel: "PowerfulJRE", genre: "Cross-Disciplinary", episodes: 12, from: "2024-02-29", to: "2026-01-16" },
  { channel: "Y Combinator", genre: "Business & Entrepreneurship", episodes: 10, from: "2024-11-08", to: "2025-07-10" },
  { channel: "Acquired", genre: "Technology & AI", episodes: 10, from: "2023-05-30", to: "2025-07-16" },
  { channel: "Tim Ferriss", genre: "Business & Entrepreneurship", episodes: 10, from: "2024-10-24", to: "2025-12-17" },
  { channel: "The Knowledge Project Podcast", genre: "Business & Entrepreneurship", episodes: 10, from: "2024-01-09", to: "2025-06-24" },
  { channel: "Lenny's Podcast", genre: "Business & Entrepreneurship", episodes: 10, from: "2025-06-05", to: "2026-01-29" },
  { channel: "Lex Fridman", genre: "Technology & AI", episodes: 10, from: "2023-12-14", to: "2025-03-16" },
  { channel: "20VC with Harry Stebbings", genre: "Startup & VC", episodes: 10, from: "2025-06-30", to: "2026-02-16" },
  { channel: "Peter Attia MD", genre: "Science & Health", episodes: 10, from: "2024-02-26", to: "2025-10-20" },
  { channel: "Ali Abdaal", genre: "Education & Self-Improvement", episodes: 10, from: "2022-03-03", to: "2024-11-15" },
  { channel: "Masters of Scale", genre: "Startup & VC", episodes: 10, from: "2024-10-10", to: "2025-07-24" },
  { channel: 'Cognitive Revolution "How AI Changes Everything"', genre: "Technology & AI", episodes: 10, from: "2025-05-22", to: "2025-11-20" },
  { channel: "No Priors: AI, Machine Learning, Tech, & Startups", genre: "Technology & AI", episodes: 10, from: "2024-09-05", to: "2026-02-12" },
  { channel: "Tom Bilyeu", genre: "Education & Self-Improvement", episodes: 10, from: "2025-10-27", to: "2025-12-09" },
  { channel: "Hard Fork", genre: "Technology & AI", episodes: 10, from: "2025-02-28", to: "2026-01-23" },
  { channel: "Founders Podcast", genre: "Education & Self-Improvement", episodes: 10, from: "2024-09-25", to: "2025-11-17" },
  { channel: "FoundMyFitness", genre: "Science & Health", episodes: 10, from: "2022-06-29", to: "2025-07-15" },
  { channel: "Wondery", genre: "Business & Entrepreneurship", episodes: 10, from: "2022-03-29", to: "2025-08-11" },
  { channel: "Chris Williamson", genre: "Education & Self-Improvement", episodes: 10, from: "2025-10-06", to: "2026-01-05" },
  { channel: "StarTalk", genre: "Science & Health", episodes: 10, from: "2025-04-22", to: "2025-12-09" },
];

/**
 * Channel deep dive for the selected channel in the capture.
 *
 * Topic counts are read off the dashboard's bar chart rather than a table, so
 * they are approximate to the nearest ~10. The ranking is exact; the magnitudes
 * are not, and the UI says so.
 */
export const DEEP_DIVE = {
  channel: "All-In Podcast",
  episodes: 18,
  firstEpisode: "2022-05-16",
  latestEpisode: "2026-01-17",
  topics: [
    { label: "politics", value: 810 },
    { label: "economy", value: 400 },
    { label: "AI", value: 290 },
    { label: "energy", value: 150 },
    { label: "media", value: 145 },
    { label: "geopolitics", value: 140 },
    { label: "taxation", value: 110 },
    { label: "vaccines", value: 80 },
    { label: "Iran", value: 65 },
    { label: "foreign policy", value: 62 },
  ],
  guests: ["Elon Musk", "Tucker Carlson", "Scott Bessent", "President Trump"],
};

/**
 * A single claim's neighbourhood, exactly as the explorer rendered it.
 * Three nodes, three edges: the smallest unit that shows how one assertion
 * traces back to the episode it came from and the topic it belongs to.
 */
export const NEIGHBOURHOOD = {
  focus: "Sam Altman is making $13 billion.",
  summary: "3 nodes · 3 edges loaded",
  nodes: [
    { id: "episode", label: "Does OpenAI Need a Bailout?", kind: "Episode", x: 30, y: 30 },
    { id: "topic", label: "finance", kind: "Topic", x: 74, y: 44 },
    { id: "claim", label: "Sam Altman is making $13 billi", kind: "Claim", x: 46, y: 76 },
  ],
  edges: [
    ["episode", "claim"],
    ["claim", "topic"],
    ["episode", "topic"],
  ] as [string, string][],
};

/** The explorer's own node-type colour key. */
export const NODE_COLOURS: Record<string, string> = {
  Person: "#ef7360",
  Topic: "#2aa89a",
  Channel: "#ef7360",
  Episode: "#4a90e2",
  Claim: "#8b8f96",
};
