import { describe, expect, it } from "vitest";
import { abVerdict, funnel, rangeStart, rate, type VariantResult } from "./summary";

describe("insights summary (FR-INS-02/04/11)", () => {
  it("hides rates with a denominator under 10", () => {
    expect(rate(3, 9)).toEqual({ num: 3, den: 9, value: null });
    expect(rate(5, 10).value).toBe(0.5);
  });

  it("funnel: step and overall conversion, and the biggest drop among readable steps", () => {
    const f = funnel({ sessions: 100, started: 60, estimated: 50, previewed: 10, eligibility: 8, booked: 2 });
    expect(f.steps.map((s) => s.count)).toEqual([100, 60, 50, 10, 8, 2]);
    expect(f.steps[1]?.step.value).toBe(0.6);
    expect(f.steps[3]?.step.value).toBe(0.2);
    expect(f.steps[3]?.overall.value).toBe(0.1);
    // previewed: 80% lost of 50. booked's step has a denominator of 8, so it isn't readable.
    expect(f.biggestDrop).toBe("previewed");
    expect(f.steps[5]?.step.value).toBeNull();
  });

  it("no readable step → no biggest drop", () => {
    expect(
      funnel({ sessions: 5, started: 2, estimated: 1, previewed: 0, eligibility: 0, booked: 0 }).biggestDrop,
    ).toBeNull();
  });

  it("ranges: hour, start of the Arizona day, launch", () => {
    const now = new Date("2030-03-16T20:30:00Z");
    expect(rangeStart("hour", "2030-03-16T16:00:00Z", now)).toBe("2030-03-16T19:30:00.000Z");
    expect(rangeStart("today", "2030-03-16T16:00:00Z", now)).toBe("2030-03-16T07:00:00.000Z");
    expect(rangeStart("launch", "2030-03-16T09:00:00-07:00", now)).toBe("2030-03-16T16:00:00.000Z");
  });

  it("A/B: no winner under 20 sessions per variant, ties within 2 points", () => {
    const v = (variant: "a" | "b", sessions: number, clicks: number, impressions: number): VariantResult => ({
      variant,
      sessions,
      ctr: rate(clicks, impressions),
      medianMsToRebate: null,
      fiveSecond: { pass: 0, fail: 0 },
    });
    expect(abVerdict(v("a", 19, 10, 19), v("b", 40, 5, 40))).toBeNull();
    expect(abVerdict(v("a", 20, 10, 20), v("b", 40, 10, 40))).toBe("a");
    expect(abVerdict(v("a", 50, 25, 50), v("b", 100, 51, 100))).toBe("tie");
  });
});
