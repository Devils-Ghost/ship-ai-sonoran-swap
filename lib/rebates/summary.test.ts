import { describe, expect, it } from "vitest";
import { formatRateShort, summarizeAll } from "./summary";

describe("program summaries (CONTENT §2 formats, from data only)", () => {
  const byId = Object.fromEntries(summarizeAll().map((s) => [s.id, s]));

  it("matches the approved card wording", () => {
    expect(byId.phoenix).toMatchObject({
      headline: "$2 per sq ft",
      facts: ["250 sq ft minimum", "approval first"],
    });
    expect(byId.mesa).toMatchObject({
      headline: "$1,000 – $2,000 by lawn size",
      facts: ["+ up to $100 for new trees", "500 sq ft minimum", "approval first"],
    });
    expect(byId.chandler).toMatchObject({
      headline: "$1.50 per sq ft, up to $2,000",
      facts: ["500 sq ft minimum", "approval first"],
    });
    expect(byId.scottsdale).toMatchObject({ headline: "Between seasons", open: false });
  });

  it("writes FAQ sentences that agree with CONTENT §2 FAQ 1", () => {
    expect(byId.phoenix?.sentence).toBe("Phoenix pays $2 per square foot (250 sq ft minimum).");
    expect(byId.mesa?.sentence).toBe(
      "Mesa pays $1,000 to $2,000 depending on lawn size, plus up to $100 for new trees.",
    );
    expect(byId.chandler?.sentence).toBe(
      "Chandler pays $1.50 per square foot, up to $2,000 (500 sq ft minimum).",
    );
  });

  it("shortens whole-dollar rates only", () => {
    expect(formatRateShort(2)).toBe("$2");
    expect(formatRateShort(1.5)).toBe("$1.50");
  });
});
