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

/**
 * Text reveals move, they do not fade.
 *
 * The staggered entrance previously animated opacity from 0. Because
 * useReducedMotion() cannot know the preference during SSR, that ships
 * opacity:0 in the server HTML, and any frame sampled before the animation
 * finishes has text at ~1.1:1 against the background. Animating transform only
 * removes the failure mode: an element that has not moved yet is still legible.
 *
 * The portrait below keeps its fade, since an image cannot become unreadable
 * text.
 */
export function Hero() {
  const prefersReducedMotion = useReducedMotion();

  const container: Variants = {
    hidden: {},
    show: {
      transition: { staggerChildren: prefersReducedMotion ? 0 : 0.12 },
    },
  };

  const item: Variants = {
    hidden: prefersReducedMotion ? {} : { y: 16 },
    show: {
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <section className="shell grid items-center gap-10 py-10 sm:py-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:py-16">
      <motion.div initial="hidden" animate="show" variants={container}>
        <motion.h1 variants={item} className="text-4xl sm:text-5xl lg:text-6xl">
          Dhanvardini
          <br />
          Rajendran
        </motion.h1>

        <motion.p variants={item} className="mt-6 max-w-measure text-base text-ink-soft sm:text-lg">
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

        <motion.p variants={item} className="mt-8 text-base text-ink-soft sm:text-lg">
          Open to roles as <RoleRotator />
        </motion.p>
      </motion.div>

      <motion.div
        // Fade is fine here: this block is the portrait, and an image at
        // partial opacity cannot become unreadable text.
        initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto w-full max-w-sm lg:mr-0 lg:ml-auto lg:max-w-[420px]"
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
