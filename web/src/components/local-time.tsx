"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Live clock in the site owner's timezone.
 *
 * A clock is an external mutable source, so `useSyncExternalStore` is the
 * right primitive rather than an effect that calls setState on mount. It also
 * gives a first-class server snapshot: rendering a time on the server and
 * hydrating it on the client is a guaranteed mismatch, since the two run in
 * different timezones and time passes in between. Returning null on the
 * server makes the client-only nature explicit instead of papering over a
 * hydration warning.
 *
 * The snapshot formats to minute precision, so repeated calls within the same
 * minute return an identical string and React's Object.is check sees no
 * change. That is what keeps this from re-rendering on every tick.
 */
export function LocalTime({
  timeZone = "America/New_York",
}: {
  timeZone?: string;
}) {
  const subscribe = useCallback((onStoreChange: () => void) => {
    const id = setInterval(onStoreChange, 30_000);
    return () => clearInterval(id);
  }, []);

  const getSnapshot = useCallback(
    () =>
      new Intl.DateTimeFormat("en-US", {
        timeZone,
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).format(new Date()),
    [timeZone],
  );

  const getServerSnapshot = useCallback(() => null, []);

  const time = useSyncExternalStore<string | null>(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  return (
    <span className="font-mono tabular-nums">
      {/* Reserved width so the row does not shift when the value arrives */}
      {time ?? <span className="inline-block w-[4.5rem]" aria-hidden="true" />}
    </span>
  );
}
