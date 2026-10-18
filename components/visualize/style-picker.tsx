"use client";

import { cn } from "cn";
import { RadioGroup as RadioGroupPrimitive } from "radix-ui";
import data from "@/content/styles.json";

// FR-VIS-03: three styles from styles.json, each with its swatches and tagline.
export const STYLES = data.styles;

export function StylePicker({ value, onChange }: { value: string; onChange: (slug: string) => void }) {
  return (
    <RadioGroupPrimitive.Root
      value={value}
      onValueChange={onChange}
      aria-label="Style"
      className="grid gap-3 sm:grid-cols-3"
    >
      {STYLES.map((s) => (
        <RadioGroupPrimitive.Item
          key={s.slug}
          value={s.slug}
          className={cn(
            "flex cursor-pointer flex-col gap-2 rounded-card border border-line bg-paper p-4 text-left transition-colors hover:border-ink-muted",
            "data-[state=checked]:border-saguaro data-[state=checked]:ring-2 data-[state=checked]:ring-saguaro",
          )}
        >
          <span className="flex gap-1" aria-hidden="true">
            {s.swatches.map((c) => (
              // Swatch colors are content data (styles.json), not design tokens.
              <span
                key={c}
                className="size-4 rounded-full border border-ink/10"
                style={{ backgroundColor: c }}
              />
            ))}
          </span>
          <span className="font-display text-lg font-semibold text-saguaro">{s.name}</span>
          <span className="text-[0.9375rem] text-ink-muted">{s.tagline}</span>
        </RadioGroupPrimitive.Item>
      ))}
    </RadioGroupPrimitive.Root>
  );
}
