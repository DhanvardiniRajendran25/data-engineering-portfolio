/**
 * A table whose rows carry a proportional bar.
 *
 * Used instead of a bar chart where the range is extreme. The graph nodes span
 * 84,260 down to 25, a ratio of about 3,370 to 1: on a shared linear scale the
 * bottom four categories render as nothing at all, and a log scale would
 * misrepresent the very dominance that is the point.
 *
 * So the bar is deliberately demoted to a proportion cue and the number carries
 * the value. A sliver next to "Channel" is honest, because the count really is
 * that small relative to claims. No hover is needed: every value is on screen.
 */
export function MagnitudeTable({
  rows,
  caption,
  total,
  totalLabel,
}: {
  rows: { label: string; value: number; note?: string }[];
  caption: string;
  total?: number;
  totalLabel?: string;
}) {
  const max = Math.max(...rows.map((r) => r.value));

  return (
    <figure className="m-0">
      <figcaption className="font-mono text-[11px] tracking-[0.14em] text-ink-faint uppercase">
        {caption}
      </figcaption>

      <table className="mt-4 w-full border-collapse text-sm">
        <thead className="sr-only">
          <tr>
            <th scope="col">Type</th>
            <th scope="col">Share</th>
            <th scope="col">Count</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} className="border-b border-line/60">
              <th
                scope="row"
                className="w-[42%] py-3 pr-3 text-left font-normal"
              >
                <span className="font-mono text-xs text-ink">{r.label}</span>
                {r.note && (
                  <span className="mt-0.5 block text-[11px] text-ink-faint">
                    {r.note}
                  </span>
                )}
              </th>

              <td className="py-3 pr-4">
                <span className="block h-1.5 w-full rounded-full bg-ink/[0.06]">
                  <span
                    className="block h-full rounded-full bg-accent"
                    style={{ width: `${Math.max((r.value / max) * 100, 0.5)}%` }}
                  />
                </span>
              </td>

              <td className="w-24 py-3 text-right font-mono text-xs tabular-nums text-ink">
                {r.value.toLocaleString("en-US")}
              </td>
            </tr>
          ))}
        </tbody>
        {total !== undefined && (
          <tfoot>
            <tr>
              <th scope="row" className="py-3 text-left font-normal">
                <span className="font-mono text-[10px] tracking-[0.14em] text-ink-faint uppercase">
                  {totalLabel ?? "Total"}
                </span>
              </th>
              <td />
              <td className="py-3 text-right font-mono text-sm tabular-nums text-ink">
                {total.toLocaleString("en-US")}
              </td>
            </tr>
          </tfoot>
        )}
      </table>
    </figure>
  );
}
