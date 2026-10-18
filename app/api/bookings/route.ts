import { z } from "zod";
import { fail, logServerError, newRequestId, ok, readJson } from "@/lib/api-response";
import { arizonaToday, isBookable, SLOT_WINDOW_IDS } from "@/lib/booking/slots";
import { createBooking, getEstimateSummary, setNotified } from "@/lib/booking/store";
import { content } from "@/lib/content/load";
import { CITY_IDS } from "@/lib/estimate/estimate";
import { bookingNotification, getNotifier } from "@/lib/notify";
import { rateLimit } from "@/lib/ratelimit";

// SRS §11.1–11.2, ARCH §4.3. Concept mode takes no personal fields at all (FR-BOOK-02): the strict schema
// rejects a `partner` block, names, phones or addresses.
const bodySchema = z.strictObject({
  slotDate: z.iso.date(),
  slotWindow: z.enum(SLOT_WINDOW_IDS),
  city: z.enum(CITY_IDS),
  estimateId: z.uuid().optional(),
  idempotencyKey: z.string().regex(/^[A-Za-z0-9-]{16,64}$/),
});

export async function POST(req: Request) {
  const requestId = newRequestId();
  const limit = await rateLimit(req, "bookings", { requestId });
  if (!limit.allowed) {
    return fail("RATE_LIMITED", { requestId, headers: { "Retry-After": String(limit.retryAfterSec) } });
  }

  const parsed = await readJson(req, bodySchema);
  if ("error" in parsed) return parsed.error;
  const body = parsed.data;

  if (!isBookable(body.slotDate, body.slotWindow, arizonaToday()))
    return fail("SLOT_UNAVAILABLE", { requestId });

  const notifier = getNotifier();
  try {
    const estimate = body.estimateId ? await getEstimateSummary(body.estimateId) : null;
    const { booking, created } = await createBooking({
      slotDate: body.slotDate,
      slotWindow: body.slotWindow,
      city: body.city,
      estimateId: estimate ? (body.estimateId ?? null) : null,
      idempotencyKey: body.idempotencyKey,
      mode: content.business.mode,
    });
    // A repeat submit returns the first booking as it stands; the crew is only buzzed once.
    if (!created) return ok({ id: booking.id, notified: booking.notified, channel: notifier.channel });

    // FR-NOTIF-02: a failed push never blocks the booking; it is recorded as not delivered.
    const notified = await notifier.send(
      bookingNotification({
        city: body.city,
        slotDate: body.slotDate,
        slotWindow: body.slotWindow,
        sqft: estimate?.sqft,
        rebateAmount: estimate?.rebateAmount,
      }),
    );
    if (!notified) logServerError(requestId, "POST /api/bookings notify", new Error("push not delivered"));
    await setNotified(booking.id, notified);
    return ok({ id: booking.id, notified, channel: notifier.channel });
  } catch (err) {
    logServerError(requestId, "POST /api/bookings", err);
    return fail("INTERNAL", { requestId });
  }
}
