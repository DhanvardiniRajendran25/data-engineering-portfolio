"""Scheduled ingestion job for the Phase 5 live data-engineering demo.

Placeholder pipeline: proves the mechanism (cron trigger, DB connection,
run-logging) end to end without committing to a dataset yet. See the
"Open questions" section in docs/MIGRATION_PLAN.md for the dataset choice
that will replace the TODOs below.
"""

import os
import sys
from datetime import datetime, timezone

import psycopg
from dotenv import load_dotenv

load_dotenv()


def get_connection() -> psycopg.Connection:
    database_url = os.environ.get("DATABASE_URL")
    if not database_url:
        raise RuntimeError(
            "DATABASE_URL is not set. Copy pipeline/.env.example to "
            "pipeline/.env and fill in a Neon connection string."
        )
    return psycopg.connect(database_url)


def run() -> None:
    # TODO(phase-5): replace with a real fetch from the chosen public dataset.
    source = "placeholder"
    record_count = 0

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                insert into pipeline_runs (source, record_count, ran_at)
                values (%s, %s, %s)
                """,
                (source, record_count, datetime.now(timezone.utc)),
            )
        conn.commit()

    print(f"Logged pipeline run: source={source} record_count={record_count}")


if __name__ == "__main__":
    try:
        run()
    except Exception as exc:  # noqa: BLE001 - top-level job entrypoint
        print(f"Pipeline run failed: {exc}", file=sys.stderr)
        sys.exit(1)
