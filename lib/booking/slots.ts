// FR-BOOK-01/03. Pure: the booking calendar is computed from "today in Arizona", and some windows are
// shown as taken, chosen by a hash of the date so every visitor (and the server) sees the same picture.

export const SLOT_WINDOWS = [
  { id: "morning", label: "Morning", hours: "7–11 AM", startHour: 7, endHour: 11 },
  { id: "afternoon", label: "Afternoon", hours: "1–5 PM", startHour: 13, endHour: 17 },
] as const;

export type SlotWindow = (typeof SLOT_WINDOWS)[number]["id"];
export const SLOT_WINDOW_IDS = SLOT_WINDOWS.map((w) => w.id) as [SlotWindow, ...SlotWindow[]];

export const BOOKING_DAYS = 10;
/** Share of windows shown as taken, in percent. */
const UNAVAILABLE_PERCENT = 30;

export type Slot = { window: SlotWindow; available: boolean };
export type Day = { date: string; slots: Slot[] };

/** "YYYY-MM-DD" for `now` on the Arizona clock (UTC−7 all year, no DST). */
export function arizonaToday(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Phoenix",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

function addDays(date: string, days: number): string {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function isSunday(date: string): boolean {
  return new Date(`${date}T12:00:00Z`).getUTCDay() === 0;
}

/** FNV-1a, 32-bit: small, stable across runtimes. */
function hash(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function isTaken(date: string, window: SlotWindow): boolean {
  return hash(`${date}|${window}`) % 100 < UNAVAILABLE_PERCENT;
}

/** The next BOOKING_DAYS bookable days after `today`, skipping Sundays. */
export function bookingDays(today: string): Day[] {
  const days: Day[] = [];
  for (let offset = 1; days.length < BOOKING_DAYS; offset += 1) {
    const date = addDays(today, offset);
    if (isSunday(date)) continue;
    days.push({ date, slots: SLOT_WINDOWS.map((w) => ({ window: w.id, available: !isTaken(date, w.id) })) });
  }
  return days;
}

/**
 * Server check for POST /api/bookings. Yesterday's calendar is also accepted so a visitor who loaded the
 * page just before midnight can still book what they saw.
 */
export function isBookable(date: string, window: SlotWindow, today: string): boolean {
  return [today, addDays(today, -1)].some((t) =>
    bookingDays(t).some((d) => d.date === date && d.slots.some((s) => s.window === window && s.available)),
  );
}

export function windowInfo(window: SlotWindow) {
  return SLOT_WINDOWS.find((w) => w.id === window) ?? SLOT_WINDOWS[0];
}

/** "2030-03-16" → "Saturday, Mar 16" (or "Sat" / "Mar 16" parts for the picker). */
export function formatDay(date: string, style: "long" | "weekday" | "monthDay" = "long"): string {
  const d = new Date(`${date}T12:00:00Z`);
  const opts: Intl.DateTimeFormatOptions =
    style === "weekday"
      ? { weekday: "short" }
      : style === "monthDay"
        ? { month: "short", day: "numeric" }
        : { weekday: "long", month: "short", day: "numeric" };
  return new Intl.DateTimeFormat("en-US", { ...opts, timeZone: "UTC" }).format(d);
}
