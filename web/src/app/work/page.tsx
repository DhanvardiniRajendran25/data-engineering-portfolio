import type { Metadata } from "next";
import { ProjectIndex } from "@/components/project-index";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Data engineering, backend, and AI projects by Dhanvardini Rajendran.",
};

type Search = { role?: string };

function isRole(v: string | undefined): v is "data" | "ai" | "systems" {
  return v === "data" || v === "ai" || v === "systems";
}

export default async function WorkPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const { role } = await searchParams;
  const active = isRole(role) ? role : "all";

  return (
    <div className="shell section-y">
      <h1 className="text-3xl sm:text-4xl lg:text-5xl">Work</h1>
      <p className="mt-4 max-w-measure text-ink-soft">
        Pipelines, backend systems, and AI features. Filter by discipline, or
        open any project for the architecture and the decisions behind it.
      </p>

      {/* The filter is resolved here, on the server, and passed down. That
          keeps the project list in the server-rendered HTML instead of behind a
          client-only Suspense boundary, which previously shipped /work as an
          empty page to anything that does not run JS. */}
      <ProjectIndex active={active} />
    </div>
  );
}
