import data from "@/content/pricing.json";
import type { Pricing } from "@/lib/content/schema";

// SRS §3.4. Validated at build by lib/content/schema.ts; read directly so the browser doesn't ship Zod.
const PRICING = data as unknown as Pricing;

export type TierId = Pricing["tiers"][number]["id"];
export type Range = { low: number; high: number };

export const TIERS = PRICING.tiers;
export const DEFAULT_TIER: TierId = PRICING.tiers.find((t) => t.featured)?.id ?? "signature";

export function getTier(id: TierId) {
  const tier = PRICING.tiers.find((t) => t.id === id);
  if (!tier) throw new Error(`Unknown pricing tier "${id}"`);
  return tier;
}

/** Project range for an area and tier; never below the minimum project (§3.4). Whole dollars. */
export function projectRange(sqft: number, tierId: TierId): Range {
  const tier = getTier(tierId);
  const area = Math.max(0, Math.round(sqft));
  return {
    low: Math.max(PRICING.minimumProject, Math.round(area * tier.lowPerSqft)),
    high: Math.max(PRICING.minimumProject, Math.round(area * tier.highPerSqft)),
  };
}

/** §3.4: net = project − estimated rebate, floored at $0 at both ends. No rebate → the project range. */
export function netRange(project: Range, rebate: number | null): Range {
  const r = rebate ?? 0;
  return { low: Math.max(0, project.low - r), high: Math.max(0, project.high - r) };
}

export const PRICING_CAPTION = PRICING.caption;
export const MINIMUM_PROJECT = PRICING.minimumProject;
