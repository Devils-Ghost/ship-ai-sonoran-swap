"use client";

import * as React from "react";
import { cn } from "cn";
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui";

// DESIGN §6 segmented control (tiers; Before/After/Compare): 44 px, one value always selected.
type SegmentedControlProps<T extends string> = {
  value: T;
  onValueChange: (value: T) => void;
  options: readonly { value: T; label: React.ReactNode }[];
  /** Accessible name for the group, e.g. "Project style". */
  label: string;
  className?: string;
};

function SegmentedControl<T extends string>({
  value,
  onValueChange,
  options,
  label,
  className,
}: SegmentedControlProps<T>) {
  return (
    <ToggleGroupPrimitive.Root
      type="single"
      value={value}
      // Radix emits "" when the active item is clicked again; keep the current value instead.
      onValueChange={(next) => {
        if (next) onValueChange(next as T);
      }}
      aria-label={label}
      className={cn(
        "inline-flex w-full flex-wrap rounded-full border border-line bg-sand p-1 sm:w-fit",
        className,
      )}
    >
      {options.map((o) => (
        <ToggleGroupPrimitive.Item
          key={o.value}
          value={o.value}
          className="min-h-11 flex-1 cursor-pointer rounded-full px-3 text-[0.9375rem] font-semibold whitespace-nowrap text-ink-muted transition-colors duration-150 hover:text-ink data-[state=on]:bg-paper data-[state=on]:text-saguaro data-[state=on]:shadow-card sm:px-4"
        >
          {o.label}
        </ToggleGroupPrimitive.Item>
      ))}
    </ToggleGroupPrimitive.Root>
  );
}

export { SegmentedControl };
