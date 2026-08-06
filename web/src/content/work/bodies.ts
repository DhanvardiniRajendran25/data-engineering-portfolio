import type { ComponentType } from "react";

/**
 * Explicit slug -> MDX body map.
 *
 * Written out by hand rather than using a dynamic `import()` with a template
 * literal: an explicit map is statically analysable, so a slug that has no
 * body file is a TypeScript error at build time instead of a runtime 404.
 * Keys must match `slug` values in ./meta.ts.
 */
export const PROJECT_BODIES: Record<
  string,
  () => Promise<{ default: ComponentType }>
> = {
  podcastiq: () => import("./bodies/podcastiq.mdx"),
  "imdb-analytics": () => import("./bodies/imdb-analytics.mdx"),
  "nypd-crime": () => import("./bodies/nypd-crime.mdx"),
  "food-inspection": () => import("./bodies/food-inspection.mdx"),
  sage: () => import("./bodies/sage.mdx"),
  courtvision: () => import("./bodies/courtvision.mdx"),
  reflexai: () => import("./bodies/reflexai.mdx"),
  docuparse: () => import("./bodies/docuparse.mdx"),
  "meta-tradepulse": () => import("./bodies/meta-tradepulse.mdx"),
};
