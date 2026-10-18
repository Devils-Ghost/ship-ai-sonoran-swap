// Display formatting shared by every page (DESIGN §6 Money; SRS §7.6). Pure, no I/O.

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const usdCents = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});
const int = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

/** Whole dollars with separators: 2480 → "$2,480". */
export function formatMoney(amount: number): string {
  return usd.format(Math.round(amount));
}

/** DESIGN §6: ranges use a spaced en dash, "$9,600 – $15,600". */
export function formatMoneyRange(low: number, high: number): string {
  return low === high ? formatMoney(low) : `${formatMoney(low)} – ${formatMoney(high)}`;
}

/** Per-unit rates keep cents: 2 → "$2.00", 1.5 → "$1.50" (FR-REB-10 basis line). */
export function formatRate(rate: number): string {
  return usdCents.format(rate);
}

export function formatNumber(n: number): string {
  return int.format(Math.round(n));
}

/** 1240 → "1,240 sq ft". */
export function formatSqft(sqft: number): string {
  return `${formatNumber(sqft)} sq ft`;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * "2026-10-15" → "Oct 15, 2026". Date-only strings are calendar dates, so they are formatted in UTC
 * to avoid shifting a day; timestamps are shown in Arizona time (no DST, UTC−7).
 */
export function formatDate(iso: string, style: "short" | "long" = "short"): string {
  const dateOnly = ISO_DATE.test(iso);
  const d = new Date(dateOnly ? `${iso}T12:00:00Z` : iso);
  return new Intl.DateTimeFormat("en-US", {
    month: style === "short" ? "short" : "long",
    day: "numeric",
    year: "numeric",
    timeZone: dateOnly ? "UTC" : "America/Phoenix",
  }).format(d);
}
