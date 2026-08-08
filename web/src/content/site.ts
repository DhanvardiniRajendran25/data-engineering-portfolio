/**
 * Single source of truth for identity and contact details.
 *
 * These values appear in the header, footer, contact page, JSON-LD, sitemap
 * and OG metadata. Keeping them in one place means a changed email or URL is
 * one edit, not a repo-wide search.
 */

/**
 * Canonical origin, resolved at build time.
 *
 * This was hardcoded to the GitHub Pages domain, which was correct only while
 * that was the only deployment. Once the app also ran on Vercel, every
 * canonical tag and every sitemap entry pointed search engines at
 * `dhanvardinirajendran25.github.io/work`, a URL that does not exist. The old
 * static site lives under a `/data-engineering-portfolio/` path prefix, so the
 * canonicals were not merely stale, they were 404s.
 *
 * Resolution order:
 *   1. `NEXT_PUBLIC_SITE_URL`, so pointing at a custom domain is a dashboard
 *      change rather than a code change.
 *   2. `VERCEL_PROJECT_PRODUCTION_URL`, the stable production hostname. Preview
 *      builds deliberately resolve to this too: a preview that canonicalises to
 *      its own throwaway URL invites Google to index the preview.
 *   3. `VERCEL_URL`, only if the project-level variable is unavailable.
 *   4. localhost, for `next dev` and for the test suite.
 *
 * All consumers (`layout.tsx`, `robots.ts`, `sitemap.ts`) are server-only, so
 * reading `process.env` here does not leak anything into the client bundle.
 */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");

  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (production) return `https://${production}`;

  const deployment = process.env.VERCEL_URL;
  if (deployment) return `https://${deployment}`;

  return "http://localhost:3000";
}

export const SITE = {
  name: "Dhanvardini Rajendran",
  /** Used by metadataBase, sitemap, robots and canonical URLs. */
  url: resolveSiteUrl(),
  role: "Data, AI, and software engineer",
  description:
    "Dhanvardini Rajendran builds data pipelines, backend systems, and AI features that ship to production.",
  location: "Boston, MA",
  /** When I can start. Distinct from graduation, which is May 2026. */
  availableFrom: "August 2026",
  relocation: "Open to relocation anywhere in the US",
  responseTime: "I reply within hours, and always within a day.",
  email: "dhanvardini.rajendran@gmail.com",
  phone: "+16179353175",
  phoneDisplay: "+1 617 935 3175",
  linkedin: "https://www.linkedin.com/in/dhanvardini/",
  github: "https://github.com/DhanvardiniRajendran25",
  // Served under its real name rather than /resume.pdf. A recruiter's Downloads
  // folder ends up with one more anonymous resume.pdf otherwise, and the
  // `download` attribute only renames it for people who use the button, not
  // for anyone who saves it from the browser's PDF viewer.
  //
  // Keep this in step with the file in public/. Everything that links to the
  // resume reads it from here, so a rename is a one-line change; next.config.ts
  // redirects the old /resume.pdf path so existing links survive.
  resume: "/Dhanvardini_Rajendran.pdf",
  resumeFilename: "Dhanvardini_Rajendran.pdf",
} as const;
