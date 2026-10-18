import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { fail, ok, readJson } from "./api-response";
import { clientIp, hashIp } from "./ip-hash";
import { LIMITS, memoryStore, rateLimit, windowStart, type RateLimitStore } from "./ratelimit";

const post = (body: string, headers: Record<string, string> = {}) =>
  new Request("http://localhost/api/x", { method: "POST", body, headers });

describe("api envelope", () => {
  it("wraps success and failure in the SRS §14 shape", async () => {
    expect(await ok({ id: 1 }).json()).toEqual({ ok: true, data: { id: 1 } });
    const res = fail("RATE_LIMITED", { requestId: "abc" });
    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({
      ok: false,
      error: {
        code: "RATE_LIMITED",
        message: "You're moving fast. Try again in a minute.",
        requestId: "abc",
      },
    });
  });

  it("validates JSON bodies and rejects bad or oversized input", async () => {
    const schema = z.object({ sqft: z.number().int().min(0) });
    expect(await readJson(post('{"sqft":1240}'), schema)).toEqual({ data: { sqft: 1240 } });

    const bad = await readJson(post('{"sqft":-1}'), schema);
    expect("error" in bad && bad.error.status).toBe(400);

    const broken = await readJson(post("{not json"), schema);
    expect("error" in broken && broken.error.status).toBe(400);

    const big = await readJson(post(JSON.stringify({ sqft: 1, pad: "x".repeat(100) })), schema, 64);
    expect("error" in big && big.error.status).toBe(413);
  });
});

describe("ip hashing", () => {
  it("uses the first forwarded hop and never returns the raw IP", () => {
    const headers = new Headers({ "x-forwarded-for": "203.0.113.7, 10.0.0.1" });
    expect(clientIp(headers)).toBe("203.0.113.7");
    const h = hashIp("203.0.113.7", "salt");
    expect(h).toMatch(/^[0-9a-f]{64}$/);
    expect(h).not.toContain("203.0.113.7");
    expect(hashIp("203.0.113.7", "other-salt")).not.toBe(h);
  });
});

describe("rate limiting", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "http://localhost:3000");
    vi.stubEnv("MOCK_DB", "1");
    vi.stubEnv("MOCK_NOTIFY", "1");
  });
  afterEach(() => vi.unstubAllEnvs());

  it("aligns fixed windows", () => {
    expect(windowStart(125_000, 60_000).getTime()).toBe(120_000);
  });

  it("allows up to the limit, then blocks until the window resets", async () => {
    const store = memoryStore();
    const req = () => post("{}", { "x-forwarded-for": "198.51.100.1" });
    const { max } = LIMITS.render;
    const now = 600_000; // start of a 10-minute window

    for (let i = 0; i < max; i++) {
      expect((await rateLimit(req(), "render", { store, now })).allowed).toBe(true);
    }
    const blocked = await rateLimit(req(), "render", { store, now: now + 1000 });
    expect(blocked).toMatchObject({ allowed: false, remaining: 0, retryAfterSec: 599 });

    expect((await rateLimit(req(), "render", { store, now: now + 600_000 })).allowed).toBe(true);
  });

  it("counts each IP separately", async () => {
    const store = memoryStore();
    const now = 0;
    for (let i = 0; i < LIMITS.render.max; i++) {
      await rateLimit(post("{}", { "x-forwarded-for": "198.51.100.1" }), "render", { store, now });
    }
    const other = await rateLimit(post("{}", { "x-forwarded-for": "198.51.100.2" }), "render", {
      store,
      now,
    });
    expect(other.allowed).toBe(true);
  });

  it("fails open when the store errors", async () => {
    const broken: RateLimitStore = { increment: () => Promise.reject(new Error("db down")) };
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect((await rateLimit(post("{}"), "events", { store: broken })).allowed).toBe(true);
    expect(spy).toHaveBeenCalledOnce();
    spy.mockRestore();
  });
});
