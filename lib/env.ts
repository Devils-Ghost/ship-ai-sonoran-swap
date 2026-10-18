import { z } from "zod";

// ARCH §7: env is validated once and fails fast with every problem listed.
// Server-only: never import this from a "use client" module. Public values are
// read through `publicEnv` so Next can inline the NEXT_PUBLIC_* literals.

// `.env` files leave unset values as "", which should mean "not set".
const optionalString = z.preprocess(
  (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
  z.string().optional(),
);

const flag = z.preprocess(
  (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
  z
    .enum(["0", "1"])
    .default("0")
    .transform((v) => v === "1"),
);

const isoDateTime = (fallback: string) =>
  z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.iso.datetime({ offset: true }).default(fallback),
  );

export const IMAGE_PROVIDERS = ["gallery", "gemini", "cloudflare", "mock"] as const;

const serverEnvSchema = z
  .object({
    // Missing becomes "" so it fails as a non-fatal issue and the checks below still run.
    NEXT_PUBLIC_SITE_URL: z.preprocess((v) => v ?? "", z.url({ error: "required; a full URL" })),
    DATABASE_URL: optionalString,
    NEXT_PUBLIC_MAPBOX_TOKEN: optionalString,
    IMAGE_PROVIDER: z.preprocess(
      (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
      z.enum(IMAGE_PROVIDERS).default("gallery"),
    ),
    IMAGE_MODEL: optionalString,
    GEMINI_API_KEY: optionalString,
    CLOUDFLARE_ACCOUNT_ID: optionalString,
    CLOUDFLARE_API_TOKEN: optionalString,
    RENDER_DAILY_CAP: z.preprocess(
      (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
      z.coerce.number().int().positive().default(40),
    ),
    NTFY_SERVER: z.preprocess(
      (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
      z.url().default("https://ntfy.sh"),
    ),
    NTFY_TOPIC: optionalString,
    IP_HASH_SALT: optionalString,
    LIVE_SINCE: isoDateTime("2026-10-18T12:00:00-07:00"),
    INSIGHTS_SINCE: isoDateTime("2026-10-17T09:00:00-07:00"),
    MOCK_IMAGE_PROVIDER: flag,
    MOCK_NOTIFY: flag,
    MOCK_DB: flag,
  })
  .superRefine((env, ctx) => {
    const require = (key: keyof typeof env, why: string) => {
      if (!env[key]) ctx.addIssue({ code: "custom", path: [key], message: `required ${why}` });
    };
    if (!env.MOCK_DB) {
      require("DATABASE_URL", "unless MOCK_DB=1");
      require("IP_HASH_SALT", "unless MOCK_DB=1");
    }
    if (!env.MOCK_NOTIFY) require("NTFY_TOPIC", "unless MOCK_NOTIFY=1");
    if (!env.MOCK_IMAGE_PROVIDER) {
      if (env.IMAGE_PROVIDER === "gemini") {
        require("GEMINI_API_KEY", "when IMAGE_PROVIDER=gemini");
        require("IMAGE_MODEL", "when IMAGE_PROVIDER=gemini");
      }
      if (env.IMAGE_PROVIDER === "cloudflare") {
        require("CLOUDFLARE_ACCOUNT_ID", "when IMAGE_PROVIDER=cloudflare");
        require("CLOUDFLARE_API_TOKEN", "when IMAGE_PROVIDER=cloudflare");
        require("IMAGE_MODEL", "when IMAGE_PROVIDER=cloudflare");
      }
    }
  });

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function parseServerEnv(raw: Record<string, string | undefined>): ServerEnv {
  // Vercel exposes the production hostname; use it when the site URL isn't set.
  const input = { ...raw };
  if (!input.NEXT_PUBLIC_SITE_URL?.trim() && input.VERCEL_PROJECT_PRODUCTION_URL) {
    input.NEXT_PUBLIC_SITE_URL = `https://${input.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  const result = serverEnvSchema.safeParse(input);
  if (!result.success) {
    const lines = result.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`);
    throw new Error(`Invalid environment variables:\n${lines.join("\n")}\nSee .env.example.`);
  }
  return result.data;
}

let cached: ServerEnv | undefined;

export function serverEnv(): ServerEnv {
  cached ??= parseServerEnv(process.env);
  return cached;
}

export const publicEnv = {
  siteUrl:
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000"),
  mapboxToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN || undefined,
} as const;
