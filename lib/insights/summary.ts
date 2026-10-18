// FR-INS-02–11. Pure shaping for /insights; queries live in ./queries.ts. Every rate carries its denominator
// so the page can refuse to show a percentage below MIN_DENOMINATOR (FR-INS-11).

export const MIN_DENOMINATOR = 10;
export const MIN_AB_SESSIONS = 20; // FR-INS-04: never call a winner below this per variant

export const RANGES = ["launch", "today", "hour"] as const;
export type Range = (typeof RANGES)[number];

export type Rate = { num: number; den: number; value: number | null };

export function rate(num: number, den: number): Rate {
  return { num, den, value: den >= MIN_DENOMINATOR ? num / den : null };
}

export const FUNNEL_STEPS = [
  { id: "sessions", label: "Visited" },
  { id: "started", label: "Started an estimate" },
  { id: "estimated", label: "Saw a rebate" },
  { id: "previewed", label: "Previewed a yard" },
  { id: "eligibility", label: "Checked eligibility" },
  { id: "booked", label: "Booked a yard walk" },
] as const;

export type FunnelStepId = (typeof FUNNEL_STEPS)[number]["id"];
export type FunnelStep = { id: FunnelStepId; label: string; count: number; step: Rate; overall: Rate };

export function funnel(counts: Record<FunnelStepId, number>): {
  steps: FunnelStep[];
  biggestDrop: FunnelStepId | null;
} {
  const first = counts.sessions;
  const steps = FUNNEL_STEPS.map((s, i) => {
    const prev = i === 0 ? first : counts[FUNNEL_STEPS[i - 1]?.id ?? "sessions"];
    return { ...s, count: counts[s.id], step: rate(counts[s.id], prev), overall: rate(counts[s.id], first) };
  });
  // The step that loses the largest share of the people who reached the one before it (readable rates only).
  let biggestDrop: FunnelStepId | null = null;
  let worst = -1;
  for (const s of steps.slice(1)) {
    if (s.step.value === null) continue;
    const loss = 1 - s.step.value;
    if (loss > worst) {
      worst = loss;
      biggestDrop = s.id;
    }
  }
  return { steps, biggestDrop };
}

export function rangeStart(range: Range, launch: string, now: Date = new Date()): string {
  if (range === "hour") return new Date(now.getTime() - 3600_000).toISOString();
  if (range === "today") {
    const az = new Date(now.getTime() - 7 * 3600_000);
    return new Date(Date.UTC(az.getUTCFullYear(), az.getUTCMonth(), az.getUTCDate(), 7)).toISOString();
  }
  return new Date(launch).toISOString();
}

export type VariantResult = {
  variant: "a" | "b";
  sessions: number;
  ctr: Rate;
  medianMsToRebate: number | null;
  fiveSecond: { pass: number; fail: number };
};

/** FR-INS-04: a winner only when both variants have enough sessions; otherwise null. */
export function abVerdict(a: VariantResult, b: VariantResult): "a" | "b" | "tie" | null {
  if (a.sessions < MIN_AB_SESSIONS || b.sessions < MIN_AB_SESSIONS) return null;
  if (a.ctr.value === null || b.ctr.value === null) return null;
  if (Math.abs(a.ctr.value - b.ctr.value) < 0.02) return "tie";
  return a.ctr.value > b.ctr.value ? "a" : "b";
}

export type Insights = {
  range: Range;
  since: string;
  funnel: { steps: FunnelStep[]; biggestDrop: FunnelStepId | null };
  cta: {
    impressions: number;
    clicks: number;
    ctr: Rate;
    byVariant: { variant: string; impressions: number; clicks: number; ctr: Rate }[];
  };
  ab: { a: VariantResult; b: VariantResult; verdict: "a" | "b" | "tie" | null };
  sources: { source: string; sessions: number; estimated: Rate; bookings: number }[];
  audience: {
    byCity: { key: string; count: number }[];
    medianSqftBucket: number | null;
    medianRebateBucket: number | null;
    tiers: { key: string; count: number }[];
    styles: { key: string; count: number }[];
  };
  health: {
    renders: number;
    renderSuccess: Rate;
    medianRenderMs: number | null;
    galleryShare: Rate;
    entryPaths: { key: string; count: number }[];
    mapFailures: number;
  };
};
