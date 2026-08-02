"use client";

import { useEffect } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";

type Layer = {
  key: string;
  position: string;
  size: string;
  colorVar: string;
  driftClass: string;
  depth: number;
};

const LAYERS: Layer[] = [
  {
    key: "aurora-1",
    position: "-top-40 -left-24",
    size: "h-[560px] w-[560px]",
    colorVar: "var(--aurora-1)",
    driftClass: "aurora-drift-a",
    depth: 24,
  },
  {
    key: "aurora-2",
    position: "top-4 -right-32",
    size: "h-[520px] w-[520px]",
    colorVar: "var(--aurora-2)",
    driftClass: "aurora-drift-b",
    depth: -30,
  },
  {
    key: "aurora-3",
    position: "-bottom-32 left-1/3",
    size: "h-[500px] w-[500px]",
    colorVar: "var(--aurora-3)",
    driftClass: "aurora-drift-c",
    depth: 18,
  },
];

function AuroraLayer({
  layer,
  springX,
  springY,
}: {
  layer: Layer;
  springX: MotionValue<number>;
  springY: MotionValue<number>;
}) {
  const x = useTransform(springX, (v) => v * layer.depth);
  const y = useTransform(springY, (v) => v * layer.depth);

  return (
    <div className={`absolute ${layer.position} ${layer.size} ${layer.driftClass}`}>
      <motion.div
        className="aurora-layer"
        style={{ background: layer.colorVar, x, y }}
      />
    </div>
  );
}

export function AmbientBackground() {
  const prefersReducedMotion = useReducedMotion();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const springX = useSpring(pointerX, { stiffness: 35, damping: 20 });
  const springY = useSpring(pointerY, { stiffness: 35, damping: 20 });

  useEffect(() => {
    if (prefersReducedMotion) return;

    function onPointerMove(event: PointerEvent) {
      pointerX.set(event.clientX / window.innerWidth - 0.5);
      pointerY.set(event.clientY / window.innerHeight - 0.5);
    }

    window.addEventListener("pointermove", onPointerMove);
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, [prefersReducedMotion, pointerX, pointerY]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {LAYERS.map((layer) => (
        <AuroraLayer key={layer.key} layer={layer} springX={springX} springY={springY} />
      ))}
    </div>
  );
}
