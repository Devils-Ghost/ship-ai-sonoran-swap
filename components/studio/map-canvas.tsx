"use client";

import type mapboxgl from "mapbox-gl";
import type { Feature, FeatureCollection, Polygon, Position } from "geojson";
import { useEffect, useImperativeHandle, useRef, useState } from "react";
import { cn } from "cn";
import { CrosshairIcon, PencilIcon, Undo2Icon, XIcon } from "lucide-react";
import { summarizeShapes, type AreaSummary } from "@/lib/estimate/area";
import { formatSqft } from "@/lib/utils/format";
import type { AddressPick } from "@/lib/geocode";

// FR-EST-03/04/05/16: satellite map with an outline tool. Polygons live only in this component's memory;
// only the total area leaves it (FR-EST-12, AGENTS §2.4). The map library is passed in as createMap so the
// same tool runs on Mapbox or on the free MapLibre backup (FR-EST-13); both share the Mapbox GL v1 API.

export type MapCanvasHandle = { deleteShape: (index: number) => void };

const PHOENIX: [number, number] = [-112.07, 33.45];
const CLOSE_PX = 14; // tap within this distance of the first point to close a shape
const HINT_MS = 10_000;
const LOAD_TIMEOUT_MS = 20_000;

export type CreateMap = (options: {
  container: HTMLElement;
  center: [number, number];
  zoom: number;
}) => mapboxgl.Map;

export type MapCanvasProps = {
  ref?: React.Ref<MapCanvasHandle>;
  target: AddressPick | null;
  onSummary: (summary: AreaSummary, newlyIgnored: number) => void;
  onError: () => void;
  className?: string;
};

type Props = MapCanvasProps & { createMap: CreateMap };

function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function ring(points: Position[]): Position[] {
  const first = points[0];
  return first ? [...points, first] : [];
}

export function MapCanvas({ ref, createMap, target, onSummary, onError, className }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  // The drawing layers exist once the style has loaded; tiles may still be arriving (slow on the backup).
  const ready = useRef(false);
  const shapes = useRef<Position[][]>([]); // closed shapes, without the repeated first point
  const draft = useRef<Position[]>([]);
  const drag = useRef<{ shape: number; vertex: number } | null>(null);
  const lastIgnored = useRef(0);
  const [drawing, setDrawing] = useState(true);
  const [draftSqft, setDraftSqft] = useState(0);
  const [hint, setHint] = useState(true);
  const drawingRef = useRef(drawing);
  useEffect(() => {
    drawingRef.current = drawing;
  }, [drawing]);

  const render = () => {
    const map = mapRef.current;
    if (!map || !ready.current) return;
    const polys: Feature<Polygon>[] = shapes.current.map((pts, i) => ({
      type: "Feature",
      properties: { shape: i },
      geometry: { type: "Polygon", coordinates: [ring(pts)] },
    }));
    const vertices: FeatureCollection = {
      type: "FeatureCollection",
      features: [
        ...shapes.current.flatMap((pts, s) =>
          pts.map((p, v) => ({
            type: "Feature" as const,
            properties: { shape: s, vertex: v },
            geometry: { type: "Point" as const, coordinates: p },
          })),
        ),
        ...draft.current.map((p, v) => ({
          type: "Feature" as const,
          properties: { shape: -1, vertex: v, first: v === 0 },
          geometry: { type: "Point" as const, coordinates: p },
        })),
      ],
    };
    const d = draft.current;
    const draftGeo: FeatureCollection = {
      type: "FeatureCollection",
      features:
        d.length >= 3
          ? [{ type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [ring(d)] } }]
          : d.length === 2
            ? [{ type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: d } }]
            : [],
    };
    (map.getSource("shapes") as mapboxgl.GeoJSONSource | undefined)?.setData({
      type: "FeatureCollection",
      features: polys,
    });
    (map.getSource("draft") as mapboxgl.GeoJSONSource | undefined)?.setData(draftGeo);
    (map.getSource("vertices") as mapboxgl.GeoJSONSource | undefined)?.setData(vertices);

    setDraftSqft(
      d.length >= 3 ? summarizeShapes([{ type: "Polygon", coordinates: [ring(d)] }]).totalSqft : 0,
    );
  };

  const publish = () => {
    const summary = summarizeShapes(
      shapes.current.map((pts) => ({ type: "Polygon", coordinates: [ring(pts)] })),
    );
    const ignored = summary.ignoredCount;
    onSummary(summary, Math.max(0, ignored - lastIgnored.current));
    lastIgnored.current = ignored;
  };

  const closeDraft = () => {
    if (draft.current.length < 3) return;
    shapes.current = [...shapes.current, draft.current];
    draft.current = [];
    render();
    publish();
  };

  useImperativeHandle(ref, () => ({
    deleteShape(index: number) {
      shapes.current = shapes.current.filter((_, i) => i !== index);
      lastIgnored.current = summarizeShapes(
        shapes.current.map((pts) => ({ type: "Polygon", coordinates: [ring(pts)] })),
      ).ignoredCount;
      render();
      publish();
    },
  }));

  useEffect(() => {
    if (!container.current) return;
    let map: mapboxgl.Map;
    try {
      map = createMap({
        container: container.current,
        center: target ? [target.lng, target.lat] : PHOENIX,
        zoom: target ? 19 : 10,
      });
    } catch {
      onError(); // WebGL unavailable
      return;
    }
    mapRef.current = map;
    map.doubleClickZoom.disable();

    // FR-EST-13: give up only when the map can't work at all: the style itself fails (bad token,
    // allowance used up, network) or it doesn't load in time. A failed tile after that mustn't take the
    // whole map down.
    map.on("error", () => {
      if (!ready.current) onError();
    });
    const loadTimer = setTimeout(() => {
      if (!ready.current) onError();
    }, LOAD_TIMEOUT_MS);

    map.on("style.load", () => {
      if (ready.current) return;
      ready.current = true;
      const terracotta = cssVar("--color-terracotta");
      const paloVerde = cssVar("--color-palo-verde");
      const paper = cssVar("--color-paper");
      const empty: FeatureCollection = { type: "FeatureCollection", features: [] };
      map.addSource("shapes", { type: "geojson", data: empty });
      map.addSource("draft", { type: "geojson", data: empty });
      map.addSource("vertices", { type: "geojson", data: empty });
      map.addLayer({
        id: "shapes-fill",
        type: "fill",
        source: "shapes",
        paint: { "fill-color": paloVerde, "fill-opacity": 0.4 },
      });
      map.addLayer({
        id: "shapes-line",
        type: "line",
        source: "shapes",
        paint: { "line-color": terracotta, "line-width": 3 },
      });
      map.addLayer({
        id: "draft-fill",
        type: "fill",
        source: "draft",
        filter: ["==", ["geometry-type"], "Polygon"],
        paint: { "fill-color": paloVerde, "fill-opacity": 0.25 },
      });
      map.addLayer({
        id: "draft-line",
        type: "line",
        source: "draft",
        paint: { "line-color": paper, "line-width": 2, "line-dasharray": [2, 1.5] },
      });
      map.addLayer({
        id: "vertices",
        type: "circle",
        source: "vertices",
        paint: {
          "circle-radius": ["case", ["boolean", ["get", "first"], false], 8, 6],
          "circle-color": paper,
          "circle-stroke-color": terracotta,
          "circle-stroke-width": 3,
        },
      });
      render();
    });

    map.on("click", (e) => {
      if (!drawingRef.current || drag.current) return;
      setHint(false);
      const pts = draft.current;
      const first = pts[0];
      if (first && pts.length >= 3) {
        const p = map.project(first as [number, number]);
        if (Math.hypot(p.x - e.point.x, p.y - e.point.y) <= CLOSE_PX) {
          closeDraft();
          return;
        }
      }
      draft.current = [...pts, [e.lngLat.lng, e.lngLat.lat]];
      render();
    });
    map.on("dblclick", (e) => {
      if (!drawingRef.current) return;
      e.preventDefault();
      closeDraft();
    });

    // Drag a corner of a finished shape to edit it (FR-EST-04).
    const startDrag = (e: mapboxgl.MapMouseEvent | mapboxgl.MapTouchEvent) => {
      const f = e.features?.[0];
      const shape = Number(f?.properties?.shape);
      if (!f || shape < 0) return;
      e.preventDefault();
      drag.current = { shape, vertex: Number(f.properties?.vertex) };
      map.dragPan.disable();
    };
    const moveDrag = (e: mapboxgl.MapMouseEvent | mapboxgl.MapTouchEvent) => {
      const d = drag.current;
      if (!d) return;
      const pts = shapes.current[d.shape];
      if (!pts) return;
      pts[d.vertex] = [e.lngLat.lng, e.lngLat.lat];
      render();
    };
    const endDrag = () => {
      if (!drag.current) return;
      // Let the click that ends a drag pass without adding a point.
      setTimeout(() => (drag.current = null), 0);
      map.dragPan.enable();
      publish();
    };
    map.on("mousedown", "vertices", startDrag);
    map.on("touchstart", "vertices", startDrag);
    map.on("mousemove", moveDrag);
    map.on("touchmove", moveDrag);
    map.on("mouseup", endDrag);
    map.on("touchend", endDrag);
    map.on("mouseenter", "vertices", () => (map.getCanvas().style.cursor = "move"));
    map.on("mouseleave", "vertices", () => (map.getCanvas().style.cursor = ""));

    const hintTimer = setTimeout(() => setHint(false), HINT_MS);
    return () => {
      clearTimeout(hintTimer);
      clearTimeout(loadTimer);
      map.remove();
      mapRef.current = null;
      ready.current = false;
    };
    // The map is created once; target changes are handled by the fly-to effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // FR-EST-03: fly to the chosen address over 1.2 s, or jump when motion is reduced.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !target) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const camera = { center: [target.lng, target.lat] as [number, number], zoom: 19 };
    if (reduce) map.jumpTo(camera);
    else map.flyTo({ ...camera, duration: 1200 });
  }, [target]);

  const undo = () => {
    draft.current = draft.current.slice(0, -1);
    render();
  };
  const recenter = () => {
    const map = mapRef.current;
    if (!map) return;
    map.jumpTo(target ? { center: [target.lng, target.lat], zoom: 19 } : { center: PHOENIX, zoom: 10 });
  };

  return (
    <div className={cn("relative overflow-hidden rounded-media border border-line bg-sand", className)}>
      {/* The map CSS makes its container position: relative, so it gets its own full-size element. */}
      <div
        className="absolute inset-0"
        role="region"
        aria-label="Satellite map. Use the toolbar to outline your lawn."
      >
        <div ref={container} className="h-full w-full" />
      </div>

      <div className="absolute top-3 left-3 flex max-w-[calc(100%-4.5rem)] flex-wrap gap-2 rounded-card bg-paper p-1.5 shadow-card">
        <ToolButton
          pressed={drawing}
          onClick={() => setDrawing((d) => !d)}
          label="Outline your lawn"
          Icon={PencilIcon}
        />
        <ToolButton onClick={undo} label="Undo point" Icon={Undo2Icon} />
        <ToolButton onClick={recenter} label="Recenter" Icon={CrosshairIcon} />
      </div>

      {draftSqft > 0 && (
        <p
          className="absolute bottom-10 left-3 rounded-full bg-ink/85 px-3 py-1.5 text-sm font-semibold text-caliche tabular"
          aria-live="polite"
        >
          {formatSqft(draftSqft)} · tap the first point to finish
        </p>
      )}

      {hint && (
        <div className="absolute inset-x-3 bottom-10 mx-auto flex max-w-md items-start gap-3 rounded-card bg-paper/95 p-4 shadow-card">
          <p className="text-[0.9375rem] text-ink">
            Tap around the edge of your grass. Tap the first point to finish. Add more shapes for other
            patches.
          </p>
          <button
            type="button"
            onClick={() => setHint(false)}
            className="-m-2 inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full hover:bg-sand"
            aria-label="Dismiss hint"
          >
            <XIcon className="size-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}

function ToolButton({
  label,
  Icon,
  onClick,
  pressed,
}: {
  label: string;
  Icon: typeof PencilIcon;
  onClick: () => void;
  pressed?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={pressed}
      className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-input px-3 text-sm font-semibold text-ink hover:bg-sand aria-pressed:bg-saguaro aria-pressed:text-caliche"
    >
      <Icon className="size-4" aria-hidden="true" />
      <span className="max-sm:sr-only">{label}</span>
    </button>
  );
}
