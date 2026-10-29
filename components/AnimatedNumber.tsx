"use client";

import { animate, useMotionValue, useReducedMotion, useTransform, motion } from "framer-motion";
import { useEffect } from "react";
import { aud } from "@/lib/pricing";

export function AnimatedAUD({ value, className }: { value: number; className?: string }) {
  const mv = useMotionValue(value);
  const reduce = useReducedMotion();
  const text = useTransform(mv, (v) => aud(Math.round(v)));
  useEffect(() => {
    if (reduce) {
      mv.set(value);
      return;
    }
    const c = animate(mv, value, { duration: 0.8, ease: [0.16, 1, 0.3, 1] });
    return () => c.stop();
  }, [value, mv, reduce]);
  return (
    <motion.span className={`tabular-nums ${className ?? ""}`} aria-live="polite">
      {text}
    </motion.span>
  );
}
