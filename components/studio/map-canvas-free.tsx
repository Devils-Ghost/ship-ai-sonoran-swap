"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { Map as MapLibreMap, NavigationControl, setWorkerUrl } from "maplibre-gl";
import type mapboxgl from "mapbox-gl";
import { freeMapStyle } from "@/lib/free-map";
import { MapCanvas, type CreateMap, type MapCanvasProps } from "./map-canvas";

// MapLibre looks for its worker next to its own module, which the bundler moves; point it at the bundled
// copy. The worker draws the outline layers.
setWorkerUrl(new URL("maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url).href);

// FR-EST-13: the backup map, MapLibre (open source) over USGS/USDA aerial imagery. No account, no key.
export function FreeMapCanvas(props: MapCanvasProps) {
  const createMap: CreateMap = ({ container, center, zoom }) => {
    const map = new MapLibreMap({
      container,
      style: freeMapStyle(),
      center,
      zoom,
      maxZoom: 20,
      canvasContextAttributes: { preserveDrawingBuffer: true }, // FR-EST-14
    });
    map.addControl(new NavigationControl({ showCompass: false }), "top-right");
    // MapLibre is the open-source fork of Mapbox GL v1; every call the outline tool makes (events, sources,
    // layers, camera, project) has the same signature in both, so it shares the tool's Mapbox typing.
    return map as unknown as mapboxgl.Map;
  };
  return <MapCanvas {...props} createMap={createMap} />;
}
