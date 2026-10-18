import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";
import { Slot } from "radix-ui";

// DESIGN §6 badge: 12 px pill. Status variants always pair color with text (never color alone).
const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs leading-none font-semibold whitespace-nowrap [&>svg]:size-3.5",
  {
    variants: {
      variant: {
        neutral: "bg-sand text-ink",
        outline: "border border-line bg-paper text-ink",
        success: "bg-success text-white",
        warning: "bg-warning-bg text-warning",
        error: "bg-error text-white",
        dark: "bg-saguaro text-caliche",
      },
    },
    defaultVariants: { variant: "neutral" },
  },
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span";
  return <Comp data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
