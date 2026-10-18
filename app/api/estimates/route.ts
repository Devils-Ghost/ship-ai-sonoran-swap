import { z } from "zod";
import { getDb } from "@/db/client";
import { and, eq, isNull } from "drizzle-orm";
import { estimates, testSessions } from "@/db/schema";
import { fail, logServerError, newRequestId, ok, readJson } from "@/lib/api-response";
import { serverEnv } from "@/lib/env";
import { CITY_IDS, computeEstimate } from "@/lib/estimate/estimate";
import { MAX_MANUAL_SQFT } from "@/lib/estimate/area";
import { TIERS } from "@/lib/estimate/pricing";
import { rateLimit } from "@/lib/ratelimit";

// SRS §14 / FR-EST-12. Strict schema: an address, coordinates or polygon in the body is rejected,
// and any amounts the client sends are ignored because the server recomputes with the same engine.
const tierIds = TIERS.map((t) => t.id) as [string, ...string[]];

const bodySchema = z.strictObject({
  city: z.enum(CITY_IDS),
  sqft: z.number().int().min(0).max(MAX_MANUAL_SQFT),
  source: z.enum(["map", "manual", "sample"]),
  shapeCount: z.number().int().min(0).max(50).default(0),
  tier: z.enum(tierIds),
  trees: z.number().int().min(0).max(10).optional(),
  removesAllGrass: z.boolean().optional(),
  testSessionId: z.uuid().optional(),
});

export async function POST(req: Request) {
  const requestId = newRequestId();
  const limit = await rateLimit(req, "estimates", { requestId });
  if (!limit.allowed) {
    return fail("RATE_LIMITED", { requestId, headers: { "Retry-After": String(limit.retryAfterSec) } });
  }

  const parsed = await readJson(req, bodySchema);
  if ("error" in parsed) return parsed.error;
  const body = parsed.data;

  const estimate = computeEstimate({
    city: body.city,
    sqft: body.sqft,
    tier: body.tier as (typeof TIERS)[number]["id"],
    trees: body.trees,
    removesAllGrass: body.removesAllGrass,
  });
  const { rebate } = estimate;

  let id: string = crypto.randomUUID();
  if (!serverEnv().MOCK_DB) {
    try {
      // A stale or unknown test-session ID must never cost the visitor their stored estimate.
      const testSessionId = body.testSessionId
        ? ((
            await getDb()
              .select({ id: testSessions.id })
              .from(testSessions)
              .where(eq(testSessions.id, body.testSessionId))
              .limit(1)
          )[0]?.id ?? null)
        : null;
      const [row] = await getDb()
        .insert(estimates)
        .values({
          city: body.city,
          programId: rebate?.programId ?? null,
          programStatus: rebate?.status ?? null,
          sqft: estimate.sqft,
          source: body.source,
          shapeCount: body.shapeCount,
          tier: body.tier,
          trees: body.trees ?? 0,
          rebateAmount: rebate?.amount ?? null,
          rebateBlocked: rebate !== null && !rebate.eligibleByArea && rebate.amount === 0,
          projectLow: estimate.project.low,
          projectHigh: estimate.project.high,
          netLow: estimate.net.low,
          netHigh: estimate.net.high,
          waterGalYear: estimate.waterGalYear,
          testSessionId,
        })
        .returning({ id: estimates.id });
      if (row) id = row.id;
      // FR-ANL-04: the first estimate in a user-test session stamps its time-to-first-rebate.
      if (testSessionId) {
        await getDb()
          .update(testSessions)
          .set({ firstEstimateAt: new Date() })
          .where(and(eq(testSessions.id, testSessionId), isNull(testSessions.firstEstimateAt)));
      }
    } catch (err) {
      logServerError(requestId, "POST /api/estimates", err);
      return fail("INTERNAL", { requestId });
    }
  }

  return ok({
    id,
    rebate,
    project: estimate.project,
    net: estimate.net,
    waterGalYear: estimate.waterGalYear,
  });
}
