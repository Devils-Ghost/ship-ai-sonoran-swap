"use client";

import { cn } from "cn";
import { ArrowUpRightIcon, DropletsIcon, OctagonXIcon } from "lucide-react";
import business from "@/content/business.json";
import { Money } from "@/components/shared/money";
import { Disclaimer } from "@/components/shared/disclaimer";
import { NotesList } from "@/components/shared/notes-list";
import { SourceNote } from "@/components/shared/source-note";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { cityLabel, type Estimate } from "@/lib/estimate/estimate";
import { PRICING_CAPTION, TIERS, type TierId } from "@/lib/estimate/pricing";
import { WATER } from "@/lib/estimate/water";
import { getProgram } from "@/lib/rebates/engine";
import { formatNumber } from "@/lib/utils/format";
import { RebateAmount } from "./rebate-amount";
import { BathtubSource, WaterEquivalent } from "./water-equivalent";
import { ReopenAlertForm } from "@/components/alerts/reopen-alert-form";
import { isReopenAlertProgram } from "@/lib/alerts";

const IS_CONCEPT = business.mode === "concept";
const TIER_OPTIONS = TIERS.map((t) => ({ value: t.id, label: t.name }));

type ResultsPanelProps = {
  estimate: Estimate | null;
  onTierChange: (tier: TierId) => void;
  onTreesChange: (trees: number) => void;
  onRemovesAllGrassChange: (value: boolean) => void;
  actions?: React.ReactNode;
  className?: string;
};

// FR-EST-09 results panel with every SRS §12 "Rebate result" state.
export function ResultsPanel({
  estimate,
  onTierChange,
  onTreesChange,
  onRemovesAllGrassChange,
  actions,
  className,
}: ResultsPanelProps) {
  if (!estimate || estimate.sqft === 0) {
    return (
      <section
        aria-label="Your results"
        className={cn(
          "flex min-h-64 items-center justify-center rounded-card border border-dashed border-line bg-paper p-6",
          className,
        )}
      >
        <p className="text-ink-muted" aria-live="polite">
          Your rebate appears here.
        </p>
      </section>
    );
  }

  const { rebate, input } = estimate;
  const program = rebate ? getProgram(rebate.programId) : null;
  const blocked = rebate !== null && !rebate.eligibleByArea && rebate.amount === 0;

  return (
    <section
      aria-label="Your results"
      className={cn("flex flex-col gap-6 rounded-card border border-line bg-paper p-6", className)}
    >
      <div aria-live="polite" className="flex flex-col gap-2">
        <p className="eyebrow">Estimated rebate</p>
        {rebate === null && (
          <p className="text-ink">
            We don&apos;t have{" "}
            {input.city === "other" ? "your utility" : cityLabel(input.city).replace("City of ", "")}
            &apos;s program in our data yet. Check your water utility&apos;s conservation office. Your project
            and water estimates still apply.
          </p>
        )}
        {rebate && rebate.amount === null && program && (
          // FR-REB-14: closed programs show status and the official link, never an amount.
          <div className="flex flex-col gap-2">
            <p className="font-display text-2xl font-semibold text-saguaro">
              {program.status === "closed" ? "Between seasons" : "No amount published"}
            </p>
            <p className="text-ink">{program.statusNote}</p>
            <a
              href={program.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-fit font-semibold link"
            >
              {program.city}&apos;s official page
              <ArrowUpRightIcon className="ml-0.5 inline size-4" aria-hidden="true" />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            {program.status === "closed" && isReopenAlertProgram(program.id) && (
              <ReopenAlertForm programId={program.id} className="mt-2" />
            )}
          </div>
        )}
        {blocked && program && (
          <div className="flex gap-3 rounded-card border border-error/30 bg-warning-bg p-4">
            <OctagonXIcon className="mt-0.5 size-5 shrink-0 text-error" aria-hidden="true" />
            <div className="flex flex-col gap-1">
              <p className="font-semibold text-ink">
                Below {program.city}&apos;s {formatNumber(rebate.minimumSqft ?? 0)} sq ft minimum
              </p>
              <p className="text-[0.9375rem] text-ink-muted">
                Measure again to include every patch of grass
                {program.type === "per_sqft" && program.minimumWaiver
                  ? ", or tell us if you're removing all of it"
                  : ""}
                .
              </p>
            </div>
          </div>
        )}
        {rebate && rebate.amount !== null && !blocked && program && (
          <>
            <RebateAmount amount={rebate.amount} className="text-5xl lg:text-6xl" />
            <p className="text-[0.9375rem] text-ink-muted">
              {rebate.basis} ({program.city})
            </p>
          </>
        )}
      </div>

      {program?.type === "tiered" && rebate?.eligibleByArea && (
        <TreesInput
          max={program.treeBonus.maxTrees}
          perTree={program.treeBonus.perTree}
          value={input.trees ?? 0}
          onChange={onTreesChange}
        />
      )}
      {program?.type === "per_sqft" && program.minimumWaiver && estimate.sqft < program.minimumSqft && (
        <label className="flex min-h-11 cursor-pointer items-center gap-3 text-[0.9375rem]">
          <input
            type="checkbox"
            checked={input.removesAllGrass ?? false}
            onChange={(e) => onRemovesAllGrassChange(e.target.checked)}
            className="size-5 accent-terracotta"
          />
          I&apos;m removing all the grass on my property
        </label>
      )}

      {rebate && <NotesList notes={rebate.notes} />}
      {program && (
        <div className="flex flex-col gap-1">
          <SourceNote program={program} />
          <Disclaimer city={program.city} />
        </div>
      )}

      <hr className="border-line" />

      <div className="flex flex-col gap-3">
        <span className="text-[0.9375rem] font-medium text-ink">Project style</span>
        <SegmentedControl
          label="Project style"
          value={input.tier}
          onValueChange={onTierChange}
          options={TIER_OPTIONS}
        />
      </div>

      <dl className="grid gap-4 sm:grid-cols-2">
        <Figure label="Project estimate">
          <Money low={estimate.project.low} high={estimate.project.high} />
        </Figure>
        <Figure label="After your rebate">
          <Money low={estimate.net.low} high={estimate.net.high} />
        </Figure>
        <Figure label="Water saved (estimate)">
          <span className="inline-flex items-start gap-1.5 text-base">
            <DropletsIcon className="mt-1 size-4 shrink-0 text-dusk" aria-hidden="true" />≈{" "}
            {formatNumber(estimate.waterGalYear)} gallons a year
          </span>
          <WaterEquivalent
            gallons={estimate.waterGalYear}
            className="text-[0.875rem] font-normal text-ink-muted"
          />
        </Figure>
        {program && (program.approval.reviewTime || program.approval.completeWithin) && (
          <Figure label="Timeline">
            <span className="text-[0.9375rem] font-normal">
              {[
                program.approval.reviewTime && `Approval: ${program.approval.reviewTime}`,
                program.approval.completeWithin && `finish within ${program.approval.completeWithin}`,
              ]
                .filter(Boolean)
                .join("; ")}
            </span>
          </Figure>
        )}
      </dl>
      <div className="flex flex-col gap-1 text-[0.8125rem] text-ink-muted">
        {IS_CONCEPT && <p>{PRICING_CAPTION}</p>}
        <details>
          <summary className="w-fit cursor-pointer underline decoration-1 underline-offset-3">
            How we estimate water
          </summary>
          <p className="mt-1">
            {WATER.derivation}{" "}
            <a
              href={WATER.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-3"
            >
              Source<span className="sr-only"> (opens in a new tab)</span>
            </a>
          </p>
          <BathtubSource className="mt-1" />
        </details>
      </div>

      {actions}
    </section>
  );
}

function Figure({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-sm text-ink-muted">{label}</dt>
      <dd className="text-lg font-semibold text-ink">{children}</dd>
    </div>
  );
}

function TreesInput({
  max,
  perTree,
  value,
  onChange,
}: {
  max: number;
  perTree: number;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[0.9375rem] font-medium text-ink">
        New low-water trees you&apos;ll plant (up to {max}, ${perTree} each)
      </span>
      <SegmentedControl
        label="New low-water trees"
        value={String(value)}
        onValueChange={(v) => onChange(Number(v))}
        options={Array.from({ length: max + 1 }, (_, i) => ({ value: String(i), label: String(i) }))}
      />
    </div>
  );
}
