import { NextResponse } from "next/server";

/**
 * Sink for Core Web Vitals beacons from the client.
 *
 * Intentionally minimal: it validates shape, logs, and returns 204. There is
 * no datastore or analytics vendor behind it yet, so persisting would imply a
 * durability guarantee that does not exist. Structured single-line logs are
 * greppable in platform logs today and are the natural place to forward to a
 * real sink later.
 *
 * Payloads arrive via `navigator.sendBeacon`, which ignores the response, so
 * this must never throw back at the client.
 */

type Payload = {
  name?: unknown;
  value?: unknown;
  rating?: unknown;
  path?: unknown;
};

export async function POST(request: Request) {
  try {
    const body: Payload = await request.json();

    // Beacons are unauthenticated and public, so treat input as untrusted.
    const name = typeof body.name === "string" ? body.name.slice(0, 24) : null;
    const value = typeof body.value === "number" ? body.value : null;
    if (!name || value === null || !Number.isFinite(value)) {
      return new NextResponse(null, { status: 204 });
    }

    console.info(
      JSON.stringify({
        type: "web-vital",
        name,
        value: Math.round(value),
        rating: typeof body.rating === "string" ? body.rating.slice(0, 16) : null,
        path: typeof body.path === "string" ? body.path.slice(0, 128) : null,
      }),
    );
  } catch {
    // Malformed body is not worth surfacing; the beacon cannot react anyway.
  }

  // 204 keeps the response body empty, which is all sendBeacon needs.
  return new NextResponse(null, { status: 204 });
}
