"use client";

import { useRouter } from "next/navigation";
import { PROJECTS, ROLE_LABELS, type Role } from "@/content/work";
import { ProjectBand } from "./project-band";

const FILTERS: { key: "all" | Role; label: string }[] = [
  { key: "all", label: "All" },
  { key: "data", label: ROLE_LABELS.data },
  { key: "ai", label: ROLE_LABELS.ai },
  { key: "systems", label: ROLE_LABELS.systems },
];


/**
 * `active` arrives as a prop resolved on the server from the URL, rather than
 * being read here with useSearchParams.
 *
 * useSearchParams forces this component (and everything it renders) to be
 * client-only, which meant the server sent an empty page: no projects for a
 * crawler that does not execute JS, nothing at all with JS disabled, and a
 * visible pop-in on load. Resolving the filter server-side means the correct
 * list is in the HTML on first byte. The URL is still the source of truth, so
 * filtered views stay shareable and Back still steps through filters.
 */
export function ProjectIndex({ active = "all" }: { active?: "all" | Role }) {
  const router = useRouter();

  const visible =
    active === "all"
      ? PROJECTS
      : PROJECTS.filter((project) => project.roles.includes(active));

  function select(key: "all" | Role) {
    const query = key === "all" ? "" : `?role=${key}`;
    router.replace(`/work${query}`, { scroll: false });
  }

  return (
    <>
      <div className="mt-8 flex flex-wrap items-center gap-2">
        {FILTERS.map((filter) => {
          const selected = filter.key === active;
          return (
            <button
              key={filter.key}
              type="button"
              onClick={() => select(filter.key)}
              aria-pressed={selected}
              className={`rounded-full border px-4 py-1.5 font-mono text-[11px] tracking-[0.14em] uppercase transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                selected
                  ? "border-ink bg-ink text-bg"
                  : "border-line text-ink-soft hover:border-ink hover:text-ink"
              }`}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      <p aria-live="polite" className="mt-4 font-mono text-xs text-ink-faint">
        {visible.length} {visible.length === 1 ? "project" : "projects"}
      </p>

      {visible.length === 0 ? (
        <p className="mt-16 text-ink-soft">
          No projects match this filter yet.
        </p>
      ) : (
        <div className="mt-6 divide-y divide-line">
          {visible.map((project, index) => (
            <ProjectBand key={project.slug} project={project} index={index} />
          ))}
        </div>
      )}
    </>
  );
}
