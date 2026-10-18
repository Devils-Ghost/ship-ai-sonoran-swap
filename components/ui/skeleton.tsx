import { cn } from "cn";

// DESIGN §6: sand shimmer; the global reduced-motion rule stops the pulse.
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn("animate-pulse rounded-input bg-sand", className)}
      {...props}
    />
  );
}

export { Skeleton };
