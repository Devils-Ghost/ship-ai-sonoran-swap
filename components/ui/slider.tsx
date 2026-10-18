"use client";

import * as React from "react";
import { cn } from "cn";

// A native range input: the browser handles arrows, Page Up/Down and Home/End, and it ships no script
// beyond this component (the home hero loads it before its LCP image). The input is 44 px tall for touch
// (DESIGN §9); the visible dot is 24 px. The fill is drawn under the thumb's center at every value.
type Props = Omit<
  React.ComponentProps<"input">,
  "type" | "value" | "defaultValue" | "onChange" | "min" | "max" | "step"
> & {
  min: number;
  max: number;
  step?: number;
  /** Kept as a one-item array so callers read like a multi-thumb slider API. */
  value: number[];
  onValueChange: (value: number[]) => void;
};

function Slider({ className, min, max, step = 1, value, onValueChange, style, ...props }: Props) {
  const current = Math.min(max, Math.max(min, value[0] ?? min));
  const fraction = max > min ? (current - min) / (max - min) : 0;
  return (
    <input
      type="range"
      data-slot="slider"
      min={min}
      max={max}
      step={step}
      value={current}
      onChange={(e) => onValueChange([Number(e.target.value)])}
      className={cn("range-slider", className)}
      style={{ ...style, "--fill": fraction } as React.CSSProperties}
      {...props}
    />
  );
}

export { Slider };
