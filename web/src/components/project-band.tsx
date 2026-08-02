"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ROLE_LABELS, type ProjectMeta } from "@/content/work";
import { ProjectCover } from "./project-cover";

/**
 * One project as a full-width band: cover on one side, text on the other,
 * sides alternating down the page. Deliberately not a boxed card.
 *
 * Detail (stack, metric, view affordance) is revealed on hover AND on
 * keyboard focus, never hover alone. Below `lg` the layout stacks and the
 * detail is always visible, since touch devices have no hover.
 */
export function ProjectBand({
  project,
  index,
}: {
  project: ProjectMeta;
  index: number;
}) {
  const prefersReducedMotion = useReducedMotion();
  const mirrored = index % 2 === 1;

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        href={`/work/${project.slug}`}
        className="group grid items-center gap-6 rounded-brand py-8 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent lg:grid-cols-2 lg:gap-14 lg:py-12"
      >
        {/* Cover */}
        <div
          className={`overflow-hidden rounded-brand border border-line ${
            mirrored ? "lg:order-2" : ""
          }`}
        >
          <div className="aspect-[16/10] w-full overflow-hidden">
            <div className="h-full w-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04] group-focus-visible:scale-[1.04] motion-reduce:transform-none motion-reduce:transition-none">
              <ProjectCover project={project} />
            </div>
          </div>
        </div>

        {/* Text */}
        <div className={mirrored ? "lg:order-1" : ""}>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="font-mono text-[10px] tracking-[0.18em] text-ink-faint uppercase">
              {project.roles.map((role) => ROLE_LABELS[role]).join(" · ")}
            </span>
            {project.year && (
              <span className="font-mono text-[10px] text-ink-faint">
                {project.year}
              </span>
            )}
          </div>

          <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl">
            {project.title}
          </h2>

          <p className="mt-3 max-w-measure text-ink-soft">{project.oneLiner}</p>

          {/* Revealed on hover / focus on desktop, always visible below lg */}
          <div className="mt-5 grid grid-rows-[1fr] opacity-100 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:grid-rows-[0fr] lg:opacity-0 lg:group-hover:grid-rows-[1fr] lg:group-hover:opacity-100 lg:group-focus-visible:grid-rows-[1fr] lg:group-focus-visible:opacity-100 motion-reduce:transition-none">
            <div className="overflow-hidden">
              {project.metric && (
                <p className="mb-3">
                  <span className="font-mono text-2xl text-ink">
                    {project.metric.value}
                  </span>{" "}
                  <span className="text-sm text-ink-soft">
                    {project.metric.label}
                  </span>
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                {project.stack.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-full border border-line px-2.5 py-1 font-mono text-[11px] text-ink-soft"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              <span className="mt-4 inline-block font-mono text-[11px] tracking-[0.14em] text-ink uppercase">
                View project
                <span className="ml-2 inline-block transition-transform duration-300 group-hover:translate-x-1">
                  &rarr;
                </span>
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
