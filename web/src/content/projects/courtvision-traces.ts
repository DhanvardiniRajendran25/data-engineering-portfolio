/**
 * Recorded runs for the CourtVision console.
 *
 * SOURCE: transcribed from screen captures of the running application, across
 * all three surfaces (Scout, Game Tape, Simulator). Scores, timestamps,
 * confidence badges, play-by-play lines and follow-up chips are as captured.
 *
 * This replays those runs; it is not connected to anything. The backend needs a
 * Gemini API key and a running FastAPI service.
 */

export const YOUTUBE_ID = "f_3UwoP55Ks";

export type Surface = "scout" | "tape" | "sim";

/** The three launch cards on the landing screen, with their real tags. */
export const SURFACES = [
  {
    id: "tape" as const,
    name: "Game Tape Analyzer",
    blurb:
      "Paste a link or upload a tape. Gemini watches the game and delivers a tactical breakdown: play patterns, key moments, exploitable weaknesses.",
    tags: ["Gemini 2.5 Pro", "Vision", "Grounded"],
  },
  {
    id: "scout" as const,
    name: "AI Scout Agent",
    blurb:
      "Ask anything about any opponent. Real-time scouting reports grounded in live stats, injury reports and recent game data, with source citations.",
    tags: ["Gemini Flash", "Search Grounded", "Real-time"],
    mostUsed: true,
  },
  {
    id: "sim" as const,
    name: "Game Simulator",
    blurb:
      "Pick two teams. AI simulates a full game play-by-play using real player stats. Pause anytime to call plays, adjust defense or substitute, and watch the outcome shift.",
    tags: ["Multi-agent", "Gemini Flash", "Live Sim"],
  },
];

export type ScoutTurn = {
  question: string;
  confidence: string;
  /** Rendered as labelled blocks, matching the app's numbered structure. */
  blocks: { label: string; body?: string; bullets?: string[] }[];
  followups?: string[];
};

export const SCOUT_TURNS: ScoutTurn[] = [
  {
    question: "Give me a full scouting report on Duke Blue Devils for the 2025 season",
    confidence: "50% confidence",
    blocks: [
      {
        label: "Direct answer",
        body: "The Duke Blue Devils have a potent offense, currently averaging 82.3 points per game, ranking 5th in the NCAA. Their success is largely driven by their ability to score from beyond the arc, with a 3-point shooting percentage of 39.2%, placing them 10th nationally. However, they struggle defensively, allowing 75.1 points per game, which ranks 275th.",
      },
      {
        label: "Key stats",
        bullets: [
          "Points per game: 82.3 (5th in NCAA)",
          "3-point shooting percentage: 39.2% (10th in NCAA)",
          "Points allowed per game: 75.1 (275th in NCAA)",
          "Turnover margin: +2.1 (120th in NCAA)",
          "Rebounds per game: 38.5 (45th in NCAA)",
        ],
      },
      {
        label: "Tactical recommendation",
        bullets: [
          "Defensive focus: emphasise defensive rotations and closing out on shooters, as Duke's opponents are likely to exploit their defensive weaknesses. Consider a zone defense to limit their perimeter shooting.",
          "Offensive strategy: utilise fast breaks and transition opportunities to counteract their high-scoring offense. Ensure your team limits turnovers to maintain possession and control the pace of the game.",
        ],
      },
      {
        label: "Confidence note",
        body: "High. The statistics are current and reflect the ongoing season performance.",
      },
    ],
    followups: [
      "Who are their key players?",
      "What is their rebounding efficiency?",
      "How do they perform in high-pressure situations?",
    ],
  },
  {
    question: "Summarize everything into a game plan we can bring to the locker room",
    confidence: "50% confidence",
    blocks: [
      {
        label: "Offensive strategy",
        bullets: [
          "Fast breaks: push the tempo to exploit Duke's transition defense. Look for quick outlets and run the floor.",
          "Limit turnovers: focus on ball security to maintain possession and control the game pace.",
        ],
      },
      {
        label: "Defensive strategy",
        bullets: [
          "Zone defense: implement a zone to limit Duke's perimeter shooting, as they excel with a 39.2% 3-point shooting rate.",
          "Close out on shooters: ensure all players are disciplined in closing out on Duke's shooters to contest shots effectively.",
        ],
      },
      {
        label: "Rebounding focus",
        bullets: [
          "Control the boards: emphasise boxing out and securing rebounds, as Duke averages 38.5 rebounds per game (45th in NCAA). This will limit their second-chance opportunities.",
        ],
      },
      {
        label: "Key matchups",
        bullets: [
          "Identify and target Duke's weaker defenders in isolation plays, particularly in transition.",
        ],
      },
      {
        label: "Mental preparation",
        bullets: [
          "Stay composed and focused, especially in high-pressure situations, as Duke can score quickly.",
        ],
      },
      {
        label: "Summary",
        bullets: [
          "Offensive focus: fast breaks, limit turnovers.",
          "Defensive focus: zone defense, close out on shooters.",
          "Rebounding: control the boards.",
        ],
      },
    ],
  },
];

/** Source clip for the tape run, so the focus timestamp can deep-link. */
export const TAPE_SOURCE = {
  youtubeId: "qvyUh-kEL6k",
  title: "Lakers highlights",
  /** 0:23, the timestamp the coach asked about. */
  seconds: 23,
};

export const TAPE_RUN = {
  file: "Lakers Highlights.mp4",
  size: "21.5 MB",
  question: "List the openers Of Lakers",
  focusTimestamp: "0:23",
  confidence: "100% confidence",
  heading: "Tactical Breakdown",
  answer:
    "The Lakers' starters at 0:23 are Luka Doncic, Austin Reaves, Marcus Smart, LeBron James, and Deandre Ayton.",
  formats: ["MP4", "MOV", "WEBM", "AVI"],
};

export const SIM_SETUP = {
  teamA: "Auburn",
  teamB: "Duke",
  scenarios: [
    { name: "Clutch Time", detail: "5 min left, close game", selected: true },
    { name: "Full Game", detail: "Tip-off to buzzer" },
    { name: "Comeback", detail: "Down 15, fight back" },
  ],
  context: ["Injured players", "Play style", "Load scout intel (session ID)"],
};

export type Play = {
  clock: string;
  text: string;
  score: string;
  kind: "score" | "miss" | "foul";
};

/** Before the coach intervenes: Auburn trailing. */
export const SIM_BEFORE = {
  score: { a: 72, b: 73 },
  clock: "Q4 2:10",
  possession: "Duke ball",
  plays: [
    { clock: "4:55", kind: "score", score: "65-70", text: "Cameron Boozer receives the pass at the top of the key, drives hard to the left, and finishes with a powerful layup over two defenders. The crowd erupts as Duke extends their lead!" },
    { clock: "4:32", kind: "score", score: "67-70", text: "Keyshawn Hall catches the ball in the left corner, fakes a three, then drives into the paint. He rises for a contested jumper and sinks it, cutting Duke's lead to three!" },
    { clock: "3:55", kind: "score", score: "67-73", text: "Duke sets a high pick for Isaiah Evans, who uses it perfectly and pulls up for a deep three-pointer. The shot is pure, and Duke's lead increases to six!" },
    { clock: "3:30", kind: "score", score: "70-73", text: "Tahaad Pettiford drives into the paint, drawing the defense before kicking it out to the left wing. Keyshawn Hall is wide open for three and drills it! Auburn is back within three!" },
    { clock: "3:10", kind: "miss", score: "70-73", text: "Duke's offense is patient as Boozer posts up. He spins and goes for a layup, but it's blocked. Auburn recovers the ball, showcasing their defensive effort." },
    { clock: "2:45", kind: "score", score: "72-73", text: "Off the rebound, Tahaad Pettiford pushes the pace on the fast break. He finds Hall sprinting to the right block, who catches it and lays it in! Auburn is now just one point behind!" },
    { clock: "2:10", kind: "foul", score: "72-73", text: "Duke regains composure and runs a half-court set. Boozer receives the ball in the post and draws a foul while going up for the shot. He heads to the line for two crucial free throws." },
  ] as Play[],
};

/** The coach calls zone defense. The simulation responds. */
export const SIM_AFTER = {
  decision: "Zone defense",
  score: { a: 79, b: 73 },
  clock: "Q4 0:10",
  possession: "Auburn ball",
  plays: [
    { clock: "2:00", kind: "miss", score: "72-73", text: "Boozer attempts to break through the zone defense with a skip pass to Evans on the right wing. Evans takes the shot, but the zone forces a tough contested three, and it bounces off the rim!" },
    { clock: "1:45", kind: "score", score: "74-73", text: "Seizing the opportunity, Auburn pushes the ball up the court. Tahaad Pettiford drives into the zone, pulls up at the free-throw line, and nails the jumper! Auburn takes the lead!" },
    { clock: "1:30", kind: "miss", score: "74-73", text: "Duke resets and tries to find space against the zone. Boozer takes a mid-range jumper, but it is off the mark! Auburn's defense is holding strong." },
    { clock: "1:10", kind: "score", score: "76-73", text: "Pettiford pushes the ball again, finding Hall in the corner. Hall hesitates, then drives through the zone and finishes with a smooth layup! Auburn is pulling away!" },
    { clock: "0:50", kind: "miss", score: "76-73", text: "Duke desperately needs to score. They pass around the perimeter, but Auburn's zone is relentless. Evans finally puts up a three-pointer, but it's off target again!" },
    { clock: "0:30", kind: "score", score: "79-73", text: "With the shot clock winding down, Pettiford takes it upon himself. He drives into the heart of the zone, kicks it out to Hall, who launches a three! It's good! Auburn's crowd is on their feet!" },
    { clock: "0:10", kind: "miss", score: "79-73", text: "In a last-ditch effort, Duke rushes down the court. Boozer takes a contested shot from the top of the key, but the zone defense disrupts his rhythm, and it clangs off the backboard!" },
  ] as Play[],
};

export const COACH_DECISIONS = [
  "Zone defense",
  "Full court press",
  "Call timeout",
  "Sub bench",
  "Feed the post",
  "Slow it down",
];

export const SCOUT_SUGGESTIONS = [
  "Full scouting report on Duke",
  "What's Auburn's biggest weakness?",
  "Compare UConn and Houston defense",
  "Scout report on Gonzaga's starting five",
];
