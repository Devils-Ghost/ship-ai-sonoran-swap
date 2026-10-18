"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { cn } from "cn";
import { RebateAmount } from "@/components/estimate/rebate-amount";
import { CitySelect } from "@/components/estimate/city-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WaterEquivalent } from "@/components/estimate/water-equivalent";
import { ShareRebate } from "@/components/share/share-rebate";
import { waterGallonsPerYear } from "@/lib/estimate/water";
import { formatNumber } from "@/lib/utils/format";
import { Slider } from "@/components/ui/slider";
import type { ProgramId } from "@/lib/content/schema";
import type { CityId } from "@/lib/estimate/estimate";
import { computeRebate, getProgram } from "@/lib/rebates/engine";
import { ReopenAlertForm } from "@/components/alerts/reopen-alert-form";
import { isReopenAlertProgram } from "@/lib/alerts";

// FR-HOME-02: inline mini-estimator. Slider 250–5,000 sq ft (step 10) plus a number input.
// Used in the home hero and, locked to one city, on the city rebate pages.
const MIN = 250;
const MAX = 5000;
const STEP = 10;
const QUICK_CITIES: readonly CityId[] = ["phoenix", "mesa", "chandler", "scottsdale"];

export function QuickEstimate({
  defaultSqft = 1200,
  lockedCity,
}: {
  defaultSqft?: number;
  /** FR-RBC: the city pages embed the estimator locked to their program. */
  lockedCity?: ProgramId;
}) {
  const [city, setCity] = useState<ProgramId>(lockedCity ?? "phoenix");
  const [sqft, setSqft] = useState(defaultSqft);
  const [draft, setDraft] = useState(String(defaultSqft));
  const inputId = useId();

  const rebate = computeRebate(city, { sqft });
  const program = getProgram(city);

  const commitDraft = (raw: string) => {
    setDraft(raw);
    const n = Number(raw);
    if (raw.trim() !== "" && Number.isFinite(n)) setSqft(Math.min(50_000, Math.max(0, Math.round(n))));
  };

  return (
    <div className="flex flex-col gap-5 rounded-card border border-line bg-paper p-5 shadow-card sm:p-6">
      <div className="flex flex-col gap-4">
        <h2 className="font-sans text-lg font-semibold text-ink">How big is your lawn?</h2>
        <div className={cn("grid gap-4", lockedCity ? "sm:grid-cols-[9rem]" : "sm:grid-cols-[1fr_9rem]")}>
          {!lockedCity && (
            <CitySelect
              value={city}
              onChange={(c) => setCity(c as ProgramId)}
              cities={QUICK_CITIES}
              label="Your city"
            />
          )}
          <div className="flex flex-col gap-2">
            <Label htmlFor={inputId}>Lawn (sq ft)</Label>
            <Input
              id={inputId}
              type="number"
              inputMode="numeric"
              min={0}
              max={50_000}
              step={1}
              value={draft}
              onChange={(e) => commitDraft(e.target.value)}
              onBlur={() => setDraft(String(sqft))}
              className="tabular"
            />
          </div>
        </div>
        <Slider
          aria-label="Lawn size in square feet"
          min={MIN}
          max={MAX}
          step={STEP}
          value={[Math.min(MAX, Math.max(MIN, sqft))]}
          onValueChange={([v]) => {
            if (v === undefined) return;
            setSqft(v);
            setDraft(String(v));
          }}
        />
      </div>
      <div className="flex flex-col gap-3 border-t border-line pt-4">
        <div aria-live="polite" className="flex min-h-20 flex-col gap-1">
          {rebate.amount === null ? (
            <>
              <p className="font-semibold text-ink">{program.city} is between seasons.</p>
              <p className="text-[0.9375rem] text-ink-muted">{program.statusNote}</p>
              {isReopenAlertProgram(city) && <ReopenAlertForm programId={city} className="mt-3" />}
            </>
          ) : rebate.eligibleByArea ? (
            <>
              <p className="flex flex-wrap items-baseline gap-x-2 text-ink">
                <span className="font-medium">Estimated rebate:</span>
                <RebateAmount amount={rebate.amount} className="text-4xl" />
              </p>
              <p className="text-[0.9375rem] text-ink-muted">{rebate.basis}</p>
            </>
          ) : (
            <p className="text-ink">{rebate.notes[0]?.text}</p>
          )}
        </div>
        {waterGallonsPerYear(sqft) > 0 && (
          <div className="flex flex-col gap-0.5 text-[0.875rem] text-ink-muted">
            <p>Water saved: ≈ {formatNumber(waterGallonsPerYear(sqft))} gallons a year (estimate).</p>
            <WaterEquivalent gallons={waterGallonsPerYear(sqft)} />
          </div>
        )}
        <Link href={`/studio?sqft=${sqft}&city=${city}`} className="w-fit font-semibold link">
          Measure my actual lawn →
        </Link>
        <ShareRebate city={city} sqft={sqft} compact />
      </div>
    </div>
  );
}
