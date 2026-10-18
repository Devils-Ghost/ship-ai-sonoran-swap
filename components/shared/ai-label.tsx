import { cn } from "cn";
import { SparklesIcon } from "lucide-react";
import business from "@/content/business.json";

// AGENTS §2.7: every AI image carries the exact label from business.json (validated at build; read
// directly so client components can use it).
// "overlay" sits bottom-left over the image (DESIGN §6); "inline" is a caption below it.
export function AiLabel({
  variant = "overlay",
  className,
}: {
  variant?: "overlay" | "inline";
  className?: string;
}) {
  const label = business.disclosures.ai;
  if (variant === "inline") {
    return <p className={cn("text-[0.8125rem] text-ink-muted", className)}>{label}</p>;
  }
  return (
    <span
      className={cn(
        "absolute bottom-3 left-3 inline-flex max-w-[calc(100%-1.5rem)] items-center gap-1.5 rounded-full bg-ink/80 px-3 py-1.5 text-xs font-semibold text-caliche backdrop-blur-sm",
        className,
      )}
    >
      <SparklesIcon className="size-3.5 shrink-0" aria-hidden="true" />
      {label}
    </span>
  );
}
