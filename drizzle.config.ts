import { existsSync } from "node:fs";
import { defineConfig } from "drizzle-kit";

// Same file Next reads in development; generate works offline, migrate needs a database URL.
// Values already in the shell win, so a one-off `DATABASE_URL_UNPOOLED=... pnpm db:migrate` targets production.
if (existsSync(".env.local")) process.loadEnvFile(".env.local");

export default defineConfig({
  dialect: "postgresql",
  schema: "./db/schema.ts",
  out: "./db/migrations",
  // Neon recommends a direct (unpooled) connection for schema changes; the app itself uses the pooled URL.
  dbCredentials: { url: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL || "" },
  strict: true,
});
