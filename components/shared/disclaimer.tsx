import { cn } from "cn";
import { content } from "@/lib/content/load";

// FR-REB-15 / CONTENT §1: shown under every rebate result. Without a city, fall back to the
// program-wide disclaimer from rebate-programs.json.
export function Disclaimer({ city, className }: { city?: string; className?: string }) {
  const text = city
    ? `Estimate only. Eligibility and payment are decided by the City of ${city}. Sonoran Swap is not affiliated with any city.`
    : content.rebates.disclaimer;
  return <p className={cn("text-[0.8125rem] text-ink-muted", className)}>{text}</p>;
}
