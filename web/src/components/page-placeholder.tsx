export function PagePlaceholder({
  title,
  phase,
}: {
  title: string;
  phase: string;
}) {
  return (
    <div className="mx-auto max-w-page px-gutter py-16 sm:py-20 lg:py-24">
      <p className="text-sm font-medium tracking-wide text-accent uppercase">
        Scaffolding
      </p>
      <h1 className="mt-3 text-3xl sm:text-4xl">{title}</h1>
      <p className="mt-4 max-w-prose text-ink-soft">
        This route exists so the site navigation is fully wired end to end.
        Real content for this page lands in {phase} of the migration.
      </p>
    </div>
  );
}
