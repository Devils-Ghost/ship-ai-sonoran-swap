import Link from "next/link";
import { cn } from "cn";
import { content, isConcept } from "@/lib/content/load";
import { SHOW_RECEIPTS } from "@/lib/site";

// FR-DISC / SRS §3.6: "Concept business" pill on every page, linking to the "Is Sonoran Swap a real
// company?" answer. That answer also lives on /launch-notes#about, which is off while SHOW_RECEIPTS is.
export function ConceptBadge({ className }: { className?: string }) {
  if (!isConcept) return null;
  return (
    <Link
      href={SHOW_RECEIPTS ? "/launch-notes#about" : "/how-it-works#faq"}
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
