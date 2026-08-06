"""Multi-city food inspection ingestion.

Three cities publish the same domain in three incompatible shapes, and each
needs its own transformation to reach a shared grain:

    Chicago  long    one row per inspection, every violation packed into a
                     single pipe-delimited free-text string  ->  PARSE
    Dallas   wide    up to 25 numbered violation blocks per inspection row,
                     spread across 63 columns                ->  UNPIVOT
    NYC      narrow  already one row per violation           ->  PASS THROUGH

They meet at one grain: one row per violation per inspection. That is the only
grain all three can reach without inventing data.

Dallas is frozen. Its Socrata dataset covers October 2016 to February 2024 and
will not update again; the city moved live inspections to a vendor portal that
is not an open API. It is still loaded, because a historical lane beside two
live ones is an honest thing for a pipeline to have, and the run log shows it
holding steady while the others move.

Run:  python pipeline/ingest.py
Env:  DATABASE_URL_DIRECT (preferred) or DATABASE_URL
      SOCRATA_APP_TOKEN   (optional, raises the anonymous rate limit)
"""

from __future__ import annotations

import os
import re
import sys
import time
import uuid
from collections import Counter, defaultdict
from datetime import date, datetime, timedelta, timezone
from typing import Any, Iterable, Iterator

import psycopg
import requests
from dotenv import load_dotenv
from psycopg.rows import dict_row

load_dotenv()
load_dotenv(os.path.join(os.path.dirname(__file__), "..", "web", ".env.local"))

# Rolling window. Neon's free tier is 0.5 GB; an unbounded live pipeline reaches
# that eventually and then fails in a way nobody notices. Bounded by design, and
# stated on the page rather than hidden.
WINDOW_MONTHS = 24
PAGE_SIZE = 5000
# Socrata will happily serve more, but a job that dies at row 400,000 with no
# checkpoint is worse than one that takes an extra minute.
MAX_PAGES_PER_CITY = 40

SCHEMA_PATH = os.path.join(os.path.dirname(__file__), "schema.sql")


# ---------------------------------------------------------------------------
# Source definitions
# ---------------------------------------------------------------------------

CITIES: dict[str, dict[str, Any]] = {
    "chicago": {
        "label": "Chicago",
        "domain": "data.cityofchicago.org",
        "resource": "4ijn-s7e5",
        "date_field": "inspection_date",
        "shape": "long",
        "live": True,
    },
    "nyc": {
        "label": "New York City",
        "domain": "data.cityofnewyork.us",
        "resource": "43nn-pn8j",
        "date_field": "inspection_date",
        "shape": "narrow",
        "live": True,
    },
    "dallas": {
        "label": "Dallas",
        "domain": "www.dallasopendata.com",
        "resource": "dri5-wcct",
        "date_field": "insp_date",
        "shape": "wide",
        # Frozen since 2024-02-29. Loaded once, then a no-op forever.
        "live": False,
    },
}


def window_start() -> date:
    return date.today() - timedelta(days=WINDOW_MONTHS * 31)


# ---------------------------------------------------------------------------
# Extract
# ---------------------------------------------------------------------------


def fetch_pages(city_key: str, since: date) -> Iterator[list[dict[str, Any]]]:
    """Page through a Socrata resource, oldest first.

    Ascending order is what makes the run resumable. The caller advances the
    watermark after each page commits, so a job killed at page 30 of 40 resumes
    near where it stopped instead of re-reading everything. Descending order
    would leave the watermark meaningless until the very last page.
    """
    cfg = CITIES[city_key]
    url = f"https://{cfg['domain']}/resource/{cfg['resource']}.json"
    headers = {}
    token = os.environ.get("SOCRATA_APP_TOKEN")
    if token:
        headers["X-App-Token"] = token

    date_field = cfg["date_field"]
    for page in range(MAX_PAGES_PER_CITY):
        params = {
            "$limit": PAGE_SIZE,
            "$offset": page * PAGE_SIZE,
            "$order": f"{date_field} ASC",
            "$where": f"{date_field} >= '{since.isoformat()}'",
        }
        response = requests.get(url, params=params, headers=headers, timeout=90)
        response.raise_for_status()
        rows = response.json()
        if not rows:
            return
        yield rows
        if len(rows) < PAGE_SIZE:
            return


# ---------------------------------------------------------------------------
# Transform. One function per city, because wide-to-long, text parsing and
# pass-through share no logic. A single generic path would branch on city at
# every step, which is a monolith with extra indirection.
# ---------------------------------------------------------------------------

Violation = dict[str, Any]

# Chicago packs violations as:
#   "3. MANAGEMENT AND PERSONNEL - Comments: OBSERVED ... | 10. ..."
# The leading integer is the code, the text before " - Comments:" the
# description. Both parts are optional in practice, which is why this is a
# tolerant match rather than a strict one.
CHICAGO_VIOLATION = re.compile(r"^\s*(\d+)\.\s*(.*?)(?:\s*-\s*Comments:\s*(.*))?$", re.S)


def to_float(value: Any) -> float | None:
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def to_int(value: Any) -> int | None:
    try:
        return int(float(value))
    except (TypeError, ValueError):
        return None


def clean_zip(value: Any) -> str | None:
    """ZIPs arrive as floats in more than one of these feeds ("60614.0"), which
    is what the original project's profiling turned up too."""
    if value is None:
        return None
    text = str(value).strip()
    if not text:
        return None
    if text.endswith(".0"):
        text = text[:-2]
    text = re.sub(r"\D", "", text)
    return text.zfill(5)[:5] if text else None


def parse_date(value: Any) -> date | None:
    if not value:
        return None
    try:
        return datetime.fromisoformat(str(value).replace("Z", "+00:00")).date()
    except ValueError:
        return None


def transform_chicago(row: dict[str, Any]) -> tuple[list[Violation], str | None]:
    """PARSE. One inspection row, N violations inside one delimited string."""
    inspection_id = row.get("inspection_id")
    inspection_date = parse_date(row.get("inspection_date"))
    if not inspection_id or not inspection_date:
        return [], "missing inspection id or date"

    raw = (row.get("violations") or "").strip()
    base = {
        "city": "chicago",
        "inspection_id": str(inspection_id),
        "inspection_date": inspection_date,
        "result": row.get("results"),
        "score": None,
        "establishment": {
            "source_id": str(row.get("license_") or inspection_id),
            "name": row.get("dba_name") or row.get("aka_name"),
            "facility_type": row.get("facility_type"),
            "cuisine": None,
        },
        "location": {
            "zip": clean_zip(row.get("zip")),
            "latitude": to_float(row.get("latitude")),
            "longitude": to_float(row.get("longitude")),
        },
        # Chicago grades the establishment's risk, not the individual violation.
        "severity": row.get("risk"),
    }

    if not raw:
        # A clean inspection is a real outcome, not a reject. Recorded with a
        # sentinel violation so pass rates stay computable.
        return [
            {
                **base,
                "violation_seq": 0,
                "code": None,
                "description": "No violations cited",
                "critical": False,
            }
        ], None

    out: list[Violation] = []
    for seq, chunk in enumerate(raw.split("|"), start=1):
        chunk = chunk.strip()
        if not chunk:
            continue
        match = CHICAGO_VIOLATION.match(chunk)
        code = match.group(1) if match else None
        description = (match.group(2) if match else chunk) or chunk
        out.append(
            {
                **base,
                "violation_seq": seq,
                "code": code,
                "description": description.strip()[:400],
                "critical": None,
            }
        )
    return out, None


def transform_dallas(row: dict[str, Any]) -> tuple[list[Violation], str | None]:
    """UNPIVOT. Up to 25 numbered blocks melted into rows.

    Only populated blocks are emitted. Profiling the live feed shows block 1 at
    92% populated falling to 0.01% at block 25, so melting all 25 unconditionally
    would multiply the row count for columns that are almost entirely empty.
    """
    inspection_date = parse_date(row.get("insp_date"))
    program_id = row.get("program_identifier")
    if not inspection_date or not program_id:
        return [], "missing program identifier or date"

    # Dallas has no inspection id. Establishment plus date is the natural key,
    # and a same-day re-inspection would collide, so the score is folded in to
    # separate them. Imperfect, and better than dropping the row.
    inspection_id = f"{program_id}|{inspection_date.isoformat()}|{row.get('score') or 'na'}"

    base = {
        "city": "dallas",
        "inspection_id": inspection_id[:200],
        "inspection_date": inspection_date,
        "result": None,
        "score": to_int(row.get("score")),
        "establishment": {
            "source_id": str(program_id),
            "name": str(program_id),
            "facility_type": row.get("type"),
            "cuisine": None,
        },
        "location": {
            "zip": clean_zip(row.get("zip")),
            "latitude": None,
            "longitude": None,
        },
        "severity": None,
    }

    out: list[Violation] = []
    for block in range(1, 26):
        description = row.get(f"violation{block}_description")
        if not description or not str(description).strip():
            continue
        points = to_int(row.get(f"violation{block}_points"))
        out.append(
            {
                **base,
                "violation_seq": block,
                "code": str(block),
                "description": str(description).strip()[:400],
                # Dallas scores violations in deducted points rather than
                # labelling them. Treated as critical above a 3-point deduction,
                # which is the city's own threshold for a priority item.
                "critical": None if points is None else points >= 3,
                "severity": None if points is None else f"{points} points",
            }
        )

    if not out:
        out.append({**base, "violation_seq": 0, "code": None,
                    "description": "No violations cited", "critical": False})
    return out, None


def transform_nyc(row: dict[str, Any]) -> tuple[list[Violation], str | None]:
    """PASS THROUGH. Already one row per violation; the work is normalisation."""
    camis = row.get("camis")
    inspection_date = parse_date(row.get("inspection_date"))
    if not camis or not inspection_date:
        return [], "missing camis or date"

    # NYC uses 1900-01-01 as its sentinel for "never inspected". Those rows
    # carry no inspection and would otherwise sit in the fact table as real
    # events dated a century ago.
    if inspection_date.year < 1990:
        return [], "sentinel date 1900-01-01 (never inspected)"

    flag = (row.get("critical_flag") or "").strip().lower()
    critical = True if flag == "critical" else False if flag == "not critical" else None

    return [
        {
            "city": "nyc",
            "inspection_id": f"{camis}|{inspection_date.isoformat()}",
            "inspection_date": inspection_date,
            "violation_seq": 0,  # replaced by a sequence below
            "result": row.get("action"),
            "score": to_int(row.get("score")),
            "code": row.get("violation_code"),
            "description": (row.get("violation_description") or "No violations cited")[:400],
            "critical": critical,
            "severity": row.get("grade"),
            "establishment": {
                "source_id": str(camis),
                "name": row.get("dba"),
                "facility_type": row.get("inspection_type"),
                "cuisine": row.get("cuisine_description"),
            },
            "location": {
                "zip": clean_zip(row.get("zipcode")),
                "latitude": to_float(row.get("latitude")),
                "longitude": to_float(row.get("longitude")),
            },
        }
    ], None


TRANSFORMS = {
    "chicago": transform_chicago,
    "dallas": transform_dallas,
    "nyc": transform_nyc,
}


# ---------------------------------------------------------------------------
# Profile. Runs on the raw payload before transformation, because the point is
# to describe the source, not our cleaned view of it.
# ---------------------------------------------------------------------------

PROFILE_COLUMNS = {
    "chicago": ["dba_name", "facility_type", "risk", "results", "violations",
                "zip", "latitude", "inspection_type"],
    "dallas": ["program_identifier", "type", "score", "zip",
               "violation1_description", "violation5_description",
               "violation10_description", "violation17_description",
               "violation25_description"],
    "nyc": ["dba", "cuisine_description", "violation_code", "critical_flag",
            "score", "grade", "zipcode", "latitude"],
}


def profile(city_key: str, rows: list[dict[str, Any]]) -> list[tuple[str, int, int, float]]:
    total = len(rows)
    if total == 0:
        return []
    out = []
    for column in PROFILE_COLUMNS[city_key]:
        populated = sum(
            1 for r in rows if r.get(column) not in (None, "") and str(r.get(column)).strip()
        )
        out.append((column, populated, total, round(100 * (total - populated) / total, 2)))
    return out


# ---------------------------------------------------------------------------
# Load
# ---------------------------------------------------------------------------


def connect() -> psycopg.Connection:
    url = os.environ.get("DATABASE_URL_DIRECT") or os.environ.get("DATABASE_URL")
    if not url:
        raise SystemExit(
            "DATABASE_URL_DIRECT (or DATABASE_URL) is not set. "
            "Copy web/.env.example to web/.env.local and fill it in."
        )
    # The direct endpoint, not the pooler: this job runs multi-statement
    # transactions and bulk upserts, which a transaction pooler handles badly.
    return psycopg.connect(url, row_factory=dict_row, autocommit=False)


def ensure_schema(conn: psycopg.Connection) -> None:
    with open(SCHEMA_PATH, encoding="utf-8") as handle:
        conn.execute(handle.read())
    conn.commit()


def upsert_dimension(cur, table: str, key_col: str, natural_key: str,
                     columns: dict[str, Any], cache: dict[str, int]) -> int:
    if natural_key in cache:
        return cache[natural_key]
    names = ", ".join(["natural_key", *columns.keys()])
    placeholders = ", ".join(["%s"] * (1 + len(columns)))
    cur.execute(
        f"""
        insert into {table} ({names}) values ({placeholders})
        on conflict (natural_key) do update set natural_key = excluded.natural_key
        returning {key_col}
        """,
        [natural_key, *columns.values()],
    )
    key = cur.fetchone()[key_col]
    cache[natural_key] = key
    return key


def ensure_dates(cur, dates: Iterable[date]) -> None:
    rows = [
        (d, d.year, d.month, d.day, d.isoweekday(), d.strftime("%B"))
        for d in sorted(set(dates))
    ]
    if not rows:
        return
    cur.executemany(
        """
        insert into dim_date (date_key, year, month, day, weekday, month_name)
        values (%s, %s, %s, %s, %s, %s)
        on conflict (date_key) do nothing
        """,
        rows,
    )


def load_violations(cur, violations: list[Violation], job_id: str,
                    caches: dict[str, dict[str, int]]) -> int:
    ensure_dates(cur, (v["inspection_date"] for v in violations))

    payload = []
    for v in violations:
        est = v["establishment"]
        loc = v["location"]
        est_key = upsert_dimension(
            cur, "dim_establishment", "establishment_key",
            f"{v['city']}|{est['source_id']}",
            {"city": v["city"], "source_id": est["source_id"], "name": est["name"],
             "facility_type": est["facility_type"], "cuisine": est["cuisine"]},
            caches["establishment"],
        )
        loc_key = upsert_dimension(
            cur, "dim_location", "location_key",
            f"{v['city']}|{loc['zip']}|{loc['latitude']}|{loc['longitude']}",
            {"city": v["city"], "zip": loc["zip"],
             "latitude": loc["latitude"], "longitude": loc["longitude"]},
            caches["location"],
        )
        viol_key = upsert_dimension(
            cur, "dim_violation", "violation_key",
            f"{v['city']}|{v['code']}|{(v['description'] or '')[:120]}",
            {"city": v["city"], "code": v["code"],
             "description": v["description"], "severity": v.get("severity")},
            caches["violation"],
        )
        payload.append((
            v["city"], v["inspection_id"], v["violation_seq"],
            est_key, loc_key, viol_key, v["inspection_date"], v["inspection_date"],
            v.get("result"), v.get("score"), v.get("critical"),
            v["city"], job_id,
        ))

    cur.executemany(
        """
        insert into fact_inspection_violations
          (city, inspection_id, violation_seq, establishment_key, location_key,
           violation_key, date_key, inspection_date, result, score, critical,
           source, job_id)
        values (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        on conflict (city, inspection_id, violation_seq) do update set
          result = excluded.result,
          score = excluded.score,
          critical = excluded.critical,
          job_id = excluded.job_id,
          load_dt = now()
        """,
        payload,
    )
    return len(payload)


def prune(cur, job_id: str) -> int:
    """Drop anything outside the rolling window. This is what keeps the free
    tier viable indefinitely rather than for the first few months."""
    cur.execute(
        "delete from fact_inspection_violations where inspection_date < %s",
        (window_start(),),
    )
    removed = cur.rowcount or 0
    # Keep the last 60 runs of observability data; the panel shows far fewer.
    cur.execute(
        """
        delete from pipeline_runs
        where job_id in (
          select job_id from pipeline_runs order by started_at desc offset 60
        )
        """
    )
    return removed


# ---------------------------------------------------------------------------
# Orchestration
# ---------------------------------------------------------------------------


def run() -> int:
    job_id = str(uuid.uuid4())
    started = datetime.now(timezone.utc)
    clock = time.monotonic()

    fetched = accepted = rejected = pruned = 0
    rejects: dict[tuple[str, str], int] = Counter()
    stage_counts: dict[tuple[str, str], int] = defaultdict(int)
    profiles: list[tuple[str, str, int, int, float]] = []

    conn = connect()
    try:
        ensure_schema(conn)
        with conn.cursor() as cur:
            cur.execute(
                """
                insert into pipeline_runs (job_id, started_at, status)
                values (%s, %s, 'running')
                """,
                (job_id, started),
            )
        conn.commit()

        # Any run still marked `running` from a previous invocation was killed
        # rather than finished. Retire it, or the panel reports a job in flight
        # forever and a genuine failure is indistinguishable from a stale row.
        with conn.cursor() as cur:
            cur.execute(
                """
                update pipeline_runs set status = 'failed', finished_at = now(),
                  error = 'abandoned: no completion recorded'
                where status = 'running' and job_id <> %s
                  and started_at < now() - interval '2 hours'
                """,
                (job_id,),
            )
        conn.commit()

        caches = {"establishment": {}, "location": {}, "violation": {}}

        with conn.cursor() as cur:
            cur.execute("select city, last_seen_at from ingest_watermark")
            watermarks = {r["city"]: r["last_seen_at"] for r in cur.fetchall()}

        for city_key, cfg in CITIES.items():
            # Resume from the watermark when one exists and still falls inside
            # the window. Re-reading the final day is deliberate: Socrata can
            # amend same-day records, and the fact table upserts, so overlap is
            # cheap and a gap is not.
            mark = watermarks.get(city_key)
            # Rewind a week before the watermark. Socrata amends recent records
            # after first publication, so resuming exactly at the high-water
            # mark silently misses late edits. The fact table upserts, so the
            # overlap costs a little time and nothing else.
            since = (
                max(mark - timedelta(days=7), window_start()) if mark else window_start()
            )

            print(f"[{city_key}] fetching from {since} ...", flush=True)
            city_rows = 0
            city_violations = 0

            for page in fetch_pages(city_key, since):
                fetched += len(page)
                city_rows += len(page)
                stage_counts[(city_key, "bronze")] += len(page)

                if not any(p[1] == city_key for p in profiles):
                    for column, populated, total, null_pct in profile(city_key, page):
                        profiles.append((city_key, column, populated, total, null_pct))

                batch: list[Violation] = []
                for row in page:
                    violations, reason = TRANSFORMS[city_key](row)
                    if reason:
                        rejected += 1
                        rejects[(city_key, reason)] += 1
                        continue
                    batch.extend(violations)

                # NYC arrives at violation grain already but without a sequence,
                # so several violations from one inspection would collide on the
                # unique key. Number them within the batch.
                if city_key == "nyc":
                    seen: Counter[str] = Counter()
                    for v in batch:
                        seen[v["inspection_id"]] += 1
                        v["violation_seq"] = seen[v["inspection_id"]]

                stage_counts[(city_key, "silver")] += len(batch)
                with conn.cursor() as cur:
                    written = load_violations(cur, batch, job_id, caches)
                conn.commit()
                accepted += written
                city_violations += written
                stage_counts[(city_key, "gold")] += written

                # Advance the watermark per page, not per city. This is the
                # difference between a killed run costing one page and costing
                # the whole city.
                page_max = max((v["inspection_date"] for v in batch), default=None)
                if page_max:
                    with conn.cursor() as cur:
                        cur.execute(
                            """
                            insert into ingest_watermark (city, last_seen_at, updated_at)
                            values (%s, %s, now())
                            on conflict (city) do update
                              set last_seen_at = greatest(
                                    ingest_watermark.last_seen_at, excluded.last_seen_at),
                                  updated_at = now()
                            """,
                            (city_key, page_max),
                        )
                    conn.commit()

                print(f"[{city_key}] +{written} violations "
                      f"({city_rows} source rows so far)", flush=True)

            print(f"[{city_key}] done: {city_rows} rows -> {city_violations} violations",
                  flush=True)

            # No end-of-city watermark write. It previously stamped date.today()
            # for live cities, which pushed the mark past every real inspection
            # date and made the next run fetch nothing at all. The watermark is
            # the max inspection_date actually loaded, advanced per page above,
            # and nothing else.

        with conn.cursor() as cur:
            pruned = prune(cur, job_id)
            cur.executemany(
                "insert into pipeline_stage_counts (job_id, city, stage, rows) "
                "values (%s,%s,%s,%s) on conflict do nothing",
                [(job_id, c, s, n) for (c, s), n in stage_counts.items()],
            )
            cur.executemany(
                "insert into pipeline_rejects (job_id, city, reason, rows) "
                "values (%s,%s,%s,%s) on conflict do nothing",
                [(job_id, c, r, n) for (c, r), n in rejects.items()],
            )
            cur.executemany(
                "insert into pipeline_profile "
                "(job_id, city, column_name, populated, total, null_pct) "
                "values (%s,%s,%s,%s,%s,%s) on conflict do nothing",
                [(job_id, c, col, p, t, n) for c, col, p, t, n in profiles],
            )
            cur.execute(
                """
                update pipeline_runs set
                  finished_at = now(), status = 'success',
                  rows_fetched = %s, rows_accepted = %s,
                  rows_rejected = %s, rows_pruned = %s, duration_ms = %s
                where job_id = %s
                """,
                (fetched, accepted, rejected, pruned,
                 int((time.monotonic() - clock) * 1000), job_id),
            )
        conn.commit()

        print(f"\nOK  fetched={fetched} accepted={accepted} "
              f"rejected={rejected} pruned={pruned} "
              f"in {time.monotonic() - clock:.1f}s")
        return 0

    except Exception as exc:  # noqa: BLE001 - the failure must be recorded
        conn.rollback()
        with conn.cursor() as cur:
            cur.execute(
                """
                update pipeline_runs set finished_at = now(), status = 'failed',
                  error = %s, duration_ms = %s
                where job_id = %s
                """,
                (f"{type(exc).__name__}: {exc}"[:500],
                 int((time.monotonic() - clock) * 1000), job_id),
            )
        conn.commit()
        print(f"FAILED {type(exc).__name__}: {exc}", file=sys.stderr)
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    sys.exit(run())
