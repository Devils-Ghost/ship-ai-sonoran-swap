import { CheckIcon, FileTextIcon, OctagonXIcon } from "lucide-react";
import type { ProgramId, RebateProgram } from "@/lib/content/schema";
import { getProgram } from "@/lib/rebates/engine";
import { formatRateShort, summarize } from "@/lib/rebates/summary";
import { formatDate, formatNumber } from "@/lib/utils/format";

// MDX building blocks for the guides. Every number and rule is read from rebate-programs.json,
// so a guide can never drift from the data (AGENTS §2.2).

type Field =
  | "rate"
  | "minimum"
  | "healthy"
  | "approvalName"
  | "reviewTime"
  | "completeWithin"
  | "payment"
  | "howToApply"
  | "summary"
  | "lastVerified";

function value(p: RebateProgram, get: Field): string {
  switch (get) {
    case "rate":
      return p.type === "per_sqft"
        ? `${formatRateShort(p.ratePerSqft)} per square foot`
        : summarize(p).headline;
    case "minimum":
      return "minimumSqft" in p && typeof p.minimumSqft === "number"
        ? `${formatNumber(p.minimumSqft)} sq ft`
        : "";
    case "healthy":
      return p.healthyGrassMinPercent ? `${p.healthyGrassMinPercent}%` : "";
    case "approvalName":
      return p.approval.name;
    case "reviewTime":
      return p.approval.reviewTime ?? "";
    case "completeWithin":
      return p.approval.completeWithin ?? "";
    case "payment":
      return p.payment ?? "";
    case "howToApply":
      return p.howToApply;
    case "summary":
      return summarize(p).sentence;
    case "lastVerified":
      return formatDate(p.lastVerified, "long");
  }
}

/** Inline fact, e.g. <Fact program="phoenix" get="reviewTime" /> → "up to 3 weeks". */
export function Fact({ program, get }: { program: ProgramId; get: Field }) {
  return <>{value(getProgram(program), get)}</>;
}

type ListName = "eligibility" | "prohibitions" | "requirements" | "documents";

const ICON = {
  eligibility: { Icon: CheckIcon, color: "text-success" },
  requirements: { Icon: CheckIcon, color: "text-success" },
  prohibitions: { Icon: OctagonXIcon, color: "text-error" },
  documents: { Icon: FileTextIcon, color: "text-saguaro" },
} as const;

/** A program's own rule list, optionally filtered by a phrase: <Rules program="mesa" list="prohibitions" match="turf" />. */
export function Rules({ program, list, match }: { program: ProgramId; list: ListName; match?: string }) {
  const items = getProgram(program)[list].filter(
    (r) => !match || r.toLowerCase().includes(match.toLowerCase()),
  );
  const { Icon, color } = ICON[list];
  return (
    <ul className="not-prose my-4 flex flex-col gap-3">
      {items.map((r) => (
        <li key={r} className="flex gap-3 text-ink">
          <Icon className={`mt-1 size-[18px] shrink-0 ${color}`} aria-hidden="true" />
          <span>{r}</span>
        </li>
      ))}
    </ul>
  );
}

/** A quoted rule, attributed to the city: <Quote program="chandler" list="prohibitions" match="artificial turf" />. */
export function Quote({ program, list, match }: { program: ProgramId; list: ListName; match: string }) {
  const p = getProgram(program);
  const rule = p[list].find((r) => r.toLowerCase().includes(match.toLowerCase()));
  if (!rule) return null;
  return (
    <blockquote className="my-4 border-l-4 border-palo-verde pl-4 text-ink">
      “{rule}”
      <footer className="mt-1 text-sm text-ink-muted">
        — City of {p.city},{" "}
        <a
          href={p.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-3"
        >
          {p.name}
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </footer>
    </blockquote>
  );
}
