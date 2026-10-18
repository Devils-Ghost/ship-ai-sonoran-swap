import { and, count, desc, eq, gte, sum } from "drizzle-orm";
import { getDb } from "@/db/client";
import { bookings, estimates, renders, testSessions } from "@/db/schema";
import { fail, logServerError, newRequestId, ok } from "@/lib/api-response";
import { serverEnv } from "@/lib/env";
import {
  cityBuckets,
  emptyStats,
  mergeTicker,
  startOfArizonaDay,
  testingSummary,
  TICKER_SIZE,
  type Stats,
} from "@/lib/stats/summary";

// SRS §14 GET /api/stats, ARCH §4.4. Aggregates only; the CDN holds each answer for 5 s so a room full of
// phones polling /live costs one query set per 5 s.
const CACHE = "public, s-maxage=5, stale-while-revalidate=5";

function resolveSince(raw: string | null): string {
  if (raw) {
    const d = new Date(raw);
    if (!Number.isNaN(d.getTime())) return d.toISOString();
  }
  return serverEnv().LIVE_SINCE ?? startOfArizonaDay();
}

export async function GET(req: Request) {
  const requestId = newRequestId();
  const since = resolveSince(new URL(req.url).searchParams.get("since"));
  if (serverEnv().MOCK_DB) return ok(emptyStats(since), { headers: { "Cache-Control": CACHE } });

  try {
    return ok(await readStats(since), { headers: { "Cache-Control": CACHE } });
  } catch (err) {
    logServerError(requestId, "GET /api/stats", err);
    return fail("INTERNAL", { requestId });
  }
}

async function readStats(since: string): Promise<Stats> {
  const db = getDb();
  const from = new Date(since);
  const [totals, cities, renderCount, bookingCount, lastEstimates, lastBookings, sessions] =
    await Promise.all([
      db
        .select({
          n: count(),
          sqft: sum(estimates.sqft).mapWith(Number),
          rebate: sum(estimates.rebateAmount).mapWith(Number),
        })
        .from(estimates)
        .where(gte(estimates.createdAt, from)),
      db
        .select({ city: estimates.city, n: count() })
        .from(estimates)
        .where(gte(estimates.createdAt, from))
        .groupBy(estimates.city),
      db
        .select({ n: count() })
        .from(renders)
        .where(and(gte(renders.createdAt, from), eq(renders.status, "success"))),
      db.select({ n: count() }).from(bookings).where(gte(bookings.createdAt, from)),
      db
        .select({
          at: estimates.createdAt,
          city: estimates.city,
          sqft: estimates.sqft,
          rebate: estimates.rebateAmount,
        })
        .from(estimates)
        .where(gte(estimates.createdAt, from))
        .orderBy(desc(estimates.createdAt))
        .limit(TICKER_SIZE),
      db
        .select({ at: bookings.createdAt, city: bookings.city })
        .from(bookings)
        .where(gte(bookings.createdAt, from))
        .orderBy(desc(bookings.createdAt))
        .limit(TICKER_SIZE),
      // FR-PROOF-04: testing numbers cover every user-test session, not just this window.
      db
        .select({
          variant: testSessions.variant,
          createdAt: testSessions.createdAt,
          firstEstimateAt: testSessions.firstEstimateAt,
        })
        .from(testSessions),
    ]);

  const t = totals[0];
  return {
    since,
    estimates: t?.n ?? 0,
    sqft: t?.sqft ?? 0,
    rebateDollars: t?.rebate ?? 0,
    renders: renderCount[0]?.n ?? 0,
    bookings: bookingCount[0]?.n ?? 0,
    byCity: cityBuckets(cities),
    recent: mergeTicker(
      lastEstimates.map((e) => ({
        kind: "estimate" as const,
        at: e.at.toISOString(),
        city: e.city,
        sqft: e.sqft,
        rebate: e.rebate,
      })),
      lastBookings.map((b) => ({ kind: "booking" as const, at: b.at.toISOString(), city: b.city })),
    ),
    testing: testingSummary(sessions),
  };
}
