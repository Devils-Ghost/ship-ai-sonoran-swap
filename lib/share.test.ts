import { describe, expect, it } from "vitest";
import { parseShareParams, sharePath, shareSummary } from "./share";

describe("share links", () => {
  it("accepts a program city and a whole lawn size", () => {
    expect(parseShareParams("phoenix", "1240")).toEqual({ city: "phoenix", sqft: 1240 });
    expect(parseShareParams("chandler", "50000")).toEqual({ city: "chandler", sqft: 50000 });
  });

  it("rejects anything else, including addresses and out-of-range sizes", () => {
    for (const [city, sqft] of [
      ["tempe", "1240"],
      ["phoenix", "0"],
      ["phoenix", "50001"],
      ["phoenix", "12.5"],
      ["phoenix", "-3"],
      ["phoenix", "123 Main St"],
      ["phoenix", undefined],
      [["phoenix"], "1240"],
    ] as const) {
      expect(parseShareParams(city, sqft)).toBeNull();
    }
  });

  it("builds the headline from the rebate engine", () => {
    expect(shareSummary({ city: "phoenix", sqft: 1240 })).toMatchObject({
      amount: 2480,
      cityName: "Phoenix",
      headline: "This lawn could earn $2,480 from Phoenix",
    });
    expect(shareSummary({ city: "mesa", sqft: 1200 })?.headline).toBe(
      "This lawn could earn $1,500 from Mesa",
    );
    expect(shareSummary({ city: "chandler", sqft: 1333 })?.amount).toBe(2000);
  });

  it("has nothing to share when the program is closed or the lawn is below the minimum", () => {
    expect(shareSummary({ city: "scottsdale", sqft: 1200 })).toBeNull();
    expect(shareSummary({ city: "phoenix", sqft: 249 })).toBeNull();
  });

  it("puts only the city and lawn size in the link", () => {
    expect(sharePath({ city: "mesa", sqft: 1520.4 })).toBe("/share?city=mesa&sqft=1520");
  });
});
