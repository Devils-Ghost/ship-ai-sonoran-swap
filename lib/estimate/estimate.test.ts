import type { Polygon } from "geojson";
import { describe, expect, it } from "vitest";
import { polygonSqft, ringSelfIntersects, summarizeShapes } from "./area";
import { netRange, projectRange } from "./pricing";
import { waterGallonsPerYear } from "./water";

describe("pricing (SRS §3.4)", () => {
  it("matches the SRS §6.11 worked example: 1,200 sq ft Phoenix Signature", () => {
    const project = projectRange(1200, "signature");
    expect(project).toEqual({ low: 12000, high: 18000 });
    expect(netRange(project, 2400)).toEqual({ low: 9600, high: 15600 });
  });

  it("never quotes below the $3,000 minimum project", () => {
    expect(projectRange(250, "essentials")).toEqual({ low: 3000, high: 3000 });
    expect(projectRange(400, "essentials")).toEqual({ low: 3000, high: 3600 });
  });

  it("floors net cost at $0 when the rebate exceeds the low estimate", () => {
    expect(netRange({ low: 3000, high: 4500 }, 3600)).toEqual({ low: 0, high: 900 });
  });

  it("uses the full project range when there is no rebate", () => {
    expect(netRange({ low: 12000, high: 18000 }, null)).toEqual({ low: 12000, high: 18000 });
  });
});

describe("water (SRS §3.5)", () => {
  it("estimates about 23 gallons per sq ft a year, rounded to 100", () => {
    expect(waterGallonsPerYear(1000)).toBe(23000);
    expect(waterGallonsPerYear(1240)).toBe(28500);
    expect(waterGallonsPerYear(0)).toBe(0);
  });
});

// Builds a rectangle of known size in feet around a point, using local meters-per-degree, which is
// independent of turf's spherical model: an honest reference for the ±3% acceptance check (§8 AC).
function rectFeet(lat: number, lng: number, widthFt: number, heightFt: number): Polygon {
  const mPerDegLat = 111_132.92 - 559.82 * Math.cos((2 * (lat * Math.PI)) / 180);
  const mPerDegLng = 111_412.84 * Math.cos((lat * Math.PI) / 180);
  const dLat = (heightFt * 0.3048) / mPerDegLat;
  const dLng = (widthFt * 0.3048) / mPerDegLng;
  return {
    type: "Polygon",
    coordinates: [
      [
        [lng, lat],
        [lng + dLng, lat],
        [lng + dLng, lat + dLat],
        [lng, lat + dLat],
        [lng, lat],
      ],
    ],
  };
}

describe("area (FR-EST-05/06)", () => {
  it("measures a 40 × 30 ft Phoenix rectangle within ±3% of 1,200 sq ft", () => {
    const sqft = polygonSqft(rectFeet(33.4486, -112.0773, 40, 30));
    expect(Math.abs(sqft - 1200) / 1200).toBeLessThan(0.03);
  });

  it("measures a 100 × 50 ft rectangle within ±3% of 5,000 sq ft", () => {
    const sqft = polygonSqft(rectFeet(33.3062, -111.8413, 100, 50));
    expect(Math.abs(sqft - 5000) / 5000).toBeLessThan(0.03);
  });

  it("totals shapes, ignores tiny ones and flags very large lawns", () => {
    const s = summarizeShapes([
      rectFeet(33.45, -112.07, 40, 30),
      rectFeet(33.4501, -112.0701, 20, 20),
      rectFeet(33.4502, -112.0702, 3, 3), // 9 sq ft → ignored
    ]);
    expect(s.shapes).toHaveLength(3);
    expect(s.ignoredCount).toBe(1);
    expect(Math.abs(s.totalSqft - 1600) / 1600).toBeLessThan(0.03);
    expect(s.tooLarge).toBe(false);
    expect(summarizeShapes([rectFeet(33.45, -112.07, 200, 120)]).tooLarge).toBe(true);
  });

  it("detects a bow-tie ring but not a normal rectangle", () => {
    const bowTie = [
      [0, 0],
      [1, 1],
      [1, 0],
      [0, 1],
      [0, 0],
    ];
    expect(ringSelfIntersects(bowTie)).toBe(true);
    expect(ringSelfIntersects(rectFeet(33.45, -112.07, 40, 30).coordinates[0]!)).toBe(false);
  });
});
