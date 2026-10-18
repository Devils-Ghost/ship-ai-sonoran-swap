import * as React from "react";
import { cn } from "cn";

// DESIGN §6: 48 px, caliche-white, line border, 6 px radius; aria-invalid turns the border to error.
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-12 w-full min-w-0 rounded-input border border-line bg-paper px-3.5 text-base text-ink transition-colors duration-150 placeholder:text-ink-muted hover:border-ink-muted disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-error",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
