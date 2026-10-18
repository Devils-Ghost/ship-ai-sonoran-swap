import { describe, expect, it } from "vitest";
import { evaluate, questionsFor, REASON_CODE, type Answers, type ResolvedQuestion } from "./evaluate";

const ids = (qs: ResolvedQuestion[]) => qs.map((q) => q.id);

/** Picks the first option with the given outcome for every listed question, "pass" for the rest. */
function answer(qs: ResolvedQuestion[], overrides: Record<string, "pass" | "fail" | "check"> = {}): Answers {
  return Object.fromEntries(
    qs.map((q) => [q.id, q.options.findIndex((o) => o.outcome === (overrides[q.id] ?? "pass"))]),
  );
}

describe("questionsFor (FR-ELIG-01/04)", () => {
  it("Phoenix skips the Mesa/Chandler-only questions", () => {
    expect(ids(questionsFor("phoenix"))).toEqual(["owner", "utility", "healthy", "removed", "size"]);
  });

  it.each(["mesa", "chandler"] as const)("%s asks about irrigation and new homes", (id) => {
    expect(ids(questionsFor(id))).toEqual([
      "owner",
      "utility",
      "healthy",
      "removed",
      "irrigation",
      "newhome",
      "size",
    ]);
  });

  it("asks 5–7 questions and always includes the removed-grass question", () => {
    for (const id of ["phoenix", "mesa", "chandler"] as const) {
      const qs = questionsFor(id);
      expect(qs.length).toBeGreaterThanOrEqual(5);
      expect(qs.length).toBeLessThanOrEqual(7);
      expect(ids(qs)).toContain("removed");
    }
  });

  it("fills city, minimum and healthy-grass values from the program data", () => {
    const phx = questionsFor("phoenix");
    expect(phx.find((q) => q.id === "utility")?.text).toBe("Is your water bill from the City of Phoenix?");
    expect(phx.find((q) => q.id === "size")?.text).toBe("Is the grass area at least 250 sq ft?");
    const partly = phx.find((q) => q.id === "healthy")?.options.find((o) => o.outcome === "check");
    expect(partly?.reason).toContain("at least 75% healthy");
    expect(questionsFor("mesa").find((q) => q.id === "size")?.text).toContain("500 sq ft");
    const chandler = questionsFor("chandler").find((q) => q.id === "healthy");
    expect(chandler?.options.find((o) => o.outcome === "check")?.reason).toContain("living grass");
    for (const q of [...phx, ...questionsFor("chandler")]) {
      expect(q.text).not.toMatch(/[{}]/);
      for (const o of q.options) expect(o.reason ?? "").not.toMatch(/[{}]/);
    }
  });

  it("Scottsdale (status only) has no question flow (FR-ELIG-02)", () => {
    expect(questionsFor("scottsdale")).toEqual([]);
  });
});

describe("evaluate (FR-ELIG-03)", () => {
  const qs = questionsFor("mesa");

  it("all pass → looks eligible", () => {
    const r = evaluate(qs, answer(qs));
    expect(r).toMatchObject({ result: "likely", fails: [], checks: [], reasonCodes: [], complete: true });
  });

  it("any check and no fail → check with the city", () => {
    const r = evaluate(qs, answer(qs, { utility: "check", size: "check" }));
    expect(r.result).toBe("check_city");
    expect(r.reasonCodes).toEqual(["utility:check", "size:check"]);
  });

  it("any fail wins over checks → not eligible, with reasons", () => {
    const r = evaluate(qs, answer(qs, { utility: "check", irrigation: "fail" }));
    expect(r.result).toBe("not_eligible");
    expect(r.fails).toEqual([
      { questionId: "irrigation", reason: "Flood- or well-irrigated grass isn't eligible in this program." },
    ]);
    expect(r.reasonCodes).toEqual(["irrigation:fail", "utility:check"]);
  });

  it("grass already removed fails with the FR-ELIG-04 message", () => {
    const r = evaluate(qs, answer(qs, { removed: "fail" }));
    expect(r.result).toBe("not_eligible");
    expect(r.fails[0]?.reason).toBe(
      "Most programs only pay for grass removed after approval. Don't remove more. Contact the city before you continue.",
    );
  });

  it("reports incomplete answers", () => {
    expect(evaluate(qs, { owner: 0 }).complete).toBe(false);
  });

  it("reason codes match the API pattern", () => {
    const all = Object.fromEntries(qs.map((q) => [q.id, q.options.length - 1]));
    for (const code of evaluate(qs, all).reasonCodes) expect(code).toMatch(REASON_CODE);
  });
});
