import { describe, expect, it } from "vitest";
import business from "@/content/business.json";
import decisions from "@/content/decisions.json";
import plants from "@/content/plants.json";
import pricing from "@/content/pricing.json";
import rebates from "@/content/rebate-programs.json";
import seoReport from "@/content/seo-report.json";
import quality from "@/content/quality.json";
import timeline from "@/content/timeline.json";
import styles from "@/content/styles.json";
import { validateContent, type RawContent } from "./schema";

const seed = (): RawContent =>
  structuredClone({ business, rebates, pricing, plants, styles, decisions, seoReport, timeline, quality });

type Path = [keyof RawContent, ...(string | number)[]];

function parentOf(raw: RawContent, path: Path): [Record<string | number, unknown>, string | number] {
  let node: unknown = raw;
  for (const key of path.slice(0, -1)) {
    node = (node as Record<string | number, unknown>)[key];
  }
  return [node as Record<string | number, unknown>, path.at(-1) as string | number];
}

/** Returns a copy of the seed with each [path, value] applied; `undefined` deletes the key. */
function seedWith(...edits: [Path, unknown][]): RawContent {
  const raw = seed();
  for (const [path, value] of edits) {
    const [parent, key] = parentOf(raw, path);
    if (value === undefined) delete parent[key];
    else parent[key] = value;
  }
  return raw;
}

describe("validateContent", () => {
  it("accepts the seed content", () => {
    const c = validateContent(seed());
    expect(c.rebates.programs.map((p) => p.id)).toEqual(["phoenix", "mesa", "chandler", "scottsdale"]);
    expect(c.business.mode).toBe("concept");
  });

  it("rejects a misspelled rebate key instead of ignoring it", () => {
    const raw = seedWith(
      [["rebates", "programs", 0, "ratePerSqft"], undefined],
      [["rebates", "programs", 0, "ratePerSqFt"], 2],
    );
    expect(() => validateContent(raw)).toThrow(/rebate-programs\.json: programs\.0/);
  });

  it("requires an https source URL and an ISO lastVerified date", () => {
    const raw = seedWith(
      [["rebates", "programs", 1, "sourceUrl"], "http://mesaaz.gov/Xeriscape"],
      [["rebates", "programs", 1, "lastVerified"], "Oct 15"],
    );
    const run = () => validateContent(raw);
    expect(run).toThrow(/programs\.1\.sourceUrl/);
    expect(run).toThrow(/programs\.1\.lastVerified/);
  });

  it("rejects a Mesa cap that disagrees with its tiers and tree bonus", () => {
    const raw = seedWith([["rebates", "programs", 1, "maximumAmount"], 2200]);
    expect(() => validateContent(raw)).toThrow(/must equal top tier \+ max tree bonus \(2100\)/);
  });

  it("rejects gaps between Mesa tiers", () => {
    const raw = seedWith([["rebates", "programs", 1, "tiers", 1, "minSqft"], 1001]);
    expect(() => validateContent(raw)).toThrow(/tiers must be contiguous/);
  });

  it("keeps the AI and pricing labels verbatim", () => {
    const raw = seedWith(
      [["business", "disclosures", "ai"], "AI rendering"],
      [["pricing", "caption"], "Pricing"],
    );
    const run = () => validateContent(raw);
    expect(run).toThrow(/business\.json: disclosures\.ai/);
    expect(run).toThrow(/pricing\.json: caption/);
  });

  it("requires a reason on failing eligibility options", () => {
    const raw = seedWith([
      ["rebates", "eligibilityQuestions", "default", 0, "options", 1, "reason"],
      undefined,
    ]);
    expect(() => validateContent(raw)).toThrow(/fail and check outcomes need a reason/);
  });

  it("catches references to plants and styles that do not exist", () => {
    const raw = seedWith(
      [["styles", "styles", 0, "plantIds"], ["saguaro"]],
      [["plants", "plants", 0, "styles"], ["tropical"]],
    );
    const run = () => validateContent(raw);
    expect(run).toThrow(/unknown plant "saguaro"/);
    expect(run).toThrow(/unknown style "tropical"/);
  });

  it("catches a rebate city with no program", () => {
    const raw = seed();
    (raw.rebates as { programs: unknown[] }).programs.pop();
    expect(() => validateContent(raw)).toThrow(/"scottsdale" has no program/);
  });
});
