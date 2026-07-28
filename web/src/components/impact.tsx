"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  ClockIcon,
  CloudIcon,
  DatabaseIcon,
  GraduationCapIcon,
  LayersIcon,
  ToolIcon,
} from "./icons";

const STATS = [
  {
    value: "8+",
    label: "Pipelines & systems shipped",
    tag: "DELIVERY",
    Icon: LayersIcon,
  },
  {
    value: "5B+",
    label: "Records processed",
    tag: "SCALE",
    Icon: DatabaseIcon,
  },
  {
    value: "3+",
    label: "Cloud platforms",
    tag: "INFRA",
    Icon: CloudIcon,
  },
  {
    value: "10+",
    label: "Engineering tools mastered",
    tag: "TOOLING",
    Icon: ToolIcon,
  },
  {
    value: "3+",
    label: "Years of engineering experience",
    tag: "TENURE",
    Icon: ClockIcon,
  },
  {
    value: "70+",
    label: "Students taught",
    tag: "MENTORSHIP",
    Icon: GraduationCapIcon,
  },
];

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

export function Impact() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section aria-label="Impact by the numbers" className="relative border-t border-line py-20">
      <motion.div
        initial={prefersReducedMotion ? undefined : "hidden"}
        whileInView={prefersReducedMotion ? undefined : "show"}
        viewport={{ once: true, margin: "-80px" }}
        variants={container}
        className="mx-auto grid max-w-page grid-cols-2 gap-6 px-gutter sm:grid-cols-3 md:grid-cols-6"
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
