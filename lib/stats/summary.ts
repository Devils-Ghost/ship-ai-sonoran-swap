// FR-LIVE-02–03, FR-PROOF-04, SRS §14 GET /api/stats. Pure shaping of rows the route reads, so the numbers
// are unit-tested without a database. Nothing here carries personal data: city, size and amounts only.

export const LIVE_CITIES = ["phoenix", "mesa", "chandler", "other"] as const;
export type LiveCity = (typeof LIVE_CITIES)[number];

export type TickerItem =
  | { kind: "estimate"; at: string; city: string; sqft: number; rebate: number | null }
  | { kind: "booking"; at: string; city: string };

export type Testing = {
  testers: number;
  medianMsToEstimate: number | null;
  completionRate: number | null;
  variantResults: Record<"a" | "b", { testers: number; medianMsToEstimate: number | null }>;
};

export type Stats = {
  since: string;
  estimates: number;
  sqft: number;
  rebateDollars: number;
  renders: number;
  bookings: number;
  byCity: Record<LiveCity, number>;
  recent: TickerItem[];
  testing: Testing;
};

export const TICKER_SIZE = 8;

/** Start of today on the Arizona clock (UTC−7, no DST), as an ISO instant. */
export function startOfArizonaDay(now: Date = new Date()): string {
  const az = new Date(now.getTime() - 7 * 3600_000);
  return new Date(Date.UTC(az.getUTCFullYear(), az.getUTCMonth(), az.getUTCDate(), 7)).toISOString();
}

export function cityBuckets(rows: { city: string; n: number }[]): Record<LiveCity, number> {
  const out: Record<LiveCity, number> = { phoenix: 0, mesa: 0, chandler: 0, other: 0 };
  for (const r of rows) {
    const key = (LIVE_CITIES as readonly string[]).includes(r.city) ? (r.city as LiveCity) : "other";
    out[key] += r.n;
  }
  return out;
}

/** Newest first, estimates and bookings interleaved. */
export function mergeTicker(
  estimates: TickerItem[],
  bookings: TickerItem[],
  size = TICKER_SIZE,
): TickerItem[] {
  return [...estimates, ...bookings].sort((a, b) => b.at.localeCompare(a.at)).slice(0, size);
}

export function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? (s[mid] ?? null) : Math.round(((s[mid - 1] ?? 0) + (s[mid] ?? 0)) / 2);
}

/**
 * Completion = a tester reached a rebate number (the D4/D5 task), i.e. first_estimate_at is set.
 * Time to first estimate is measured from the test session's start.
 */
export function testingSummary(
  sessions: { variant: string; createdAt: Date; firstEstimateAt: Date | null }[],
): Testing {
  const ms = (s: (typeof sessions)[number]) =>
    s.firstEstimateAt ? s.firstEstimateAt.getTime() - s.createdAt.getTime() : null;
  const done = (list: typeof sessions) => list.map(ms).filter((v): v is number => v !== null && v >= 0);
  const forVariant = (v: "a" | "b") => {
    const list = sessions.filter((s) => s.variant === v);
    return { testers: list.length, medianMsToEstimate: median(done(list)) };
  };
  const completed = done(sessions);
  return {
    testers: sessions.length,
    medianMsToEstimate: median(completed),
    completionRate: sessions.length ? completed.length / sessions.length : null,
    variantResults: { a: forVariant("a"), b: forVariant("b") },
  };
}

export function emptyStats(since: string): Stats {
  return {
    since,
    estimates: 0,
    sqft: 0,
    rebateDollars: 0,
    renders: 0,
    bookings: 0,
    byCity: cityBuckets([]),
    recent: [],
    testing: testingSummary([]),
  };
}
