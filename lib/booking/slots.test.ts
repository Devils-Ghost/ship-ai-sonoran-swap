import { describe, expect, it } from "vitest";
import { arizonaToday, BOOKING_DAYS, bookingDays, formatDay, isBookable, isTaken } from "./slots";

describe("arizonaToday", () => {
  it("uses the Arizona clock (UTC−7), not UTC", () => {
    expect(arizonaToday(new Date("2030-03-16T06:30:00Z"))).toBe("2030-03-15");
    expect(arizonaToday(new Date("2030-03-16T07:00:00Z"))).toBe("2030-03-16");
  });
});

describe("bookingDays (FR-BOOK-01/03)", () => {
  const days = bookingDays("2030-03-15"); // a Friday

  it("lists the next 10 days after today, skipping Sundays", () => {
    expect(days).toHaveLength(BOOKING_DAYS);
    expect(days[0]?.date).toBe("2030-03-16");
    expect(days.map((d) => d.date)).not.toContain("2030-03-17");
    expect(days.map((d) => d.date)).not.toContain("2030-03-24");
    expect(days.at(-1)?.date).toBe("2030-03-27");
  });

  it("offers morning and afternoon each day", () => {
    for (const d of days) expect(d.slots.map((s) => s.window)).toEqual(["morning", "afternoon"]);
  });

  it("marks some windows taken, deterministically", () => {
    const flags = days.flatMap((d) => d.slots.map((s) => s.available));
    expect(flags).toContain(false);
    expect(flags).toContain(true);
    expect(bookingDays("2030-03-15")).toEqual(days);
    for (const d of days) for (const s of d.slots) expect(s.available).toBe(!isTaken(d.date, s.window));
  });
});

describe("isBookable", () => {
  const today = "2030-03-15";
  const open = bookingDays(today)
    .flatMap((d) => d.slots.map((s) => ({ date: d.date, ...s })))
    .find((s) => s.available);
  const taken = bookingDays(today)
    .flatMap((d) => d.slots.map((s) => ({ date: d.date, ...s })))
    .find((s) => !s.available);

  it("accepts an open window and rejects a taken one", () => {
    if (!open || !taken) throw new Error("fixture needs both kinds of slot");
    expect(isBookable(open.date, open.window, today)).toBe(true);
    expect(isBookable(taken.date, taken.window, today)).toBe(false);
  });

  it("rejects past days, Sundays and dates beyond the window", () => {
    expect(isBookable("2030-03-14", "morning", today)).toBe(false);
    expect(isBookable("2030-03-17", "morning", today)).toBe(false);
    expect(isBookable("2030-04-30", "morning", today)).toBe(false);
  });
});

it("formatDay", () => {
  expect(formatDay("2030-03-16")).toBe("Saturday, Mar 16");
  expect(formatDay("2030-03-16", "weekday")).toBe("Sat");
  expect(formatDay("2030-03-16", "monthDay")).toBe("Mar 16");
});

it("buildIcs writes Arizona windows in UTC (FR-BOOK-05)", async () => {
  const { buildIcs } = await import("./ics");
  const ics = buildIcs({
    id: "abc",
    slotDate: "2030-03-16",
    slotWindow: "afternoon",
    city: "Mesa",
    note: "Demo, no one will visit.",
    now: new Date("2030-03-15T20:00:00Z"),
  });
  expect(ics).toContain("DTSTART:20300316T200000Z");
  expect(ics).toContain("DTEND:20300317T000000Z");
  expect(ics).toContain(String.raw`DESCRIPTION:Afternoon window\, 1–5 PM. Demo\, no one will visit.`);
  expect(ics.split("\r\n")[0]).toBe("BEGIN:VCALENDAR");
});
