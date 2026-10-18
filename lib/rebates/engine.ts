import data from "@/content/rebate-programs.json";
import type { ProgramId, RebatePrograms, RebateProgram } from "@/lib/content/schema";
import { formatMoney, formatNumber, formatRate } from "@/lib/utils/format";
import type { RebateInput, RebateNote, RebateResult } from "./types";

// SRS §7 rebate engine. Pure: the same code runs in the browser (instant UI) and on the server
// (/api/estimates recompute). Every amount, minimum, cap and rule comes from rebate-programs.json
// (AGENTS §2.2). The JSON is validated by lib/content/schema.ts during `pnpm build`, so this module
// reads it directly instead of shipping Zod to the browser.
const PROGRAMS = (data as unknown as RebatePrograms).programs;

/** SRS §7.4 MESA_NEAR_TIER: hint when the lawn is within this many sq ft of the next tier. */
const NEAR_TIER_WINDOW_SQFT = 100;

export function getProgram(programId: ProgramId): RebateProgram {
  const program = PROGRAMS.find((p) => p.id === programId);
  if (!program) throw new Error(`Unknown rebate program "${programId}"`);
  return program;
}

export function computeRebate(programId: ProgramId, input: RebateInput): RebateResult {
  return computeRebateFor(getProgram(programId), input);
}

/** Exposed for tests that need to vary program data; app code calls computeRebate(). */
export function computeRebateFor(program: RebateProgram, input: RebateInput): RebateResult {
  // §7.4: area is rounded to a whole sq ft before anything else; negatives are treated as 0.
  const sqft = Math.max(0, Math.round(input.sqft));
  switch (program.type) {
    case "per_sqft":
      return perSqft(program, sqft, input.removesAllGrass ?? false);
    case "tiered":
      return tiered(program, sqft, input.trees ?? 0);
    case "status_only":
      return statusOnly(program);
  }
}

type PerSqftProgram = Extract<RebateProgram, { type: "per_sqft" }>;
type TieredProgram = Extract<RebateProgram, { type: "tiered" }>;
type StatusOnlyProgram = Extract<RebateProgram, { type: "status_only" }>;

function base(program: RebateProgram): Pick<RebateResult, "programId" | "status" | "sourceUrl"> {
  return {
    programId: program.id,
    status: program.status,
    sourceUrl: program.sourceUrl,
  };
}

// FR-REB-12: the approval warning accompanies every result. FR-REB-13: unknown funding is called out.
function commonNotes(program: RebateProgram): RebateNote[] {
  const notes: RebateNote[] = [
    {
      kind: "warning",
      code: "APPROVAL_FIRST",
      text: `Don't remove any grass until ${program.city} approves your project in writing. Grass removed early can cost you the whole rebate.`,
    },
  ];
  if (program.status === "unknown") {
    notes.push({
      kind: "info",
      code: "FUNDING_UNKNOWN",
      text: "Funding is first-come, first-served. Confirm availability with the city before you start.",
    });
  }
  return notes;
}

function timelineNote(program: RebateProgram, code: string): RebateNote | null {
  const { reviewTime, completeWithin } = program.approval;
  const parts = [
    reviewTime && `Approval review: ${reviewTime}.`,
    completeWithin && `Finish within ${completeWithin}.`,
  ].filter(Boolean);
  return parts.length ? { kind: "info", code, text: parts.join(" ") } : null;
}

function minimumBlocker(program: RebateProgram, code: string, minimum: number): RebateNote {
  return {
    kind: "blocker",
    code,
    text: `${program.city} requires at least ${formatNumber(minimum)} sq ft of grass.`,
  };
}

function perSqft(program: PerSqftProgram, sqft: number, removesAllGrass: boolean): RebateResult {
  const prefix = program.id === "chandler" ? "CHD" : "PHX";
  const increment = program.roundingIncrementSqft ?? 1;
  const waived = removesAllGrass && program.minimumWaiver !== undefined;
  const notes: RebateNote[] = [];

  if (sqft < program.minimumSqft && !waived) {
    notes.push(minimumBlocker(program, `${prefix}_MIN`, program.minimumSqft));
    // FR-REB-11: tell the visitor what would change the outcome.
    if (program.minimumWaiver)
      notes.push({ kind: "info", code: `${prefix}_MIN_WAIVER`, text: program.minimumWaiver });
    return {
      ...base(program),
      eligibleByArea: false,
      amount: 0,
      basis: `Below the ${formatNumber(program.minimumSqft)} sq ft minimum`,
      notes: [...notes, ...commonNotes(program)],
      capApplied: false,
      minimumSqft: program.minimumSqft,
    };
  }

  // FR-REB-07: Chandler pays in 10 sq ft increments, rounded up.
  const billable = Math.ceil(sqft / increment) * increment;
  const raw = Math.round(program.ratePerSqft * billable);
  const cap = program.maximumAmount;
  const capApplied = cap !== null && raw > cap;
  const amount = capApplied ? cap : raw;

  let basis = `${formatRate(program.ratePerSqft)} × ${formatNumber(billable)} sq ft`;
  if (billable !== sqft) basis += ` (${formatNumber(sqft)} rounded up to ${increment} sq ft increments)`;
  if (capApplied) basis += `, capped at ${formatMoney(cap)}`;

  // Approval warning leads every successful result (FR-REB-12); program-specific info follows.
  notes.push(...commonNotes(program));
  if (waived && sqft < program.minimumSqft) {
    notes.push({ kind: "info", code: `${prefix}_MIN_WAIVED`, text: program.minimumWaiver ?? "" });
  }
  if (capApplied && cap !== null) {
    notes.push({
      kind: "info",
      code: `${prefix}_CAP`,
      text: `${program.city} caps the rebate at ${formatMoney(cap)} (reached at ${formatNumber(capReachedAtSqft(program.ratePerSqft, cap, increment))} sq ft or more).`,
    });
  }
  if (program.caseByCaseAboveSqft !== undefined && sqft > program.caseByCaseAboveSqft) {
    notes.push({
      kind: "info",
      code: `${prefix}_LARGE`,
      text: `Projects over ${formatNumber(program.caseByCaseAboveSqft)} sq ft are reviewed case by case, funds permitting.`,
    });
  }
  if (program.healthyGrassMinPercent) {
    notes.push({
      kind: "info",
      code: `${prefix}_HEALTHY_${program.healthyGrassMinPercent}`,
      text: `The grass must be alive and at least ${program.healthyGrassMinPercent}% healthy.`,
    });
  }
  const timeline = timelineNote(program, prefix === "CHD" ? "CHD_90_DAYS" : "PHX_TIMELINE");
  if (timeline) notes.push(timeline);

  return {
    ...base(program),
    eligibleByArea: true,
    amount,
    basis,
    notes,
    capApplied,
    minimumSqft: program.minimumSqft,
  };
}

/** Smallest measured area whose rounded-up billable area pays the full cap (Chandler: 1,331 sq ft). */
export function capReachedAtSqft(rate: number, cap: number, increment: number): number {
  const billable = Math.ceil(cap / rate / increment) * increment;
  return billable - increment + 1;
}

function tiered(program: TieredProgram, sqft: number, trees: number): RebateResult {
  const notes: RebateNote[] = [];
  if (sqft < program.minimumSqft) {
    notes.push(minimumBlocker(program, "MESA_MIN", program.minimumSqft));
    return {
      ...base(program),
      eligibleByArea: false,
      amount: 0,
      basis: `Below the ${formatNumber(program.minimumSqft)} sq ft minimum`,
      notes: [...notes, ...commonNotes(program)],
      capApplied: false,
      minimumSqft: program.minimumSqft,
    };
  }

  // Tiers are validated contiguous and ascending, so exactly one matches.
  const index = program.tiers.findIndex(
    (t) => sqft >= t.minSqft && (t.maxSqft === null || sqft <= t.maxSqft),
  );
  const tier = program.tiers[index];
  if (!tier) throw new Error(`No tier for ${sqft} sq ft in ${program.id}`);
  const next = program.tiers[index + 1];

  const treeCount = Math.min(Math.max(0, Math.floor(trees)), program.treeBonus.maxTrees);
  const bonus = treeCount * program.treeBonus.perTree;
  const raw = tier.amount + bonus;
  const capApplied = raw > program.maximumAmount;
  const amount = Math.min(raw, program.maximumAmount);

  const range =
    tier.maxSqft === null
      ? `${formatNumber(tier.minSqft)}+ sq ft`
      : `${formatNumber(tier.minSqft)}–${formatNumber(tier.maxSqft)} sq ft`;
  let basis = `${range} tier: ${formatMoney(tier.amount)}`;
  if (treeCount > 0)
    basis += ` + ${treeCount} ${treeCount === 1 ? "tree" : "trees"} × ${formatMoney(program.treeBonus.perTree)}`;

  notes.push(...commonNotes(program));
  if (next && next.minSqft - sqft <= NEAR_TIER_WINDOW_SQFT) {
    notes.push({
      kind: "info",
      code: "MESA_NEAR_TIER",
      text: `You're within ${NEAR_TIER_WINDOW_SQFT} sq ft of the next tier (${formatNumber(next.minSqft)} sq ft pays ${formatMoney(next.amount)}).`,
    });
  }
  // Quoted from the program's own rule lists so the wording can't drift from the data.
  const noTurf = findRule(program.prohibitions, /artificial turf/i);
  if (noTurf) notes.push({ kind: "info", code: "MESA_NO_TURF", text: noTurf });
  const onceEvery = findRule(program.eligibility, /one incentive per property/i);
  if (onceEvery) notes.push({ kind: "info", code: "MESA_ONCE_3Y", text: onceEvery });
  const timeline = timelineNote(program, "MESA_TIMELINE");
  if (timeline) notes.push(timeline);

  return {
    ...base(program),
    eligibleByArea: true,
    amount,
    basis,
    notes,
    capApplied,
    minimumSqft: program.minimumSqft,
  };
}

function findRule(rules: string[], pattern: RegExp): string | undefined {
  return rules.find((r) => pattern.test(r));
}

function statusOnly(program: StatusOnlyProgram): RebateResult {
  // FR-REB-14: a closed program shows its status and official link, never an amount.
  return {
    ...base(program),
    eligibleByArea: false,
    amount: null,
    basis: program.status === "closed" ? "Program closed" : "No amount published",
    notes: [{ kind: "info", code: "SCT_CLOSED", text: program.statusNote }, ...commonNotes(program)],
    capApplied: false,
    minimumSqft: null,
  };
}
