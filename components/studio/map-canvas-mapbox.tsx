"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import mapboxgl from "mapbox-gl";
import { MapCanvas, type CreateMap, type MapCanvasProps } from "./map-canvas";

// FR-EST-03: the primary map, Mapbox satellite with street labels.
export function MapboxCanvas({ token, ...props }: MapCanvasProps & { token: string }) {
  const createMap: CreateMap = ({ container, center, zoom }) => {
    mapboxgl.accessToken = token;
    const map = new mapboxgl.Map({
      container,
      style: "mapbox://styles/mapbox/satellite-streets-v12",
      center,
      zoom,
      preserveDrawingBuffer: true, // FR-EST-14: the prep sheet snapshots the canvas
      attributionControl: true,
    });
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");
    return map;
  };
  return <MapCanvas {...props} createMap={createMap} />;
}
