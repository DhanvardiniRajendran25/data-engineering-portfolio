/**
 * Route-level loading fallback.
 *
 * Every page is statically prerendered today, so this rarely shows. It exists
 * so that when a route does become dynamic (the Phase 5 live pipeline panel
 * reads from Postgres), navigation shows structure rather than a blank frame.
 *
 * Deliberately a static skeleton, not a spinner: it reserves the same shape
 * the real content occupies, so there is no layout shift when it swaps in.
 * `animate-pulse` is a motion-safe variant, so it stays still for visitors who
 * asked for reduced motion.
 */
export default function Loading() {
  return (
    <div className="shell-content section-y" aria-busy="true">
      {/* Screen readers get a clear status; the bars below are decorative. */}
      <p className="sr-only" role="status">
        Loading
      </p>

      <div aria-hidden="true" className="motion-safe:animate-pulse">
        <div className="h-3 w-40 rounded-full bg-ink/[0.07]" />
        <div className="mt-6 h-12 w-2/3 rounded-brand-sm bg-ink/[0.07] sm:h-16" />
        <div className="mt-8 space-y-3">
          <div className="h-4 w-full rounded-full bg-ink/[0.05]" />
          <div className="h-4 w-11/12 rounded-full bg-ink/[0.05]" />
          <div className="h-4 w-4/5 rounded-full bg-ink/[0.05]" />
        </div>
        <div className="mt-12 h-64 w-full rounded-brand bg-ink/[0.05]" />
      </div>
    </div>
  );
}
