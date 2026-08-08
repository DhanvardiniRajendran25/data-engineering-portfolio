# CourtVision AI

**Three coordinated Gemini agents for basketball coaching.**
Built under hackathon constraints: a $25 credit budget, no database, in-memory
state. Those constraints are the point rather than an embarrassment, and the
project's best material is one design decision about confidence that transfers to
any LLM system you will ever build.

---

## Pitch ladder

### 20 seconds
> Three coordinated Gemini agents for basketball coaching. The design decision I
> like is confidence: instead of asking the model how sure it is, I derive
> confidence from how many sources grounded the answer, because source count is
> observable and self-assessment is not.

### 2 minutes
> Three agents on one FastAPI app. Scout answers tactical questions anchored to
> real current-season statistics, Video Analyzer is a separate service module, and
> Simulator runs a live court taking a compiled intel brief from Scout as input.
>
> The architectural rule is grounding before generation: the Google Search tool
> fires before Gemini writes a word, so no statistic is invented. Post-hoc
> checking would mean the wrong number was already written.
>
> The second decision is that Gemini drives the simulation state itself, not just
> the dialogue. Player instructions are open-ended natural language, and a rules
> engine would need every instruction enumerated in advance.
>
> And it was built inside a $25 budget, which drove an in-memory session store and
> scale-to-zero deployment. That is correct for a hackathon and wrong for
> production, and the write-up says so.

### 10 minutes
Walk the three agents, the five decisions, and be ready to defend the constraints
as decisions rather than apologise for them.

---

## The three agents

| # | Agent | Model | Job |
|---|---|---|---|
| 01 | **Scout** | Gemini 2.5 Flash + Search grounding | tactical questions anchored to real current-season statistics |
| 02 | **Video analyzer** | Gemini 2.5 Flash | independent service module on the shared FastAPI app |
| 03 | **Simulator** | Gemini 2.5 Flash | runs the live court from a compiled intel brief |

**The handoff is the interesting part:** Scout's output is structured so the
Simulator can ingest it directly, via a `send-to-sim` path. That is agent
composition through a typed contract rather than through shared prose.

---

## Decisions

### D1. Grounding before generation

**Chose** the Google Search tool fires before the model writes. **Over** letting
the model answer from parameters, or retrieving after generating and then
checking.
**Because** scouting needs exact numbers, not impressions; a vague answer is
useless where "187th in 3PT defense at 35.2%" is actionable; **post-hoc checking
means the wrong number was already written.**
**Cost:** a search round-trip on every request, so latency is paid up front.

> **The clause to remember:** post-hoc checking means the wrong number was already
> written. Once a model has generated a plausible statistic, verifying it can only
> reject the whole answer, not repair it. Grounding first changes the generation
> rather than auditing it.

### D2. Confidence from grounding, not from the model

**Chose** derive confidence from how many sources grounded the answer. **Over**
asking the model how confident it is.
**Because** self-assessed confidence is unreliable and skews overconfident, and
source count is observable rather than claimed.
**Cost:** a heuristic, not a calibrated probability. It counts sources, not their
quality.

```python
def calculate_confidence(grounding_metadata) -> float:
    if not grounding_metadata or not grounding_metadata.grounding_chunks:
        return 0.5
    num_sources = len(grounding_metadata.grounding_chunks)
    if num_sources >= 3: return 0.9
    elif num_sources == 2: return 0.8
    elif num_sources == 1: return 0.7
    return 0.5
```

**This is the most transferable idea in the project.** Every LLM product has a
confidence display and most of them ask the model, which is close to meaningless.
Deriving it from an observable property of the retrieval is a real improvement.

> **Follow-up: "That is just counting. Three bad sources beat one good one."**
> Completely correct, and the write-up says so: it counts sources, not their
> quality. What it buys is that the signal is *observable* rather than *claimed*,
> and a model asked to rate its own confidence is not even counting anything. The
> upgrade path is weighting by source authority, or agreement between sources,
> which is a better signal than either count or self-report. But I would not
> present this as calibrated probability, because it is not.

**Volunteering the limitation before it is raised is what makes this answer
strong.**

### D3. Gemini as the simulation engine

**Chose** the model decides state updates, not just text. **Over** a rules engine
for state with the model only for dialogue.
**Because** player instructions are open-ended natural language; a rules engine
would need every instruction enumerated in advance; one model handles
interpretation, outcome and narration together.
**Cost:** simulation outcomes are non-deterministic, so the same instruction can
differ between runs.

> **Follow-up: "Non-determinism in a simulation seems bad."**
> It depends what the simulation is for. For a coaching tool exploring "what if I
> double-team here," variation across runs is closer to reality than a
> deterministic rules engine that always returns the same outcome. For anything
> requiring reproducibility, it would be disqualifying. The honest framing is that
> this was the right call for the use case and would need a seed and a
> deterministic core for anything evaluative.

### D4. Temperature 0.2 across the board

**Chose** low temperature everywhere. **Over** higher temperature for livelier
pilot dialogue.
**Because** the same call returns statistics *and* dialogue, and factual precision
matters more than varied phrasing.
**Cost:** dialogue is more consistent and less colourful than it could be.

> **Follow-up: "Why not separate the calls and use different temperatures?"**
> That is the better design and worth conceding immediately. Splitting into a
> factual call at 0.2 and a narration call at 0.7 would give both. It was one call
> for latency and cost inside the budget, and the single temperature is the
> compromise that fell out of that.

### D5. In-memory session store

**Chose** a Python dict, no database. **Over** Redis, Firestore or a managed
database.
**Because** multi-turn memory was needed but durability was not; zero dependencies
to provision inside a $25 budget; Cloud Run scales to zero so idle cost stays nil.
**Cost:** **sessions die with the instance. Correct for a hackathon, wrong for
production, and stated as such.**

> **This is the decision most likely to be probed, and the framing is everything.**
> A reviewer who spots an in-memory store with no persistence reads it as an
> oversight unless the reasoning is visible. Saying "multi-turn memory was needed,
> durability was not, and here is what it costs" converts a weakness into evidence
> that you distinguish requirements from defaults.

> **Follow-up: "What breaks first when you productionise?"**
> Sessions, immediately, because Cloud Run scaling to zero destroys them and
> scaling *out* means a user's second request may hit a different instance with no
> memory of the first. The fix is Redis or Firestore for session state, and it is a
> small change precisely because the store was isolated behind a narrow interface.

---

## Architectural principles

| Principle | What |
|---|---|
| Voice-first input | Chirp is the primary path, typing is the fallback |
| Stateless per request | every call completes independently, state lives per session |
| Grounding before generation | search fires first, so stats are real |
| AI as engine | Gemini drives court state, not just Q&A |
| Separation of concerns | three independent modules on one FastAPI app |
| Hackathon-pragmatic | no database, serverless, inside budget |

**The structured response carries:** `answer`, `confidence`, `sources`,
`search_queries`, `suggested_followups`, `court_state`, `pilot_dialogue`.

Returning `search_queries` is a nice touch worth mentioning: the user can see what
the system actually searched for, which makes the grounding inspectable rather
than merely claimed.

---

## The constraint conversation

Expect: **"This has no database, no persistence, and a heuristic for confidence.
Is it production quality?"**

> No, and it was not built to be. It was a hackathon project with a $25 credit
> budget, and each of those three things is a decision with a stated cost rather
> than something I missed.
>
> The in-memory store exists because multi-turn memory was a requirement and
> durability was not, and provisioning Redis inside that budget would have spent
> money on a property the use case did not need. The confidence heuristic exists
> because the alternative, asking the model, is worse, not because it is good.
> Non-determinism in the simulation is appropriate for exploration and would be
> disqualifying for evaluation.
>
> What I would change first is the session store, because it is the one that
> breaks the moment there is a second instance, and it is a small change because
> it sits behind a narrow interface.

**Why this works:** it accepts the premise, distinguishes decisions from
oversights, and names the first thing to fix without being asked.

---

## Anticipated questions

**"Why Gemini rather than GPT-4o or Claude?"**
Google Search grounding is native to the Gemini tooling, and grounding-before-
generation is the architectural rule the whole project depends on. Getting the
same property elsewhere would mean wiring a separate search tool and losing the
grounding metadata the confidence score reads. Also, credits.

**"Why FastAPI?"**
Async endpoints for concurrent search round-trips, and it packages cleanly into
the Cloud Run container. Three modules on one app keeps deployment single while
keeping concerns separate.

**"How do you know the grounding is actually being used?"**
The grounding metadata is extracted per response and the sources are returned to
the client. That is the same reasoning as returning `search_queries`: the
grounding is inspectable, so the claim is checkable rather than asserted.

**"Is Video Analyzer actually built?"**
Be precise: it is a service module with a reserved stub endpoint, sharing the CORS
config and project structure. Say "stub endpoint reserved" rather than implying a
finished feature. This is the same discipline as labelling ReflexAI's pairs
trading experimental.

**"What did you learn?"**
That the confidence decision generalises. Every LLM feature I build now derives
confidence from something observable rather than from the model's self-report, and
that came directly from this project.

---

## Adjacent theory

- Grounding and tool use: search-before-generation vs retrieve-then-verify
- Model calibration, and why LLM self-reported confidence is unreliable
- Multi-agent composition through typed contracts
- Determinism vs variation in simulation
- Temperature and its effect on factual output
- Serverless scale-to-zero, cold starts, and stateless request design
- Session state in a horizontally scaled service

---

## Gaps to concede

- In-memory sessions die with the instance
- Confidence is a heuristic, not calibrated, and ignores source quality
- Simulation is non-deterministic
- Video analyzer is a reserved stub
- One temperature for two different jobs
- No evaluation suite, unlike SAGE and PodcastIQ
