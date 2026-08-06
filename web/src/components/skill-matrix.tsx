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
 * The reveal sits inside each category row rather than once at the end of the
 * section: with a single shared region at the bottom, hovering a skill in the
 * first category printed its projects several screens below, out of view.
 */

/** Loose match: "Databricks" in skills vs "Azure Databricks" in a stack. */
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

  return (
    <div>
      <p className="text-sm text-ink-soft">
        Hover a skill to see the shipped projects that used it.
      </p>

      <div className="mt-8 border-t border-line">
        {SKILL_GROUPS.map((group) => {
          const activeHere = active && group.items.includes(active);
          const activeProjects = activeHere ? (usage.get(active) ?? []) : [];

          return (
            <div
              key={group.label}
              className="grid gap-3 border-b border-line py-6 lg:grid-cols-[minmax(0,13rem)_1fr] lg:gap-10"
            >
              <div className="flex items-baseline gap-3 lg:block">
                <h3 className="text-base">{group.label}</h3>
                <span className="font-mono text-[10px] text-ink-faint lg:mt-1 lg:block">
                  {String(group.items.length).padStart(2, "0")}
                </span>
              </div>

              <div>
                <div className="flex flex-wrap gap-1.5">
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
                        className={`rounded-full border px-2.5 py-1 text-xs whitespace-nowrap transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                          isActive
                            ? "border-ink text-ink"
                            : "border-line text-ink-soft hover:border-ink hover:text-ink"
                        }`}
                      >
                        {item}
                        {used.length > 0 && (
                          <span
                            aria-hidden="true"
                            className={`ml-1.5 inline-block h-1 w-1 rounded-full align-middle ${
                              isActive ? "bg-accent" : "bg-accent/40"
                            }`}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Fixed height so revealing usage never shifts the layout */}
                <div aria-live="polite" className="mt-2 h-5 overflow-hidden">
                  {activeHere && activeProjects.length > 0 && (
                    <p className="truncate text-xs text-ink-soft">
                      <span className="font-mono text-[10px] tracking-[0.14em] text-ink-faint uppercase">
                        Used in
                      </span>{" "}
                      {activeProjects.map((project, i) => (
                        <span key={project.slug}>
                          {i > 0 && <span className="text-ink-faint">, </span>}
                          <Link
                            href={`/work/${project.slug}`}
                            className="text-ink underline decoration-line underline-offset-2 transition-colors hover:decoration-accent"
                          >
                            {project.title}
                          </Link>
                        </span>
                      ))}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
