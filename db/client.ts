import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import { serverEnv } from "@/lib/env";
import * as schema from "./schema";

let db: NeonHttpDatabase<typeof schema> | undefined;

/** Lazily connects so pages that never touch the database don't need DATABASE_URL at build. */
export function getDb(): NeonHttpDatabase<typeof schema> {
  if (db) return db;
  const { DATABASE_URL, MOCK_DB } = serverEnv();
  if (MOCK_DB || !DATABASE_URL) {
    throw new Error(
      "Database is disabled (MOCK_DB=1 or DATABASE_URL unset); callers must use their mock path.",
    );
  }
  db = drizzle({ client: neon(DATABASE_URL), schema });
  return db;
}
