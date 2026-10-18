// FR-ANL-03/05. Shared by the browser client and POST /api/events. Pure, no I/O, no Zod (client bundle).

type PropType = "string" | "number";

export const EVENTS = {
  hero_cta_click: { cta: "string", variant: "string" },
  estimator_start: { path: "string" },
  address_selected: {},
  polygon_completed: { count: "number" },
  manual_area_entered: {},
  sample_used: {},
  estimate_shown: { city: "string", sqftBucket: "number", rebateBucket: "number", tier: "string" },
  prep_sheet_opened: { city: "string" },
  eligibility_started: { city: "string" },
  eligibility_result: { city: "string", result: "string" },
  visualizer_upload: { source: "string" },
  render_success: { style: "string", ms: "number" },
  render_failed: { style: "string", code: "string" },
  render_downloaded: { style: "string" },
  booking_started: {},
  booking_confirmed: { city: "string" },
  feedback_sent: {},
  proof_opened: { tab: "string" },
  guide_read: { slug: "string" },
  headline_variant: { v: "string" },
  cta_impression: { cta: "string", variant: "string" },
  page_view: { path: "string", variant: "string" },
  // FR-INS-07 "map failure count" needs its own event; not in the FR-ANL-03 list, added for that panel.
  map_failed: { engine: "string" },
  // Shareable rebate result: how it was shared (native share sheet or copied link) and the city.
  rebate_shared: { method: "string", city: "string" },
  // "Notify me when it reopens" sign-ups for programs between seasons (no email in the event).
  reopen_alert_signup: { city: "string" },
} as const satisfies Record<string, Record<string, PropType>>;

export type EventName = keyof typeof EVENTS;
export type EventProps = Record<string, string | number>;

export function isEventName(name: unknown): name is EventName {
  return typeof name === "string" && Object.hasOwn(EVENTS, name);
}

const MAX_STRING = 64;

/** Keeps only the props listed for the event, with the listed type; strings are capped. */
export function cleanProps(name: EventName, props: unknown): EventProps {
  const allowed: Record<string, PropType> = EVENTS[name];
  const out: EventProps = {};
  if (!props || typeof props !== "object") return out;
  for (const [key, type] of Object.entries(allowed)) {
    const value = (props as Record<string, unknown>)[key];
    if (type === "number" && typeof value === "number" && Number.isFinite(value))
      out[key] = Math.round(value);
    if (type === "string" && typeof value === "string" && value.length > 0)
      out[key] = value.slice(0, MAX_STRING);
  }
  return out;
}

/** SRS §11.9 tagged sources. */
export const SOURCES = ["qr-screen", "qr-table", "linkedin", "x", "test", "direct"] as const;

const REFERRAL = /^referral:[a-z0-9.-]{1,253}$/;

/** Unknown values become "other" (FR-ANL-05). */
export function normalizeSource(raw: unknown): string {
  if (typeof raw !== "string") return "direct";
  const v = raw.trim().toLowerCase();
  if ((SOURCES as readonly string[]).includes(v) || REFERRAL.test(v)) return v;
  return "other";
}

export const VARIANTS = ["a", "b"] as const;
export type Variant = (typeof VARIANTS)[number];

export function normalizeVariant(raw: unknown): Variant | null {
  return raw === "a" || raw === "b" ? raw : null;
}

/** FR-ANL-03 buckets: sq ft by 250, rebate by $500 (lower bound). */
export const sqftBucket = (sqft: number) => Math.floor(Math.max(0, sqft) / 250) * 250;
export const rebateBucket = (amount: number) => Math.floor(Math.max(0, amount) / 500) * 500;

export const MAX_BATCH = 20;
