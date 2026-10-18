import { computeEstimate } from "@/lib/estimate/estimate";
import type { Stats } from "@/lib/stats/summary";

// /live only: the demo replay (see ./flag for the mode itself).
/** Live-board replay for demo mode: three sample estimates through the real engine, plus one booking. */
export function demoStats(now: Date = new Date()): Stats {
  const samples = [
    { city: "phoenix", sqft: 1240 },
    { city: "mesa", sqft: 1520 },
    { city: "chandler", sqft: 860 },
  ] as const;
  const at = (minAgo: number) => new Date(now.getTime() - minAgo * 60_000).toISOString();
  const recent = samples.map((s, i) => {
    const e = computeEstimate({ city: s.city, sqft: s.sqft, tier: "signature" });
    return {
      kind: "estimate" as const,
      at: at(3 + i * 4),
      city: s.city,
      sqft: e.sqft,
      rebate: e.rebate?.amount ?? null,
    };
  });
  return {
    since: at(60),
    estimates: recent.length,
    sqft: recent.reduce((t, r) => t + r.sqft, 0),
    rebateDollars: recent.reduce((t, r) => t + (r.rebate ?? 0), 0),
    renders: 1,
    bookings: 1,
    byCity: { phoenix: 1, mesa: 1, chandler: 1, other: 0 },
    recent: [{ kind: "booking", at: at(1), city: "mesa" }, ...recent],
    testing: {
      testers: 0,
      medianMsToEstimate: null,
      completionRate: null,
      variantResults: {
        a: { testers: 0, medianMsToEstimate: null },
        b: { testers: 0, medianMsToEstimate: null },
      },
    },
  };
}
