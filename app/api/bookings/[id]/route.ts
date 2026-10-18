import { fail, logServerError, newRequestId, ok } from "@/lib/api-response";
import { getBooking } from "@/lib/booking/store";
import { rateLimit } from "@/lib/ratelimit";

// SRS §14: booking summary without partner PII.
export async function GET(req: Request, ctx: RouteContext<"/api/bookings/[id]">) {
  const requestId = newRequestId();
  const limit = await rateLimit(req, "bookingRead", { requestId });
  if (!limit.allowed) {
    return fail("RATE_LIMITED", { requestId, headers: { "Retry-After": String(limit.retryAfterSec) } });
  }
  const { id } = await ctx.params;
  try {
    const booking = await getBooking(id);
    return booking ? ok(booking) : fail("NOT_FOUND", { requestId });
  } catch (err) {
    logServerError(requestId, "GET /api/bookings/[id]", err);
    return fail("INTERNAL", { requestId });
  }
}
