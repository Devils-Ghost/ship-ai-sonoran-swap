import business from "@/content/business.json";

// SRS §3.5: ≈ 23 gallons per sq ft per year, an estimate derived from a City of Phoenix figure.
export const WATER = business.waterEstimate;

/**
 * Days of an average American family's home water use that the gallons equal, using EPA WaterSense's
 * "more than 300 gallons per day". Because the real figure is above 300, this is an upper bound: the copy
 * says "up to". Whole days, rounded down.
 */
export function familyDays(gallons: number): number {
  return Math.floor(Math.max(0, gallons) / WATER.householdEquivalent.galPerFamilyDay);
}

/** Gallons a year, rounded to the nearest 100 so the estimate doesn't look more precise than it is. */
export function waterGallonsPerYear(sqft: number): number {
  return Math.round((Math.max(0, sqft) * WATER.galPerSqftYear) / 100) * 100;
}
