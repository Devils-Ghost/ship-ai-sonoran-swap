import { z } from "zod";
import { getDb } from "@/db/client";
import { reopenAlerts } from "@/db/schema";
import { REOPEN_ALERT_PROGRAMS } from "@/lib/alerts";
import { fail, logServerError, newRequestId, ok, readJson } from "@/lib/api-response";
import { serverEnv } from "@/lib/env";
import { rateLimit } from "@/lib/ratelimit";

// "Notify me when it reopens" for programs between seasons. The email is stored only with consent, once per
// program (a repeat sign-up answers the same way, so the response never reveals who is on the list). A
// filled honeypot gets a normal-looking success and is never stored.
const bodySchema = z.strictObject({
  programId: z.enum(REOPEN_ALERT_PROGRAMS),
  email: z.email().max(254),
  consent: z.literal(true),
  hp: z.string().max(200).optional(),
});

export async function POST(req: Request) {
  const requestId = newRequestId();
  const limit = await rateLimit(req, "alerts", { requestId });
  if (!limit.allowed) {
    return fail("RATE_LIMITED", { requestId, headers: { "Retry-After": String(limit.retryAfterSec) } });
  }
  const parsed = await readJson(req, bodySchema);
  if ("error" in parsed) return parsed.error;
  const body = parsed.data;

  if (body.hp) return ok({ subscribed: true });

  if (!serverEnv().MOCK_DB) {
    try {
      await getDb()
        .insert(reopenAlerts)
        .values({ programId: body.programId, email: body.email.trim().toLowerCase(), consent: true })
        .onConflictDoNothing();
    } catch (err) {
      logServerError(requestId, "POST /api/alerts", err);
      return fail("INTERNAL", { requestId });
    }
  }
  return ok({ subscribed: true });
}
