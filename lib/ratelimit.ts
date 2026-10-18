import { sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import { rateLimits } from "@/db/schema";
import { logServerError } from "@/lib/api-response";
import { serverEnv } from "@/lib/env";
import { clientIp, hashIp } from "@/lib/ip-hash";

// SRS §14 limits per route, as fixed windows. ARCH §1: counts live in Postgres (no extra service).
export const LIMITS = {
  estimates: { max: 30, windowMs: 60_000 },
  render: { max: 5, windowMs: 10 * 60_000 },
  eligibility: { max: 30, windowMs: 60_000 },
  bookings: { max: 10, windowMs: 60_000 },
  bookingRead: { max: 60, windowMs: 60_000 },
  feedback: { max: 5, windowMs: 10 * 60_000 },
  alerts: { max: 5, windowMs: 10 * 60_000 },
  events: { max: 120, windowMs: 60_000 },
  testSessions: { max: 10, windowMs: 60_000 },
} as const;

export type LimitName = keyof typeof LIMITS;

export type RateLimitStore = {
  /** Adds one hit and returns the window's new total. */
  increment(key: { ipHash: string; route: string; windowStart: Date }): Promise<number>;
};

export type RateLimitDecision = { allowed: boolean; remaining: number; retryAfterSec: number };

export function windowStart(nowMs: number, windowMs: number): Date {
  return new Date(Math.floor(nowMs / windowMs) * windowMs);
}

export function decide(
  count: number,
  max: number,
  start: Date,
  windowMs: number,
  nowMs: number,
): RateLimitDecision {
  return {
    allowed: count <= max,
    remaining: Math.max(0, max - count),
    retryAfterSec: Math.max(1, Math.ceil((start.getTime() + windowMs - nowMs) / 1000)),
  };
}

export const postgresStore: RateLimitStore = {
  async increment({ ipHash, route, windowStart: start }) {
    const [row] = await getDb()
      .insert(rateLimits)
      .values({ ipHash, route, windowStart: start, count: 1 })
      .onConflictDoUpdate({
        target: [rateLimits.ipHash, rateLimits.route, rateLimits.windowStart],
        set: { count: sql`${rateLimits.count} + 1` },
      })
      .returning({ count: rateLimits.count });
    return row?.count ?? 1;
  },
};

/** For tests and MOCK_DB; per-process only. */
export function memoryStore(): RateLimitStore {
  const counts = new Map<string, number>();
  return {
    async increment({ ipHash, route, windowStart: start }) {
      const key = `${ipHash}|${route}|${start.getTime()}`;
      const next = (counts.get(key) ?? 0) + 1;
      counts.set(key, next);
      return next;
    },
  };
}

const devStore = memoryStore();

/**
 * Counts this request against `name`'s limit. Fails open: if the store errors, the request is allowed
 * and the error is logged, because a broken limiter must not take the site down.
 */
export async function rateLimit(
  req: Request,
  name: LimitName,
  options: { store?: RateLimitStore; now?: number; requestId?: string } = {},
): Promise<RateLimitDecision> {
  const env = serverEnv();
  const { max, windowMs } = LIMITS[name];
  const now = options.now ?? Date.now();
  const start = windowStart(now, windowMs);
  const store = options.store ?? (env.MOCK_DB ? devStore : postgresStore);
  const ipHash = hashIp(clientIp(req.headers), env.IP_HASH_SALT ?? "dev-salt");

  try {
    const count = await store.increment({ ipHash, route: name, windowStart: start });
    return decide(count, max, start, windowMs, now);
  } catch (err) {
    logServerError(options.requestId ?? "-", `ratelimit:${name}`, err);
    return { allowed: true, remaining: max, retryAfterSec: 0 };
  }
}
