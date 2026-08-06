import Image from "next/image";
import type { ProjectMeta } from "@/content/work";
import { BLUR } from "@/content/work/blur";

/**
 * Project cover. Renders the real image when one exists, and a typographic
 * placeholder when it does not, so a missing file never shows as a broken
 * image. Drop covers into web/public/projects/<slug>.webp and set `image` in
 * meta.ts.
 */
export function ProjectCover({
  project,
  priority = false,
  sizes,
}: {
  project: ProjectMeta;
  /** Set on the first above-the-fold cover so it is not lazy-loaded. */
  priority?: boolean;
  /** Rendered width at each breakpoint, so the browser picks the right file. */
  sizes?: string;
}) {
  if (project.image) {
    const blurDataURL = BLUR[project.slug];

    return (
      <Image
        src={project.image}
        alt={`${project.title} cover`}
        width={1600}
        height={1000}
        priority={priority}
        // Without this the browser assumes the image spans the full viewport
        // and downloads a larger file than it needs at every breakpoint.
        sizes={sizes ?? "(min-width: 1024px) 50vw, 100vw"}
        placeholder={blurDataURL ? "blur" : "empty"}
        blurDataURL={blurDataURL}
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
