import { describe, expect, it } from "vitest";
import { FREE_MAP_ATTRIBUTION, NAIP_TILES, USGS_OVERVIEW_TILES, freeMapStyle } from "./free-map";

describe("backup map style (FR-EST-13)", () => {
  it("asks NAIP for one Web Mercator tile per request", () => {
    expect(NAIP_TILES).toContain("bbox={bbox-epsg-3857}");
    const url = new URL(NAIP_TILES.replace("{bbox-epsg-3857}", "1,2,3,4"));
    expect(url.host).toBe("imagery.nationalmap.gov");
    expect(url.searchParams.get("bbox")).toBe("1,2,3,4");
    expect(url.searchParams.get("bboxSR")).toBe("3857");
    expect(url.searchParams.get("imageSR")).toBe("3857");
    expect(url.searchParams.get("f")).toBe("image");
  });

  it("keeps the fast overview under NAIP and credits the sources", () => {
    const style = freeMapStyle();
    expect(style.layers.map((l) => l.id)).toEqual(["overview", "naip"]);
    expect(style.sources.overview.tiles).toEqual([USGS_OVERVIEW_TILES]);
    expect(style.sources.overview.maxzoom).toBe(16);
    expect(style.sources.overview.attribution).toBe(FREE_MAP_ATTRIBUTION);
  });
});
