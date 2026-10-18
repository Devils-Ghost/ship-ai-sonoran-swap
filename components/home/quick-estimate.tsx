"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { RebateAmount } from "@/components/estimate/rebate-amount";
import { CitySelect } from "@/components/estimate/city-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import type { CityId } from "@/lib/estimate/estimate";
import { computeRebate, getProgram } from "@/lib/rebates/engine";
import type { ProgramId } from "@/lib/content/schema";

// FR-HOME-02: inline mini-estimator in the hero. Slider 250–5,000 sq ft (step 10) plus a number input.
const MIN = 250;
const MAX = 5000;
const STEP = 10;
const QUICK_CITIES: readonly CityId[] = ["phoenix", "mesa", "chandler", "scottsdale"];

export function QuickEstimate({ defaultSqft = 1200 }: { defaultSqft?: number }) {
  const [city, setCity] = useState<ProgramId>("phoenix");
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
      <h2 className="font-sans text-lg font-semibold text-ink">How big is your lawn?</h2>
      <div className="grid gap-4 sm:grid-cols-[1fr_9rem]">
        <CitySelect
          value={city}
          onChange={(c) => setCity(c as ProgramId)}
          cities={QUICK_CITIES}
          label="Your city"
        />
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
      <div aria-live="polite" className="flex min-h-20 flex-col gap-1">
        {rebate.amount === null ? (
          <>
            <p className="font-semibold text-ink">{program.city} is between seasons.</p>
            <p className="text-[0.9375rem] text-ink-muted">{program.statusNote}</p>
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
      <Link href={`/studio?sqft=${sqft}&city=${city}`} className="w-fit font-semibold link">
        Measure my actual lawn →
      </Link>
    </div>
  );
}
