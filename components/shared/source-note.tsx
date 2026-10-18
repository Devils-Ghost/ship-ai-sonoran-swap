import { cn } from "cn";
import { ArrowUpRightIcon } from "lucide-react";
import type { RebateProgram } from "@/lib/content/schema";

// FR-REB-04 / RC6: every rebate figure carries its official source.
// Copy: CONTENT §1 "Source: {Program name}, City of {City}".
export function SourceNote({ program, className }: { program: RebateProgram; className?: string }) {
  return (
    <p className={cn("text-[0.8125rem] text-ink-muted", className)}>
      Source:{" "}
      <a
        href={program.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="underline decoration-1 underline-offset-3 hover:text-ink"
      >
        {program.name}, City of {program.city}
        <ArrowUpRightIcon className="ml-0.5 inline size-3.5 align-[-2px]" aria-hidden="true" />
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    </p>
  );
}
