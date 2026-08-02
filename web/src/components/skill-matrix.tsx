"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { SKILL_GROUPS } from "@/content/about";
import { PROJECTS } from "@/content/work";

/**
 * Skills, cross-referenced against the projects that actually used them.
 *
 * A plain skill list is a claim. Pointing each skill at the shipped work that
 * used it is evidence, and it costs nothing to maintain because the mapping is
 * derived from each project's existing `stack` rather than hand-written.
 *
 * Hovering or focusing a skill reveals its projects; skills with no shipped
 * project stay visible and unmarked rather than being hidden, since not
 * everything worth listing has a public project behind it.
 */

/** Loose match: "Azure Databricks" in skills vs "Databricks" in a stack. */
function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function projectsUsing(skill: string) {
  const s = normalize(skill);
  return PROJECTS.filter((project) =>
    project.stack.some((tech) => {
      const t = normalize(tech);
      return t.includes(s) || s.includes(t);
    }),
  );
}

export function SkillMatrix() {
  const [active, setActive] = useState<string | null>(null);

  const usage = useMemo(() => {
    const map = new Map<string, { slug: string; title: string }[]>();
    for (const group of SKILL_GROUPS) {
      for (const item of group.items) {
        map.set(
          item,
          projectsUsing(item).map((p) => ({ slug: p.slug, title: p.title })),
        );
      }
    }
    return map;
  }, []);

  const activeProjects = active ? (usage.get(active) ?? []) : [];

  return (
    <div>
      <p className="max-w-measure text-sm text-ink-soft">
        Hover a skill to see the shipped projects that used it.
      </p>

      <div className="mt-8 border-t border-line">
        {SKILL_GROUPS.map((group) => (
          <div
            key={group.label}
            className="grid gap-4 border-b border-line py-7 lg:grid-cols-[minmax(0,15rem)_1fr] lg:gap-12"
          >
            <div className="flex items-baseline gap-3 lg:block">
              <h3 className="text-lg">{group.label}</h3>
              <span className="font-mono text-[11px] text-ink-faint lg:mt-1 lg:block">
                {String(group.items.length).padStart(2, "0")} skills
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {group.items.map((item) => {
                const used = usage.get(item) ?? [];
                const isActive = active === item;
                return (
                  <button
                    key={item}
                    type="button"
                    onMouseEnter={() => setActive(item)}
                    onMouseLeave={() => setActive(null)}
                    onFocus={() => setActive(item)}
                    onBlur={() => setActive(null)}
                    aria-describedby={
                      isActive && used.length > 0 ? "skill-usage" : undefined
                    }
                    className={`rounded-full border px-3 py-1.5 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                      isActive
                        ? "border-ink text-ink"
                        : "border-line text-ink-soft hover:border-ink hover:text-ink"
                    }`}
                  >
                    {item}
                    {used.length > 0 && (
                      <span
                        aria-hidden="true"
                        className={`ml-1.5 inline-block h-1.5 w-1.5 rounded-full align-middle ${
                          isActive ? "bg-accent" : "bg-accent/40"
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Reserved space so revealing usage does not shift the page */}
      <div id="skill-usage" aria-live="polite" className="mt-6 min-h-[2.5rem]">
        {active && activeProjects.length > 0 && (
          <p className="text-sm text-ink-soft">
            <span className="font-mono text-[11px] tracking-[0.16em] text-ink-faint uppercase">
              {active} in
            </span>{" "}
            {activeProjects.map((project, i) => (
              <span key={project.slug}>
                {i > 0 && <span className="text-ink-faint">, </span>}
                <Link
                  href={`/work/${project.slug}`}
                  className="text-ink underline decoration-line underline-offset-4 transition-colors hover:decoration-accent"
                >
                  {project.title}
                </Link>
              </span>
            ))}
          </p>
        )}
      </div>
    </div>
  );
}
