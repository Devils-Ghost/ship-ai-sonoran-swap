import { and, count, eq, gte } from "drizzle-orm";
import { getDb } from "@/db/client";
import { renders } from "@/db/schema";

// RENDER_DAILY_CAP keeps live renders under the provider's free allocation (ARCH §10). Cloudflare resets
// at 00:00 UTC, so the window is the UTC day. Every live attempt counts, because each one spends quota.

export function utcDayStart(now = new Date()): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

let memoryCount = { day: 0, count: 0 };

/** Used under MOCK_DB and in tests. */
export function bumpMemoryCount(now = new Date()): number {
  const day = utcDayStart(now).getTime();
  if (memoryCount.day !== day) memoryCount = { day, count: 0 };
  memoryCount.count += 1;
  return memoryCount.count;
}

export async function liveRendersToday(provider: string, useDb: boolean, now = new Date()): Promise<number> {
  if (!useDb) return memoryCount.day === utcDayStart(now).getTime() ? memoryCount.count : 0;
  const [row] = await getDb()
    .select({ n: count() })
    .from(renders)
    .where(and(eq(renders.provider, provider), gte(renders.createdAt, utcDayStart(now))));
  return row?.n ?? 0;
}
