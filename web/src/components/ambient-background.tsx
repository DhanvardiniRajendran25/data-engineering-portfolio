export function AmbientBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="ambient-blob ambient-blob-a absolute -top-24 -left-24 h-[520px] w-[520px] bg-ink/[0.1]" />
      <div className="ambient-blob ambient-blob-b absolute top-1/3 -right-32 h-[460px] w-[460px] bg-ink/[0.08]" />
      <div className="ambient-blob ambient-blob-c absolute bottom-0 left-1/4 h-[400px] w-[400px] bg-ink/[0.06]" />
    </div>
  );
}
