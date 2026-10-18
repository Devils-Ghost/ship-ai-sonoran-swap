"use client";

import { useEffect, useRef, useState } from "react";

// FR-EST-10: numbers glide to their new value in 200 ms; no animation with reduced motion.
export function useCountUp(target: number, durationMs = 200): number {
  const [value, setValue] = useState(target);
  const from = useRef(target);

  useEffect(() => {
    const start = from.current;
    if (start === target) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t0 = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      // Reduced motion: land on the target in the first frame.
      const p = reduce ? 1 : Math.min(1, (now - t0) / durationMs);
      const eased = 1 - (1 - p) ** 3;
      const next = Math.round(start + (target - start) * eased);
      from.current = next;
      setValue(next);
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, durationMs]);

  return value;
}
