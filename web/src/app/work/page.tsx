import type { Metadata } from "next";
import { Suspense } from "react";
import { ProjectIndex } from "@/components/project-index";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Data engineering, backend, and AI projects by Dhanvardini Rajendran.",
};

export default function WorkPage() {
  return (
    <div className="shell section-y">
      <h1 className="text-3xl sm:text-4xl lg:text-5xl">Work</h1>
      <p className="mt-4 max-w-measure text-ink-soft">
        Pipelines, backend systems, and AI features. Filter by discipline, or
        open any project for the architecture and the decisions behind it.
      </p>

      {/* ProjectIndex reads filter state from the URL via useSearchParams,
          which Next requires to sit inside a Suspense boundary so the rest of
          the page can still be prerendered statically. */}
      <Suspense fallback={<div className="mt-8 h-10" />}>
        <ProjectIndex />
      </Suspense>
    </div>
  );
}
