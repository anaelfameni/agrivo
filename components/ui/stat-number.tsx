"use client";
import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";

interface Props {
  value: number;
  from?: number;
  duration?: number;
  format?: (n: number) => string;
  prefix?: string;
  suffix?: string;
  className?: string;
}

/** Compteur animé de `from` → `value`, déclenché une fois au scroll (whileInView). */
export function StatNumber({
  value,
  from = 0,
  duration = 1.6,
  format,
  prefix = "",
  suffix = "",
  className = "",
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-8% 0px" });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(from);

  useEffect(() => {
    if (!inView) return;
    // Reduced-motion : pas de compteur animé, on affiche directement la valeur finale.
    if (reduce) {
      setDisplay(value);
      return;
    }
    const controls = animate(from, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [inView, value, from, duration, reduce]);

  const fmt = format ?? ((n: number) => Math.round(n).toLocaleString("fr-FR"));
  return (
    <span ref={ref} className={className}>
      {prefix}
      {fmt(display)}
      {suffix}
    </span>
  );
}
