import { z } from "zod";
import { getDb } from "@/db/client";
import { testSessions } from "@/db/schema";
import { fail, logServerError, newRequestId, ok, readJson } from "@/lib/api-response";
import { serverEnv } from "@/lib/env";
import { rateLimit } from "@/lib/ratelimit";

// FR-ANL-04: /?t=T01&v=a starts a user-test session. The label is a tester code, never a name.
const bodySchema = z.strictObject({
  label: z.string().regex(/^[A-Za-z0-9-]{1,16}$/),
  variant: z.enum(["a", "b"]),
});

export async function POST(req: Request) {
  const requestId = newRequestId();
  const limit = await rateLimit(req, "testSessions", { requestId });
  if (!limit.allowed) {
    return fail("RATE_LIMITED", { requestId, headers: { "Retry-After": String(limit.retryAfterSec) } });
  }
  const parsed = await readJson(req, bodySchema);
  if ("error" in parsed) return parsed.error;

  let id: string = crypto.randomUUID();
  if (!serverEnv().MOCK_DB) {
    try {
      const [row] = await getDb()
        .insert(testSessions)
        .values({ testerLabel: parsed.data.label.toUpperCase(), variant: parsed.data.variant })
        .returning({ id: testSessions.id });
      if (row) id = row.id;
    } catch (err) {
      logServerError(requestId, "POST /api/test-sessions", err);
      return fail("INTERNAL", { requestId });
    }
  }
  return ok({ id });
}
