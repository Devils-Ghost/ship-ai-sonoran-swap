import business from "@/content/business.json";

// SRS §3.5: ≈ 23 gallons per sq ft per year, an estimate derived from a City of Phoenix figure.
export const WATER = business.waterEstimate;

/**
 * Full bathtubs the gallons would fill, using USGS Water Science School's "a good-sized bath holds 40
 * gallons" (source in content/business.json). Rounded to a whole tub.
 */
export function bathtubs(gallons: number): number {
  return Math.round(Math.max(0, gallons) / WATER.bathtubEquivalent.galPerBathtub);
}

/** Gallons a year, rounded to the nearest 100 so the estimate doesn't look more precise than it is. */
export function waterGallonsPerYear(sqft: number): number {
  return Math.round((Math.max(0, sqft) * WATER.galPerSqftYear) / 100) * 100;
}
