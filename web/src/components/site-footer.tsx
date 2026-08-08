import { DownloadIcon, EmailIcon, GithubIcon, LinkedinIcon } from "./icons";
import { SITE } from "@/content/site";

const FOOTER_LINKS = [
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
    href: SITE.resume,
    label: "Resume",
    Icon: DownloadIcon,
    external: false,
    download: SITE.resumeFilename,
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-line px-gutter py-8 text-sm text-ink-soft">
      <div className="mx-auto flex max-w-page flex-wrap items-center justify-between gap-4">
        <span className="font-display text-ink">Dhanvardini Rajendran</span>
        <nav aria-label="Contact" className="flex items-center gap-2">
          {FOOTER_LINKS.map(({ href, label, Icon, external, download }) => (
            <a
              key={label}
              href={href}
              aria-label={label}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener" : undefined}
              download={download}
              className="grid h-10 w-10 place-items-center rounded-full border border-line text-ink-soft transition-colors hover:border-ink hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
            >
              <Icon className="h-[16px] w-[16px]" />
            </a>
          ))}
        </nav>
      </div>
      <p className="mx-auto mt-4 max-w-page text-ink-faint">
        &copy; {new Date().getFullYear()} Dhanvardini Rajendran.
      </p>
    </footer>
  );
}
