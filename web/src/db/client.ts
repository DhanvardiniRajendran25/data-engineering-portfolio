import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

/**
 * Lazily creates the DB client on first use rather than at import time,
 * so builds and routes that don't touch the database never require
 * DATABASE_URL to be set (e.g. this whole file is unused until Phase 5).
 */
let cached: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (cached) return cached;

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Copy web/.env.example to web/.env.local and " +
        "fill in a Neon connection string before calling getDb().",
    );
  }

  cached = drizzle(neon(url), { schema });
  return cached;
}
