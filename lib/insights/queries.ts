import { sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import {
  abVerdict,
  funnel,
  rate,
  type FunnelStepId,
  type Insights,
  type Range,
  type VariantResult,
} from "./summary";

// FR-INS-02–07 aggregates over the events table (team sessions excluded, FR-INS-13). Only counts and
// medians leave the database; no row-level data. Kept here, not in the route handler (AGENTS §4).

type Row = Record<string, unknown>;
const n = (v: unknown) => (v === null || v === undefined ? 0 : Number(v));
const nOrNull = (v: unknown) => (v === null || v === undefined ? null : Number(v));

async function rows(query: ReturnType<typeof sql>): Promise<Row[]> {
  const res = (await getDb().execute(query)) as unknown as { rows: Row[] };
  return res.rows;
}

// Example shown instead of a refusal or a rate-limit message: the visitor still saw a desert yard.
const PREVIEWED = sql`(name = 'render_success'
  or (name = 'visualizer_upload' and props->>'source' = 'sample')
  or (name = 'render_failed' and coalesce(props->>'code', '') not in ('PROVIDER_REFUSED', 'INVALID_IMAGE', 'RATE_LIMITED')))`;

export async function readInsights(range: Range, since: string): Promise<Insights> {
  const from = sql`created_at >= ${since}::timestamptz and team = false`;

  const [
    funnelRows,
    ctaRows,
    abRows,
    fiveRows,
    sourceRows,
    cityRows,
    medianRows,
    tierRows,
    styleRows,
    healthRows,
    pathRows,
  ] = await Promise.all([
    rows(sql`
        select
          count(distinct session_id) filter (where name = 'page_view') as sessions,
          count(distinct session_id) filter (where name = 'estimator_start') as started,
          count(distinct session_id) filter (where name = 'estimate_shown') as estimated,
          count(distinct session_id) filter (where ${PREVIEWED}) as previewed,
          count(distinct session_id) filter (where name = 'eligibility_result') as eligibility,
          count(distinct session_id) filter (where name = 'booking_confirmed') as booked
        from events where ${from}`),
    rows(sql`
        select coalesce(variant, 'a') as variant,
          count(*) filter (where name = 'cta_impression') as impressions,
          count(*) filter (where name = 'hero_cta_click') as clicks
        from events where ${from} and name in ('cta_impression', 'hero_cta_click')
        group by 1 order by 1`),
    rows(sql`
        with s as (
          select session_id, max(coalesce(variant, 'a')) as variant,
            min(created_at) filter (where name = 'page_view') as started,
            min(created_at) filter (where name = 'estimate_shown') as shown
          from events where ${from} and session_id is not null group by session_id
        )
        select variant, count(*) filter (where started is not null) as sessions,
          percentile_cont(0.5) within group (order by extract(epoch from shown - started) * 1000)
            filter (where shown is not null and shown >= started) as median_ms
        from s group by variant`),
    rows(sql`
        select variant,
          count(*) filter (where notes ilike '%5s:pass%') as pass,
          count(*) filter (where notes ilike '%5s:fail%') as fail
        from test_sessions where created_at >= ${since}::timestamptz group by variant`),
    rows(sql`
        select source,
          count(distinct session_id) filter (where name = 'page_view') as sessions,
          count(distinct session_id) filter (where name = 'estimate_shown') as estimated,
          count(distinct session_id) filter (where name = 'booking_confirmed') as bookings
        from events where ${from} group by source order by 2 desc limit 12`),
    rows(sql`
        select props->>'city' as key, count(*) as count from events
        where ${from} and name = 'estimate_shown' group by 1 order by 2 desc`),
    rows(sql`
        select
          percentile_disc(0.5) within group (order by (props->>'sqftBucket')::int) as sqft,
          percentile_disc(0.5) within group (order by (props->>'rebateBucket')::int) as rebate
        from events where ${from} and name = 'estimate_shown'`),
    rows(sql`
        select props->>'tier' as key, count(*) as count from events
        where ${from} and name = 'estimate_shown' group by 1 order by 2 desc`),
    rows(sql`
        select props->>'style' as key, count(*) as count from events
        where ${from} and name in ('render_success', 'render_failed') group by 1 order by 2 desc`),
    rows(sql`
        select
          count(*) filter (where name = 'render_success') as ok,
          count(*) filter (where name = 'render_failed') as failed,
          count(*) filter (where name = 'render_failed' and props->>'code' in ('GALLERY', 'DAILY_CAP')) as gallery,
          percentile_cont(0.5) within group (order by (props->>'ms')::numeric)
            filter (where name = 'render_success') as median_ms,
          count(*) filter (where name = 'map_failed') as map_failures
        from events where ${from} and name in ('render_success', 'render_failed', 'map_failed')`),
    rows(sql`
        select props->>'path' as key, count(*) as count from events
        where ${from} and name = 'estimator_start' group by 1 order by 2 desc`),
  ]);

  const f = funnelRows[0] ?? {};
  const counts = Object.fromEntries(
    (["sessions", "started", "estimated", "previewed", "eligibility", "booked"] as FunnelStepId[]).map(
      (k) => [k, n(f[k])],
    ),
  ) as Record<FunnelStepId, number>;

  const byVariant = ctaRows.map((r) => ({
    variant: String(r.variant),
    impressions: n(r.impressions),
    clicks: n(r.clicks),
    ctr: rate(n(r.clicks), n(r.impressions)),
  }));
  const impressions = byVariant.reduce((s, v) => s + v.impressions, 0);
  const clicks = byVariant.reduce((s, v) => s + v.clicks, 0);

  const variant = (v: "a" | "b"): VariantResult => {
    const ab = abRows.find((r) => r.variant === v);
    const cta = byVariant.find((r) => r.variant === v);
    const five = fiveRows.find((r) => r.variant === v);
    return {
      variant: v,
      sessions: n(ab?.sessions),
      ctr: cta?.ctr ?? rate(0, 0),
      medianMsToRebate: nOrNull(ab?.median_ms) === null ? null : Math.round(n(ab?.median_ms)),
      fiveSecond: { pass: n(five?.pass), fail: n(five?.fail) },
    };
  };
  const a = variant("a");
  const b = variant("b");

  const kv = (list: Row[]) => list.map((r) => ({ key: String(r.key ?? "unknown"), count: n(r.count) }));
  const h = healthRows[0] ?? {};
  const renders = n(h.ok) + n(h.failed);
  const m = medianRows[0] ?? {};

  return {
    range,
    since,
    funnel: funnel(counts),
    cta: { impressions, clicks, ctr: rate(clicks, impressions), byVariant },
    ab: { a, b, verdict: abVerdict(a, b) },
    sources: sourceRows.map((r) => ({
      source: String(r.source),
      sessions: n(r.sessions),
      estimated: rate(n(r.estimated), n(r.sessions)),
      bookings: n(r.bookings),
    })),
    audience: {
      byCity: kv(cityRows),
      medianSqftBucket: nOrNull(m.sqft),
      medianRebateBucket: nOrNull(m.rebate),
      tiers: kv(tierRows),
      styles: kv(styleRows),
    },
    health: {
      renders,
      renderSuccess: rate(n(h.ok), renders),
      medianRenderMs: nOrNull(h.median_ms) === null ? null : Math.round(n(h.median_ms)),
      galleryShare: rate(n(h.gallery), renders),
      entryPaths: kv(pathRows),
      mapFailures: n(h.map_failures),
    },
  };
}

/** MOCK_DB=1: an empty, well-formed answer so the page's empty states render. */
export function emptyInsights(range: Range, since: string): Insights {
  const zero = { sessions: 0, started: 0, estimated: 0, previewed: 0, eligibility: 0, booked: 0 };
  const v = (variant: "a" | "b"): VariantResult => ({
    variant,
    sessions: 0,
    ctr: rate(0, 0),
    medianMsToRebate: null,
    fiveSecond: { pass: 0, fail: 0 },
  });
  return {
    range,
    since,
    funnel: funnel(zero),
    cta: { impressions: 0, clicks: 0, ctr: rate(0, 0), byVariant: [] },
    ab: { a: v("a"), b: v("b"), verdict: null },
    sources: [],
    audience: { byCity: [], medianSqftBucket: null, medianRebateBucket: null, tiers: [], styles: [] },
    health: {
      renders: 0,
      renderSuccess: rate(0, 0),
      medianRenderMs: null,
      galleryShare: rate(0, 0),
      entryPaths: [],
      mapFailures: 0,
    },
  };
}
