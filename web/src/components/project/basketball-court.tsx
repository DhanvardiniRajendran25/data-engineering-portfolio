/**
 * The simulator's court, drawn to match the application.
 *
 * A full half-court-mirrored layout rather than a plain rectangle: boundary,
 * centre line and circle, both keys with free-throw circles, both three-point
 * arcs, and both hoops. The ball marker is positioned from data, so the court
 * reflects possession instead of being decoration.
 *
 * Deliberately not theme-following. The court is navy in the real app, and it
 * sits inside the console's own fixed dark surface, so it keeps that palette in
 * both site themes.
 */

export type BallPosition = { x: number; y: number };

const W = 400;
const H = 250;
const PAD = 14;

const COURT = "#161d33";
const LINE = "rgba(226, 232, 240, 0.30)";
const LINE_SOFT = "rgba(226, 232, 240, 0.16)";

export function BasketballCourt({
  ball,
  label,
}: {
  ball: BallPosition;
  label: string;
}) {
  const left = PAD;
  const right = W - PAD;
  const top = PAD;
  const bottom = H - PAD;
  const midX = W / 2;
  const midY = H / 2;

  // Key (paint) box, mirrored at each end.
  const keyH = 76;
  const keyW = 54;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={label}
      className="h-auto w-full"
    >
      {/* Floor */}
      <rect x="0" y="0" width={W} height={H} rx="6" fill={COURT} />

      {/* Boundary */}
      <rect
        x={left}
        y={top}
        width={right - left}
        height={bottom - top}
        fill="none"
        stroke={LINE}
        strokeWidth="1.4"
      />

      {/* Centre line and circle */}
      <line x1={midX} y1={top} x2={midX} y2={bottom} stroke={LINE} strokeWidth="1.4" />
      <circle cx={midX} cy={midY} r="26" fill="none" stroke={LINE} strokeWidth="1.4" />
      <circle cx={midX} cy={midY} r="4" fill={LINE_SOFT} />

      {/* Left end */}
      <rect
        x={left}
        y={midY - keyH / 2}
        width={keyW}
        height={keyH}
        fill="none"
        stroke={LINE}
        strokeWidth="1.3"
      />
      <circle cx={left + keyW} cy={midY} r="19" fill="none" stroke={LINE} strokeWidth="1.3" />
      {/* Three-point arc: bulges toward centre court */}
      <path
        d={`M ${left} ${top + 26} A 92 92 0 0 1 ${left} ${bottom - 26}`}
        fill="none"
        stroke={LINE}
        strokeWidth="1.3"
      />
      <line x1={left + 5} y1={midY - 10} x2={left + 5} y2={midY + 10} stroke={LINE} strokeWidth="2" />
      <circle cx={left + 11} cy={midY} r="5.5" fill="none" stroke={LINE} strokeWidth="1.5" />

      {/* Right end, mirrored */}
      <rect
        x={right - keyW}
        y={midY - keyH / 2}
        width={keyW}
        height={keyH}
        fill="none"
        stroke={LINE}
        strokeWidth="1.3"
      />
      <circle cx={right - keyW} cy={midY} r="19" fill="none" stroke={LINE} strokeWidth="1.3" />
      <path
        d={`M ${right} ${top + 26} A 92 92 0 0 0 ${right} ${bottom - 26}`}
        fill="none"
        stroke={LINE}
        strokeWidth="1.3"
      />
      <line x1={right - 5} y1={midY - 10} x2={right - 5} y2={midY + 10} stroke={LINE} strokeWidth="2" />
      <circle cx={right - 11} cy={midY} r="5.5" fill="none" stroke={LINE} strokeWidth="1.5" />

      {/* Ball. Transitions between positions, and stops moving under
          prefers-reduced-motion via the motion-reduce utility. */}
      <g
        className="transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
        style={{ transform: `translate(${ball.x - midX}px, ${ball.y - midY}px)` }}
      >
        <circle cx={midX} cy={midY} r="11" fill="#ef7360" opacity="0.18" />
        <circle cx={midX} cy={midY} r="6.5" fill="#ef7360" />
        <path
          d={`M ${midX - 6.5} ${midY} h 13 M ${midX} ${midY - 6.5} v 13`}
          stroke="#8a2f22"
          strokeWidth="0.9"
        />
      </g>
    </svg>
  );
}
