import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

// DESIGN §6: sand or white bg, 12 px radius, 24 px padding, line border; borders over shadows.
const cardVariants = cva("rounded-card border border-line p-6 text-ink", {
  variants: {
    tone: {
      paper: "bg-paper",
      sand: "bg-sand",
    },
    raised: { true: "shadow-card", false: "" },
  },
  defaultVariants: { tone: "paper", raised: false },
});

function Card({
  className,
  tone,
  raised,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof cardVariants>) {
  return <div data-slot="card" className={cn(cardVariants({ tone, raised }), className)} {...props} />;
}

export { Card, cardVariants };
