# Project Inventory

Audit of what actually exists behind each project, done 2026-08-02 by cross-checking the old static pages against the public GitHub account. This drives which projects get featured in Phase B/E.

## Why this audit mattered

The old static site linked **almost none** of the real repositories, even though most exist. A visitor had no way to verify any of the work. That is now the single most valuable easy fix: link the code.

## Featured candidates (have a real artifact)

| Project | Repo | Live | Lens |
|---|---|---|---|
| **IMDb Analytics** | [`IMDb_Analytics_FullStack_Data_Pipeline_And_Dashboarding`](https://github.com/DhanvardiniRajendran25/IMDb_Analytics_FullStack_Data_Pipeline_And_Dashboarding) | — | Data |
| **NYPD Crime** | [`End_to_End_NYPD_Crime_Arrest_Data_Engineering_Pipeline`](https://github.com/DhanvardiniRajendran25/End_to_End_NYPD_Crime_Arrest_Data_Engineering_Pipeline) | — | Data |
| **Food Inspection** | [`Public_Health_Compliance_Food_Inspection_Analytics_Platform`](https://github.com/DhanvardiniRajendran25/Public_Health_Compliance_Food_Inspection_Analytics_Platform) | — | Data |
| **Seattle Pet ETL** | [`Seattle_Pet_Licenses_ETL_Pipeline`](https://github.com/DhanvardiniRajendran25/Seattle_Pet_Licenses_ETL_Pipeline) | — | Data |
| **Sage** | not found | ✅ [Cloud Run](https://sage-compliance-assistant-138449082911.us-central1.run.app/) | AI · Systems |
| **CourtVisionAI** | [`CourtVisionAI`](https://github.com/DhanvardiniRajendran25/CourtVisionAI) | — | AI |
| **ReflexAI** | [`ReflexAI_AI-Powered_Stock_And_Macro_Risk_Analysis_Platform`](https://github.com/DhanvardiniRajendran25/ReflexAI_AI-Powered_Stock_And_Macro_Risk_Analysis_Platform) | — | AI · Data |
| **PodcastIQ** | team project ([collaborator's repo](https://github.com/Aadarsh-Ravi31/PodcastIQ)) | — | AI · Data |

## No verifiable artifact

No repo and no live deployment found. Not suitable as featured case studies; candidates for archive rows or removal.

- `multiagent-codegen`
- `docuparse`
- `meta-tradepulse`
- `mookit`

## Decisions (2026-08-02)

- **CourtVisionAI and ReflexAI are added** to the featured set. Both have substantial repos and strengthen the AI Engineer lens, previously the thinnest of the three.
  - CourtVision's original case-study page was deleted in the Phase 0 cleanup (it was filed as a PM/UX study). It is recoverable: `git show 7549fa4:projects/courtvision.html`. Its PRD is at `git show 7549fa4:projects/courtvision-prd.html`.
  - ReflexAI has no existing page; it needs a write-up from scratch.
- **PodcastIQ is a team project.** Present it explicitly as collaborative, naming the role played. Keep the collaborator's repo link, labeled as the team repo. Framing it honestly is both accurate and still credits real work; an unlabeled link to another person's account would read as a mistake at best.
- **Sage has no repo but is live.** The live deployment is stronger evidence than a repo, but a repo (even a cleaned-up one) would strengthen it further.

## Revised scope (supersedes the earlier 600-1200 word target)

The original target assumed the write-up was the *only* evidence. With repos linked, the repo carries the "what" and the write-up only needs to carry the "why."

- **Featured case studies: 300-500 words each.** Focused on constraints and decisions, not description.
- **Every featured project must link its repo.** Non-negotiable; this is the verifiability the old site lacked.
- **Live links wherever they exist**, and Phase F adds one genuinely live pipeline as the centerpiece.

**Note on "live and end-to-end":** the four Azure Data Factory + Snowflake pipelines cannot be made publicly live, since they depend on paid cloud resources. For those, "end-to-end" is evidenced by the repo, the architecture diagram, and dashboard screenshots. The Phase F pipeline exists precisely to give the site one thing that is genuinely running and inspectable.

## Recommended featured set (7)

Balanced across the three lenses, avoiding repetition among the four similar medallion-architecture pipelines:

1. **IMDb Analytics** — Data. Largest scale story (141M records).
2. **NYPD Crime** — Data. Full ADF → Snowflake → Power BI chain.
3. **Food Inspection** — Data. Multi-source integration (Chicago + Dallas).
4. **Seattle Pet ETL** — Data. Clean medallion architecture reference.
5. **Sage** — AI · Systems. The only live deployment.
6. **CourtVisionAI** — AI. Multi-agent system.
7. **ReflexAI** — AI · Data. RAG over financial data.

PodcastIQ becomes the eighth if wanted, or an archive row labeled as a team project.
