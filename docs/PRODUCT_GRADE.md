# Product-Grade Checklist

The four pillars that make this read as a real engineered product rather than a portfolio template. Audited 2026-08-03 against the actual repo, not from memory.

This list previously existed only in conversation and kept getting lost. It lives here now.

**Status key:** ✅ done · 🟡 partial · ⬜ not started

---

## 1. Infrastructure and platform

| Item | Status | Detail |
|---|---|---|
| CI: lint, typecheck, build | ✅ | `.github/workflows/ci.yml` |
| CI: axe accessibility gate | ✅ | Runs against every route, both themes |
| CI: Lighthouse budgets | ✅ | `lighthouserc.json` |
| Concurrency cancellation | ✅ | Stale runs cancelled on new push |
| Scheduled data pipeline | 🟡 | `pipeline.yml` + `pipeline/ingest.py` exist, never run against a real database |
| Duplicate CI workflows | ✅ | `web-ci.yml` deleted; `ci.yml` was a superset of it. |
| Security headers / CSP | ✅ | CSP, HSTS preload, nosniff, Referrer-Policy, X-Frame-Options, Permissions-Policy. `script-src` uses `unsafe-inline` as a documented trade: see the reasoning block in `next.config.ts`. Verified in a real browser with zero violations across all routes. |
| Env var validation | ✅ | Already correct on audit: `getDb()` throws a directed message naming the file to copy. Lazy by design so builds never require the variable. |
| Deployment config | ⬜ | No `vercel.json`. No preview/production env separation. |
| Redirect map implemented | ⬜ | Written up in [REDIRECT_MAP.md](./REDIRECT_MAP.md), not built. Old `.html` URLs will 404 at cutover. |

## 2. Performance

| Item | Status | Detail |
|---|---|---|
| Self-hosted fonts, no CDN round trip | ✅ | `next/font` |
| Image optimization | ✅ | `next/image`, modern formats, correct sizing |
| Static prerendering | ✅ | 20 pages, all 9 projects SSG |
| Lighthouse budgets in CI | ✅ | Fails the build on regression |
| Bundle analyzer wired | ✅ | `@next/bundle-analyzer` |
| `loading.tsx` boundaries | ✅ | Layout-shaped skeleton, motion-safe, `role="status"` for screen readers. |
| API caching / revalidation | ⬜ | Matters once the live demo serves real queries; currently only `/api/health`. |
| Real-device profiling | ⬜ | Never tested on a mid-tier Android. Blur and blend-mode effects are GPU-cost items. |

## 3. System design

| Item | Status | Detail |
|---|---|---|
| Typed content model with build-time validation | ✅ | Bad or missing field fails the build, not the page |
| Single design-token source, two-tier width system | ✅ | Rail 1600px, content 1120px, prose measure |
| One template for all project pages | ✅ | Structurally prevents the old site's drift bug |
| Error boundaries | ✅ | `error.tsx`, `global-error.tsx`, `not-found.tsx` |
| Database schema | 🟡 | `src/db/schema.ts` via Drizzle, never migrated against a real database |
| Architecture diagrams per project | ⬜ | The explorable-diagram component from the Phase D spec. Needs node/edge data from you. |
| Written design note for the pipeline | ⬜ | Schema, request flow, failure modes. This is the single strongest seniority signal on the site. |
| API contract / OpenAPI | ⬜ | For the live demo endpoints |

## 4. Observability and operations

**The pillar with nothing done.** A product that cannot be observed is not production-grade, and this is currently a blind spot end to end.

| Item | Status | Detail |
|---|---|---|
| Error tracking | ⬜ | Still nothing. Needs a vendor DSN, so it is blocked on a decision from you. |
| Web vitals / RUM | 🟡 | Field collection wired via `useReportWebVitals` to `/api/vitals`, which validates and logs structured lines. No durable sink yet, so data is not retained beyond platform logs. |
| Analytics | ⬜ | No idea which projects get read. Worth a privacy-respecting option. |
| Uptime monitoring | ⬜ | Nothing notices if the site or pipeline goes down. |
| Pipeline alerting | ⬜ | A failed cron run fails silently. |
| Structured logging | ⬜ | For the API routes once they serve real traffic. |

---

## Recommended order

Grouped by whether they need anything from you.

**Needs nothing from you (do these first):**
1. Delete `web-ci.yml` — trivial, stops wasting CI minutes
2. Security headers + CSP with a nonce for the theme script
3. Env var validation that fails fast at boot
4. `loading.tsx` boundaries
5. Error tracking and web vitals

**Needs decisions or credentials from you:**
6. Live pipeline: Neon database, secrets in GitHub Actions
7. Analytics choice, if any
8. Deployment and domain cutover

**Needs your content:**
9. Architecture diagram data per project
10. Pipeline design note
11. Project write-ups (Phase E)
