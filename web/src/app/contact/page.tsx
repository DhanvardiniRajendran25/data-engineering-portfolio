import type { Metadata } from "next";
import { CopyButton } from "@/components/copy-button";
import { LocalTime } from "@/components/local-time";
import {
  DownloadIcon,
  EmailIcon,
  GithubIcon,
  LinkedinIcon,
  PhoneIcon,
} from "@/components/icons";
import { SITE } from "@/content/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${SITE.name}, based in ${SITE.location}.`,
  alternates: { canonical: "/contact" },
};

/**
 * Deliberately not a form: a statically exported site has nowhere to POST to,
 * and a form that silently fails is worse than none.
 *
 * The contact details are the point of this page, so they sit centred at the
 * top at full width rather than in a sidebar. The qualifying detail (roles,
 * availability, fit) follows underneath as supporting context. An earlier
 * version inverted this and put the channels in a 20rem right-hand column,
 * which buried the one thing a visitor came for and also squeezed the role
 * chips into a column too narrow to hold them on one line.
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
          Available from {SITE.availableFrom}
        </span>
        <span aria-hidden="true" className="opacity-30">
          /
        </span>
        <span>{SITE.location}</span>
        <span aria-hidden="true" className="opacity-30">
          /
        </span>
        <span>{SITE.relocation}</span>
        <span aria-hidden="true" className="opacity-30">
          /
        </span>
        <span>
          <span className="sr-only">Local time: </span>
          <LocalTime /> local
        </span>
      </div>

      <h1 className="mt-6 text-display">Let us talk</h1>

      {/* Channels first, centred, full width. This is what the page is for. */}
      <section
        aria-labelledby="reach-me"
        className="mt-12 rounded-brand border border-line bg-bg-elev px-6 py-10 text-center sm:px-10"
      >
        <h2
          id="reach-me"
          className="font-mono text-[11px] tracking-[0.2em] text-ink-faint uppercase"
        >
          Reach me
        </h2>

        {/* Email shown in full. It breaks to a second line on narrow screens
            rather than truncating, since a clipped address is unusable. */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-3">
          <a
            href={`mailto:${SITE.email}`}
            className="inline-flex max-w-full items-center gap-3 text-xl break-all transition-colors hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:text-2xl"
          >
            <EmailIcon className="h-5 w-5 shrink-0 text-ink-faint" />
            {SITE.email}
          </a>
          <CopyButton value={SITE.email} label="Email address" />
        </div>

        <p className="mt-3 text-sm text-ink-faint">
          Best channel. {SITE.responseTime}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href={`tel:${SITE.phone}`}
            className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2.5 text-sm transition-colors hover:border-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <PhoneIcon className="h-4 w-4" />
            {SITE.phoneDisplay}
          </a>
          <a
            href={SITE.linkedin}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2.5 text-sm transition-colors hover:border-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <LinkedinIcon className="h-4 w-4" />
            LinkedIn
          </a>
          <a
            href={SITE.github}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2.5 text-sm transition-colors hover:border-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <GithubIcon className="h-4 w-4" />
            GitHub
          </a>
          <a
            href={SITE.resume}
            download={SITE.resumeFilename}
            className="inline-flex items-center gap-2 rounded-full border border-ink px-5 py-2.5 font-mono text-[11px] tracking-[0.14em] text-ink uppercase transition-colors hover:bg-ink hover:text-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <DownloadIcon className="h-4 w-4" />
            Resume
          </a>
        </div>
      </section>

      {/* Supporting context, now at full width so the role chips fit one line */}
      <div className="mt-16">
        <div className="min-w-0">
          <section>
            <h2 className="font-mono text-[11px] tracking-[0.2em] text-ink-faint uppercase">
              What I am looking for
            </h2>
            <p className="mt-4 text-body-lg text-ink-soft">
              I finish my MS at Northeastern in May 2026 and am available to
              start from {SITE.availableFrom}. I am looking for a team where I
              can own data and AI systems end to end, in any of these shapes:
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
      </div>
    </div>
  );
}
