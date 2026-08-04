# Project Inventory

Audit of what actually exists behind each project, done 2026-08-02 by cross-checking the old static pages against the public GitHub account. This drives which projects get featured in Phase B/E.

## Why this audit mattered

The old static site linked **almost none** of the real repositories, even though most exist. A visitor had no way to verify any of the work. That is now the single most valuable easy fix: link the code.

## Featured set (9) — order as displayed

| # | Project | Repo | Live | Lens |
|---|---|---|---|---|
| 1 | **PodcastIQ** | [`PodcastIQ`](https://github.com/DhanvardiniRajendran25/PodcastIQ) | — | AI · Data |
| 2 | **IMDb Analytics** | [`IMDb_Analytics_FullStack_Data_Pipeline_And_Dashboarding`](https://github.com/DhanvardiniRajendran25/IMDb_Analytics_FullStack_Data_Pipeline_And_Dashboarding) | — | Data |
| 3 | **NYPD Crime** | [`End_to_End_NYPD_Crime_Arrest_Data_Engineering_Pipeline`](https://github.com/DhanvardiniRajendran25/End_to_End_NYPD_Crime_Arrest_Data_Engineering_Pipeline) | — | Data |
| 4 | **Food Inspection** | [`Public_Health_Compliance_Food_Inspection_Analytics_Platform`](https://github.com/DhanvardiniRajendran25/Public_Health_Compliance_Food_Inspection_Analytics_Platform) | — | Data |
| 5 | **Sage** | not found | ✅ [Cloud Run](https://sage-compliance-assistant-138449082911.us-central1.run.app/) | AI · Systems |
| 6 | **CourtVisionAI** | [`CourtVisionAI`](https://github.com/DhanvardiniRajendran25/CourtVisionAI) | — | AI |
| 7 | **ReflexAI** | [`ReflexAI_AI-Powered_Stock_And_Macro_Risk_Analysis_Platform`](https://github.com/DhanvardiniRajendran25/ReflexAI_AI-Powered_Stock_And_Macro_Risk_Analysis_Platform) | — | AI · Data |
| 8 | **DocuParse** | [`Docuparse`](https://github.com/DhanvardiniRajendran25/Docuparse) | — | AI · Systems |
| 9 | **Meta TradePulse** | [`Quantitative_Trading_Analysis_on_META_Stock`](https://github.com/DhanvardiniRajendran25/Quantitative_Trading_Analysis_on_META_Stock) | — | Data |

**Removed from the featured set:** Seattle Pet ETL (repo still exists; can be an archive row).

## Correction to the first audit pass

The initial audit reported "no repo found" for DocuParse, Meta TradePulse, and Mookit. **That was wrong** — the repo listing was truncated at 60 lines and those repos were below the cut. The full account listing shows them. Only `multiagent-codegen` genuinely has no matching repository.

Repos present but not currently featured: `Seattle_Pet_Licenses_ETL_Pipeline`, `Mookit_Inventory_Management`, `HealthHub360`, `Dynamic_Price_Performance_Simulator`, `An_Authenticated_Dynamic_Auction_Energy_Trading_Mechanism_in_Blockchain_Enabled_SmartGrid`, `haunted-task-list`.

## Not featured

- `multiagent-codegen` — no repo and no live deployment found
- `mookit` — repo exists (`Mookit_Inventory_Management`); available as an archive row
- `seattle-pet-etl` — repo exists; available as an archive row

## Decisions (2026-08-02)

- **CourtVisionAI and ReflexAI are added** to the featured set. Both have substantial repos and strengthen the AI Engineer lens, previously the thinnest of the three.
  - CourtVision's original case-study page was deleted in the Phase 0 cleanup (it was filed as a PM/UX study). It is recoverable: `git show 7549fa4:projects/courtvision.html`. Its PRD is at `git show 7549fa4:projects/courtvision-prd.html`.
  - ReflexAI has no existing page; it needs a write-up from scratch.
- **PodcastIQ is featured first**, and does not carry a "team project" label. Its repo link is resolved: see the section at the end.
- **Sage has no repo but is live.** The live deployment is stronger evidence than a repo, but a repo (even a cleaned-up one) would strengthen it further.

## Revised scope (supersedes the earlier 600-1200 word target)

The original target assumed the write-up was the *only* evidence. With repos linked, the repo carries the "what" and the write-up only needs to carry the "why."

- **Featured case studies: 300-500 words each.** Focused on constraints and decisions, not description.
- **Every featured project must link its repo.** Non-negotiable; this is the verifiability the old site lacked.
- **Live links wherever they exist**, and Phase F adds one genuinely live pipeline as the centerpiece.

**Note on "live and end-to-end":** the four Azure Data Factory + Snowflake pipelines cannot be made publicly live, since they depend on paid cloud resources. For those, "end-to-end" is evidenced by the repo, the architecture diagram, and dashboard screenshots. The Phase F pipeline exists precisely to give the site one thing that is genuinely running and inspectable.

## Resolved: the PodcastIQ repo link (2026-08-04)

Closed. Dhanvardini published her own repository at
[github.com/DhanvardiniRajendran25/PodcastIQ](https://github.com/DhanvardiniRajendran25/PodcastIQ),
and that is now linked from the project page, the work index and the deep dive.

This had been the site's one real attribution risk. PodcastIQ leads the featured
set, and the only repository previously known for it sat on a collaborator's
account, so a recruiter clicking through from the lead project would have landed
on someone else's profile with no explanation. Option 2 of the three recorded
here was taken, which was also the strongest: publish your own and link it.

Every featured project now links a repository except Sage, which has a live
deployment instead.
