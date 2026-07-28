import Image from "next/image";
import { EmailIcon, GithubIcon, LinkedinIcon, PhoneIcon } from "./icons";
import { RoleRotator } from "./role-rotator";

const SOCIAL_LINKS = [
  {
    href: "https://www.linkedin.com/in/dhanvardini/",
    label: "LinkedIn",
    Icon: LinkedinIcon,
    external: true,
  },
  {
    href: "https://github.com/DhanvardiniRajendran25",
    label: "GitHub",
    Icon: GithubIcon,
    external: true,
  },
  {
    href: "mailto:dhanvardini.rajendran@gmail.com",
    label: "Email",
    Icon: EmailIcon,
    external: false,
  },
  {
    href: "tel:+16179353175",
    label: "Call",
    Icon: PhoneIcon,
    external: false,
  },
];

export function Hero() {
  return (
    <section className="mx-auto grid max-w-page items-center gap-12 px-gutter py-20 md:grid-cols-[1.1fr_0.9fr]">
      <div>
        <h1 className="text-5xl sm:text-6xl">
          Dhanvardini
          <br />
          Rajendran
        </h1>

        <p className="mt-6 max-w-prose text-lg text-ink-soft">
          I engineer data pipelines, backend systems, and AI features that
          ship to production.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a
            href="/resume.pdf"
            download="Dhanvardini_Rajendran_Resume.pdf"
            className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Download Resume
          </a>

          <div className="flex items-center gap-2">
            {SOCIAL_LINKS.map(({ href, label, Icon, external }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener" : undefined}
                className="grid h-10 w-10 place-items-center rounded-full border border-line text-ink-soft transition-colors hover:border-accent hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
              >
                <Icon className="h-[18px] w-[18px]" />
              </a>
            ))}
          </div>
        </div>

        <p className="mt-8 text-sm text-ink-soft">
          Open to roles as <RoleRotator />
        </p>
      </div>

      <div className="relative mx-auto w-full max-w-sm">
        <div className="overflow-hidden rounded-brand border border-line shadow-brand">
          <Image
            src="/headshot.webp"
            alt="Dhanvardini Rajendran"
            width={420}
            height={560}
            priority
            className="h-auto w-full"
          />
        </div>
        <div className="absolute -bottom-4 -right-4 rounded-brand-sm border border-line bg-bg-elev px-4 py-3 text-center shadow-brand">
          <p className="font-display text-lg text-ink">3+ yrs</p>
          <p className="text-xs text-ink-soft">building production systems</p>
        </div>
      </div>
    </section>
  );
}
