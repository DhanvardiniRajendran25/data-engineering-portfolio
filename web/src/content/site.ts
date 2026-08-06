/**
 * Single source of truth for identity and contact details.
 *
 * These values appear in the header, footer, contact page, JSON-LD, sitemap
 * and OG metadata. Keeping them in one place means a changed email or URL is
 * one edit, not a repo-wide search.
 */

export const SITE = {
  name: "Dhanvardini Rajendran",
  /** Used by metadataBase, sitemap, robots and canonical URLs. */
  url: "https://dhanvardinirajendran25.github.io",
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
  resume: "/resume.pdf",
  resumeFilename: "Dhanvardini_Rajendran_Resume.pdf",
} as const;
