# The portfolio platform

**The site itself as an engineering artifact.**
Not a project in the portfolio, but the thing the portfolio runs on, and the
richest material you have for a full-stack, platform or frontend conversation.
Every decision here is one you can point at live.

Stack: Next.js 16 (App Router), React 19, TypeScript, Tailwind 4, Vercel, Neon
Postgres, GitHub Actions, Playwright, axe-core.

---

## Pitch

> The site is statically generated Next.js on Vercel, with one dynamic API route
> reading a Postgres database that a scheduled GitHub Actions job writes to twice
> a day. The interesting parts are the constraints I held it to: a strict Content
> Security Policy, 42 automated accessibility tests across three browser engines
> and five viewports, and a data-visualisation palette that was validated with a
> colour-science script rather than chosen by eye.

---

## Architecture

```
GitHub repo (public)
   |
   |-- GitHub Actions, twice daily -> Socrata APIs -> Neon Postgres
   |                                                     ^
   |-- push -> Vercel build                              |
                 |                                       |
                 v                                       |
        static pages (SSG)                               |
        + /api/pipeline (dynamic) ------------------------
                 |
                 v
             browser
```

**The key property: the database is never on the critical path of a page render.**
Pages are statically generated. The live panel fetches client-side after mount. If
Neon is asleep or the free tier is exhausted, the panel degrades and the rest of
the page is untouched.

---

## Decisions

### D1. Static generation with a client-side live panel

**Chose** SSG pages plus a client fetch for live data. **Over** server-side
rendering the live data into the page.
**Because** SSR would put a sleeping database on the critical path of a page load,
and Neon's free tier scales compute to zero after five idle minutes, so the first
visitor of the day would wait for a cold start before seeing anything.
**Cost:** a brief loading state, and the live numbers are not in the initial HTML,
so they are not indexed.

**Four states, not one:** loading (skeleton sized to the loaded panel so the page
does not shift), empty (database reachable but no data), unavailable (database not
responding), and loaded. Rendering zeroes for the middle two would be a lie.

### D2. Whitelisted queries, no parameters at all

The API route exposes **no parameters**. Every query is a fixed statement in one
module with no interpolation from a request.

> **Follow-up: "Is that not inflexible?"**
> Yes, deliberately. There is no injection surface rather than a defended one. If a
> filter is ever needed it must be an enum mapped to a literal in that module,
> never a string passed through. For a read-only public panel, flexibility is not
> worth the class of bug it opens.

### D3. Pooled vs direct connections

Two connection strings, used for different things:

| String | Used by | Why |
|---|---|---|
| **Pooled** (`-pooler` host) | Next.js API routes | serverless functions open many short-lived connections, which is what the pooler exists for; the free tier's connection ceiling is reachable without it |
| **Direct** | ingestion job, migrations | bulk operations and multi-statement transactions misbehave through a pooler |

**This distinction is a real interview differentiator.** Most people use whichever
string they were given.

### D4. CSP with `unsafe-inline`, documented rather than hidden

The Content Security Policy is strict except for one concession, and the reasoning
matters more than the policy:

- **Hash-based CSP is impossible** because Next emits inline scripts whose content
  varies per build
- **Nonce-based CSP forces dynamic rendering**, which would defeat static
  generation entirely
- So: `unsafe-inline` for scripts, with the reasoning written in the config

`frame-src` is scoped to exactly two origins, `drive.google.com` and
`www.youtube-nocookie.com`, rather than left open.

> **Follow-up: "So your CSP does not stop XSS."**
> Correct for injected inline script, and I would not claim otherwise. What it does
> constrain is `frame-src`, `connect-src` and `img-src`, so an injected script
> cannot exfiltrate to an arbitrary origin or frame arbitrary content. The tradeoff
> is stated in the config rather than left for someone to discover, and the right
> fix is nonces once the cost of dynamic rendering is acceptable.

**`upgrade-insecure-requests` was deliberately removed.** It broke WebKit: Safari
rewrote every asset URL to `https://localhost:3000` in development, producing SSL
errors and completely unstyled pages. Chromium exempts localhost, so it only
appeared in cross-browser testing. HSTS covers the concern in production.

**That is a good "how do you debug something that only breaks in one browser"
story.**

### D5. Accessibility as a gate, not a checklist

42 automated tests: every route in light and dark themes, plus focus-trap and
skip-link behaviour, run across Chromium, Firefox and WebKit at five viewports
(336 test-runs on the full matrix).

**Real defects it caught:**

| Defect | Cause |
|---|---|
| Text shipped fully transparent | opacity-based reveal animations. `useReducedMotion()` returns false during SSR, so `opacity: 0` was baked into the server HTML. Contrast measured 1.04:1. Fixed by animating transform only. |
| Console text at 1.44:1 | dimmed steps rendered at `opacity-30` |
| `--ink-faint` at 4.29:1 | the dark console surface rebinds theme tokens and was never contrast-checked against its own background. Recomputed to 6.95:1. |
| Rotating text ignored reduced-motion | only the transition was suppressed, not the rotation. WCAG 2.2.2 violation. |
| Scrollable diagrams keyboard-inaccessible | pointer-only. Added `role="region"`, `aria-label`, `tabIndex`. |
| `definition-list` violation | a `<p>` inside a `<dl>`, which permits only `dt`, `dd` and `div`. |

> **The lesson worth stating:** the transparent-text bug appeared three separate
> times in different components. Automated contrast testing caught all three; code
> review had not caught any. That is the argument for the tests existing.

Third-party iframe content is excluded **by origin**, not by tag, so a genuine
violation in an iframe we author still fails.

### D6. A validated visualisation palette

The live dashboard needed categorical colours for three cities. Rather than
picking them:

```
node validate_palette.js "#c2453d,#2563c9,#1f8a5c" --mode light --surface "#fffdf8"
  [PASS] Lightness band      all 3 inside L 0.43-0.77
  [PASS] Chroma floor        all 3 >= 0.1
  [PASS] CVD separation      worst adjacent dE 21.8 (deutan)
  [PASS] Normal-vision floor worst adjacent dE 22.9
  [PASS] Contrast vs surface all 3 >= 3:1
```

**Dark mode has its own validated steps**, `#e0685f, #6690e0, #45a276`, not a
lightened flip of the light ones, because a flipped ramp leaves the lightness
band.

Earlier candidates failed on the **chroma floor**: a teal at OKLCH chroma 0.09
reads as grey. That is not something you catch by eye.

**Colour rules held throughout:**
- Sequential (one hue, light to dark) wherever the job is magnitude
- Categorical only where the series *are* the subject
- Never a value-ramp over nominal categories, which re-encodes bar length as hue
- Colour follows the entity, never its rank, so filtering never repaints survivors
- Every series direct-labelled, because blue and green separate poorly under
  tritanopia

### D7. Chart forms chosen by job, not by variety

Eleven dashboard blocks, ten distinct forms. Each chosen for what the data does:

| Data's job | Form |
|---|---|
| single ratio against a limit | meter, not a two-slice pie |
| part-to-whole | one 100% composition bar, not N separate bars |
| ordered sequence (1..25) | decay curve, not ranked bars |
| geographic | dot map from real coordinates, small multiples per city |
| ranked long-named categories | dot plot, not eight full-width bars |
| magnitude over a date grid | calendar heatmap, one hue |

**Two bugs the form choices exposed**, which is the point worth making: changing
the representation surfaced defects that the old representation hid. The Dallas
sparsity series was rendering alphabetically (`violation10`, `violation17`,
`violation1`) because column names sort as strings, and the order *was* the entire
finding.

### D8. Testing strategy

| Layer | Tool | Gate |
|---|---|---|
| Types | `tsc --noEmit` | error |
| Lint | ESLint | error |
| Accessibility | Playwright + axe-core | error |
| Responsive | Playwright, 5 viewports | error |
| Performance | Lighthouse CI | desktop error, **mobile warn** |

Mobile Lighthouse budgets ship as warnings rather than errors because no baseline
has been measured, and a gate set to an unmeasured number is a gate that will be
disabled the first time it fires.

**Known limits, stated:** axe catches roughly 30 to 40% of real accessibility
problems. It verifies contrast, names, roles and structure; it cannot judge
whether a focus order makes sense or whether alt text is meaningful. A pass is a
floor, not a substitute for a manual screen reader pass.

---

## Operational details worth knowing

**GitHub disables scheduled workflows after 60 days of repository inactivity.** A
portfolio repo goes quiet, and six months later the live panel silently reads
"89d ago," which is worse than having no panel. The job commits a small state file
on each run so the pipeline keeps its own schedule alive.

**GitHub Actions cron is heavily delayed.** The 07:00 UTC run fired at 09:37 UTC,
2h37m late. That is normal for the free tier and it is why the page shows the
actual last-run timestamp rather than promising a cadence.

**Vercel Hobby cron is limited to once per day**, which is why the ingestion runs
on Actions rather than on Vercel.

**Vercel root directory.** The Next app lives in `web/`, not the repo root. Until
that is set, Vercel scans the root, finds the old static HTML, and detects no
framework.

**A near-miss worth mentioning if security comes up:** a live database connection
string was pasted into `.env.example`, which is a *tracked* file, rather than
`.env.local`, which is gitignored. Caught before commit. The file now states in its
own header that it is committed and public, at the point where someone would make
that mistake. Defence at the point of failure rather than in a README nobody reads.

---

## Anticipated questions

**"Why Next.js and not a static site generator?"**
The live panel needs an API route holding a database credential server-side. A
pure static generator cannot do that without a separate backend. Next gives static
generation for the 30 pages that are static and one dynamic route for the one that
is not.

**"How do you keep the database credential out of the browser bundle?"**
It is read in a server-only module, never prefixed `NEXT_PUBLIC_`, and never
imported into a client component. The `NEXT_PUBLIC_` prefix is the mechanism by
which Next inlines a variable into client JavaScript, so anything without it stays
server-side.

**"What is your caching strategy?"**
The API route caches its snapshot so a hundred visitors do not mean a hundred
database queries. Neon's free tier has a connection ceiling that an uncached route
would exhaust during exactly the traffic spike you would want to survive.

**"How do you handle the database being down?"**
The read function never throws to the caller. It logs the real error server-side
and returns a generic `unavailable` status, because the reason is served publicly.
The panel renders a notice; the page is unaffected.

**"What would you improve?"**
Nonce-based CSP once dynamic rendering is acceptable. A measured mobile Lighthouse
baseline so those budgets can become gates. And a real screen reader pass, since
axe is a floor.

---

## Adjacent theory

- SSG vs SSR vs ISR vs client fetch, and what each costs
- CSP directives, and why nonces conflict with static generation
- Connection pooling in serverless environments
- WCAG 2.1 AA: contrast ratios, 2.2.2 pause/stop/hide, focus management
- `prefers-reduced-motion`, `forced-colors`, `prefers-reduced-transparency`
- OKLab / OKLCH, colour vision deficiency simulation, perceptual uniformity
- Core Web Vitals: LCP, CLS, INP
