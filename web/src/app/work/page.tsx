import type { Metadata } from "next";
import { CASE_STUDIES, ROLE_LABELS } from "@/content/work";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Data engineering, backend, and AI case studies by Dhanvardini Rajendran.",
};

// Temporary listing. Phase C replaces this with the real archive table
// (semantic <table>, role filtering, URL state, responsive collapse).
// It exists now so the Phase B content model is exercised by the build.
export default function WorkPage() {
  return (
    <div className="shell section-y">
      <h1 className="text-3xl sm:text-4xl">Work</h1>
      <p className="mt-4 max-w-measure text-ink-soft">
        {CASE_STUDIES.length} case studies. The archive table, filtering, and
        written write-ups land in the next phases.
      </p>

      <ul className="mt-10 divide-y divide-line border-t border-line">
        {CASE_STUDIES.map((study) => (
          <li key={study.slug} className="py-5">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="font-mono text-xs text-ink-faint">
                {study.year ?? "----"}
              </span>
              <h2 className="text-xl">{study.title}</h2>
              <span className="font-mono text-[10px] tracking-wider text-ink-faint uppercase">
                {study.roles.map((role) => ROLE_LABELS[role]).join(" · ")}
              </span>
            </div>

            <p className="mt-2 max-w-measure text-sm text-ink-soft">
              {study.oneLiner}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="font-mono text-xs text-ink-faint">
                {study.stack.join(" · ")}
              </span>
              {study.repo && (
                <a
                  href={study.repo}
                  target="_blank"
                  rel="noopener"
                  className="text-xs underline decoration-line underline-offset-4 transition-colors hover:decoration-accent"
                >
                  Repository
                </a>
              )}
              {study.live && (
                <a
                  href={study.live}
                  target="_blank"
                  rel="noopener"
                  className="text-xs underline decoration-line underline-offset-4 transition-colors hover:decoration-accent"
                >
                  Live
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
