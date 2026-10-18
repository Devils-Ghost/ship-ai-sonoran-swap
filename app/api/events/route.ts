import { z } from "zod";
import { getDb } from "@/db/client";
import { events } from "@/db/schema";
import { fail, logServerError, newRequestId, ok, readJson } from "@/lib/api-response";
import {
  cleanProps,
  isEventName,
  MAX_BATCH,
  normalizeSource,
  normalizeVariant,
} from "@/lib/analytics/whitelist";
import { serverEnv } from "@/lib/env";
import { rateLimit } from "@/lib/ratelimit";

// FR-ANL-02/03, SRS §14. The envelope is validated loosely and each event strictly against the whitelist:
// unknown names and props are dropped silently, so an old tab never gets errors back.
const bodySchema = z.object({ events: z.array(z.unknown()).max(MAX_BATCH) });

const eventSchema = z.object({
  name: z.string(),
  props: z.unknown().optional(),
  path: z.string().max(200).regex(/^\//).optional(),
  sessionId: z
    .string()
    .regex(/^[A-Za-z0-9-]{8,64}$/)
    .optional(),
  source: z.unknown().optional(),
  variant: z.unknown().optional(),
  team: z.boolean().optional(),
});

export async function POST(req: Request) {
  const requestId = newRequestId();
  const limit = await rateLimit(req, "events", { requestId });
  if (!limit.allowed) {
    return fail("RATE_LIMITED", { requestId, headers: { "Retry-After": String(limit.retryAfterSec) } });
  }

  const parsed = await readJson(req, bodySchema);
  if ("error" in parsed) return parsed.error;

  const rows = parsed.data.events.flatMap((raw) => {
    const e = eventSchema.safeParse(raw);
    if (!e.success || !isEventName(e.data.name)) return [];
    // Paths are kept without query strings, so nothing a visitor typed into a URL is stored.
    const path = e.data.path?.split(/[?#]/)[0] ?? null;
    return [
      {
        name: e.data.name,
        props: cleanProps(e.data.name, e.data.props),
        path,
        sessionId: e.data.sessionId ?? null,
        source: normalizeSource(e.data.source),
        variant: normalizeVariant(e.data.variant),
        team: e.data.team ?? false,
      },
    ];
  });

  if (rows.length > 0 && !serverEnv().MOCK_DB) {
    try {
      await getDb().insert(events).values(rows);
    } catch (err) {
      logServerError(requestId, "POST /api/events", err);
      return fail("INTERNAL", { requestId });
    }
  }
  return ok({ accepted: rows.length });
}
