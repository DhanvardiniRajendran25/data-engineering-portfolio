const STATS = [
  { value: "8+", label: "Pipelines & systems shipped" },
  { value: "5B+", label: "Records processed" },
  { value: "3+", label: "Cloud platforms" },
  { value: "10+", label: "Engineering tools mastered" },
  { value: "3+", label: "Years of engineering experience" },
  { value: "70+", label: "Students taught" },
];

export function Impact() {
  return (
    <section aria-label="Impact by the numbers" className="border-t border-line">
      <div className="mx-auto grid max-w-page grid-cols-2 gap-8 px-gutter py-16 sm:grid-cols-3 md:grid-cols-6">
        {STATS.map((stat) => (
          <div key={stat.label} className="text-center sm:text-left">
            <p className="font-display text-4xl text-ink">{stat.value}</p>
            <p className="mt-1 text-sm text-ink-soft">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
