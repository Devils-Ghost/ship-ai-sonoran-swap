import business from "@/content/business.json";

// SRS §3.5: ≈ 23 gallons per sq ft per year, an estimate derived from a City of Phoenix figure.
export const WATER = business.waterEstimate;

/** Gallons a year, rounded to the nearest 100 so the estimate doesn't look more precise than it is. */
export function waterGallonsPerYear(sqft: number): number {
  return Math.round((Math.max(0, sqft) * WATER.galPerSqftYear) / 100) * 100;
}
