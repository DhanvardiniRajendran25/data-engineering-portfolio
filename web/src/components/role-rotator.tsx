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
const ROTATE_MS = 3200;

export function RoleRotator() {
  const [index, setIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((current) => (current + 1) % ROLES.length);
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="inline-flex items-baseline gap-2">
      <span className="relative inline-block overflow-hidden align-bottom">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={ROLES[index]}
            aria-hidden="true"
            className="font-display inline-block font-semibold text-accent"
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
