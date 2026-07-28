"use client";

import { useEffect, useState } from "react";

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

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((current) => (current + 1) % ROLES.length);
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="inline-flex items-baseline gap-2">
      <span aria-hidden="true" className="font-display text-accent">
        {ROLES[index]}
      </span>
      <span className="sr-only">
        Open to roles as {ROLES.join(", ")}.
      </span>
    </span>
  );
}
