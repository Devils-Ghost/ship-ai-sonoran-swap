import data from "@/content/rebate-programs.json";
import type { ProgramId, RebatePrograms, RebateProgram } from "@/lib/content/schema";
import { formatMoney, formatNumber } from "@/lib/utils/format";

// Plain-language one-liners for each program (CONTENT §2 "Rebates by city" formats), built only from
// rebate-programs.json so no amount is ever typed into a page (AGENTS §2.2).
const PROGRAMS = (data as unknown as RebatePrograms).programs;

export function allPrograms(): RebateProgram[] {
  return PROGRAMS;
}

/** "$2" for whole-dollar rates, "$1.50" otherwise. */
export function formatRateShort(rate: number): string {
  return Number.isInteger(rate) ? `$${rate}` : `$${rate.toFixed(2)}`;
}

export type ProgramSummary = {
  id: ProgramId;
  city: string;
  /** e.g. "$2 per sq ft", "$1,000 – $2,000 by lawn size", "Between seasons" */
  headline: string;
  /** Short facts shown after the headline, e.g. ["250 sq ft minimum", "approval first"]. */
  facts: string[];
  /** One sentence for FAQ answers and meta descriptions. */
  sentence: string;
  open: boolean;
};

export function summarize(program: RebateProgram): ProgramSummary {
  const approval = program.approval.required ? "approval first" : null;
  switch (program.type) {
    case "per_sqft": {
      const rate = `${formatRateShort(program.ratePerSqft)} per sq ft`;
      const cap = program.maximumAmount !== null ? `, up to ${formatMoney(program.maximumAmount)}` : "";
      const min = `${formatNumber(program.minimumSqft)} sq ft minimum`;
      return {
        id: program.id,
        city: program.city,
        headline: `${rate}${cap}`,
        facts: [min, approval].filter((f): f is string => f !== null),
        sentence: `${program.city} pays ${formatRateShort(program.ratePerSqft)} per square foot${cap ? `, up to ${formatMoney(program.maximumAmount ?? 0)}` : ""} (${formatNumber(program.minimumSqft)} sq ft minimum).`,
        open: true,
      };
    }
    case "tiered": {
      const low = program.tiers[0]?.amount ?? 0;
      const high = program.tiers.at(-1)?.amount ?? 0;
      const bonus = program.treeBonus.perTree * program.treeBonus.maxTrees;
      return {
        id: program.id,
        city: program.city,
        headline: `${formatMoney(low)} – ${formatMoney(high)} by lawn size`,
        facts: [
          bonus > 0 ? `+ up to ${formatMoney(bonus)} for new trees` : null,
          `${formatNumber(program.minimumSqft)} sq ft minimum`,
          approval,
        ].filter((f): f is string => f !== null),
        sentence: `${program.city} pays ${formatMoney(low)} to ${formatMoney(high)} depending on lawn size${bonus > 0 ? `, plus up to ${formatMoney(bonus)} for new trees` : ""}.`,
        open: true,
      };
    }
    case "status_only":
      return {
        id: program.id,
        city: program.city,
        headline: program.status === "closed" ? "Between seasons" : "No amount published",
        facts: [],
        sentence: program.statusNote,
        open: false,
      };
  }
}

export function summarizeAll(): ProgramSummary[] {
  return PROGRAMS.map(summarize);
}
