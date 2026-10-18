import { describe, expect, it } from "vitest";
import { formatDate, formatMoney, formatMoneyRange, formatRate, formatSqft } from "./format";

describe("format", () => {
  it("formats whole dollars with separators", () => {
    expect(formatMoney(2480)).toBe("$2,480");
    expect(formatMoney(10002)).toBe("$10,002");
    expect(formatMoney(0)).toBe("$0");
    expect(formatMoney(1994.6)).toBe("$1,995");
  });

  it("joins ranges with a spaced en dash and collapses equal ends", () => {
    expect(formatMoneyRange(9600, 15600)).toBe("$9,600 – $15,600");
    expect(formatMoneyRange(3000, 3000)).toBe("$3,000");
  });

  it("keeps cents on per-square-foot rates", () => {
    expect(formatRate(2)).toBe("$2.00");
    expect(formatRate(1.5)).toBe("$1.50");
  });

  it("formats square feet", () => {
    expect(formatSqft(1240)).toBe("1,240 sq ft");
  });

  it("does not shift calendar dates across time zones", () => {
    expect(formatDate("2026-10-15")).toBe("Oct 15, 2026");
    expect(formatDate("2026-10-15", "long")).toBe("October 15, 2026");
  });

  it("shows timestamps in Arizona time", () => {
    // 03:00 UTC on Oct 16 is still Oct 15 in Phoenix (UTC−7).
    expect(formatDate("2026-10-16T03:00:00Z")).toBe("Oct 15, 2026");
  });
});
