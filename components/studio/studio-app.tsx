"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { HomeIcon, MapIcon, RulerIcon } from "lucide-react";
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui";
import { toast } from "sonner";
import business from "@/content/business.json";
import { CitySelect } from "@/components/estimate/city-select";
import { ResultsPanel } from "@/components/estimate/results-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/sonner";
import { testSessionId, track } from "@/lib/analytics/client";
import { rebateBucket, sqftBucket } from "@/lib/analytics/whitelist";
import { MAX_MANUAL_SQFT } from "@/lib/estimate/area";
import { saveSnapshotForPrep } from "@/lib/studio/snapshot";
import { pickParams } from "@/lib/utils/url";
import { computeEstimate, isCityId, programFor, type CityId } from "@/lib/estimate/estimate";
import { DEFAULT_TIER, TIERS, type TierId } from "@/lib/estimate/pricing";
import { formatMoney, formatNumber } from "@/lib/utils/format";
import { MapMeasure, type MapResult } from "./map-measure";

type Path = "map" | "manual" | "sample";

// FR-EST-01: three entry paths, map first. MapMeasure defers the Mapbox GL bundle itself.

const PATHS: { value: Path; label: string; Icon: typeof MapIcon }[] = [
  { value: "map", label: "Measure on the map", Icon: MapIcon },
  { value: "manual", label: "I know my square footage", Icon: RulerIcon },
  { value: "sample", label: "Try a sample yard", Icon: HomeIcon },
];

const SAMPLE = business.sample as { label: string; city: CityId; sqft: number };

function isTier(v: string | null): v is TierId {
  return TIERS.some((t) => t.id === v);
}

/**
 * Reads ?sqft&city&tier without a Suspense hole: the server (and first client render) sees no params, so the
 * studio prerenders with defaults and nothing below it shifts (C3). A shared link remounts the app with its
 * values right after hydration.
 */
export function StudioRoot() {
  const search = useSyncExternalStore(
    subscribeToNothing,
    // Only the params the studio reads: analytics strips ?src=/?team=/?t= after load, which must not remount it.
    () => pickParams(window.location.search, ["sqft", "city", "tier"]),
    () => "",
  );
  return <StudioApp key={search} params={new URLSearchParams(search)} />;
}

const subscribeToNothing = () => () => {};

function StudioApp({ params }: { params: URLSearchParams }) {
  const initialSqft = Number(params.get("sqft"));
  const initialCity = params.get("city");
  const initialTier = params.get("tier");
  // §6.2: if sqft and city arrive in the link, skip straight to results on the manual path.
  const fromLink = Number.isFinite(initialSqft) && initialSqft > 0 && isCityId(initialCity);

  const [path, setPath] = useState<Path>(fromLink ? "manual" : "map");
  const [city, setCity] = useState<CityId>(fromLink && isCityId(initialCity) ? initialCity : "phoenix");
  const [manualSqft, setManualSqft] = useState<string>(fromLink ? String(Math.round(initialSqft)) : "");
  const [map, setMap] = useState<MapResult>({ sqft: 0, shapeCount: 0 });
  const [tier, setTier] = useState<TierId>(isTier(initialTier) ? initialTier : DEFAULT_TIER);
  const [trees, setTrees] = useState(0);
  const [removesAllGrass, setRemovesAllGrass] = useState(false);
  const [estimateId, setEstimateId] = useState<string | null>(null);
  const manualId = useId();
  const resultsRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  // FR-ANL-03: estimator_start once per page load, on the visitor's first real action.
  const start = (how: Path) => {
    if (started.current) return;
    started.current = true;
    track("estimator_start", { path: how });
  };

  const shapeCount = useRef(0);
  // The React Compiler keeps this stable (it reads only a ref and a setter), so MapMeasure's callbacks don't churn.
  const onMap = (next: MapResult) => {
    if (next.shapeCount > shapeCount.current) track("polygon_completed", { count: next.shapeCount });
    shapeCount.current = next.shapeCount;
    setMap(next);
  };

  const sqft = path === "sample" ? SAMPLE.sqft : path === "manual" ? clampSqft(Number(manualSqft)) : map.sqft;

  const estimate = useMemo(
    () => (sqft > 0 ? computeEstimate({ city, sqft, tier, trees, removesAllGrass }) : null),
    [city, sqft, tier, trees, removesAllGrass],
  );

  useStoreFirstEstimate(estimate, path, map.shapeCount, setEstimateId);

  const choosePath = (next: Path) => {
    setPath(next);
    start(next);
    if (next === "sample") {
      setCity(SAMPLE.city);
      track("sample_used");
    }
  };

  const copyLink = async () => {
    const url = new URL("/studio", window.location.origin);
    url.searchParams.set("sqft", String(sqft));
    url.searchParams.set("city", city);
    url.searchParams.set("tier", tier);
    try {
      await navigator.clipboard.writeText(url.toString());
      toast.success("Link copied. It holds your city and lawn size, never your address.");
    } catch {
      toast.error("Couldn't copy. Here's the link: " + url.toString());
    }
  };

  const program = programFor(city);
  const actions = estimate && (
    <div className="flex flex-col gap-3">
      <Button asChild>
        <Link href={estimateId ? `/book?estimateId=${estimateId}` : "/book"}>Book a free yard walk</Link>
      </Button>
      <div className="grid gap-3 sm:grid-cols-2">
        <Button asChild variant="secondary">
          <Link href="/visualize">See it as a desert yard</Link>
        </Button>
        {program && (
          <Button asChild variant="secondary">
            <Link href={`/eligibility?city=${program}`}>Check eligibility</Link>
          </Button>
        )}
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        <Link
          href={`/studio/prep?city=${city}&sqft=${sqft}&tier=${tier}`}
          onClick={() => {
            saveSnapshotForPrep();
            track("prep_sheet_opened", { city });
          }}
          className="min-h-11 content-center font-semibold link"
        >
          Print prep sheet
        </Link>
        <button type="button" onClick={copyLink} className="min-h-11 cursor-pointer font-semibold link">
          Copy link
        </button>
      </div>
    </div>
  );

  return (
    <div className="container-page pb-24 lg:pb-16">
      <ToggleGroupPrimitive.Root
        type="single"
        value={path}
        onValueChange={(v) => v && choosePath(v as Path)}
        aria-label="How do you want to measure?"
        className="grid gap-3 sm:grid-cols-3"
      >
        {PATHS.map(({ value, label, Icon }) => (
          <ToggleGroupPrimitive.Item
            key={value}
            value={value}
            className="flex min-h-14 cursor-pointer items-center gap-3 rounded-card border border-line bg-paper px-4 text-left font-semibold text-ink transition-colors hover:border-ink-muted data-[state=on]:border-saguaro data-[state=on]:bg-saguaro data-[state=on]:text-caliche"
          >
            <Icon className="size-5 shrink-0" aria-hidden="true" />
            {label}
          </ToggleGroupPrimitive.Item>
        ))}
      </ToggleGroupPrimitive.Root>

      <div className="mt-8 grid gap-8 lg:grid-cols-[3fr_2fr] lg:items-start">
        <div className="flex flex-col gap-6">
          {path === "map" && (
            <MapMeasure
              onChange={onMap}
              onCity={(c) => {
                setCity(c);
                start("map");
                track("address_selected");
              }}
            />
          )}

          {path === "manual" && (
            <div className="flex flex-col gap-4 rounded-card border border-line bg-paper p-6">
              <div className="flex max-w-xs flex-col gap-2">
                <Label htmlFor={manualId}>Grass area (sq ft)</Label>
                <Input
                  id={manualId}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={MAX_MANUAL_SQFT}
                  step={1}
                  placeholder="e.g. 1200"
                  value={manualSqft}
                  onChange={(e) => {
                    setManualSqft(e.target.value);
                    start("manual");
                  }}
                  className="tabular"
                />
              </div>
              <details className="text-[0.9375rem] text-ink-muted">
                <summary className="w-fit cursor-pointer font-medium text-ink underline decoration-1 underline-offset-3">
                  How to measure with a tape
                </summary>
                <p className="mt-2 max-w-prose">
                  Split your grass into rectangles. Measure each one&apos;s length and width in feet and
                  multiply them. Add the rectangles together for your total.
                </p>
              </details>
            </div>
          )}

          {path === "sample" && (
            <div className="flex flex-col gap-2 rounded-card border border-line bg-paper p-6">
              <p className="eyebrow">{SAMPLE.label}</p>
              <p className="text-lg text-ink">
                A {formatNumber(SAMPLE.sqft)} sq ft front lawn in Phoenix. Change the city or project style to
                see how the numbers move.
              </p>
            </div>
          )}

          <div className="max-w-sm">
            <CitySelect value={city} onChange={setCity} />
          </div>
        </div>

        <div ref={resultsRef} className="scroll-mt-24 lg:sticky lg:top-24">
          <ResultsPanel
            estimate={estimate}
            onTierChange={setTier}
            onTreesChange={setTrees}
            onRemovesAllGrassChange={setRemovesAllGrass}
            actions={actions}
          />
        </div>
      </div>

      {/* FR-EST-15: on phones the rebate stays visible once computed. */}
      {estimate?.rebate?.amount != null && estimate.rebate.eligibleByArea && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-caliche/95 backdrop-blur-sm lg:hidden">
          <div className="container-page flex min-h-16 items-center justify-between gap-4 py-2">
            <p className="text-sm text-ink-muted">
              Estimated rebate{" "}
              <span className="block font-display text-2xl font-semibold text-terracotta tabular">
                {formatMoney(estimate.rebate.amount)}
              </span>
            </p>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => resultsRef.current?.scrollIntoView({ behavior: "smooth" })}
            >
              See details
            </Button>
          </div>
        </div>
      )}
      <Toaster />
    </div>
  );
}

function clampSqft(n: number): number {
  return Number.isFinite(n) ? Math.min(MAX_MANUAL_SQFT, Math.max(0, Math.round(n))) : 0;
}

/**
 * FR-EST-12: store the first result of this page load (server recomputes it). Debounced so typing
 * "1240" doesn't store "1". Failure never touches the UI.
 */
function useStoreFirstEstimate(
  estimate: ReturnType<typeof computeEstimate> | null,
  source: Path,
  shapeCount: number,
  onStored: (id: string) => void,
) {
  const stored = useRef(false);
  useEffect(() => {
    if (stored.current || !estimate) return;
    const timer = setTimeout(async () => {
      stored.current = true;
      if (source === "manual") track("manual_area_entered");
      track("estimate_shown", {
        city: estimate.input.city,
        sqftBucket: sqftBucket(estimate.sqft),
        rebateBucket: rebateBucket(estimate.rebate?.amount ?? 0),
        tier: estimate.input.tier,
      });
      const testSession = testSessionId();
      try {
        const res = await fetch("/api/estimates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            city: estimate.input.city,
            sqft: estimate.sqft,
            source,
            shapeCount: source === "map" ? shapeCount : 0,
            tier: estimate.input.tier,
            trees: estimate.input.trees ?? 0,
            removesAllGrass: estimate.input.removesAllGrass ?? false,
            ...(testSession ? { testSessionId: testSession } : {}),
          }),
        });
        const json: unknown = await res.json();
        if (json && typeof json === "object" && "ok" in json && json.ok && "data" in json) {
          const data = json.data as { id?: unknown };
          if (typeof data.id === "string") onStored(data.id);
        }
      } catch {
        // Storing is best-effort; the visitor's estimate is already on screen.
      }
    }, 1200);
    return () => clearTimeout(timer);
  }, [estimate, source, shapeCount, onStored]);
}
