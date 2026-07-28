"use client";

import Image from "next/image";
import { motion, useReducedMotion, type Variants } from "framer-motion";
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
  const prefersReducedMotion = useReducedMotion();

  const container: Variants = {
    hidden: {},
    show: {
      transition: { staggerChildren: prefersReducedMotion ? 0 : 0.12 },
    },
  };

  const item: Variants = {
    hidden: prefersReducedMotion ? {} : { opacity: 0, y: 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <section className="mx-auto grid max-w-page items-center gap-16 px-gutter py-28 md:grid-cols-[1.1fr_0.9fr]">
      <motion.div initial="hidden" animate="show" variants={container}>
        <motion.h1 variants={item} className="text-5xl sm:text-6xl">
          Dhanvardini
          <br />
          Rajendran
        </motion.h1>

        <motion.p variants={item} className="mt-6 max-w-prose text-lg text-ink-soft">
          I engineer data pipelines, backend systems, and AI features that
          ship to production.
        </motion.p>

        <motion.div variants={item} className="mt-10 flex flex-wrap items-center gap-4">
          <a
            href="/resume.pdf"
            download="Dhanvardini_Rajendran_Resume.pdf"
            className="rounded-full border border-ink px-6 py-3 text-xs font-medium tracking-[0.08em] text-ink uppercase transition-colors hover:bg-ink hover:text-bg"
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
                className="grid h-10 w-10 place-items-center rounded-full border border-line text-ink-soft transition-colors hover:border-ink hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
              >
                <Icon className="h-[18px] w-[18px]" />
              </a>
            ))}
          </div>
        </motion.div>

        <motion.p variants={item} className="mt-8 text-lg text-ink-soft">
          Open to roles as <RoleRotator />
        </motion.p>
      </motion.div>

      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto w-full max-w-sm"
      >
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
      </motion.div>
    </section>
  );
}
