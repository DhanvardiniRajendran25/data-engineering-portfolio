# Redirect Map — old static site → new Next.js app

Decided in Phase A, **implemented in Phase G (cutover)**. Until the new app is deployed, none of these are live.

## Why this exists

The current live site (GitHub Pages, `main` branch) serves real `.html` URLs that may be linked from resumes, LinkedIn, job applications, or search results. When the Next.js app replaces it, those URLs must not 404.

Redirects are **only** needed for old static URLs. Routes that existed solely inside the unreleased Next.js app (for example `/projects` before it became `/work`) need no redirect, because they were never publicly reachable.

## Page mappings

| Old (live static) | New | Type |
|---|---|---|
| `/index.html`, `/` | `/` | 301 |
| `/projects.html` | `/work` | 301 |
| `/projects/<slug>.html` | `/work/<slug>` | 301 |
| `/experience.html` | `/about#experience` | 301 |
| `/education.html` | `/about#education` | 301 |
| `/skills.html` | `/about#skills` | 301 |
| `/awards.html` | `/about#awards` | 301 |
| `/about.html` | `/about` | 301 |
| `/story.html` | `/about` | 301 |
| `/contact.html` | `/contact` | 301 |
| `/gallery.html` | `/` | 301 |

## Case study slugs

The ten flagship data engineering case studies keep their slugs, changing only the path shape (`/projects/<slug>.html` → `/work/<slug>`):

`seattle-pet-etl` · `nypd-crime` · `imdb-analytics` · `food-inspection` · `podcastiq` · `sage` · `multiagent-codegen` · `docuparse` · `meta-tradepulse` · `mookit`

Two linked PRD documents also need destinations decided in Phase B:

- `/projects/sage-prd.html`
- `/projects/podcastiq-prd.html`

## Notes and open items

- **Gallery has no equivalent.** It was dropped deliberately, so `/gallery.html` redirects to the homepage rather than 404ing. A redirect to a non-equivalent page is a soft-404 signal to search engines; acceptable here since the page carried no unique indexed value.
- **Anchor targets must exist.** The `#experience`, `#education`, `#skills`, and `#awards` fragments require matching `id` attributes on the About page, added in Phase E. If those ids are missing, the redirect silently lands at the top of the page.
- **Assets.** Old asset paths (`/assets/...`) are referenced by the live site's OG image and JSON-LD metadata. Verify these resolve or are updated before cutover, or existing social-share previews break.
- **The 32 deleted PM/UX pages** (removed in the Phase 0 cleanup, see [CLEANUP_LOG.md](./CLEANUP_LOG.md)) are already gone from the live site and intentionally have no redirect.

## Verification checklist (Phase G)

- [ ] Every mapping above returns 301 to the correct destination
- [ ] All ten case study slugs resolve
- [ ] Anchor fragments land on the correct section, not just the page top
- [ ] Old asset URLs used in OG/JSON-LD still resolve
- [ ] No redirect chains (old → intermediate → final)
