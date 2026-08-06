# Quality Checklist — data-engineering-portfolio (Next.js rewrite)

A living checklist of the structural/edge cases a production-grade website should handle. Not everything here applies with equal weight to a portfolio site (no user accounts, minimal user input), but every category is worth a deliberate yes/no rather than an accidental gap. Checked items are addressed as of this writing; unchecked items are known gaps or not yet verified. Update this file as work lands in each phase — see `docs/MIGRATION_PLAN.md` for phase context.

## 1. Responsive & device coverage
- [x] Phone widths (320-428px), including the narrowest common devices, not just "mobile" as one bucket
- [x] Tablet, both orientations (iPad portrait 768px and landscape 1024px specifically — these sit right on default breakpoints and are easy to get wrong)
- [x] Laptop (1280-1440px) and large/ultra-wide monitors (1920px+) — content width capped so line length/whitespace doesn't degrade
- [ ] Foldables / unusual aspect ratios (very tall narrow, or very short wide viewports — e.g. a browser window resized to 400x300)
- [ ] Landscape phone specifically (short viewport height, e.g. 375x667 rotated to 667x375) — vertical padding that's fine in portrait can push content below the fold in landscape
- [ ] Browser zoom at 150%/200% (distinct from device pixel ratio) — layout shouldn't break or clip
- [ ] OS-level text-size scaling (accessibility text zoom, separate from browser zoom)
- [x] Touch target sizing (≥40px) for anything tappable
- [ ] Actual device testing (this pass was reasoned through Tailwind breakpoints + lint/build, not visually verified on real hardware — worth doing before calling it done)

## 2. Cross-browser & platform
- [ ] Chrome, Safari (desktop + iOS — iOS Safari has the most quirks: 100vh bugs, backdrop-filter support history, date input styling), Firefox, Edge
- [ ] Safari-specific: `mix-blend-mode` + `filter: blur()` combinations (used in the ambient background) can perform/render differently than Chromium
- [ ] Older/non-evergreen browsers — graceful degradation, not a blank page, if a CSS feature isn't supported
- [ ] JavaScript disabled or blocked — the SSR'd HTML should still be readable content (this is close to true today since pages are mostly server-rendered, but the mobile nav, theme toggle, and role rotator are JS-dependent; confirm the *content* — not the chrome — still reads fine with JS off)
- [ ] Ad blockers / tracking blockers — shouldn't break anything, since fonts are self-hosted via `next/font` (no external CDN dependency there) — verify no other external script gets added later without this in mind

## 3. Accessibility (WCAG)
- [x] Full keyboard navigation (tab order, all interactive elements reachable, visible focus rings via `focus-visible`)
- [x] Mobile menu: focus moves to close button on open, `Escape` closes, body scroll locked, `role="dialog"` + `aria-modal`
- [x] `prefers-reduced-motion` respected globally (CSS kill-switch) and per-component (framer-motion `useReducedMotion`)
- [ ] Screen reader pass (VoiceOver/NVDA) on the actual built pages, not just correct markup in isolation — landmark regions (`header`/`nav`/`main`/`footer`), heading hierarchy per page (only one `h1`), skip-to-content link
- [ ] Color contrast audit against the actual token values in both themes (WCAG AA minimum, especially `--ink-faint`/`--ink-soft` on their respective backgrounds — flagged as a risk in the original site audit, should re-check on the new palette)
- [ ] `prefers-reduced-transparency` — the header/menu use `backdrop-blur`; should have a solid fallback for users who've disabled transparency effects
- [ ] `forced-colors` / Windows High Contrast mode — borders and backgrounds shouldn't disappear (a lot of this site's structure relies on subtle low-opacity borders like `border-line`, which forced-colors mode can flatten)
- [ ] Alt text correctness for every real image once content pages are built (not just the hero photo)
- [ ] Form labels/error messaging once the contact form exists (Phase 2 remaining page)

## 4. Performance / Core Web Vitals
- [x] Fonts self-hosted via `next/font` (no FOIT/FOUT, no external font CDN round-trip)
- [x] `next/image` for the hero photo (responsive `srcset`, lazy by default except `priority` on the hero)
- [ ] Lighthouse pass (LCP, CLS, INP) once more pages exist — not yet run
- [ ] Animation performance on low-end/older mobile devices specifically — `backdrop-blur`, `mix-blend-mode`, and the light-beam `blur(75px)` filter are all GPU-cost items; should profile on a mid-tier Android, not just a dev machine
- [ ] Bundle size checked as pages accumulate (framer-motion is already a meaningful dependency — fine for now, watch it as more animated components get added)
- [ ] `prefers-reduced-data` / Save-Data header — not currently handled; low priority for a portfolio but worth a conscious "not doing this" rather than never considering it

## 5. SEO & discoverability
- [x] Per-app metadata template (`title: { default, template }`) in root layout
- [ ] Per-page `metadata` exports once real page content lands (each of Experience/Education/Skills/etc. currently has no page-specific title/description — the placeholder pages inherit the root default, which is a real gap once they're indexed)
- [ ] Structured data (JSON-LD `Person` schema existed on the old static site's homepage — not yet carried over)
- [ ] `sitemap.xml` / `robots.txt` for the new app (old static site had both; Next.js can generate these via file conventions — not yet added)
- [ ] Open Graph / Twitter card image and metadata (old site had `og:image`; not yet set up in the new app)
- [ ] Canonical URLs, especially important at cutover when both the old static URLs (`/projects/sage.html`) and new ones (`/projects/sage`) might briefly coexist — redirect map is tracked in the migration plan's Phase 6

## 6. Content & data edge cases
- [ ] Very long content (a project title or tag that's unusually long) — does it truncate gracefully or break a card layout?
- [ ] Very short/empty content — not really applicable yet since content is hand-authored, but relevant once Phase 3's content model exists (a project record missing a field shouldn't crash the page)
- [ ] Special characters in copy (ampersands, quotes) — rendered correctly, no double-escaping
- [ ] Broken/missing images — the old static site had 13 orphaned assets and zero broken references at cleanup time; the new content model should make "image file doesn't exist" a build-time error, not a silent broken `<img>`
- [ ] Internal link correctness at scale — once Projects/Gallery have many entries, worth a link-checker step (this class of bug is exactly what the original site audit found: 34 unlinked pages)

## 7. Interactive component & state edge cases
- [x] Theme toggle: correct on first load (light/dark/OS-preference), no hydration mismatch (fixed via `useSyncExternalStore`)
- [ ] Theme sync **across tabs** — currently a `localStorage` write in one tab does not update an already-open second tab (no `storage` event listener). Real gap, low severity.
- [ ] Back/forward browser navigation — does the mobile menu correctly close, does scroll position restore sensibly, does anything break the bfcache (no `unload` handlers currently, which is good — keep it that way)
- [ ] Rapid/double-click protection on any future form submit button (Phase 2 contact form, Phase 5 API calls)
- [ ] Focus restoration after the mobile menu closes (currently focus goes to the close button on open; verify it returns somewhere sensible on close, e.g. back to the hamburger trigger)

## 8. Error handling & resilience
- [ ] Custom `404` page matching the site's design (old static site had one; new app currently relies on Next's default `not-found`)
- [ ] Error boundary / custom `error.tsx` for a route that throws — not yet added
- [ ] Graceful behavior if a CDN or third-party script is blocked — currently minimal external dependency (fonts are self-hosted), but framer-motion, GSAP-successor animations, etc. should never be a hard requirement for content to be visible (the CSS-based reduced-motion fallback already guarantees this for the ambient background; confirm the same holds as animated components are added elsewhere)

## 9. Security
- [ ] `rel="noopener"` on all `target="_blank"` external links (currently present on the social links — verify this stays true as more external links get added)
- [ ] No secrets/API keys ever shipped to the client bundle (relevant starting Phase 5, when a real database/API key exists)
- [ ] CSP headers — not yet configured; worth adding once the Phase 5 API exists, since inline scripts (the theme bootstrap script) will need either a nonce or to be an accepted exception
- [ ] HTTPS-only in production (Vercel handles this by default; confirm no mixed-content links)
- [ ] Dependency vulnerability awareness (already surfaced: current `npm audit` flags are dev-toolchain-only, not runtime; re-check periodically, don't blindly `npm audit fix --force`)

## 10. Forms & user input (Phase 2 contact form, not yet built)
- [ ] Client- and server-side validation (never trust client-only)
- [ ] Empty/whitespace-only submission handling
- [ ] Clear inline error messaging, associated with the field via `aria-describedby`
- [ ] Spam/bot protection (honeypot field or similar, since this will be a public endpoint)
- [ ] Rate limiting on the submit endpoint
- [ ] Success/failure state that's visible to screen readers (`aria-live`), not just a color change

## 11. Backend/API edge cases (Phase 5 live demo, not yet built)
- [ ] Every API route: what happens on empty/missing dataset, malformed request, database connection failure, timeout
- [ ] No arbitrary user-supplied query execution (already decided against in the migration plan — fixed, whitelisted query set only)
- [ ] Loading, empty, and error states in the UI for anything that fetches from the API (not just the happy path)
- [ ] Idempotency for anything that writes data
- [ ] CORS configuration if the API is ever called from a different origin

## 12. Internationalization/localization readiness
- [ ] Not a current requirement (single-locale, single-language site), but noted consciously: no hardcoded date/number formatting that would break if this ever changed. `new Date().getFullYear()` for the footer copyright year is timezone-dependent between server and client render — low-risk (only matters within seconds of a new year, in a specific timezone mismatch window) but worth knowing about rather than being surprised by.

## 13. Print & alternate media
- [ ] No print stylesheet yet — the old static site didn't have one either, but worth deciding deliberately rather than by omission, especially since the resume itself is a PDF (fine) but someone printing a project case-study page will get whatever the screen layout produces (nav, buttons, backgrounds and all)

## 14. PWA / app-icon polish
- [x] `icon.svg` favicon convention in place
- [ ] `apple-touch-icon`, manifest, and theme-color meta tag (affects how the site looks if someone adds it to an iOS/Android home screen, and the mobile browser chrome color) — not yet added

## 15. Testing & QA strategy
- [ ] No automated tests exist yet (no unit, integration, or e2e coverage) — reasonable for a portfolio at this stage, but worth an explicit decision on where the line is (e.g., is the Phase 5 API worth a few integration tests given it's a "real" backend?)
- [ ] No visual regression or accessibility-audit tooling wired into CI yet
- [ ] No Lighthouse CI gate

## 16. Deployment & infrastructure
- [ ] Redirect map from old static URLs to new ones (tracked as a Phase 6 item in the migration plan, not yet built)
- [ ] Preview vs. production environment parity (env vars, especially once Phase 5's `DATABASE_URL` exists)
- [ ] Build failure handling — what happens if a future PR breaks the build; CI is planned (Phase 1) but not yet wired up in this repo
- [ ] Rollback strategy on a bad deploy (Vercel gives this for free via previous deployments — confirm it's actually used, not just theoretically available)

## 17. Monitoring & analytics
- [ ] No error tracking (e.g. Sentry) or uptime monitoring currently planned or added
- [ ] No analytics currently added — worth a deliberate decision (even simple, privacy-respecting analytics) rather than flying blind on which case studies actually get read

## 18. Legal/compliance
- [ ] If analytics or a contact-form backend ever stores visitor data, a privacy note becomes necessary — currently moot since neither exists yet
- [ ] No cookie consent needed today (no cookies/tracking in use)

## 19. Maintainability / content scalability
- [x] Typed content model planned for Phase 3, specifically to prevent the class of bug found in the original site audit (34 orphaned pages, a JS-bundle mismatch bug caused by copy-pasted per-page HTML)
- [ ] A way to verify, going forward, that every new project page is actually linked from the projects index (the exact failure mode found in the old site) — worth a lint rule or build-time check once the content model exists, not just discipline
