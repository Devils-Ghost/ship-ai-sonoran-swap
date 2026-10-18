import business from "@/content/business.json";
import rebates from "@/content/rebate-programs.json";
import type { ProgramId } from "@/lib/content/schema";
import { computeRebate } from "@/lib/rebates/engine";
import type { RebateResult } from "@/lib/rebates/types";
import { netRange, projectRange, type Range, type TierId } from "./pricing";
import { waterGallonsPerYear } from "./water";

// FR-EST-08/09: one function produces everything the results panel, QuickEstimate and /api/estimates show.

export const CITY_IDS = [...business.serviceCities, "other"] as const;
export type CityId = (typeof CITY_IDS)[number];

const PROGRAM_IDS = new Set<string>(rebates.programs.map((p) => p.id));

export function isCityId(value: unknown): value is CityId {
  return typeof value === "string" && (CITY_IDS as readonly string[]).includes(value);
}

export function programFor(city: CityId): ProgramId | null {
  return PROGRAM_IDS.has(city) ? (city as ProgramId) : null;
}

export function cityLabel(city: CityId): string {
  return city === "other" ? "Another utility" : `City of ${city.charAt(0).toUpperCase()}${city.slice(1)}`;
}

/** CONTENT §3 "Not in data" copy, from rebate-programs.json → otherCities. */
export function notInDataText(city: CityId): string {
  const other = rebates.otherCities as Record<string, string>;
  return other[city] ?? other.other ?? "";
}

export type EstimateInput = {
  city: CityId;
  sqft: number;
  tier: TierId;
  trees?: number;
  removesAllGrass?: boolean;
};

export type Estimate = {
  input: EstimateInput;
  sqft: number;
  /** Null when the city has no program in our data (FR-EST-08). */
  rebate: RebateResult | null;
  project: Range;
  net: Range;
  waterGalYear: number;
};

export function computeEstimate(input: EstimateInput): Estimate {
  const sqft = Math.max(0, Math.round(input.sqft));
  const programId = programFor(input.city);
  const rebate = programId
    ? computeRebate(programId, { sqft, trees: input.trees, removesAllGrass: input.removesAllGrass })
    : null;
  const project = projectRange(sqft, input.tier);
  return {
    input,
    sqft,
    rebate,
    project,
    net: netRange(project, rebate?.amount ?? null),
    waterGalYear: waterGallonsPerYear(sqft),
  };
}
