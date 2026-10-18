import { describe, expect, it } from "vitest";
import type { RebateProgram } from "@/lib/content/schema";
import { capReachedAtSqft, computeRebate, computeRebateFor, getProgram } from "./engine";
import type { RebateResult } from "./types";

const codes = (r: RebateResult) => r.notes.map((n) => n.code);

// SRS §7.5 required boundary cases, verbatim.
describe("SRS §7.5 boundaries", () => {
  it.each([
    ["phoenix", 249, {}, 0],
    ["phoenix", 250, {}, 500],
    ["phoenix", 1240, {}, 2480],
    ["phoenix", 5001, {}, 10002],
    ["mesa", 499, {}, 0],
    ["mesa", 500, {}, 1000],
    ["mesa", 999, {}, 1000],
    ["mesa", 1000, {}, 1500],
    ["mesa", 1500, { trees: 2 }, 2100],
    ["mesa", 3000, { trees: 5 }, 2100],
    ["chandler", 499, {}, 0],
    ["chandler", 499, { removesAllGrass: true }, 750],
    ["chandler", 501, {}, 765],
    ["chandler", 1333, {}, 2000],
    ["chandler", 1330, {}, 1995],
  ] as const)("%s %i sq ft %o → $%i", (program, sqft, extra, amount) => {
    expect(computeRebate(program, { sqft, ...extra }).amount).toBe(amount);
  });

  it("Scottsdale is closed: no amount, status closed", () => {
    for (const sqft of [0, 1200, 20000]) {
      const r = computeRebate("scottsdale", { sqft });
      expect(r.amount).toBeNull();
      expect(r.status).toBe("closed");
      expect(r.eligibleByArea).toBe(false);
      expect(codes(r)).toContain("SCT_CLOSED");
    }
  });
});

describe("notes and flags", () => {
  it("blocks below the minimum with a blocker note and eligibleByArea false", () => {
    for (const [program, sqft, code] of [
      ["phoenix", 249, "PHX_MIN"],
      ["mesa", 499, "MESA_MIN"],
      ["chandler", 499, "CHD_MIN"],
    ] as const) {
      const r = computeRebate(program, { sqft });
      expect(r.eligibleByArea).toBe(false);
      expect(r.notes[0]).toMatchObject({ kind: "blocker", code });
    }
  });

  it("explains Chandler's minimum waiver when blocked (FR-REB-11)", () => {
    expect(codes(computeRebate("chandler", { sqft: 499 }))).toContain("CHD_MIN_WAIVER");
  });

  it("adds PHX_LARGE only above 5,000 sq ft", () => {
    expect(codes(computeRebate("phoenix", { sqft: 5000 }))).not.toContain("PHX_LARGE");
    expect(codes(computeRebate("phoenix", { sqft: 5001 }))).toContain("PHX_LARGE");
  });

  it("flags Mesa lawns within 100 sq ft of the next tier", () => {
    for (const sqft of [900, 999, 1400, 1499]) {
      expect(codes(computeRebate("mesa", { sqft })), String(sqft)).toContain("MESA_NEAR_TIER");
    }
    for (const sqft of [899, 1000, 1399, 1500, 3000]) {
      expect(codes(computeRebate("mesa", { sqft })), String(sqft)).not.toContain("MESA_NEAR_TIER");
    }
  });

  it("quotes Mesa's turf and once-per-3-years rules from the data", () => {
    const r = computeRebate("mesa", { sqft: 1200 });
    expect(codes(r)).toEqual(expect.arrayContaining(["MESA_NO_TURF", "MESA_ONCE_3Y"]));
    const mesa = getProgram("mesa");
    const noTurf = r.notes.find((n) => n.code === "MESA_NO_TURF");
    expect(mesa.prohibitions).toContain(noTurf?.text);
  });

  it("applies and explains Chandler's cap at 1,331 sq ft", () => {
    expect(computeRebate("chandler", { sqft: 1330 })).toMatchObject({ amount: 1995, capApplied: false });
    const capped = computeRebate("chandler", { sqft: 1331 });
    expect(capped).toMatchObject({ amount: 2000, capApplied: true });
    expect(capped.notes.find((n) => n.code === "CHD_CAP")?.text).toContain("1,331 sq ft");
    expect(capReachedAtSqft(1.5, 2000, 10)).toBe(1331);
  });

  it("shows the approval warning on every result (FR-REB-12)", () => {
    for (const program of ["phoenix", "mesa", "chandler", "scottsdale"] as const) {
      for (const sqft of [0, 300, 1200, 6000]) {
        expect(codes(computeRebate(program, { sqft })), `${program} ${sqft}`).toContain("APPROVAL_FIRST");
      }
    }
  });

  it("leads with the blocker, otherwise with the approval warning", () => {
    for (const program of ["phoenix", "mesa", "chandler", "scottsdale"] as const) {
      for (const sqft of [100, 950, 1400, 6000]) {
        const r = computeRebate(program, { sqft });
        const first = r.notes[0];
        const where = `${program} ${sqft}`;
        if (r.eligibleByArea || r.amount === null) {
          // Scottsdale leads with its closed-status note, then the approval warning.
          const maxIndex = program === "scottsdale" ? 1 : 0;
          expect(
            r.notes.findIndex((n) => n.code === "APPROVAL_FIRST"),
            where,
          ).toBeLessThanOrEqual(maxIndex);
        } else {
          expect(first?.kind, where).toBe("blocker");
        }
      }
    }
  });

  it("calls out unknown funding status (FR-REB-13)", () => {
    expect(codes(computeRebate("phoenix", { sqft: 1200 }))).toContain("FUNDING_UNKNOWN");
    expect(codes(computeRebate("scottsdale", { sqft: 1200 }))).not.toContain("FUNDING_UNKNOWN");
  });

  it("carries the source and last-checked date (FR-REB-04)", () => {
    const r = computeRebate("phoenix", { sqft: 1200 });
    expect(r.sourceUrl).toMatch(/^https:\/\/www\.phoenix\.gov\//);
    expect(r.lastVerified).toBe(getProgram("phoenix").lastVerified);
  });
});

describe("basis lines (FR-REB-10)", () => {
  it("formats per-sq-ft, rounded, capped and tiered bases", () => {
    expect(computeRebate("phoenix", { sqft: 1240 }).basis).toBe("$2.00 × 1,240 sq ft");
    expect(computeRebate("chandler", { sqft: 501 }).basis).toBe(
      "$1.50 × 510 sq ft (501 rounded up to 10 sq ft increments)",
    );
    expect(computeRebate("chandler", { sqft: 1333 }).basis).toContain("capped at $2,000");
    expect(computeRebate("mesa", { sqft: 1200, trees: 1 }).basis).toBe(
      "1,000–1,499 sq ft tier: $1,500 + 1 tree × $50",
    );
    expect(computeRebate("mesa", { sqft: 2000 }).basis).toBe("1,500+ sq ft tier: $2,000");
  });
});

describe("input handling", () => {
  it("rounds area to a whole sq ft before computing (§7.4)", () => {
    expect(computeRebate("phoenix", { sqft: 249.5 }).amount).toBe(500); // rounds to 250
    expect(computeRebate("phoenix", { sqft: 249.4 }).amount).toBe(0);
  });

  it("treats negative areas and trees as zero", () => {
    expect(computeRebate("phoenix", { sqft: -10 }).amount).toBe(0);
    expect(computeRebate("mesa", { sqft: 1500, trees: -3 }).amount).toBe(2000);
  });

  it("returns whole dollars for every Chandler area", () => {
    for (let sqft = 500; sqft <= 1400; sqft++) {
      expect(Number.isInteger(computeRebate("chandler", { sqft }).amount)).toBe(true);
    }
  });
});

// property test: Phoenix pays exactly $2 × sq ft across the whole residential range.
describe("Phoenix property", () => {
  it("amount = rate × sqft for every area from 250 to 20,000", () => {
    const rate = getProgram("phoenix");
    if (rate.type !== "per_sqft") throw new Error("Phoenix should be per_sqft");
    for (let sqft = 250; sqft <= 20000; sqft++) {
      const r = computeRebate("phoenix", { sqft });
      if (r.amount !== rate.ratePerSqft * sqft) throw new Error(`${sqft} → ${r.amount}`);
    }
  });
});

describe("data-driven", () => {
  it("follows the program data, not hard-coded numbers", () => {
    const phoenix = getProgram("phoenix");
    const changed = { ...phoenix, ratePerSqft: 3, minimumSqft: 400 } as RebateProgram;
    expect(computeRebateFor(changed, { sqft: 1000 }).amount).toBe(3000);
    expect(computeRebateFor(changed, { sqft: 399 }).amount).toBe(0);
  });
});
