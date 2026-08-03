"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import Link from "next/link";

/**
 * Route-level error boundary.
 *
 * Note the prop is `unstable_retry` in this Next.js version, not the `reset`
 * name used previously.
 */
export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    // No error reporting service is wired up yet. Logging keeps the digest
    // visible so a production failure can still be traced from the console.
    console.error(error);
  }, [error]);

  return (
    <div className="shell-content section-y">
      <p className="font-mono text-xs tracking-[0.18em] text-accent uppercase">
        Error
      </p>
      <h1 className="mt-4 text-4xl sm:text-5xl">Something went wrong</h1>
      <p className="mt-5 max-w-measure text-lg text-ink-soft">
        This page failed to render. Retrying often clears it. If it keeps
        happening, the other pages are unaffected.
      </p>

      {error.digest && (
        <p className="mt-4 font-mono text-xs text-ink-faint">
          Reference: {error.digest}
        </p>
      )}

      <div className="mt-10 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => unstable_retry()}
          className="rounded-full border border-ink px-6 py-3 font-mono text-[11px] tracking-[0.14em] text-ink uppercase transition-colors hover:bg-ink hover:text-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-full border border-line px-6 py-3 font-mono text-[11px] tracking-[0.14em] text-ink-soft uppercase transition-colors hover:border-ink hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
