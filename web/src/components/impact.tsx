import {
  ClockIcon,
  CloudIcon,
  DatabaseIcon,
  GraduationCapIcon,
  LayersIcon,
  ToolIcon,
} from "./icons";

const STATS = [
  {
    value: "8+",
    label: "Pipelines & systems shipped",
    Icon: LayersIcon,
  },
  {
    value: "5B+",
    label: "Records processed",
    Icon: DatabaseIcon,
  },
  {
    value: "3+",
    label: "Cloud platforms",
    Icon: CloudIcon,
  },
  {
    value: "10+",
    label: "Engineering tools mastered",
    Icon: ToolIcon,
  },
  {
    value: "3+",
    label: "Years of engineering experience",
    Icon: ClockIcon,
  },
  {
    value: "70+",
    label: "Students taught",
    Icon: GraduationCapIcon,
  },
];

export function Impact() {
  return (
    <section aria-label="Impact by the numbers" className="relative border-t border-line py-16">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,var(--accent-soft),transparent_55%)]"
      />
      <div className="mx-auto grid max-w-page grid-cols-2 gap-4 px-gutter sm:grid-cols-3 md:grid-cols-6">
        {STATS.map(({ value, label, Icon }) => (
          <div
            key={label}
            className="group rounded-brand border border-line bg-bg-elev p-5 shadow-brand transition-transform duration-300 hover:-translate-y-1"
          >
            <div className="grid h-9 w-9 place-items-center rounded-full bg-accent-soft text-accent">
              <Icon className="h-[18px] w-[18px]" />
            </div>
            <p className="mt-4 font-display text-3xl font-bold text-ink">
              {value}
            </p>
            <p className="mt-1 text-sm text-ink-soft">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
