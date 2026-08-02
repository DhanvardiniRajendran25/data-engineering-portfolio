import Image from "next/image";
import type { ProjectMeta } from "@/content/work";

/**
 * Project cover. Renders the real screenshot when one exists, and a
 * typographic placeholder when it does not, so a missing file never shows as a
 * broken image. Drop real covers into web/public/projects/<slug>.png and set
 * `image` in meta.ts.
 */
export function ProjectCover({ project }: { project: ProjectMeta }) {
  if (project.image) {
    return (
      <Image
        src={project.image}
        alt={`${project.title} interface`}
        width={1600}
        height={1000}
        className="h-full w-full object-cover"
      />
    );
  }

  return (
    <div className="flex h-full w-full flex-col justify-between bg-ink/[0.04] p-6 sm:p-8">
      <span className="font-mono text-[10px] tracking-[0.18em] text-ink-faint uppercase">
        {project.context}
      </span>
      <div>
        <p className="font-display text-2xl text-ink/70 sm:text-3xl">
          {project.title}
        </p>
        <p className="mt-2 font-mono text-[11px] text-ink-faint">
          {project.stack.slice(0, 3).join(" · ")}
        </p>
      </div>
    </div>
  );
}
