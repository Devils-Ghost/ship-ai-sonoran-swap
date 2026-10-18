import { ArrowUpRightIcon, CheckIcon, FileTextIcon, OctagonXIcon, TriangleAlertIcon } from "lucide-react";
import { Money, Sqft } from "@/components/shared/money";
import { NotesList } from "@/components/shared/notes-list";
import type { RebateProgram } from "@/lib/content/schema";
import { computeRebate } from "@/lib/rebates/engine";
import { formatRateShort, summarize } from "@/lib/rebates/summary";
import { formatMoney, formatNumber } from "@/lib/utils/format";

// FR-RBC city page building blocks. Everything renders from the program record and the engine.

export const WORKED_EXAMPLE_SQFT = 1200;

/** "At a glance" facts. */
export function ProgramFacts({ program }: { program: RebateProgram }) {
  const s = summarize(program);
  const rows: [string, React.ReactNode][] = [["How it pays", s.headline]];
  if (program.type === "per_sqft") {
    rows.push(["Minimum", <Sqft key="m" value={program.minimumSqft} />]);
    rows.push([
      "Maximum",
      program.maximumAmount === null ? "No fixed cap" : formatMoney(program.maximumAmount),
    ]);
    if (program.caseByCaseAboveSqft)
      rows.push([
        "Large projects",
        `Over ${formatNumber(program.caseByCaseAboveSqft)} sq ft reviewed case by case`,
      ]);
    if (program.roundingIncrementSqft)
      rows.push(["Rounding", `Paid in ${program.roundingIncrementSqft} sq ft increments, rounded up`]);
  }
  if (program.type === "tiered") {
    rows.push(["Minimum", <Sqft key="m" value={program.minimumSqft} />]);
    rows.push(["Maximum", formatMoney(program.maximumAmount)]);
  }
  if (program.type === "status_only" && program.lastSeasonMaximum) {
    rows.push(["Last season", `Up to ${formatMoney(program.lastSeasonMaximum)}`]);
  }
  rows.push(["Approval first", program.approval.required ? program.approval.name : "Not required"]);
  if (program.approval.reviewTime) rows.push(["Review time", program.approval.reviewTime]);
  if (program.approval.completeWithin) rows.push(["Time to finish", program.approval.completeWithin]);
  if (program.payment) rows.push(["Payment", program.payment]);
  rows.push(["Funding", program.statusNote]);

  return (
    <dl className="grid gap-x-8 gap-y-4 rounded-card border border-line bg-paper p-6 sm:grid-cols-2">
      {rows.map(([k, v]) => (
        <div key={k} className="flex flex-col gap-1">
          <dt className="text-sm text-ink-muted">{k}</dt>
          <dd className="text-ink">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

/** "How the money is calculated", computed by the engine for a 1,200 sq ft lawn (FR-RBC). */
export function WorkedExample({ program }: { program: RebateProgram }) {
  if (program.type === "status_only") return null;
  const r = computeRebate(program.id, { sqft: WORKED_EXAMPLE_SQFT });
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 rounded-card border border-line bg-paper p-6">
        <p className="text-ink-muted">
          Example: a <Sqft value={WORKED_EXAMPLE_SQFT} /> lawn
        </p>
        <p className="font-display text-4xl font-semibold text-terracotta">
          <Money amount={r.amount ?? 0} />
        </p>
        <p className="text-[0.9375rem] text-ink-muted">{r.basis}</p>
      </div>

      {program.type === "tiered" && (
        <table className="w-full max-w-xl border-collapse text-left">
          <caption className="mb-2 text-left text-sm text-ink-muted">
            {program.city} pays by tier, plus {formatMoney(program.treeBonus.perTree)} per new low-water tree
            (up to {program.treeBonus.maxTrees}).
          </caption>
          <thead>
            <tr className="border-b border-line text-sm text-ink-muted">
              <th scope="col" className="py-2 font-medium">
                Grass removed
              </th>
              <th scope="col" className="py-2 font-medium">
                Incentive
              </th>
            </tr>
          </thead>
          <tbody>
            {program.tiers.map((t) => (
              <tr key={t.minSqft} className="border-b border-line">
                <td className="py-2 tabular">
                  {t.maxSqft === null
                    ? `${formatNumber(t.minSqft)} sq ft or more`
                    : `${formatNumber(t.minSqft)}–${formatNumber(t.maxSqft)} sq ft`}
                </td>
                <td className="py-2 font-semibold tabular">{formatMoney(t.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {program.type === "per_sqft" && program.roundingIncrementSqft && <RoundingExample program={program} />}
    </div>
  );
}

function RoundingExample({ program }: { program: Extract<RebateProgram, { type: "per_sqft" }> }) {
  const odd = program.minimumSqft + 1;
  const r = computeRebate(program.id, { sqft: odd });
  return (
    <p className="max-w-2xl text-ink">
      {program.city} pays {formatRateShort(program.ratePerSqft)} per square foot in{" "}
      {program.roundingIncrementSqft} sq ft steps, rounded up: a <Sqft value={odd} /> lawn pays{" "}
      <Money amount={r.amount ?? 0} /> ({r.basis}).
    </p>
  );
}

function RuleList({ items, icon, tone }: { items: string[]; icon: "check" | "no" | "doc"; tone?: "error" }) {
  const Icon = icon === "check" ? CheckIcon : icon === "no" ? OctagonXIcon : FileTextIcon;
  return (
    <ul className="flex max-w-3xl flex-col gap-3">
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-ink">
          <Icon
            className={
              tone === "error"
                ? "mt-1 size-[18px] shrink-0 text-error"
                : "mt-1 size-[18px] shrink-0 text-success"
            }
            aria-hidden="true"
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

// Eligibility lists mix requirements with exclusions ("… is not eligible"); exclusions get the "no" icon
// and a text label so the meaning never depends on the icon (DESIGN §10).
const EXCLUSION = /\bnot eligible\b|\bineligible\b|\bisn't eligible\b/i;

export function WhoQualifies({ program }: { program: RebateProgram }) {
  return (
    <ul className="flex max-w-3xl flex-col gap-3">
      {program.eligibility.map((item) => {
        const excluded = EXCLUSION.test(item);
        const Icon = excluded ? OctagonXIcon : CheckIcon;
        return (
          <li key={item} className="flex gap-3 text-ink">
            <Icon
              className={
                excluded ? "mt-1 size-[18px] shrink-0 text-error" : "mt-1 size-[18px] shrink-0 text-success"
              }
              aria-hidden="true"
            />
            <span>
              <span className="sr-only">{excluded ? "Not eligible: " : "Required: "}</span>
              {item}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/** The approval warning leads, then the city's own prohibitions (FR-REB-12). */
export function WhatNotToDo({ program }: { program: RebateProgram }) {
  return (
    <div className="flex flex-col gap-5">
      <p className="flex max-w-3xl gap-3 rounded-card border border-warning/30 bg-warning-bg p-4 text-ink">
        <TriangleAlertIcon className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden="true" />
        <span>
          <span className="sr-only">Warning: </span>
          Don&apos;t remove any grass until {program.city} approves your project in writing. Removing grass
          before approval can cost you the whole rebate.
        </span>
      </p>
      <RuleList items={program.prohibitions} icon="no" tone="error" />
    </div>
  );
}

export function Requirements({ program }: { program: RebateProgram }) {
  if (program.requirements.length === 0) return null;
  return <RuleList items={program.requirements} icon="check" />;
}

export function DocumentsChecklist({ program }: { program: RebateProgram }) {
  if (program.documents.length === 0) return null;
  return <RuleList items={program.documents} icon="doc" />;
}

export function OfficialSource({ program }: { program: RebateProgram }) {
  return (
    <p className="text-ink">
      <a href={program.sourceUrl} target="_blank" rel="noopener noreferrer" className="font-semibold link">
        {program.name}, City of {program.city}
        <ArrowUpRightIcon className="ml-0.5 inline size-4 align-[-2px]" aria-hidden="true" />
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    </p>
  );
}

/** The engine's notes for the worked example (approval, funding, timelines). */
export function ExampleNotes({ program }: { program: RebateProgram }) {
  if (program.type === "status_only") return null;
  const r = computeRebate(program.id, { sqft: WORKED_EXAMPLE_SQFT });
  return <NotesList notes={r.notes} />;
}
