import Link from "next/link";

export default function NotFound() {
  return (
    <div className="shell-content section-y">
      <p className="font-mono text-xs tracking-[0.18em] text-accent uppercase">
        404
      </p>
      <h1 className="mt-4 text-4xl sm:text-5xl">This page does not exist</h1>
      <p className="mt-5 max-w-measure text-lg text-ink-soft">
        The link may be out of date, or the page may have moved during the site
        rebuild. The work index is the best place to pick things back up.
      </p>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/work"
          className="rounded-full border border-ink px-6 py-3 font-mono text-[11px] tracking-[0.14em] text-ink uppercase transition-colors hover:bg-ink hover:text-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          View work
        </Link>
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
