/**
 * Project content model.
 *
 * Metadata lives in TypeScript (not MDX frontmatter) on purpose: `tsc` then
 * validates every record at build time, so a missing or misspelled field is a
 * build failure rather than a silently broken page. Prose lives in .mdx
 * alongside, where long-form writing and code blocks are comfortable.
 */

/** The three role lenses the portfolio is filtered by. */
export type Role = "data" | "ai" | "systems";

export const ROLE_LABELS: Record<Role, string> = {
  data: "Data",
  ai: "AI",
  systems: "Systems",
};

export type ProjectMeta = {
  /** URL segment: /work/<slug>. Must match the .mdx filename in ./bodies. */
  slug: string;
  title: string;
  /**
   * Year delivered. `null` renders as an em-free placeholder in the archive
   * table. Deliberately nullable rather than guessed: an invented date on a
   * portfolio is worse than a blank one. Tracked in docs/YOUR_TODOS.md.
   */
  year: number | null;
  /** Where it was built: Northeastern, Optum, Personal, etc. */
  context: string;
  /** One line, outcome-first. Shown in the archive table and on cards. */
  oneLiner: string;
  roles: Role[];
  /** Technologies, shown as monospace chips. Keep to ~5 most significant. */
  stack: string[];
  /**
   * Cover image, e.g. "/projects/podcastiq.png".
   * `null` renders a typographic placeholder instead of a broken image, so the
   * index stays presentable until real screenshots are dropped into
   * web/public/projects/. See docs/PHASE_C_D_SPEC.md for specs.
   */
  image: string | null;
  /** Headline number surfaced on hover in the index. */
  metric?: { value: string; label: string };
  /**
   * Additional images shown inside the project page: dashboards, schemas,
   * architecture diagrams, app screenshots. Each needs a caption, since an
   * uncaptioned screenshot makes the reader guess what they are looking at.
   * Files live in web/public/projects/<slug>/.
   */
  gallery?: { src: string; caption: string }[];
  /** Public repository. Omit when there genuinely is not one. */
  repo?: string;
  /** Live deployment, if any. */
  live?: string;
  /** Whether a written project body exists yet. Drives Phase E tracking. */
  hasWriteUp: boolean;
};
