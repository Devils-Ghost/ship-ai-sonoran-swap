import turfArea from "@turf/area";
import type { Polygon, Position } from "geojson";

// FR-EST-05/06: lawn area from drawn polygons. Pure; runs in the browser only (polygons never reach our server).

export const SQFT_PER_SQ_METER = 10.7639;
/** FR-EST-06: shapes smaller than this are treated as accidental taps and ignored. */
export const MIN_SHAPE_SQFT = 20;
/** FR-EST-06: totals above this get a "double-check your outline" warning. */
export const LARGE_LAWN_SQFT = 20_000;
/** FR-EST-07: manual entry bounds, matching the database check constraint. */
export const MAX_MANUAL_SQFT = 50_000;

export function polygonSqft(polygon: Polygon): number {
  return Math.round(turfArea(polygon) * SQFT_PER_SQ_METER);
}

export type ShapeArea = { sqft: number; ignored: boolean; selfIntersecting: boolean };

export type AreaSummary = {
  totalSqft: number;
  shapes: ShapeArea[];
  /** Number of shapes dropped for being under MIN_SHAPE_SQFT (the UI shows a toast). */
  ignoredCount: number;
  tooLarge: boolean;
  selfIntersecting: boolean;
};

export function summarizeShapes(polygons: Polygon[]): AreaSummary {
  const shapes = polygons.map((p) => {
    const sqft = polygonSqft(p);
    return {
      sqft,
      ignored: sqft < MIN_SHAPE_SQFT,
      selfIntersecting: ringSelfIntersects(p.coordinates[0] ?? []),
    };
  });
  const counted = shapes.filter((s) => !s.ignored);
  const totalSqft = counted.reduce((sum, s) => sum + s.sqft, 0);
  return {
    totalSqft,
    shapes,
    ignoredCount: shapes.length - counted.length,
    tooLarge: totalSqft > LARGE_LAWN_SQFT,
    selfIntersecting: counted.some((s) => s.selfIntersecting),
  };
}

/** True when any two non-adjacent edges of a closed ring cross (FR-EST-06 "Shape crosses itself"). */
export function ringSelfIntersects(ring: Position[]): boolean {
  const pts = closed(ring);
  const n = pts.length - 1; // number of edges
  if (n < 4) return false; // a triangle can't cross itself
  const at = (k: number): Position => pts[k] ?? [0, 0];
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (j === i + 1 || (i === 0 && j === n - 1)) continue; // adjacent edges share a vertex
      if (segmentsCross(at(i), at(i + 1), at(j), at(j + 1))) return true;
    }
  }
  return false;
}

function closed(ring: Position[]): Position[] {
  const first = ring[0];
  const last = ring[ring.length - 1];
  if (!first || !last) return [];
  return first[0] === last[0] && first[1] === last[1] ? ring : [...ring, first];
}

function orient([ax = 0, ay = 0]: Position, [bx = 0, by = 0]: Position, [cx = 0, cy = 0]: Position): number {
  return Math.sign((bx - ax) * (cy - ay) - (by - ay) * (cx - ax));
}

// Proper crossings only; touching endpoints and collinear overlaps don't count at lawn scale.
function segmentsCross(a: Position, b: Position, c: Position, d: Position): boolean {
  return orient(a, b, c) * orient(a, b, d) < 0 && orient(c, d, a) * orient(c, d, b) < 0;
}
