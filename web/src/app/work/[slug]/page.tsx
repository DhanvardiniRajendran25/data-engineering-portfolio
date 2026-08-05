import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { PROJECTS, PROJECT_BODIES, ROLE_LABELS, getProject } from "@/content/work";
import { ProjectCover } from "@/components/project-cover";
import { PodcastIQDeepDive } from "@/components/project/podcastiq-deep-dive";
import { SageDeepDive } from "@/components/project/sage-deep-dive";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return PROJECTS.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return { title: project.title, description: project.oneLiner };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  // Projects with a bespoke deep dive render that instead of the MDX body.
  // Declared before the loader below, which reads it.
  const hasDeepDive = slug === "podcastiq" || slug === "sage";

  const loadBody = PROJECT_BODIES[slug];
  const Body =
    !hasDeepDive && project.hasWriteUp && loadBody
      ? (await loadBody()).default
      : null;

  const position = PROJECTS.findIndex((p) => p.slug === slug);
  const previous = position > 0 ? PROJECTS[position - 1] : null;
  const next =
    position < PROJECTS.length - 1 ? PROJECTS[position + 1] : null;

  return (
    <article className="section-y">
      <div className="shell">
      <Link
        href="/work"
        className="font-mono text-[11px] tracking-[0.14em] text-ink-soft uppercase transition-colors hover:text-ink"
      >
        &larr; All work
      </Link>

      <header className="mt-8">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="font-mono text-[10px] tracking-[0.18em] text-ink-faint uppercase">
            {project.roles.map((role) => ROLE_LABELS[role]).join(" · ")}
          </span>
          <span className="font-mono text-[10px] text-ink-faint">
            {project.context}
            {project.year ? ` · ${project.year}` : ""}
          </span>
        </div>

        <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl">
          {project.title}
        </h1>
        <p className="mt-4 max-w-measure text-lg text-ink-soft">
          {project.oneLiner}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {project.repo && (
            <a
              href={project.repo}
              target="_blank"
              rel="noopener"
              className="rounded-full border border-ink px-5 py-2.5 font-mono text-[11px] tracking-[0.14em] text-ink uppercase transition-colors hover:bg-ink hover:text-bg"
            >
              Repository
            </a>
          )}
          {project.live && (
            <a
              href={project.live}
              target="_blank"
              rel="noopener"
              className="rounded-full border border-line px-5 py-2.5 font-mono text-[11px] tracking-[0.14em] text-ink-soft uppercase transition-colors hover:border-ink hover:text-ink"
            >
              Live demo
            </a>
          )}
        </div>
      </header>

      {/* Capped well under the 1600px shell. At full width a 16:10 cover renders
          about 1600x1000 and pushes the entire write-up below the fold. */}
      <div className="mx-auto mt-10 max-w-3xl overflow-hidden rounded-brand border border-line">
        <div className="aspect-[2/1] w-full">
          <ProjectCover
            project={project}
            priority
            sizes="(min-width: 768px) 768px, 100vw"
          />
        </div>
      </div>

      {/* Deep-dive projects close with a full grouped stack section, so the
          duplicate chip row here is dropped for them. */}
      {!hasDeepDive && (
      <div className="mt-8 flex flex-wrap gap-2">
        {project.stack.map((tech) => (
          <span
            key={tech}
            className="rounded-full border border-line px-3 py-1 font-mono text-[11px] text-ink-soft"
          >
            {tech}
          </span>
        ))}
      </div>
      )}

      {Body && (
        <div className="mt-12 max-w-measure">
          <Body />
        </div>
      )}

      {!project.hasWriteUp && !hasDeepDive && (
        <p className="mt-12 max-w-measure rounded-brand border border-line bg-bg-elev p-6 text-sm text-ink-soft">
          The full write-up for this project is in progress. The repository
          above has the code and implementation detail in the meantime.
        </p>
      )}
      </div>

      {slug === "podcastiq" && <PodcastIQDeepDive />}
      {slug === "sage" && <SageDeepDive />}

      {project.gallery && project.gallery.length > 0 && (
        <section aria-label="Project images" className="shell mt-16 space-y-10">
          {project.gallery.map((item) => (
            <figure key={item.src}>
              <div className="overflow-hidden rounded-brand border border-line">
                <Image
                  src={item.src}
                  alt={item.caption}
                  width={1600}
                  height={1000}
                  className="h-auto w-full"
                />
              </div>
              <figcaption className="mt-3 max-w-measure font-mono text-xs text-ink-faint">
                {item.caption}
              </figcaption>
            </figure>
          ))}
        </section>
      )}

      <nav
        aria-label="Project navigation"
        className="shell mt-20 flex flex-wrap justify-between gap-6 border-t border-line pt-8"
      >
        {previous ? (
          <Link href={`/work/${previous.slug}`} className="group">
            <span className="font-mono text-[10px] tracking-[0.18em] text-ink-faint uppercase">
              Previous
            </span>
            <p className="mt-1 text-lg transition-colors group-hover:text-accent">
              {previous.title}
            </p>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link href={`/work/${next.slug}`} className="group text-right">
            <span className="font-mono text-[10px] tracking-[0.18em] text-ink-faint uppercase">
              Next
            </span>
            <p className="mt-1 text-lg transition-colors group-hover:text-accent">
              {next.title}
            </p>
          </Link>
        )}
      </nav>
    </article>
  );
}
