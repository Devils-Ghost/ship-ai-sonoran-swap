// FR-EST-13 backup map: public-domain US government aerial imagery that needs no account or key.
// Used when Mapbox refuses (bad token, allowance used up). Overview tiles are cached and fast but stop at
// zoom 16; NAIP aerial photos (0.6 m) cover house-level zoom and render on request, so a first view can
// take ~10 s before the CDN has it.

export const USGS_OVERVIEW_TILES =
  "https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}";

const NAIP_EXPORT =
  "https://imagery.nationalmap.gov/arcgis/rest/services/USGSNAIPImagery/ImageServer/exportImage";
const NAIP_TILE_PX = 512;

/** MapLibre fills in `{bbox-epsg-3857}` with each tile's Web Mercator bounds. */
export const NAIP_TILES = `${NAIP_EXPORT}?${new URLSearchParams({
  bbox: "{bbox-epsg-3857}",
  bboxSR: "3857",
  imageSR: "3857",
  size: `${NAIP_TILE_PX},${NAIP_TILE_PX}`,
  format: "jpg",
  bandIds: "0,1,2",
  f: "image",
})
  .toString()
  .replace(encodeURIComponent("{bbox-epsg-3857}"), "{bbox-epsg-3857}")}`;

export const FREE_MAP_ATTRIBUTION = "Imagery: USGS The National Map, USDA NAIP";

/** Zoom at which NAIP takes over from the overview layer. */
export const NAIP_MIN_ZOOM = 16;

/** A MapLibre style (spec v8) with no labels, glyphs or sprites: two raster layers. */
export function freeMapStyle() {
  return {
    version: 8 as const,
    sources: {
      overview: {
        type: "raster" as const,
        tiles: [USGS_OVERVIEW_TILES],
        tileSize: 256,
        maxzoom: 16, // the cached service returns 404 above this; MapLibre overzooms instead
        attribution: FREE_MAP_ATTRIBUTION,
      },
      naip: {
        type: "raster" as const,
        tiles: [NAIP_TILES],
        tileSize: NAIP_TILE_PX,
        // A 512 px tile at z17 is ~0.5 m per pixel in Phoenix, the source's own resolution, so deeper zoom
        // overzooms instead of asking for more slow renders.
        minzoom: NAIP_MIN_ZOOM - 1,
        maxzoom: 17,
      },
    },
    layers: [
      { id: "overview", type: "raster" as const, source: "overview" },
      // The overview stays underneath, so a slow NAIP tile shows a soft photo, never a blank square.
      { id: "naip", type: "raster" as const, source: "naip", minzoom: NAIP_MIN_ZOOM },
    ],
  };
}
