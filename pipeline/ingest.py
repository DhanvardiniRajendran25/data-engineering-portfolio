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

# Arbitrary but fixed. Any concurrent ingestion must use the same number for the
# lock to mean anything.
ADVISORY_LOCK = 831147


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
        "frozen_end": date(2024, 2, 29),
    },
}


def window_start() -> date:
    """Rolling window for cities that are still publishing."""
    return date.today() - timedelta(days=WINDOW_MONTHS * 31)


def city_window_start(city_key: str) -> date:
    """Window start for one city.

    A single global rolling window silently erased Dallas. Its last inspection
    is 2024-02-29 and the 24-month window now begins 2024-07-23, so every Dallas
    row fell outside it: the fetch returned nothing and the prune would have
    deleted the lane even if it had loaded. A frozen source is anchored to its
    own final date instead, so it keeps its last 24 months permanently.
    """
    cfg = CITIES[city_key]
    if cfg["live"]:
        return window_start()
    return cfg["frozen_end"] - timedelta(days=WINDOW_MONTHS * 31)


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


def clean_coords(lat: Any, lon: Any) -> dict[str, float | None]:
    """Reject placeholder coordinates.

    NYC publishes 0,0 for records it has not geocoded. Kept as-is, a single one
    of those stretches a map's extent from the equator to Manhattan and collapses
    every real point into one corner, which is exactly what happened.

    The envelope is deliberately generous rather than per-city: a bounds check
    tight enough to be interesting is a bounds check that silently drops a
    legitimately relocated establishment.
    """
    lat_f, lon_f = to_float(lat), to_float(lon)
    if lat_f is None or lon_f is None:
        return {"latitude": None, "longitude": None}
    # Null island. Not a restaurant in the Gulf of Guinea.
    if abs(lat_f) < 0.01 and abs(lon_f) < 0.01:
        return {"latitude": None, "longitude": None}
    if not (18 <= lat_f <= 72) or not (-180 <= lon_f <= -66):
        return {"latitude": None, "longitude": None}
    return {"latitude": lat_f, "longitude": lon_f}


def dallas_coords(raw: Any) -> dict[str, float | None]:
    """Pull latitude and longitude out of Dallas's nested lat_long field.

    Socrata returns it as a dict when the column is a location type, but it
    arrives as a stringified dict often enough that both are handled. Anything
    unparseable yields nulls rather than raising: a missing coordinate is a
    normal gap, not a reason to reject an inspection.
    """
    if not raw:
        return {"latitude": None, "longitude": None}

    if isinstance(raw, dict):
        lat, lon = raw.get("latitude"), raw.get("longitude")
    else:
        text = str(raw)
        lat_match = re.search(r"'latitude':\s*'([-\d.]+)'", text)
        lon_match = re.search(r"'longitude':\s*'([-\d.]+)'", text)
        lat = lat_match.group(1) if lat_match else None
        lon = lon_match.group(1) if lon_match else None

    return clean_coords(lat, lon)


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
            **clean_coords(row.get("latitude"), row.get("longitude")),
        },
        # Chicago grades the establishment's risk, not the individual violation.
        "severity": row.get("risk"),
    }

    if not raw:
        # A clean inspection is a real outcome, not a reject. Recorded with a
        # sentinel violation so pass rates stay computable.
        # critical stays None, not False. Chicago does not grade individual
        # violations at all, so a False here is not "this was not critical", it
        # is a guess. It also made the dashboard report Chicago as 0.0% critical
        # rather than correctly saying the source does not grade them.
        return [
            {
                **base,
                "violation_seq": 0,
                "code": None,
                "description": "No violations cited",
                "critical": None,
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
            # Dallas nests coordinates inside a lat_long object alongside a
            # human_address blob, rather than publishing plain columns the way
            # Chicago and NYC do. These were being dropped, which quietly cost
            # the whole city its place on any map.
            **dallas_coords(row.get("lat_long")),
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
                    "description": "No violations cited", "critical": None})
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
                **clean_coords(row.get("latitude"), row.get("longitude")),
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
    # All 25 blocks, so the sparsity profile is a curve rather than five points.
    # The falloff from 92% to 0.01% is the finding; a handful of samples of it
    # cannot show a shape.
    "dallas": ["program_identifier", "type", "score", "zip", "lat_long",
               *[f"violation{i}_description" for i in range(1, 26)]],
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
    """Get-or-create a dimension row.

    DO NOTHING then SELECT, rather than DO UPDATE. The previous version used a
    no-op `do update set natural_key = excluded.natural_key` purely to make
    RETURNING fire on conflict, which takes a row-level write lock on every
    existing dimension row it touches. Two overlapping runs then deadlocked on
    dim_establishment, each holding rows the other wanted.

    DO NOTHING takes no write lock when the row already exists, so the common
    case (an establishment seen a thousand times) is now a cheap read.
    """
    if natural_key in cache:
        return cache[natural_key]

    names = ", ".join(["natural_key", *columns.keys()])
    placeholders = ", ".join(["%s"] * (1 + len(columns)))
    cur.execute(
        f"""
        insert into {table} ({names}) values ({placeholders})
        on conflict (natural_key) do nothing
        returning {key_col}
        """,
        [natural_key, *columns.values()],
    )
    row = cur.fetchone()
    if row is None:
        # Already present, inserted by an earlier batch or an earlier run.
        cur.execute(
            f"select {key_col} from {table} where natural_key = %s", (natural_key,)
        )
        row = cur.fetchone()

    key = row[key_col]
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
          -- Dimension keys are re-pointed too. Without this, enriching a
          -- dimension leaves every existing fact row aimed at the old version
          -- of it: adding coordinates to Dallas created new dim_location rows
          -- that nothing referenced.
          establishment_key = excluded.establishment_key,
          location_key = excluded.location_key,
          violation_key = excluded.violation_key,
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
    """Drop anything outside each city's own window.

    Per city, not global. A single global cutoff would delete the entire Dallas
    lane on the run that loaded it, because its newest row predates the rolling
    window that the two live cities sit inside.
    """
    removed = 0
    for city_key in CITIES:
        cur.execute(
            "delete from fact_inspection_violations "
            "where city = %s and inspection_date < %s",
            (city_key, city_window_start(city_key)),
        )
        removed += cur.rowcount or 0
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

        # Exactly one ingestion at a time, enforced by the database rather than
        # by whoever is starting jobs. The workflow has a concurrency group, but
        # that does not stop a local run overlapping a scheduled one, which is
        # how two processes ended up deadlocking on dim_establishment. An
        # advisory lock is held for the session and released automatically if
        # the process dies, so a crash cannot leave it stuck.
        with conn.cursor() as cur:
            cur.execute("select pg_try_advisory_lock(%s) as got", (ADVISORY_LOCK,))
            if not cur.fetchone()["got"]:
                print("another ingestion holds the lock; exiting without work.")
                return 0
        conn.commit()
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
            floor = city_window_start(city_key)
            mark = watermarks.get(city_key)
            # Rewind a week before the watermark. Socrata amends recent records
            # after first publication, so resuming exactly at the high-water
            # mark silently misses late edits. The fact table upserts, so the
            # overlap costs a little time and nothing else.
            since = max(mark - timedelta(days=7), floor) if mark else floor

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
