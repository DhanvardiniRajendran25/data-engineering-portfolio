"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  DatabaseIcon,
  GraduationCapIcon,
  LayersIcon,
  NetworkIcon,
  QuoteIcon,
  ShieldIcon,
} from "./icons";

/**
 * Outcomes only. Every figure here is something that happened to a system or to
 * the people using it, not an inventory of what is on the CV.
 *
 * "10+ engineering tools mastered" and "3+ cloud platforms" were the two that
 * had to go. Both are self-assessed breadth, which is unfalsifiable and which
 * every candidate claims; the skills section already lists the tooling, and a
 * reader who cares can check it there. "3+ years of experience" went for the
 * same reason: it is a fact about a calendar, not about work.
 *
 * The reliability figure is stated as the reduction rather than as "40% to
 * 10%", because a tile has room for one number and 75% fewer failures is the
 * thing that actually improved.
 */
const STATS = [
  {
    value: "4B+",
    label: "Claims records processed",
    tag: "SCALE",
    Icon: DatabaseIcon,
  },
  {
    value: "75%",
    label: "Fewer pipeline failures",
    tag: "RELIABILITY",
    Icon: ShieldIcon,
  },
  {
    value: "5M+",
    label: "Health plan members served",
    tag: "REACH",
    Icon: NetworkIcon,
  },
  {
    value: "10+",
    label: "Production ETL pipelines",
    tag: "DELIVERY",
    Icon: LayersIcon,
  },
  {
    value: "2",
    label: "Peer-reviewed papers",
    tag: "RESEARCH",
    Icon: QuoteIcon,
  },
  {
    value: "70+",
    label: "Engineers onboarded",
    tag: "MENTORSHIP",
    Icon: GraduationCapIcon,
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
        className="shell grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-6"
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
