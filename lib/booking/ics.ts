import { windowInfo, type SlotWindow } from "./slots";

// FR-BOOK-05. Pure RFC 5545 builder. Times are written in UTC: Arizona is UTC−7 all year (no DST).

const AZ_OFFSET_HOURS = 7;

function utcStamp(date: string, hourAz: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCHours(hourAz + AZ_OFFSET_HOURS);
  return d
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
}

function escapeText(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

export function buildIcs(b: {
  id: string;
  slotDate: string;
  slotWindow: SlotWindow;
  city: string;
  note: string;
  now: Date;
}): string {
  const w = windowInfo(b.slotWindow);
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Sonoran Swap//Yard walk//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${b.id}@sonoranswap`,
    `DTSTAMP:${b.now
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "")}`,
    `DTSTART:${utcStamp(b.slotDate, w.startHour)}`,
    `DTEND:${utcStamp(b.slotDate, w.endHour)}`,
    `SUMMARY:${escapeText("Sonoran Swap yard walk (demo)")}`,
    `DESCRIPTION:${escapeText(`${w.label} window, ${w.hours}. ${b.note}`)}`,
    `LOCATION:${escapeText(b.city)}`,
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}
