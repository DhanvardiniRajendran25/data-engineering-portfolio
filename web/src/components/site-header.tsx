"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/story", label: "Story" },
  { href: "/experience", label: "Experience" },
  { href: "/education", label: "Education" },
  { href: "/skills", label: "Skills" },
  { href: "/awards", label: "Awards" },
  { href: "/projects", label: "Projects" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 flex flex-wrap items-center justify-between gap-4 border-b border-line bg-bg/85 px-gutter py-4 backdrop-blur">
      <Link href="/" className="font-display text-lg font-semibold text-ink">
        Dhanvardini Rajendran
      </Link>
      <nav
        aria-label="Primary"
        className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium text-ink-soft"
      >
        {NAV_LINKS.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive ? "page" : undefined}
              className={
                isActive
                  ? "text-accent"
                  : "transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
              }
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      <ThemeToggle />
    </header>
  );
}
