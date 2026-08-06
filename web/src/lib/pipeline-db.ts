import { neon } from "@neondatabase/serverless";

/**
 * Read side of the live food inspection pipeline.
 *
 * Server-only. Every query in this file is a fixed statement with no
 * interpolation from a request: the API route exposes no parameters at all, so
 * there is no injection surface rather than a defended one. If a future filter
 * is added it must be an enum mapped to a literal here, never a string passed
 * through.
 *
 * Reads go through Neon's POOLED endpoint. Serverless functions open many
 * short-lived connections, which is what the pooler exists for, and the free
 * tier's connection ceiling is reachable without it.
 */

export type PipelineSnapshot = {
  status: "ok";
  run: {
    finishedAt: string | null;
    status: string;
    rowsFetched: number;
    rowsAccepted: number;
    rowsRejected: number;
    rowsPruned: number;
    durationMs: number | null;
  } | null;
  totals: {
    violations: number;
    inspections: number;
    establishments: number;
  };
  cities: {
    city: string;
    violations: number;
    inspections: number;
    latest: string | null;
  }[];
  daily: { day: string; violations: number }[];
  profile: {
    city: string;
    column: string;
    populated: number;
    total: number;
    nullPct: number;
  }[];
  rejects: { city: string; reason: string; rows: number }[];
  stages: { city: string; stage: string; rows: number }[];
};

export type PipelineUnavailable = {
  status: "unavailable";
  reason: string;
};

function client() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not configured");
  return neon(url);
}

const num = (v: unknown) => Number(v ?? 0);

/**
 * Postgres `date` columns arrive from the driver as JS Date objects, and
 * `String(date)` yields "Tue Aug 04 2026 ...", so slicing the first ten
 * characters produced "Tue Aug 04" instead of a date.
 *
 * Formatted from local parts rather than `toISOString`, which converts to UTC
 * first and rolls a local-midnight date back to the previous day for anyone
 * east of Greenwich.
 */
function isoDate(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }
  const d = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(d.getTime())) return null;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export async function readSnapshot(): Promise<
  PipelineSnapshot | PipelineUnavailable
> {
  try {
    const sql = client();

    // Issued together rather than sequentially. Neon scales compute to zero
    // after five idle minutes, so the first query of the day pays a cold start
    // and paying it six times in series is the difference between a visible
    // wait and none.
    const [runRows, totalRows, cityRows, dailyRows, profileRows, rejectRows, stageRows] =
      await Promise.all([
        sql`select finished_at, status, rows_fetched, rows_accepted,
                   rows_rejected, rows_pruned, duration_ms
              from pipeline_runs
             where status = 'success'
             order by started_at desc limit 1`,
        sql`select count(*) as violations,
                   count(distinct (city || inspection_id)) as inspections,
                   count(distinct establishment_key) as establishments
              from fact_inspection_violations`,
        sql`select city, count(*) as violations,
                   count(distinct inspection_id) as inspections,
                   max(inspection_date) as latest
              from fact_inspection_violations
             group by city order by count(*) desc`,
        sql`select inspection_date as day, count(*) as violations
              from fact_inspection_violations
             where inspection_date >= current_date - interval '90 days'
             group by inspection_date order by inspection_date`,
        sql`select city, column_name, populated, total, null_pct
              from pipeline_profile
             where job_id = (select job_id from pipeline_runs
                              where status = 'success'
                              order by started_at desc limit 1)
             order by city, column_name`,
        sql`select city, reason, rows from pipeline_rejects
             where job_id = (select job_id from pipeline_runs
                              where status = 'success'
                              order by started_at desc limit 1)
             order by rows desc`,
        sql`select city, stage, rows from pipeline_stage_counts
             where job_id = (select job_id from pipeline_runs
                              where status = 'success'
                              order by started_at desc limit 1)`,
      ]);

    const run = runRows[0];
    const totals = totalRows[0] ?? {};

    return {
      status: "ok",
      run: run
        ? {
            finishedAt: run.finished_at
              ? new Date(run.finished_at as string).toISOString()
              : null,
            status: String(run.status),
            rowsFetched: num(run.rows_fetched),
            rowsAccepted: num(run.rows_accepted),
            rowsRejected: num(run.rows_rejected),
            rowsPruned: num(run.rows_pruned),
            durationMs: run.duration_ms == null ? null : num(run.duration_ms),
          }
        : null,
      totals: {
        violations: num(totals.violations),
        inspections: num(totals.inspections),
        establishments: num(totals.establishments),
      },
      cities: cityRows.map((r) => ({
        city: String(r.city),
        violations: num(r.violations),
        inspections: num(r.inspections),
        latest: isoDate(r.latest),
      })),
      daily: dailyRows.map((r) => ({
        day: isoDate(r.day) ?? "",
        violations: num(r.violations),
      })),
      profile: profileRows.map((r) => ({
        city: String(r.city),
        column: String(r.column_name),
        populated: num(r.populated),
        total: num(r.total),
        nullPct: num(r.null_pct),
      })),
      rejects: rejectRows.map((r) => ({
        city: String(r.city),
        reason: String(r.reason),
        rows: num(r.rows),
      })),
      stages: stageRows.map((r) => ({
        city: String(r.city),
        stage: String(r.stage),
        rows: num(r.rows),
      })),
    };
  } catch (error) {
    // Never throw to the caller. A sleeping database, an exhausted free tier or
    // a missing env var must degrade the panel, not take a project page down
    // with it. The reason is generic on purpose: it is served publicly.
    console.error("pipeline snapshot failed", error);
    return { status: "unavailable", reason: "The pipeline database is not reachable." };
  }
}
