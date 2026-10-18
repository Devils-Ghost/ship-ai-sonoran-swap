"use client";

import { useEffect, useState } from "react";
import { TriangleAlertIcon } from "lucide-react";
import { cn } from "cn";
import { Skeleton } from "@/components/ui/skeleton";
import { SegmentedControl } from "@/components/ui/segmented-control";
import type { Insights, Range, Rate } from "@/lib/insights/summary";
import { formatMoney, formatNumber } from "@/lib/utils/format";

// FR-INS-01–07, 11, 12 and the §12 "Insights panels" states. Simple accessible tables with inline bars;
// the bars are decoration (aria-hidden), the table is the data. Copy: CONTENT §9.

const RANGE_OPTIONS = [
  { value: "launch", label: "Since launch" },
  { value: "today", label: "Today" },
  { value: "hour", label: "Last hour" },
] as const;

const sinceFormat = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "America/Phoenix",
});

type State = { kind: "loading" } | { kind: "ok"; data: Insights; stale: boolean } | { kind: "error" };

export function InsightsLive() {
  const [range, setRange] = useState<Range>("launch");
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    let alive = true;
    fetch(`/api/insights?range=${range}`)
      .then((r) => r.json() as Promise<{ ok: boolean; data?: Insights }>)
      .then((j) => {
        if (!alive) return;
        if (j.ok && j.data) setState({ kind: "ok", data: j.data, stale: false });
        else setState((s) => (s.kind === "ok" ? { ...s, stale: true } : { kind: "error" }));
      })
      .catch(() => alive && setState((s) => (s.kind === "ok" ? { ...s, stale: true } : { kind: "error" })));
    return () => {
      alive = false;
    };
  }, [range]);

  const data = state.kind === "ok" ? state.data : null;

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-3">
        <SegmentedControl
          label="Time period"
          value={range}
          onValueChange={(r) => {
            setState((s) => (s.kind === "ok" ? s : { kind: "loading" }));
            setRange(r);
          }}
          options={RANGE_OPTIONS}
        />
        <p className="text-sm text-ink-muted" aria-live="polite">
          {data
            ? `Live data from this site since ${sinceFormat.format(new Date(data.since))}. Team visits excluded.`
            : " "}
        </p>
        {state.kind === "ok" && state.stale && (
          <Alert>Couldn&apos;t load insights. Showing last snapshot.</Alert>
        )}
        {state.kind === "error" && (
          <Alert>Couldn&apos;t load insights right now. Try again in a minute.</Alert>
        )}
      </div>

      <Panel title="The funnel" loading={state.kind === "loading"}>
        {data && (
          <>
            {data.funnel.steps[0]?.count === 0 ? (
              <Empty />
            ) : (
              <Table
                caption="Unique sessions at each step"
                head={["Step", "Sessions", "From previous", "Overall"]}
                rows={data.funnel.steps.map((s, i) => [
                  <span key="l" className="flex items-center gap-2">
                    {s.label}
                    {data.funnel.biggestDrop === s.id && (
                      <span className="rounded-full bg-warning-bg px-2 py-0.5 text-xs font-semibold text-warning">
                        Biggest drop-off
                      </span>
                    )}
                  </span>,
                  <Bar key="n" value={s.count} max={data.funnel.steps[0]?.count ?? 1} />,
                  i === 0 ? "–" : <Pct key="p" rate={s.step} />,
                  i === 0 ? "–" : <Pct key="o" rate={s.overall} />,
                ])}
              />
            )}
          </>
        )}
      </Panel>

      <div className="grid gap-10 lg:grid-cols-2">
        <Panel title="Click-through" loading={state.kind === "loading"}>
          {data &&
            (data.cta.impressions === 0 ? (
              <Empty />
            ) : (
              <Table
                caption="Hero 'See my rebate' button: seen vs clicked"
                head={["Headline", "Seen", "Clicked", "Click-through"]}
                rows={[
                  ...data.cta.byVariant.map((v) => [
                    `Variant ${v.variant.toUpperCase()}`,
                    formatNumber(v.impressions),
                    formatNumber(v.clicks),
                    <Pct key="c" rate={v.ctr} />,
                  ]),
                  [
                    "All",
                    formatNumber(data.cta.impressions),
                    formatNumber(data.cta.clicks),
                    <Pct key="t" rate={data.cta.ctr} />,
                  ],
                ]}
              />
            ))}
        </Panel>

        <Panel title="Headline test" loading={state.kind === "loading"}>
          {data && (
            <div className="flex flex-col gap-4">
              <Table
                caption="Headline A vs B"
                head={["", "A", "B"]}
                rows={[
                  ["Sessions", formatNumber(data.ab.a.sessions), formatNumber(data.ab.b.sessions)],
                  [
                    "Click-through",
                    <Pct key="a" rate={data.ab.a.ctr} />,
                    <Pct key="b" rate={data.ab.b.ctr} />,
                  ],
                  [
                    "Median time to a rebate",
                    seconds(data.ab.a.medianMsToRebate),
                    seconds(data.ab.b.medianMsToRebate),
                  ],
                  [
                    "Five-second test (pass / fail)",
                    `${data.ab.a.fiveSecond.pass} / ${data.ab.a.fiveSecond.fail}`,
                    `${data.ab.b.fiveSecond.pass} / ${data.ab.b.fiveSecond.fail}`,
                  ],
                ]}
              />
              <p className="font-semibold text-ink">
                {data.ab.verdict === null
                  ? "Too little data to call a winner yet."
                  : data.ab.verdict === "tie"
                    ? "No clear difference between the headlines."
                    : `Headline ${data.ab.verdict.toUpperCase()} leads on click-through.`}
              </p>
            </div>
          )}
        </Panel>

        <Panel title="Where visitors come from" loading={state.kind === "loading"}>
          {data &&
            (data.sources.length === 0 ? (
              <Empty />
            ) : (
              <Table
                caption="Sessions, rebate views and bookings by source"
                head={["Source", "Sessions", "Saw a rebate", "Bookings"]}
                rows={data.sources.map((s) => [
                  sourceLabel(s.source),
                  formatNumber(s.sessions),
                  <Pct key="e" rate={s.estimated} />,
                  formatNumber(s.bookings),
                ])}
              />
            ))}
        </Panel>

        <Panel title="Who's measuring" loading={state.kind === "loading"}>
          {data &&
            (data.audience.byCity.length === 0 ? (
              <Empty />
            ) : (
              <div className="flex flex-col gap-5">
                <Counts caption="Estimates by city" items={data.audience.byCity} label={cityLabel} />
                <dl className="grid grid-cols-2 gap-4">
                  <Fact
                    label="Typical lawn"
                    value={
                      data.audience.medianSqftBucket === null
                        ? "–"
                        : `${formatNumber(data.audience.medianSqftBucket)}+ sq ft`
                    }
                  />
                  <Fact
                    label="Typical estimated rebate"
                    value={
                      data.audience.medianRebateBucket === null
                        ? "–"
                        : `${formatMoney(data.audience.medianRebateBucket)}+`
                    }
                  />
                </dl>
                <Counts caption="Project style picked" items={data.audience.tiers} label={capitalize} />
                {data.audience.styles.length > 0 && (
                  <Counts caption="Yard previews by style" items={data.audience.styles} label={styleLabel} />
                )}
                <p className="text-[0.8125rem] text-ink-muted">
                  Sizes and rebates are bucketed (250 sq ft, $500); no individual rows.
                </p>
              </div>
            ))}
        </Panel>

        <Panel title="Feature health" loading={state.kind === "loading"}>
          {data && (
            <div className="flex flex-col gap-5">
              <dl className="grid grid-cols-2 gap-4">
                <Fact label="Live previews that worked" value={<Pct rate={data.health.renderSuccess} />} />
                <Fact label="Median preview time" value={seconds(data.health.medianRenderMs)} />
                <Fact
                  label="Example shown (daily limit reached)"
                  value={<Pct rate={data.health.galleryShare} />}
                />
                <Fact label="Map failures" value={formatNumber(data.health.mapFailures)} />
              </dl>
              {data.health.entryPaths.length > 0 ? (
                <Counts
                  caption="How people start an estimate"
                  items={data.health.entryPaths}
                  label={pathLabel}
                />
              ) : (
                <Empty />
              )}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}

function Panel({ title, loading, children }: { title: string; loading: boolean; children: React.ReactNode }) {
  const id = `panel-${title.toLowerCase().replace(/\W+/g, "-")}`;
  return (
    <section aria-labelledby={id} aria-busy={loading} className="flex flex-col gap-4">
      <h2 id={id} className="text-2xl">
        {title}
      </h2>
      {loading ? <Skeleton className="h-40 w-full" /> : children}
    </section>
  );
}

function Alert({ children }: { children: React.ReactNode }) {
  return (
    <p
      role="status"
      className="flex items-center gap-2 rounded-card border border-warning/30 bg-warning-bg p-3 text-ink"
    >
      <TriangleAlertIcon className="size-5 shrink-0 text-warning" aria-hidden="true" />
      {children}
    </p>
  );
}

function Empty() {
  return (
    <p className="rounded-card border border-dashed border-line p-5 text-ink-muted">
      No data yet for this period.
    </p>
  );
}

/** FR-INS-11: below 10 in the denominator, say so instead of showing a percentage. */
function Pct({ rate }: { rate: Rate }) {
  if (rate.value === null)
    return <span className="text-[0.8125rem] text-ink-muted">n = {rate.den}, too few to read</span>;
  return <span className="tabular">{Math.round(rate.value * 100)}%</span>;
}

function Bar({ value, max }: { value: number; max: number }) {
  return (
    <span className="flex items-center gap-2">
      <span className="w-10 text-right tabular">{formatNumber(value)}</span>
      <span className="hidden h-2 flex-1 overflow-hidden rounded-full bg-sand sm:block" aria-hidden="true">
        <span
          className="block h-full rounded-full bg-saguaro"
          style={{ width: `${max ? (value / max) * 100 : 0}%` }}
        />
      </span>
    </span>
  );
}

function Table({ caption, head, rows }: { caption: string; head: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-[0.9375rem]">
        <caption className="pb-2 text-left text-sm text-ink-muted">{caption}</caption>
        <thead className="text-[0.8125rem] text-ink-muted">
          <tr className="border-b border-line">
            {head.map((h, i) => (
              <th key={i} scope="col" className={cn("py-2 font-medium", i > 0 && "px-2")}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-line/70">
              {r.map((c, j) =>
                j === 0 ? (
                  <th key={j} scope="row" className="py-2.5 pr-2 font-medium text-ink">
                    {c}
                  </th>
                ) : (
                  <td key={j} className="px-2 py-2.5 text-ink">
                    {c}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Counts({
  caption,
  items,
  label,
}: {
  caption: string;
  items: { key: string; count: number }[];
  label: (k: string) => string;
}) {
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <Table
      caption={caption}
      head={["", "Count"]}
      rows={items.map((i) => [label(i.key), <Bar key="b" value={i.count} max={max} />])}
    />
  );
}

function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col-reverse gap-0.5 rounded-card border border-line bg-paper p-3">
      <dt className="text-[0.8125rem] text-ink-muted">{label}</dt>
      <dd className="font-display text-xl font-semibold text-saguaro">{value}</dd>
    </div>
  );
}

const seconds = (ms: number | null) => (ms === null ? "–" : `${Math.round(ms / 1000)} s`);
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const cityLabel = (c: string) => (c === "other" ? "Another utility" : capitalize(c));
const styleLabel = (s: string) => s.split("-").map(capitalize).join(" ");
const pathLabel = (p: string) =>
  ({ map: "Map outline", manual: "Typed square footage", sample: "Sample yard" })[p] ?? capitalize(p);
const SOURCE_LABEL: Record<string, string> = {
  "qr-pitch": "QR (pitch)",
  "qr-table": "QR (table card)",
  linkedin: "LinkedIn",
  x: "X",
  discord: "Discord",
  test: "User tests",
  submission: "Hackathon submission",
  direct: "Direct",
  other: "Other",
};
const sourceLabel = (s: string) => SOURCE_LABEL[s] ?? (s.startsWith("referral:") ? s.slice(9) : s);
