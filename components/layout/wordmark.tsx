import { cn } from "cn";

// Sun over a desert horizon; drawn with currentColor so it works on caliche and saguaro.
function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true" focusable="false">
      <circle cx="16" cy="13" r="6" fill="currentColor" className="text-terracotta" />
      <path
        d="M3 23c4-3.2 7.5-3.2 11 0s7 3.2 11 0c1.4-1.1 2.7-1.7 4-1.9"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Wordmark({ name, className }: { name: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Mark className="size-7 shrink-0 sm:size-8" />
      {/* Below 360 px only the mark shows; the home link keeps the name as its accessible label. */}
      <span className="font-display text-[1.1875rem] leading-none font-semibold tracking-tight whitespace-nowrap max-[359px]:sr-only sm:text-[1.375rem]">
        {name}
      </span>
    </span>
  );
}
