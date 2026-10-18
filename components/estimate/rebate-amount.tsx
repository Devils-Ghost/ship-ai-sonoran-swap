"use client";

import { cn } from "cn";
import { useCountUp } from "@/lib/hooks/use-count-up";
import { formatMoney } from "@/lib/utils/format";

/** The big terracotta figure (DESIGN §6 results panel), animated per FR-EST-10. */
export function RebateAmount({ amount, className }: { amount: number; className?: string }) {
  const shown = useCountUp(amount);
  return (
    <span className={cn("font-display leading-none font-semibold text-terracotta tabular", className)}>
      {formatMoney(shown)}
    </span>
  );
}
