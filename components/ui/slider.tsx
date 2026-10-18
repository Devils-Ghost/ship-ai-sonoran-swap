"use client";

import * as React from "react";
import { cn } from "cn";
import { Slider as SliderPrimitive } from "radix-ui";

// Radix handles arrows, Page Up/Down and Home/End. The thumb is 44 px for touch (DESIGN §9);
// the visible dot inside it stays small.
function Slider({
  className,
  "aria-label": ariaLabel,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  // The label belongs on the thumb (role="slider"); on the root <span> it is a prohibited ARIA attribute.
  return (
    <SliderPrimitive.Root
      data-slot="slider"
      className={cn("relative flex h-11 w-full touch-none items-center select-none", className)}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-sand">
        <SliderPrimitive.Range className="absolute h-full bg-terracotta" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        aria-label={ariaLabel}
        className="flex size-11 cursor-grab items-center justify-center rounded-full active:cursor-grabbing"
      >
        <span className="size-6 rounded-full border-[3px] border-terracotta bg-paper shadow-card" />
      </SliderPrimitive.Thumb>
    </SliderPrimitive.Root>
  );
}

export { Slider };
