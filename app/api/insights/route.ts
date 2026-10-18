import { fail, logServerError, newRequestId, ok } from "@/lib/api-response";
import { serverEnv } from "@/lib/env";
import { emptyInsights, readInsights } from "@/lib/insights/queries";
import { rangeStart, RANGES, type Range } from "@/lib/insights/summary";

// SRS §14 GET /api/insights, FR-INS-12: cached 30 s at the CDN; anonymized aggregates only.
const CACHE = "public, s-maxage=30, stale-while-revalidate=30";

export async function GET(req: Request) {
  const requestId = newRequestId();
  const raw = new URL(req.url).searchParams.get("range");
  const range: Range = (RANGES as readonly string[]).includes(raw ?? "") ? (raw as Range) : "launch";
  const env = serverEnv();
  const since = rangeStart(range, env.INSIGHTS_SINCE);

  if (env.MOCK_DB) return ok(emptyInsights(range, since), { headers: { "Cache-Control": CACHE } });
  try {
    return ok(await readInsights(range, since), { headers: { "Cache-Control": CACHE } });
  } catch (err) {
    logServerError(requestId, "GET /api/insights", err);
    return fail("INTERNAL", { requestId });
  }
}
