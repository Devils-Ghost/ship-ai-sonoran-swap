import Link from "next/link";
import { cn } from "cn";
import { content, isConcept } from "@/lib/content/load";

// FR-DISC / SRS §3.6: "Concept business" pill on every page, linking to the about section.
export function ConceptBadge({ className }: { className?: string }) {
  if (!isConcept) return null;
  return (
    <Link
      href="/launch-notes#about"
      className={cn(
        "inline-flex min-h-8 items-center gap-1.5 rounded-full bg-sand px-3 text-xs font-semibold whitespace-nowrap text-ink hover:bg-line",
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-terracotta" aria-hidden="true" />
      {content.business.disclosures.badge}
    </Link>
  );
}
