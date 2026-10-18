import { cn } from "cn";
import rebates from "@/content/rebate-programs.json";

// FR-REB-15 / CONTENT §1: shown under every rebate result. Without a city, fall back to the
// program-wide disclaimer. Reads the JSON directly so client components can use it without Zod.
export function Disclaimer({ city, className }: { city?: string; className?: string }) {
  const text = city
    ? `Estimate only. Eligibility and payment are decided by the City of ${city}. Sonoran Swap is not affiliated with any city.`
    : rebates.disclaimer;
  return <p className={cn("text-[0.8125rem] text-ink-muted", className)}>{text}</p>;
}
