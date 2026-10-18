import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { bookings, estimates } from "@/db/schema";
import { serverEnv } from "@/lib/env";
import type { SlotWindow } from "./slots";

// Booking persistence (ARCH §4.3). With MOCK_DB=1 (e2e, local without a database) bookings live in a
// per-process map on globalThis, so the API route and the confirmation page (separate bundles) share it.

export type EstimateSummary = { sqft: number; rebateAmount: number | null; tier: string; city: string };

export type BookingSummary = {
  id: string;
  createdAt: string;
  slotDate: string;
  slotWindow: SlotWindow;
  city: string;
  notified: boolean;
  estimate: EstimateSummary | null;
};

export type NewBooking = {
  slotDate: string;
  slotWindow: SlotWindow;
  city: string;
  estimateId: string | null;
  idempotencyKey: string;
  mode: "concept" | "partner";
};

type MemoryRow = BookingSummary & { idempotencyKey: string };
const memory = ((globalThis as { __ssBookings?: Map<string, MemoryRow> }).__ssBookings ??= new Map());

export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getEstimateSummary(id: string): Promise<EstimateSummary | null> {
  if (serverEnv().MOCK_DB || !UUID.test(id)) return null;
  const [row] = await getDb()
    .select({
      sqft: estimates.sqft,
      rebateAmount: estimates.rebateAmount,
      tier: estimates.tier,
      city: estimates.city,
    })
    .from(estimates)
    .where(eq(estimates.id, id))
    .limit(1);
  return row ?? null;
}

/**
 * Inserts the booking unless its idempotency key was already used (FR-BOOK-06). `created` is false for a
 * repeat submit, which then gets the original booking back and must not notify again.
 */
export async function createBooking(
  input: NewBooking,
): Promise<{ booking: BookingSummary; created: boolean }> {
  if (serverEnv().MOCK_DB) {
    const existing = [...memory.values()].find((b) => b.idempotencyKey === input.idempotencyKey);
    if (existing) return { booking: existing, created: false };
    const row: MemoryRow = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      slotDate: input.slotDate,
      slotWindow: input.slotWindow,
      city: input.city,
      notified: false,
      estimate: null,
      idempotencyKey: input.idempotencyKey,
    };
    memory.set(row.id, row);
    return { booking: row, created: true };
  }

  const db = getDb();
  const [inserted] = await db
    .insert(bookings)
    .values({
      slotDate: input.slotDate,
      slotWindow: input.slotWindow,
      city: input.city,
      estimateId: input.estimateId,
      mode: input.mode,
      idempotencyKey: input.idempotencyKey,
    })
    .onConflictDoNothing({ target: bookings.idempotencyKey })
    .returning({ id: bookings.id });
  if (inserted) {
    const booking = await getBooking(inserted.id);
    if (booking) return { booking, created: true };
  }
  const [prior] = await db
    .select({ id: bookings.id })
    .from(bookings)
    .where(eq(bookings.idempotencyKey, input.idempotencyKey))
    .limit(1);
  const booking = prior ? await getBooking(prior.id) : null;
  if (!booking) throw new Error("booking insert returned no row");
  return { booking, created: false };
}

export async function setNotified(id: string, notified: boolean): Promise<void> {
  if (serverEnv().MOCK_DB) {
    const row = memory.get(id);
    if (row) row.notified = notified;
    return;
  }
  await getDb().update(bookings).set({ notified }).where(eq(bookings.id, id));
}

/** Booking summary for the confirmation page and GET /api/bookings/[id]. Never includes partner PII. */
export async function getBooking(id: string): Promise<BookingSummary | null> {
  if (!UUID.test(id)) return null;
  if (serverEnv().MOCK_DB) {
    const row = memory.get(id);
    if (!row) return null;
    const { idempotencyKey: _key, ...summary } = row;
    return summary;
  }
  const [row] = await getDb()
    .select({
      id: bookings.id,
      createdAt: bookings.createdAt,
      slotDate: bookings.slotDate,
      slotWindow: bookings.slotWindow,
      city: bookings.city,
      notified: bookings.notified,
      estimateId: bookings.estimateId,
    })
    .from(bookings)
    .where(eq(bookings.id, id))
    .limit(1);
  if (!row) return null;
  return {
    id: row.id,
    createdAt: row.createdAt.toISOString(),
    slotDate: row.slotDate,
    slotWindow: row.slotWindow as SlotWindow,
    city: row.city,
    notified: row.notified,
    estimate: row.estimateId ? await getEstimateSummary(row.estimateId) : null,
  };
}
