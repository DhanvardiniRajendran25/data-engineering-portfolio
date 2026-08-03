import type { Metadata } from "next";
import { CopyButton } from "@/components/copy-button";
import { LocalTime } from "@/components/local-time";
import {
  DownloadIcon,
  EmailIcon,
  GithubIcon,
  LinkedinIcon,
} from "@/components/icons";
import { SITE } from "@/content/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${SITE.name}, based in ${SITE.location}.`,
  alternates: { canonical: "/contact" },
};

/**
 * Deliberately not a form, and deliberately not a second copy of the footer.
 *
 * A statically exported site has nowhere to POST to, and a form that silently
 * fails is worse than none. The footer already carries the same four links on
 * every page, so repeating them as the whole page would be redundant. What a
 * hiring reader actually cannot get anywhere else is the qualifying detail:
 * what roles, from when, on what terms, and whether their team is a fit. That
 * is what this page leads with; the channels are the closing step.
 */

const LOOKING_FOR = [
  "Software Engineer",
  "Data Engineer",
  "AI Engineer",
  "Forward Deployed Engineer",
  "Analytics Engineer",
];

const GOOD_FIT = [
  "Data infrastructure is treated as a product, not an afterthought",
  "Engineers own their pipelines end to end, including the on-call",
  "Correctness and observability matter as much as shipping speed",
  "There is appetite for AI in production, not just prototypes",
];

const LESS_GOOD_FIT = [
  "Dashboards are the deliverable and the pipeline is someone else's problem",
  "Data quality is handled by patching downstream reports",
  "AI work stops at the demo",
];

export default function ContactPage() {
  return (
    <div className="shell-content section-y">
      {/* Status line: the qualifying facts, above everything else */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[11px] tracking-[0.16em] text-ink-faint uppercase">
        <span className="inline-flex items-center gap-2 text-ink">
          <span className="relative grid h-2 w-2 place-items-center">
            <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-70 motion-safe:animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          Available from May 2026
        </span>
        <span aria-hidden="true" className="opacity-30">
          /
        </span>
        <span>{SITE.location}</span>
        <span aria-hidden="true" className="opacity-30">
          /
        </span>
        <span>
          <span className="sr-only">Local time: </span>
          <LocalTime /> local
        </span>
      </div>

      <h1 className="mt-6 text-display">Let us talk</h1>

      {/* Asymmetric split: the prose column is itself the reading measure, so
          text is never a narrow paragraph stranded in a wide empty container. */}
      <div className="mt-12 grid gap-x-16 gap-y-14 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0">
          <section>
            <h2 className="font-mono text-[11px] tracking-[0.2em] text-ink-faint uppercase">
              What I am looking for
            </h2>
            <p className="mt-4 text-body-lg text-ink-soft">
              I finish my MS at Northeastern in May 2026. I am looking for a
              team where I can own data and AI systems end to end, in any of
              these shapes:
            </p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {LOOKING_FOR.map((role) => (
                <li
                  key={role}
                  className="rounded-full border border-line px-3 py-1.5 font-mono text-[11px] text-ink-soft"
                >
                  {role}
                </li>
              ))}
            </ul>
          </section>

          {/* The distinguishing part: stating the negative case as plainly as
              the positive one. Most portfolios only claim fit. */}
          <section className="mt-14 grid gap-8 sm:grid-cols-2">
            <div>
              <h2 className="font-mono text-[11px] tracking-[0.2em] text-ink-faint uppercase">
                We will get on if
              </h2>
              <ul className="mt-4 space-y-3">
                {GOOD_FIT.map((item) => (
                  <li
                    key={item}
                    className="border-l-2 border-accent/40 pl-4 text-sm leading-relaxed text-ink-soft"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="font-mono text-[11px] tracking-[0.2em] text-ink-faint uppercase">
                Probably not a fit if
              </h2>
              <ul className="mt-4 space-y-3">
                {LESS_GOOD_FIT.map((item) => (
                  <li
                    key={item}
                    className="border-l-2 border-line pl-4 text-sm leading-relaxed text-ink-faint"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>

        {/* Channels: compact sidebar, not the headline act */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-brand border border-line bg-bg-elev p-6">
            <h2 className="font-mono text-[11px] tracking-[0.2em] text-ink-faint uppercase">
              Reach me
            </h2>

            <div className="mt-5 space-y-4">
              <div>
                <div className="flex items-center justify-between gap-3">
                  <a
                    href={`mailto:${SITE.email}`}
                    className="inline-flex min-w-0 items-center gap-2 text-sm transition-colors hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    <EmailIcon className="h-4 w-4 shrink-0 text-ink-faint" />
                    <span className="truncate">{SITE.email}</span>
                  </a>
                  <CopyButton value={SITE.email} label="Email address" />
                </div>
                <p className="mt-2 text-xs text-ink-faint">
                  Best channel. I reply within a day or two.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 border-t border-line pt-4">
                <a
                  href={SITE.linkedin}
                  target="_blank"
                  rel="noopener"
                  className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-2 text-xs transition-colors hover:border-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  <LinkedinIcon className="h-4 w-4" />
                  LinkedIn
                </a>
                <a
                  href={SITE.github}
                  target="_blank"
                  rel="noopener"
                  className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-2 text-xs transition-colors hover:border-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  <GithubIcon className="h-4 w-4" />
                  GitHub
                </a>
              </div>

              <a
                href={SITE.resume}
                download={SITE.resumeFilename}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-ink px-5 py-3 font-mono text-[11px] tracking-[0.14em] text-ink uppercase transition-colors hover:bg-ink hover:text-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <DownloadIcon className="h-4 w-4" />
                Resume
              </a>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
