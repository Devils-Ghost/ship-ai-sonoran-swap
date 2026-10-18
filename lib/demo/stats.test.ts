import { describe, expect, it } from "vitest";
import { computeEstimate } from "@/lib/estimate/estimate";
import { demoStats } from "./stats";

describe("demoStats (NFR-REL-02 replay)", () => {
  it("adds up its own sample estimates, priced by the real engine", () => {
    const s = demoStats(new Date("2030-03-17T19:00:00Z"));
    const mesa = computeEstimate({ city: "mesa", sqft: 1520, tier: "signature" }).rebate?.amount;
    expect(s.recent.find((r) => r.kind === "estimate" && r.city === "mesa")).toMatchObject({ rebate: mesa });
    const est = s.recent.filter((r) => r.kind === "estimate");
    expect(s.estimates).toBe(est.length);
    expect(s.sqft).toBe(est.reduce((t, r) => t + (r.kind === "estimate" ? r.sqft : 0), 0));
    expect(s.recent[0]?.at > (s.recent[1]?.at ?? "")).toBe(true);
  });
});
