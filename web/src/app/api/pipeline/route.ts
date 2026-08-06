import { readSnapshot } from "@/lib/pipeline-db";

/**
 * Public read of the live food inspection pipeline.
 *
 * Deliberately parameterless. The panel needs one fixed payload, so the route
 * accepts no query string, no body and no headers of consequence. There is
 * nothing to whitelist because there is nothing to pass through: the strongest
 * version of "never take SQL from the client" is to take nothing at all.
 *
 * Revalidated rather than live. Neon's free tier has a connection ceiling and
 * scales to zero when idle, so a burst of traffic must not become a burst of
 * connections. Five minutes is well inside the pipeline's own cadence, which
 * means the cache never shows data older than the source anyway.
 *
 * Kept public because the point of the panel is that it is inspectable. Anyone
 * can read this and check the numbers on the page against it.
 */
export const revalidate = 300;

export async function GET() {
  const snapshot = await readSnapshot();

  // 200 even when unavailable. The client renders a degraded state from the
  // body; a 5xx here would show up as a console error on a page that is
  // otherwise working perfectly.
  return Response.json(snapshot, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=900",
    },
  });
}
