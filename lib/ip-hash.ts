import { createHash } from "node:crypto";

// SRS §15.9: IPs are only ever stored as SHA-256(salt + ip); the raw address never leaves the request.

/**
 * Prefers x-vercel-forwarded-for (set by Vercel, which overwrites X-Forwarded-For to prevent spoofing),
 * then x-real-ip, then the first hop of x-forwarded-for (local and tests). "unknown" groups the rest.
 */
export function clientIp(headers: Headers): string {
  const first = (name: string) => headers.get(name)?.split(",")[0]?.trim();
  return first("x-vercel-forwarded-for") || first("x-real-ip") || first("x-forwarded-for") || "unknown";
}

export function hashIp(ip: string, salt: string): string {
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}
