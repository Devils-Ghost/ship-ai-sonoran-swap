import { serverEnv } from "@/lib/env";
import { formatMoney, formatNumber } from "@/lib/utils/format";
import { formatDay, windowInfo, type SlotWindow } from "@/lib/booking/slots";

// FR-NOTIF-01/02 and ARCH §6: a Notifier adapter (ntfy or mock). Sending never throws; it reports
// whether the push was accepted so the booking can store `notified` honestly.

export type Channel = "ntfy" | "mock" | "none";
export type Notification = { title: string; body: string };

export type Notifier = { channel: Channel; send(n: Notification): Promise<boolean> };

const NTFY_TIMEOUT_MS = 4000; // the exit gate is "phone buzzes within 5 s"

export function ntfyNotifier(server: string, topic: string, fetchImpl: typeof fetch = fetch): Notifier {
  return {
    channel: "ntfy",
    async send({ title, body }) {
      try {
        const res = await fetchImpl(`${server.replace(/\/$/, "")}/${encodeURIComponent(topic)}`, {
          method: "POST",
          body,
          headers: { Title: title, Priority: "high", Tags: "cactus" },
          signal: AbortSignal.timeout(NTFY_TIMEOUT_MS),
        });
        return res.ok;
      } catch {
        return false;
      }
    },
  };
}

export const mockNotifier: Notifier = { channel: "mock", send: async () => true };

export function getNotifier(): Notifier {
  const env = serverEnv();
  if (env.MOCK_NOTIFY || !env.NTFY_TOPIC) return mockNotifier;
  return ntfyNotifier(env.NTFY_SERVER, env.NTFY_TOPIC);
}

export function cityName(city: string): string {
  return city === "other" ? "Other city" : city.charAt(0).toUpperCase() + city.slice(1);
}

/**
 * FR-NOTIF-01: "SONORAN SWAP DEMO · Yard walk booked · {City} · {sqft} sq ft · est. rebate ${amount} ·
 * {Day} {Window}". Estimate parts are left out when no estimate (or no rebate amount) is attached.
 */
export function bookingNotification(b: {
  city: string;
  slotDate: string;
  slotWindow: SlotWindow;
  sqft?: number | null;
  rebateAmount?: number | null;
}): Notification {
  const parts = ["SONORAN SWAP DEMO", "Yard walk booked", cityName(b.city)];
  if (b.sqft != null) parts.push(`${formatNumber(b.sqft)} sq ft`);
  if (b.rebateAmount != null) parts.push(`est. rebate ${formatMoney(b.rebateAmount)}`);
  parts.push(
    `${formatDay(b.slotDate, "weekday")} ${formatDay(b.slotDate, "monthDay")} ${windowInfo(b.slotWindow).label}`,
  );
  return { title: "Yard walk booked (demo)", body: parts.join(" · ") };
}
