import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Placeholder schema for the Phase 5 live data-engineering demo.
 * Table shape is provisional — finalized once a dataset is chosen
 * (see "Open questions" in docs/MIGRATION_PLAN.md). Kept here so the
 * ORM/migration wiring (drizzle.config.ts, src/db/client.ts) has a real
 * table to generate a migration against.
 */
export const pipelineRuns = pgTable("pipeline_runs", {
  id: serial("id").primaryKey(),
  source: text("source").notNull(),
  recordCount: integer("record_count").notNull(),
  ranAt: timestamp("ran_at", { withTimezone: true }).defaultNow().notNull(),
});
