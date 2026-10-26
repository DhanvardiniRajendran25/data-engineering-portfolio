"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  ClockIcon,
  DatabaseIcon,
  GraduationCapIcon,
  LayersIcon,
  NetworkIcon,
  QuoteIcon,
  RouteIcon,
  ShieldIcon,
} from "./icons";

/**
 * Outcomes only. Every figure here is something that happened to a system, to
 * the people it served, or to the team, not an inventory of what is on the CV.
 *
 * Self-assessed breadth ("tools mastered", "cloud platforms", "years of
 * experience") is deliberately excluded: it is unfalsifiable and every
 * candidate claims it. The skills section lists the tooling for anyone who
 * wants it. The eight tiles below span the three areas the work actually
 * covers, full-stack and backend delivery, the AI systems, and the scale and
 * people those systems reached.
 */
const STATS = [
  {
    value: "40+",
    label: "Production features shipped",
    tag: "DELIVERY",
    Icon: LayersIcon,
  },
  {
    value: "90%+",
    label: "Test coverage, TDD and XP",
    tag: "QUALITY",
    Icon: ShieldIcon,
  },
  {
    value: "30%",
    label: "Faster releases via CI/CD",
    tag: "VELOCITY",
    Icon: ClockIcon,
  },
  {
    value: "10+",
    label: "AI systems shipped, 20+ agents",
    tag: "AI SYSTEMS",
    Icon: RouteIcon,
  },
  {
    value: "5M+",
    label: "Members served by systems built",
    tag: "IMPACT",
    Icon: NetworkIcon,
  },
  {
    value: "4B+",
    label: "Records processed",
    tag: "SCALE",
    Icon: DatabaseIcon,
  },
  {
    value: "70+",
    label: "Engineers mentored",
    tag: "MENTORSHIP",
    Icon: GraduationCapIcon,
  },
  {
    value: "4",
    label: "Peer-reviewed papers",
    tag: "RESEARCH",
    Icon: QuoteIcon,
  },
];

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

/**
 * Scroll reveals move, they do not fade.
 *
 * `initial={{ opacity: 0 }}` bakes opacity:0 into the server-rendered HTML,
 * because useReducedMotion() cannot know the user's preference during SSR. Any
 * element still below the fold therefore ships transparent, and if whileInView
 * has not fired the text is invisible to sighted users and reads at 1.04:1 to
 * axe. Animating transform only removes the failure mode outright: a transform
 * cannot make text unreadable, so the worst case is an element that has not
 * moved yet rather than one that cannot be read.
 */
const item: Variants = {
  hidden: { y: 14 },
  show: { y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

export function Impact() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section aria-label="Impact by the numbers" className="section-y relative border-t border-line">
      <motion.div
        initial={prefersReducedMotion ? undefined : "hidden"}
        whileInView={prefersReducedMotion ? undefined : "show"}
        viewport={{ once: true, margin: "-80px" }}
        variants={container}
        className="shell grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4"
      >
        {STATS.map(({ value, label, tag, Icon }) => (
          <motion.div
            key={label}
            variants={item}
            whileHover={prefersReducedMotion ? undefined : { y: -4 }}
            className="group relative overflow-hidden rounded-brand border border-line bg-bg-elev p-5"
          >
            <Icon
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-3 -right-3 h-20 w-20 text-ink opacity-[0.05]"
            />

            <div className="relative flex items-center justify-between">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-ink/[0.05] text-ink-soft">
                <Icon className="h-[18px] w-[18px]" />
              </div>
              <span className="font-mono text-[10px] tracking-wider text-ink-faint">
                {tag}
              </span>
            </div>

            <p className="relative mt-4 font-mono text-3xl font-medium text-ink">
              {value}
            </p>
            <p className="relative mt-1 text-sm text-ink-soft">{label}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
