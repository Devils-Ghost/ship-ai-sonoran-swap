import data from "@/content/rebate-programs.json";
import type { ProgramId } from "@/lib/content/schema";
import { computeRebate, getProgram } from "@/lib/rebates/engine";
import { formatMoney } from "@/lib/utils/format";

// Shareable rebate result. The link carries only the city and the lawn size (never an address); every
// number on the share page is recomputed from those two values by the rebate engine.

export const SHARE_PATH = "/share";
const MAX_SQFT = 50_000;

export type ShareInput = { city: ProgramId; sqft: number };

export type ShareSummary = ShareInput & {
  cityName: string;
  amount: number;
  /** "This lawn could earn $2,480 from Phoenix" */
  headline: string;
};

// Read from the data, not the Zod schema module, so the client share button doesn't ship Zod.
const PROGRAM_IDS: readonly string[] = data.programs.map((p) => p.id);

function isProgramId(value: unknown): value is ProgramId {
  return typeof value === "string" && PROGRAM_IDS.includes(value);
}

/** Validates raw query values. Lawn size is a whole number from 1 to 50,000 sq ft. */
export function parseShareParams(city: unknown, sqft: unknown): ShareInput | null {
  if (!isProgramId(city) || typeof sqft !== "string" || !/^\d{1,5}$/.test(sqft)) return null;
  const n = Number(sqft);
  if (n < 1 || n > MAX_SQFT) return null;
  return { city, sqft: n };
}

/** The shareable summary, or null when there is no amount to share (closed program, below minimum). */
export function shareSummary(input: ShareInput): ShareSummary | null {
  const rebate = computeRebate(input.city, { sqft: input.sqft });
  if (rebate.amount === null || !rebate.eligibleByArea || rebate.amount <= 0) return null;
  const cityName = getProgram(input.city).city;
  return {
    ...input,
    cityName,
    amount: rebate.amount,
    headline: `This lawn could earn ${formatMoney(rebate.amount)} from ${cityName}`,
  };
}

/** Relative share link, e.g. /share?city=phoenix&sqft=1240. */
export function sharePath(input: ShareInput): string {
  const q = new URLSearchParams({ city: input.city, sqft: String(Math.round(input.sqft)) });
  return `${SHARE_PATH}?${q.toString()}`;
}
