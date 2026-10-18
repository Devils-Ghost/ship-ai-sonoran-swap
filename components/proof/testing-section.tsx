"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Testing } from "@/lib/stats/summary";

// FR-PROOF-02/04: testing numbers come from test_sessions through /api/stats, never typed by hand.
// FR-INS-04 rule: no A/B winner below 20 testers per variant.
const MIN_PER_VARIANT = 20;

const seconds = (ms: number | null) => (ms === null ? "–" : `${Math.round(ms / 1000)} s`);

export function TestingSection() {
  const [state, setState] = useState<{ kind: "loading" } | { kind: "error" } | { kind: "ok"; t: Testing }>({
    kind: "loading",
  });

  useEffect(() => {
    let alive = true;
    fetch("/api/stats")
      .then((r) => r.json() as Promise<{ ok: boolean; data?: { testing: Testing } }>)
      .then((j) => alive && setState(j.ok && j.data ? { kind: "ok", t: j.data.testing } : { kind: "error" }))
      .catch(() => alive && setState({ kind: "error" }));
    return () => {
      alive = false;
    };
  }, []);

  if (state.kind === "loading")
    return (
      <div className="flex flex-col gap-3" aria-busy="true">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  if (state.kind === "error")
    return <p role="status">Couldn&apos;t load live numbers right now. Try again in a moment.</p>;

  const { t } = state;
  if (t.testers === 0)
    return (
      <p className="text-ink-muted">No user-test sessions yet. Results appear here as testers finish.</p>
    );

  const { a, b } = t.variantResults;
  const enough = a.testers >= MIN_PER_VARIANT && b.testers >= MIN_PER_VARIANT;
  return (
    <div className="flex flex-col gap-5">
      <dl className="grid grid-cols-2 gap-4">
        <Stat label="Testers" value={String(t.testers)} />
        <Stat label="Median time to a rebate" value={seconds(t.medianMsToEstimate)} />
        <Stat
          label="Reached a rebate"
          value={t.completionRate === null ? "–" : `${Math.round(t.completionRate * 100)}%`}
        />
      </dl>
      <section className="flex flex-col gap-2">
        <h3 className="font-sans text-base font-semibold text-ink">Headline test</h3>
        <p className="text-ink-muted">
          A: {a.testers} testers, median {seconds(a.medianMsToEstimate)}. B: {b.testers} testers, median{" "}
          {seconds(b.medianMsToEstimate)}.
        </p>
        <p className="text-ink">
          {enough
            ? "Both variants have enough testers to compare; see /insights for the full breakdown."
            : "Too little data to call a winner."}
        </p>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col-reverse gap-0.5 rounded-card border border-line bg-paper p-3">
      <dt className="text-[0.8125rem] text-ink-muted">{label}</dt>
      <dd className="font-display text-2xl font-semibold text-saguaro tabular">{value}</dd>
    </div>
  );
}
