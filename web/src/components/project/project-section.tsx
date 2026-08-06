/**
 * Shared section wrapper for the project deep dives.
 *
 * Extracted because five deep dives had each declared an identical local
 * `Section`. One definition means the heading rule, kicker placement and the
 * shell/shell-content width choice stay consistent across every project page,
 * and a change to that rhythm happens once.
 */
export function ProjectSection({
  id,
  label,
  kicker,
  children,
  wide = false,
}: {
  id: string;
  label: string;
  /** A fragment, not a sentence. Sits at the end of the heading rule. */
  kicker?: string;
  children: React.ReactNode;
  /** Full 1600px rail instead of the narrower reading column. */
  wide?: boolean;
}) {
  return (
    <section
      id={id}
      className={`${wide ? "shell" : "shell-content"} scroll-mt-28 pt-20 lg:pt-28`}
    >
      <div className="flex items-baseline gap-4 sm:gap-6">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl">{label}</h2>
        <span aria-hidden="true" className="h-px flex-1 bg-line" />
        {kicker && (
          <span className="font-mono text-[10px] tracking-[0.14em] text-ink-faint uppercase">
            {kicker}
          </span>
        )}
      </div>
      <div className="mt-8 lg:mt-10">{children}</div>
    </section>
  );
}
