"use client";

import dynamic from "next/dynamic";
import { useCallback, useRef, useState } from "react";
import { MapIcon, OctagonXIcon, TrashIcon, TriangleAlertIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LARGE_LAWN_SQFT, MIN_SHAPE_SQFT, type AreaSummary } from "@/lib/estimate/area";
import { isCityId, type CityId } from "@/lib/estimate/estimate";
import { formatNumber, formatSqft } from "@/lib/utils/format";
import { AddressSearch, type AddressPick } from "./address-search";
import type { MapCanvasHandle } from "./map-canvas";

export type MapResult = { sqft: number; shapeCount: number };

const MAP_HEIGHT = "h-[60vh] min-h-80 lg:h-[560px]";

// Mapbox GL is ~510 KB gzipped, so it loads only after an address is chosen or the visitor asks for it.
const MapCanvas = dynamic(() => import("./map-canvas").then((m) => m.MapCanvas), {
  ssr: false,
  loading: () => <Skeleton className={`${MAP_HEIGHT} w-full rounded-media`} />,
});

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export function MapMeasure({
  onChange,
  onCity,
}: {
  onChange: (result: MapResult) => void;
  onCity: (city: CityId) => void;
}) {
  const [showMap, setShowMap] = useState(false);
  const [failed, setFailed] = useState(!TOKEN);
  const [target, setTarget] = useState<AddressPick | null>(null);
  const [summary, setSummary] = useState<AreaSummary | null>(null);
  const canvas = useRef<MapCanvasHandle>(null);

  const onSummary = useCallback(
    (s: AreaSummary, newlyIgnored: number) => {
      setSummary(s);
      onChange({ sqft: s.totalSqft, shapeCount: s.shapes.filter((x) => !x.ignored).length });
      if (newlyIgnored > 0) toast(`That shape was under ${MIN_SHAPE_SQFT} sq ft, so we left it out.`);
    },
    [onChange],
  );

  const pick = (p: AddressPick) => {
    setTarget(p);
    setShowMap(true);
    // FR-EST-08: preselect the utility city from the geocoder; the visitor confirms it below.
    const place = p.place?.toLowerCase() ?? "";
    onCity(isCityId(place) ? place : "other");
  };

  if (failed) {
    // FR-EST-13: the page stays fully usable through the other two paths.
    return (
      <div className="flex flex-col gap-2 rounded-card border border-line bg-paper p-6" role="status">
        <p className="flex items-center gap-2 font-semibold text-ink">
          <OctagonXIcon className="size-5 text-error" aria-hidden="true" />
          Map unavailable
        </p>
        <p className="text-ink-muted">
          The map isn&apos;t loading right now. Enter your square footage or try the sample yard.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {TOKEN && <AddressSearch token={TOKEN} onPick={pick} />}

      {showMap && TOKEN ? (
        <MapCanvas
          ref={canvas}
          token={TOKEN}
          target={target}
          onSummary={onSummary}
          onError={() => setFailed(true)}
          className={MAP_HEIGHT}
        />
      ) : (
        <div
          className={`${MAP_HEIGHT} flex flex-col items-center justify-center gap-4 rounded-media border border-line bg-sand p-6 text-center`}
        >
          <MapIcon className="size-10 text-saguaro" aria-hidden="true" />
          <p className="max-w-sm text-ink-muted">
            Find your home above, or open the map and zoom in yourself.
          </p>
          <Button variant="secondary" onClick={() => setShowMap(true)}>
            Show the map
          </Button>
        </div>
      )}

      {summary && summary.shapes.length > 0 && (
        <div className="flex flex-col gap-3 rounded-card border border-line bg-paper p-4">
          <p className="font-semibold text-ink">
            Total: <span className="tabular">{formatSqft(summary.totalSqft)}</span>
          </p>
          <ul className="flex flex-col gap-1">
            {summary.shapes.map((s, i) => (
              <li key={i} className="flex min-h-11 items-center justify-between gap-3 text-[0.9375rem]">
                <span className={s.ignored ? "text-ink-muted line-through" : "text-ink"}>
                  Shape {i + 1}: <span className="tabular">{formatSqft(s.sqft)}</span>
                  {s.ignored && " (too small, ignored)"}
                </span>
                <button
                  type="button"
                  onClick={() => canvas.current?.deleteShape(i)}
                  className="inline-flex size-11 cursor-pointer items-center justify-center rounded-full text-ink-muted hover:bg-sand hover:text-ink"
                  aria-label={`Delete shape ${i + 1}`}
                >
                  <TrashIcon className="size-4" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
          {summary.selfIntersecting && <Warning>Your shape crosses itself. Drag a corner to fix it.</Warning>}
          {summary.tooLarge && (
            <Warning>
              That&apos;s larger than most residential lawns (over {formatNumber(LARGE_LAWN_SQFT)} sq ft).
              Double-check your outline.
            </Warning>
          )}
        </div>
      )}
    </div>
  );
}

function Warning({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="flex gap-2 rounded-input bg-warning-bg px-3 py-2 text-[0.9375rem] text-warning"
      role="alert"
    >
      <TriangleAlertIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      {children}
    </p>
  );
}
