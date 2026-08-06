import { ImageResponse } from "next/og";
import { PROJECTS, getProject } from "@/content/work";
import {
  OG_CONTENT_TYPE,
  OG_SIZE,
  OgCard,
  loadOgFonts,
} from "@/lib/og-card";

export const alt = "Project overview";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/**
 * One card per project, generated at build time.
 *
 * Mirrors the page's own generateStaticParams so every project ships a real
 * PNG rather than falling back to the site card. A link to a specific project
 * should preview as that project.
 */
export function generateStaticParams() {
  return PROJECTS.map((project) => ({ slug: project.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);

  // A missing project would mean the slug is not in PROJECTS, in which case the
  // page itself 404s. Render the site card rather than throwing during build.
  if (!project) {
    return new ImageResponse(
      (
        <OgCard
          eyebrow="Dhanvardini Rajendran"
          title="Selected work"
          body="Data pipelines, backend systems, and AI features that ship to production."
        />
      ),
      { ...size, fonts: await loadOgFonts() },
    );
  }

  return new ImageResponse(
    (
      <OgCard
        eyebrow={`Dhanvardini Rajendran · ${project.context}${
          project.year ? ` ${project.year}` : ""
        }`}
        title={project.title}
        body={project.oneLiner}
        metric={project.metric}
        chips={project.stack}
      />
    ),
    { ...size, fonts: await loadOgFonts() },
  );
}
