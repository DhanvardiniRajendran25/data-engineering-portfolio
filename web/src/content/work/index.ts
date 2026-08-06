import { PROJECTS } from "./meta";
import { PROJECT_BODIES } from "./bodies";
import type { ProjectMeta } from "./types";

/**
 * Content integrity checks.
 *
 * These run when the module is first imported, which during `next build`
 * happens while static pages are generated. A violation therefore fails the
 * build loudly instead of shipping a half-broken page. This is the guard
 * against the failure mode found in the previous site's audit, where 34
 * hand-copied pages silently drifted out of sync with the index.
 */
function validate(studies: ProjectMeta[]): void {
  const problems: string[] = [];

  const seen = new Set<string>();
  for (const study of studies) {
    const at = `project "${study.slug}"`;

    if (seen.has(study.slug)) problems.push(`duplicate slug: ${study.slug}`);
    seen.add(study.slug);

    if (!study.slug.trim()) problems.push("a project has an empty slug");
    if (!study.title.trim()) problems.push(`${at}: empty title`);
    if (!study.oneLiner.trim()) problems.push(`${at}: empty oneLiner`);
    if (!study.context.trim()) problems.push(`${at}: empty context`);
    if (study.roles.length === 0) problems.push(`${at}: no roles`);
    if (study.stack.length === 0) problems.push(`${at}: empty stack`);

    if (!(study.slug in PROJECT_BODIES)) {
      problems.push(`${at}: no MDX body registered in bodies.ts`);
    }
  }

  for (const slug of Object.keys(PROJECT_BODIES)) {
    if (!seen.has(slug)) {
      problems.push(`body "${slug}.mdx" is registered but missing from meta.ts`);
    }
  }

  if (problems.length > 0) {
    throw new Error(
      `Project content is invalid:\n  - ${problems.join("\n  - ")}`,
    );
  }
}

validate(PROJECTS);

export { PROJECTS, PROJECT_BODIES };
export { getProject } from "./meta";
export { ROLE_LABELS } from "./types";
export type { ProjectMeta, Role } from "./types";
