import { describe, expect, it } from "vitest";
import { ROUTES } from "./routes";

describe("route registry", () => {
  it("covers at least the 18 indexable routes QUALITY RC2 asks for", () => {
    expect(ROUTES.filter((r) => r.index).length).toBeGreaterThanOrEqual(18);
  });

  it("has unique paths", () => {
    const paths = ROUTES.map((r) => r.path);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it("keeps titles ≤ 60 and descriptions ≤ 155 characters (SRS §4.5)", () => {
    for (const r of ROUTES) {
      expect(r.title.length, r.path).toBeLessThanOrEqual(60);
      expect(r.description.length, r.path).toBeLessThanOrEqual(155);
    }
  });

  it("excludes the pages FR-SEO-02 keeps out of search", () => {
    const hidden = ROUTES.filter((r) => !r.index).map((r) => r.path);
    expect(hidden).toEqual(expect.arrayContaining(["/live", "/studio/prep"]));
  });
});
