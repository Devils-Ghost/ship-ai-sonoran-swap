import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";
import { Loader2Icon } from "lucide-react";
import { Slot } from "radix-ui";

// DESIGN §6: pill buttons, 48 px tall (44 px minimum), Inter 600 16 px, hover darken, press scale .98.
const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition-[background-color,color,border-color,transform] duration-150 ease-soft select-none active:scale-[.98] disabled:pointer-events-none disabled:opacity-50 aria-busy:cursor-progress [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      variant: {
        primary: "bg-terracotta text-white hover:bg-terracotta-dark",
        // The header's always-present CTA: saguaro, so terracotta marks one primary action per viewport (D2).
        brand: "bg-saguaro text-caliche hover:bg-ink",
        secondary:
          "border-[1.5px] border-saguaro bg-transparent text-saguaro hover:bg-saguaro hover:text-caliche",
        ghost: "bg-transparent text-ink hover:bg-sand",
        link: "h-auto! rounded-none px-0! text-terracotta underline decoration-[1.5px] underline-offset-3 hover:text-terracotta-dark active:scale-100",
      },
      size: {
        default: "h-12 px-5 text-base",
        sm: "h-11 px-4 text-[0.9375rem]",
        icon: "size-11",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    /** Shows a spinner, sets aria-busy and blocks repeat clicks. Ignored with asChild. */
    loading?: boolean;
  };

function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  if (asChild) {
    return (
      <Slot.Root data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props}>
        {children}
      </Slot.Root>
    );
  }
  return (
    <button
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <Loader2Icon className="animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}

export { Button, buttonVariants };
