import type { Metadata } from "next";
import { CopyButton } from "@/components/copy-button";
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
 * Deliberately no form.
 *
 * A statically exported site has nowhere to POST to, and a form that silently
 * fails is worse than no form at all. Direct channels also suit the audience:
 * recruiters and engineers reach for email or LinkedIn. Copy-to-clipboard
 * removes the one real friction of a mailto link, which is that it hijacks
 * the browser for anyone without a desktop mail client.
 */

const CHANNELS = [
  {
    label: "Email",
    value: SITE.email,
    href: `mailto:${SITE.email}`,
    Icon: EmailIcon,
    copyable: true,
    external: false,
  },
  {
    label: "Phone",
    value: SITE.phoneDisplay,
    href: `tel:${SITE.phone}`,
    Icon: PhoneIcon,
    copyable: true,
    external: false,
  },
  {
    label: "LinkedIn",
    value: "in/dhanvardini",
    href: SITE.linkedin,
    Icon: LinkedinIcon,
    copyable: false,
    external: true,
  },
  {
    label: "GitHub",
    value: "DhanvardiniRajendran25",
    href: SITE.github,
    Icon: GithubIcon,
    copyable: false,
    external: true,
  },
];

export default function ContactPage() {
  return (
    <div className="shell-content section-y">
      <h1 className="text-4xl sm:text-5xl lg:text-6xl">Get in touch</h1>

      <p className="mt-6 max-w-measure text-lg text-ink-soft">
        I finish my MS at Northeastern in May 2026 and am looking for software,
        data, and AI engineering roles. If you are hiring, or you just want to
        talk about pipelines and AI systems, I would like to hear from you.
      </p>

      <p className="mt-4 font-mono text-xs tracking-[0.14em] text-ink-faint uppercase">
        {SITE.location}
        <span className="mx-2 opacity-40">/</span>
        Open to relocation
      </p>

      <ul className="mt-12 border-t border-line">
        {CHANNELS.map(({ label, value, href, Icon, copyable, external }) => (
          <li
            key={label}
            className="flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-line py-5"
          >
            <span
              aria-hidden="true"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line text-ink-soft"
            >
              <Icon className="h-[17px] w-[17px]" />
            </span>

            <span className="min-w-0 flex-1">
              <span className="block font-mono text-[10px] tracking-[0.18em] text-ink-faint uppercase">
                {label}
              </span>
              <a
                href={href}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener" : undefined}
                className="mt-0.5 block truncate text-lg transition-colors hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                {value}
              </a>
            </span>

            {copyable && <CopyButton value={value} label={label} />}
          </li>
        ))}
      </ul>

      <a
        href={SITE.resume}
        download={SITE.resumeFilename}
        className="mt-10 inline-flex items-center gap-2 rounded-full border border-ink px-6 py-3 font-mono text-[11px] tracking-[0.14em] text-ink uppercase transition-colors hover:bg-ink hover:text-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <DownloadIcon className="h-4 w-4" />
        Download resume
      </a>
    </div>
  );
}
