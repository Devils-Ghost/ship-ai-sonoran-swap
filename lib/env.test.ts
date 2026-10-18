import { describe, expect, it } from "vitest";
import { parseServerEnv } from "./env";

const base = {
  NEXT_PUBLIC_SITE_URL: "https://ship-ai-sonoran-swap.vercel.app",
  DATABASE_URL: "postgres://u:p@host/db",
  IP_HASH_SALT: "a-long-random-salt",
  NTFY_TOPIC: "some-long-random-topic",
};

describe("parseServerEnv", () => {
  it("applies defaults for optional values", () => {
    const env = parseServerEnv(base);
    expect(env.IMAGE_PROVIDER).toBe("gallery");
    expect(env.RENDER_DAILY_CAP).toBe(50);
    expect(env.NTFY_SERVER).toBe("https://ntfy.sh");
    expect(env.MOCK_DB).toBe(false);
  });

  it("treats empty strings from .env files as unset", () => {
    expect(() => parseServerEnv({ ...base, DATABASE_URL: "" })).toThrow(/DATABASE_URL/);
  });

  it("lists every problem at once", () => {
    const run = () => parseServerEnv({ NEXT_PUBLIC_SITE_URL: "not a url" });
    expect(run).toThrow(/NEXT_PUBLIC_SITE_URL/);
    expect(run).toThrow(/DATABASE_URL/);
    expect(run).toThrow(/NTFY_TOPIC/);
  });

  it("still lists the other problems when the site URL is missing", () => {
    const run = () => parseServerEnv({});
    expect(run).toThrow(/NEXT_PUBLIC_SITE_URL: required/);
    expect(run).toThrow(/DATABASE_URL/);
  });

  it("lets mocks stand in for external services", () => {
    const env = parseServerEnv({
      NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
      MOCK_DB: "1",
      MOCK_NOTIFY: "1",
      MOCK_IMAGE_PROVIDER: "1",
      IMAGE_PROVIDER: "gemini",
    });
    expect(env.MOCK_DB && env.MOCK_NOTIFY && env.MOCK_IMAGE_PROVIDER).toBe(true);
  });

  it("requires provider credentials for live image providers", () => {
    expect(() => parseServerEnv({ ...base, IMAGE_PROVIDER: "gemini" })).toThrow(/GEMINI_API_KEY/);
    expect(() => parseServerEnv({ ...base, IMAGE_PROVIDER: "cloudflare" })).toThrow(/CLOUDFLARE_API_TOKEN/);
  });

  it("falls back to the Vercel production hostname", () => {
    const { NEXT_PUBLIC_SITE_URL: _omit, ...rest } = base;
    const env = parseServerEnv({ ...rest, VERCEL_PROJECT_PRODUCTION_URL: "ship-ai-sonoran-swap.vercel.app" });
    expect(env.NEXT_PUBLIC_SITE_URL).toBe("https://ship-ai-sonoran-swap.vercel.app");
  });
});
