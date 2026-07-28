export function AmbientBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="ambient-blob ambient-blob-a absolute -top-32 -left-20 h-[420px] w-[420px] bg-ink/[0.04]" />
      <div className="ambient-blob ambient-blob-b absolute top-1/3 -right-24 h-[380px] w-[380px] bg-ink/[0.035]" />
    </div>
  );
}
