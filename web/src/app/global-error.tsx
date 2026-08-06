"use client"; // Error boundaries must be Client Components

/**
 * Last-resort boundary for failures in the root layout itself.
 *
 * Because the root layout is what failed, this replaces the whole document
 * and must render its own html and body. It therefore cannot use the site's
 * fonts, theme tokens, or Tailwind layer, so the styling here is inline and
 * intentionally minimal.
 */
export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "2rem",
          background: "#f8f5ef",
          color: "#1a2230",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <main style={{ maxWidth: "34rem" }}>
          <h1 style={{ fontSize: "1.75rem", margin: 0, lineHeight: 1.2 }}>
            Something went wrong
          </h1>
          <p style={{ marginTop: "1rem", lineHeight: 1.6, color: "#4a5566" }}>
            The site failed to load. Retrying usually resolves it.
          </p>
          {error.digest && (
            <p
              style={{
                marginTop: "0.75rem",
                fontFamily: "ui-monospace, monospace",
                fontSize: "0.75rem",
                color: "#8a93a3",
              }}
            >
              Reference: {error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={() => unstable_retry()}
            style={{
              marginTop: "1.75rem",
              padding: "0.75rem 1.5rem",
              borderRadius: "9999px",
              border: "1px solid #1a2230",
              background: "transparent",
              color: "#1a2230",
              font: "inherit",
              fontSize: "0.8rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
