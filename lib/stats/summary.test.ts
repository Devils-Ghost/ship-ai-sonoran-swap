import { describe, expect, it } from "vitest";
import {
  cityBuckets,
  median,
  mergeTicker,
  startOfArizonaDay,
  testingSummary,
  type TickerItem,
} from "./summary";

describe("stats summary", () => {
  it("start of the Arizona day", () => {
    expect(startOfArizonaDay(new Date("2030-03-16T18:00:00Z"))).toBe("2030-03-16T07:00:00.000Z");
    // 11 PM Friday in Arizona is already Saturday in UTC.
    expect(startOfArizonaDay(new Date("2030-03-17T06:00:00Z"))).toBe("2030-03-16T07:00:00.000Z");
  });

  it("buckets cities, folding the rest into other (FR-LIVE-03)", () => {
    expect(
      cityBuckets([
        { city: "phoenix", n: 3 },
        { city: "tempe", n: 2 },
        { city: "other", n: 1 },
        { city: "mesa", n: 4 },
      ]),
    ).toEqual({ phoenix: 3, mesa: 4, chandler: 0, other: 3 });
  });

  it("merges the ticker newest first, 8 items", () => {
    const est: TickerItem[] = Array.from({ length: 6 }, (_, i) => ({
      kind: "estimate",
      at: `2030-03-16T1${i}:00:00.000Z`,
      city: "mesa",
      sqft: 1000,
      rebate: 1000,
    }));
    const book: TickerItem[] = [
      { kind: "booking", at: "2030-03-16T15:30:00.000Z", city: "phoenix" },
      { kind: "booking", at: "2030-03-16T09:00:00.000Z", city: "phoenix" },
      { kind: "booking", at: "2030-03-16T08:00:00.000Z", city: "phoenix" },
    ];
    const t = mergeTicker(est, book);
    expect(t).toHaveLength(8);
    expect(t[0]?.at).toBe("2030-03-16T15:30:00.000Z");
    expect(t.at(-1)?.at).toBe("2030-03-16T09:00:00.000Z");
  });

  it("median", () => {
    expect(median([])).toBeNull();
    expect(median([5, 1, 3])).toBe(3);
    expect(median([1, 2, 3, 4])).toBe(3);
  });

  it("testing: median time to first estimate, completion and per-variant results", () => {
    const at = (s: number) => new Date(Date.UTC(2026, 9, 17, 17, 0, s));
    const t = testingSummary([
      { variant: "a", createdAt: at(0), firstEstimateAt: at(20) },
      { variant: "a", createdAt: at(0), firstEstimateAt: at(40) },
      { variant: "b", createdAt: at(0), firstEstimateAt: at(30) },
      { variant: "b", createdAt: at(0), firstEstimateAt: null },
    ]);
    expect(t.testers).toBe(4);
    expect(t.medianMsToEstimate).toBe(30_000);
    expect(t.completionRate).toBe(0.75);
    expect(t.variantResults).toEqual({
      a: { testers: 2, medianMsToEstimate: 30_000 },
      b: { testers: 2, medianMsToEstimate: 30_000 },
    });
    expect(testingSummary([]).completionRate).toBeNull();
  });
});
