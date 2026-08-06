/**
 * Shared Open Graph card.
 *
 * One layout for the site card and all nine project cards, so a link pasted
 * into LinkedIn or Slack looks like it came from the same place regardless of
 * which page it points at.
 *
 * Written against Satori, which renders the JSX below rather than a browser.
 * Two constraints follow from that and are easy to trip over:
 *   - Any element with more than one child needs an explicit `display: flex`.
 *     Satori has no block layout, and a missing display throws at render time
 *     rather than degrading.
 *   - Long text is truncated in JS. Satori's line clamping is unreliable
 *     across versions, and a card that overflows its own frame looks worse
 *     than one that ends in an ellipsis.
 *
 * Colours are the light theme's tokens, copied rather than imported because
 * CSS custom properties do not exist in this renderer.
 */

import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

const C = {
  bg: "#f8f5ef",
  ink: "#1a2230",
  inkSoft: "#4a5566",
  inkFaint: "#6a717e",
  accent: "#c2453d",
  line: "rgba(26, 34, 48, 0.14)",
};

/**
 * Fonts are vendored under web/assets so a build never depends on a CDN.
 *
 * Both must be STATIC instances. Satori cannot parse variable fonts: handed
 * Google's `PlayfairDisplay[wght].ttf` it fails with
 * "Cannot read properties of undefined (reading '256')" during prerender,
 * which is an obscure way of saying the weight axis is not a weight table.
 * The Google Fonts CSS API only serves static TTFs to clients that do not
 * advertise woff2 support, which is how the SemiBold file here was obtained.
 */
export async function loadOgFonts() {
  const [display, sans, mono] = await Promise.all([
    readFile(join(process.cwd(), "assets/PlayfairDisplay-SemiBold.ttf")),
    readFile(join(process.cwd(), "assets/Geist-Regular.ttf")),
    readFile(join(process.cwd(), "assets/GeistMono-Regular.ttf")),
  ]);
  return [
    { name: "Playfair", data: display, style: "normal" as const, weight: 600 as const },
    { name: "Geist", data: sans, style: "normal" as const, weight: 400 as const },
    { name: "GeistMono", data: mono, style: "normal" as const, weight: 400 as const },
  ];
}

function clamp(text: string, max: number) {
  if (text.length <= max) return text;
  // Cut on a word boundary so the ellipsis does not land mid-word.
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

export type OgCardProps = {
  /** Small mono line above the title. */
  eyebrow: string;
  title: string;
  /** One or two sentences. Truncated at 150 characters. */
  body: string;
  /** Large figure bottom left, e.g. a headline metric. Optional. */
  metric?: { value: string; label: string };
  /** Mono chips along the bottom. Capped at four so the row never wraps. */
  chips?: string[];
};

export function OgCard({ eyebrow, title, body, metric, chips }: OgCardProps) {
  // Long project names need to step down or they collide with the frame.
  const titleSize = title.length > 26 ? 68 : title.length > 18 ? 84 : 100;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        height: "100%",
        backgroundColor: C.bg,
        padding: "64px 72px",
        // A wide accent edge, the same gesture the site uses for section rules.
        borderLeft: `14px solid ${C.accent}`,
        fontFamily: "GeistMono",
      }}
    >
      {/* Top: wordmark and eyebrow */}
      <div style={{ display: "flex", alignItems: "center" }}>
        <div
          style={{
            display: "flex",
            fontFamily: "Playfair",
            fontSize: 30,
            color: C.accent,
            letterSpacing: "0.02em",
          }}
        >
          DR
        </div>
        <div
          style={{
            display: "flex",
            width: 28,
            height: 1,
            backgroundColor: C.line,
            margin: "0 18px",
          }}
        />
        <div
          style={{
            display: "flex",
            fontSize: 17,
            letterSpacing: "0.18em",
            color: C.inkFaint,
            textTransform: "uppercase",
          }}
        >
          {clamp(eyebrow, 46)}
        </div>
      </div>

      {/* Middle: the title and one supporting sentence */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            fontFamily: "Playfair",
            fontSize: titleSize,
            lineHeight: 1.05,
            color: C.ink,
            letterSpacing: "-0.015em",
          }}
        >
          {clamp(title, 52)}
        </div>
        {/* Sans, not mono. The eyebrow, metric label and chips stay mono
            because that is the site's language for metadata, but a full
            sentence set in mono reads as terminal output rather than prose. */}
        <div
          style={{
            display: "flex",
            marginTop: 26,
            maxWidth: 880,
            fontFamily: "Geist",
            fontSize: 26,
            lineHeight: 1.45,
            color: C.inkSoft,
          }}
        >
          {clamp(body, 150)}
        </div>
      </div>

      {/* Bottom: metric on the left, stack chips on the right */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          borderTop: `1px solid ${C.line}`,
          paddingTop: 26,
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline" }}>
          {metric ? (
            <div style={{ display: "flex", alignItems: "baseline" }}>
              <div style={{ display: "flex", fontSize: 46, color: C.accent }}>
                {metric.value}
              </div>
              <div
                style={{
                  display: "flex",
                  marginLeft: 14,
                  fontSize: 19,
                  color: C.inkFaint,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                {clamp(metric.label, 28)}
              </div>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                fontSize: 19,
                color: C.inkFaint,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              dhanvardini.vercel.app
            </div>
          )}
        </div>

        {chips && chips.length > 0 && (
          <div style={{ display: "flex" }}>
            {chips.slice(0, 4).map((chip) => (
              <div
                key={chip}
                style={{
                  display: "flex",
                  marginLeft: 10,
                  padding: "8px 16px",
                  border: `1px solid ${C.line}`,
                  borderRadius: 999,
                  fontSize: 17,
                  color: C.inkSoft,
                }}
              >
                {chip}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
