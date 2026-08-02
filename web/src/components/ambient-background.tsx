export function AmbientBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="light-beam light-beam-1 beam-sweep-a" />
      <div className="light-beam light-beam-2 beam-sweep-b" />
    </div>
  );
}
