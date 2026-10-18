import { z } from "zod";
import { getDb } from "@/db/client";
import { eligibilityChecks } from "@/db/schema";
import { fail, logServerError, newRequestId, ok, readJson } from "@/lib/api-response";
import { PROGRAM_IDS } from "@/lib/content/schema";
import { REASON_CODE, RESULT_IDS } from "@/lib/eligibility/evaluate";
import { serverEnv } from "@/lib/env";
import { rateLimit } from "@/lib/ratelimit";

// FR-ELIG-06: only { programId, result, reasonCodes } are stored; never the answers themselves.
const bodySchema = z.strictObject({
  programId: z.enum(PROGRAM_IDS),
  result: z.enum(RESULT_IDS),
  reasonCodes: z.array(z.string().regex(REASON_CODE)).max(12),
});

export async function POST(req: Request) {
  const requestId = newRequestId();
  const limit = await rateLimit(req, "eligibility", { requestId });
  if (!limit.allowed) {
    return fail("RATE_LIMITED", { requestId, headers: { "Retry-After": String(limit.retryAfterSec) } });
  }

  const parsed = await readJson(req, bodySchema);
  if ("error" in parsed) return parsed.error;
  const body = parsed.data;

  let id: string = crypto.randomUUID();
  if (!serverEnv().MOCK_DB) {
    try {
      const [row] = await getDb()
        .insert(eligibilityChecks)
        .values({ programId: body.programId, result: body.result, reasonCodes: body.reasonCodes })
        .returning({ id: eligibilityChecks.id });
      if (row) id = row.id;
    } catch (err) {
      logServerError(requestId, "POST /api/eligibility", err);
      return fail("INTERNAL", { requestId });
    }
  }
  return ok({ id });
}
