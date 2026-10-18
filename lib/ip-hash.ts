import { createHash } from "node:crypto";

// SRS §15.9: IPs are only ever stored as SHA-256(salt + ip); the raw address never leaves the request.

/** First hop of x-forwarded-for (set by Vercel), then x-real-ip; "unknown" groups clients we can't identify. */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || headers.get("x-real-ip")?.trim() || "unknown";
}

export function hashIp(ip: string, salt: string): string {
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}
