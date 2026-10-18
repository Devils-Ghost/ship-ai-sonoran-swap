import { z } from "zod";
import { getDb } from "@/db/client";
import { feedback } from "@/db/schema";
import { fail, logServerError, newRequestId, ok, readJson } from "@/lib/api-response";
import { serverEnv } from "@/lib/env";
import { rateLimit } from "@/lib/ratelimit";

// SRS §11.5 (FR-FB), §14. The email is optional and only accepted with consent (AGENTS §2.4). A filled
// honeypot gets a normal-looking success and is never stored.
const bodySchema = z
  .strictObject({
    message: z.string().trim().min(1).max(1000),
    email: z.email().max(254).optional(),
    consent: z.boolean(),
    page: z.string().max(200).regex(/^\//),
    hp: z.string().max(200).optional(),
  })
  .refine((b) => !b.email || b.consent, { message: "consent required with an email", path: ["consent"] });

export async function POST(req: Request) {
  const requestId = newRequestId();
  const limit = await rateLimit(req, "feedback", { requestId });
  if (!limit.allowed) {
    return fail("RATE_LIMITED", { requestId, headers: { "Retry-After": String(limit.retryAfterSec) } });
  }
  const parsed = await readJson(req, bodySchema);
  if ("error" in parsed) return parsed.error;
  const body = parsed.data;

  if (body.hp) return ok({ id: crypto.randomUUID() });

  let id: string = crypto.randomUUID();
  if (!serverEnv().MOCK_DB) {
    try {
      const [row] = await getDb()
        .insert(feedback)
        .values({
          message: body.message,
          email: body.email && body.consent ? body.email : null,
          consent: Boolean(body.email && body.consent),
          page: body.page.split(/[?#]/)[0] ?? null,
        })
        .returning({ id: feedback.id });
      if (row) id = row.id;
    } catch (err) {
      logServerError(requestId, "POST /api/feedback", err);
      return fail("INTERNAL", { requestId });
    }
  }
  return ok({ id });
}
