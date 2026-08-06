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
 * The analytics below deliberately mirror what the original Tableau workbook
 * produced: outcome distributions, risk hotspots, violation frequency and
 * severity, and geographic clustering. The point of the panel is not that it
 * shows numbers, it is that it answers the same questions the retired build
 * answered, against data that arrived this morning.
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
    locations: number;
    violationTypes: number;
    criticalPct: number;
  };
  cities: {
    city: string;
    violations: number;
    inspections: number;
    perInspection: number;
    latest: string | null;
  }[];
  daily: { day: string; violations: number }[];
  monthly: { month: string; violations: number; inspections: number }[];
  topViolations: { description: string; city: string; count: number }[];
  hotspots: { zip: string; city: string; violations: number; establishments: number }[];
  outcomes: { result: string; count: number }[];
  severity: { city: string; critical: number; notCritical: number; unknown: number }[];
  stages: { city: string; stage: string; rows: number }[];
  profile: {
    city: string;
    column: string;
    populated: number;
    total: number;
    nullPct: number;
  }[];
  rejects: { city: string; reason: string; rows: number }[];
  history: {
    startedAt: string | null;
    status: string;
    rowsFetched: number;
    rowsAccepted: number;
    durationMs: number | null;
  }[];
};

export type PipelineUnavailable = { status: "unavailable"; reason: string };

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

    // The most recent successful run, resolved once and reused. Three of the
    // queries below key off it, and a correlated subquery in each would make
    // the planner resolve it three times.
    const jobRows = await sql`select job_id from pipeline_runs
                               where status = 'success'
                               order by started_at desc limit 1`;
    const jobId = (jobRows[0]?.job_id as string | undefined) ?? null;

    // Issued together rather than sequentially. Neon scales compute to zero
    // after five idle minutes, so the first query of the day pays a cold start
    // and paying it a dozen times in series is the difference between a visible
    // wait and none.
    const [
      runRows, totalRows, cityRows, dailyRows, monthlyRows,
      topViolationRows, hotspotRows, outcomeRows, severityRows,
      profileRows, rejectRows, stageRows, historyRows,
    ] = await Promise.all([
      sql`select finished_at, status, rows_fetched, rows_accepted,
                 rows_rejected, rows_pruned, duration_ms
            from pipeline_runs
           where status = 'success' order by started_at desc limit 1`,

      sql`select count(*) as violations,
                 count(distinct (city || inspection_id)) as inspections,
                 count(distinct establishment_key) as establishments,
                 count(distinct location_key) as locations,
                 count(distinct violation_key) as violation_types,
                 round(100.0 * count(*) filter (where critical)
                       / nullif(count(*) filter (where critical is not null), 0), 1)
                   as critical_pct
            from fact_inspection_violations`,

      sql`select city, count(*) as violations,
                 count(distinct inspection_id) as inspections,
                 round(count(*)::numeric
                       / nullif(count(distinct inspection_id), 0), 2) as per_inspection,
                 max(inspection_date) as latest
            from fact_inspection_violations
           group by city order by count(*) desc`,

      sql`select inspection_date as day, count(*) as violations
            from fact_inspection_violations
           where inspection_date >= current_date - interval '90 days'
           group by inspection_date order by inspection_date`,

      // Violation frequency trend, the workbook's third view.
      sql`select to_char(date_trunc('month', inspection_date), 'YYYY-MM') as month,
                 count(*) as violations,
                 count(distinct (city || inspection_id)) as inspections
            from fact_inspection_violations
           group by 1 order by 1`,

      // Violation frequency and severity, the workbook's third view.
      sql`select v.description, v.city, count(*) as count
            from fact_inspection_violations f
            join dim_violation v on v.violation_key = f.violation_key
           where v.description is not null
             and v.description <> 'No violations cited'
           group by v.description, v.city
           order by count(*) desc limit 8`,

      // Geographic clustering, the workbook's fourth view.
      sql`select l.zip, l.city, count(*) as violations,
                 count(distinct f.establishment_key) as establishments
            from fact_inspection_violations f
            join dim_location l on l.location_key = f.location_key
           where l.zip is not null and l.zip <> '00000'
           group by l.zip, l.city
           order by count(*) desc limit 10`,

      // Inspection outcome distribution, the workbook's first view.
      sql`select result, count(distinct (city || inspection_id)) as count
            from fact_inspection_violations
           where result is not null and result <> ''
           group by result order by count(distinct (city || inspection_id)) desc
           limit 8`,

      sql`select city,
                 count(*) filter (where critical) as critical,
                 count(*) filter (where critical = false) as not_critical,
                 count(*) filter (where critical is null) as unknown
            from fact_inspection_violations group by city`,

      jobId
        ? sql`select city, column_name, populated, total, null_pct
                from pipeline_profile where job_id = ${jobId}
               order by city, column_name`
        : Promise.resolve([]),

      jobId
        ? sql`select city, reason, rows from pipeline_rejects
               where job_id = ${jobId} order by rows desc`
        : Promise.resolve([]),

      jobId
        ? sql`select city, stage, rows from pipeline_stage_counts
               where job_id = ${jobId}`
        : Promise.resolve([]),

      // Run history. Failures included deliberately: a log that only shows
      // successes is not a log.
      sql`select started_at, status, rows_fetched, rows_accepted, duration_ms
            from pipeline_runs order by started_at desc limit 8`,
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
        locations: num(totals.locations),
        violationTypes: num(totals.violation_types),
        criticalPct: num(totals.critical_pct),
      },
      cities: cityRows.map((r) => ({
        city: String(r.city),
        violations: num(r.violations),
        inspections: num(r.inspections),
        perInspection: num(r.per_inspection),
        latest: isoDate(r.latest),
      })),
      daily: dailyRows.map((r) => ({
        day: isoDate(r.day) ?? "",
        violations: num(r.violations),
      })),
      monthly: monthlyRows.map((r) => ({
        month: String(r.month),
        violations: num(r.violations),
        inspections: num(r.inspections),
      })),
      topViolations: topViolationRows.map((r) => ({
        description: String(r.description),
        city: String(r.city),
        count: num(r.count),
      })),
      hotspots: hotspotRows.map((r) => ({
        zip: String(r.zip),
        city: String(r.city),
        violations: num(r.violations),
        establishments: num(r.establishments),
      })),
      outcomes: outcomeRows.map((r) => ({
        result: String(r.result),
        count: num(r.count),
      })),
      severity: severityRows.map((r) => ({
        city: String(r.city),
        critical: num(r.critical),
        notCritical: num(r.not_critical),
        unknown: num(r.unknown),
      })),
      stages: stageRows.map((r) => ({
        city: String(r.city),
        stage: String(r.stage),
        rows: num(r.rows),
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
      history: historyRows.map((r) => ({
        startedAt: r.started_at
          ? new Date(r.started_at as string).toISOString()
          : null,
        status: String(r.status),
        rowsFetched: num(r.rows_fetched),
        rowsAccepted: num(r.rows_accepted),
        durationMs: r.duration_ms == null ? null : num(r.duration_ms),
      })),
    };
  } catch (error) {
    // Never throw to the caller. A sleeping database, an exhausted free tier or
    // a missing env var must degrade the panel, not take a project page down
    // with it. The reason is generic on purpose: it is served publicly.
    console.error("pipeline snapshot failed", error);
    return {
      status: "unavailable",
      reason: "The pipeline database is not reachable.",
    };
  }
}
