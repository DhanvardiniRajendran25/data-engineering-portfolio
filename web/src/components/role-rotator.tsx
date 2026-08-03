"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const ROLES = [
  "Software Engineer",
  "Data Engineer",
  "AI Engineer",
  "Forward Deployed Engineer",
  "Analytics Engineer",
];

// Deliberately slow: this is ambient, not attention-grabbing.
const ROTATE_MS = 5500;

export function RoleRotator() {
  const [index, setIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  /**
   * Rotation stops entirely under `prefers-reduced-motion`, showing the first
   * role statically.
   *
   * Previously the interval ran regardless and only the transition was
   * suppressed, which left content auto-updating forever with no way to pause
   * it. WCAG 2.2.2 (Pause, Stop, Hide) covers auto-updating content, not just
   * animation, so honouring the preference here means not cycling at all.
   *
   * It also removed a real flake: axe could sample the accent text mid
   * crossfade and read its blended value (~90% opacity over the background)
   * as a contrast failure, which is a transient composite rather than a colour
   * anyone is asked to read.
   */
  useEffect(() => {
    if (prefersReducedMotion) return;

    const id = setInterval(() => {
      setIndex((current) => (current + 1) % ROLES.length);
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, [prefersReducedMotion]);

  return (
    <span className="inline-flex items-baseline gap-2">
      <span className="relative inline-block overflow-hidden align-bottom">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={ROLES[index]}
            aria-hidden="true"
            className="font-display inline-block text-xl font-medium text-accent sm:text-2xl lg:text-3xl"
            initial={prefersReducedMotion ? false : { y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={prefersReducedMotion ? undefined : { y: -12, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {ROLES[index]}
          </motion.span>
        </AnimatePresence>
      </span>
      <span className="sr-only">Open to roles as {ROLES.join(", ")}.</span>
    </span>
  );
}
