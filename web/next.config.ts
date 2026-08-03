import type { NextConfig } from "next";
import createMDX from "@next/mdx";
import withBundleAnalyzer from "@next/bundle-analyzer";

const isDev = process.env.NODE_ENV === "development";

/**
 * `script-src` uses 'unsafe-inline'. That is a deliberate decision, not an
 * oversight, and the reasoning matters.
 *
 * The App Router emits its own inline scripts to stream the RSC payload, and
 * their contents differ per page, so no fixed hash list can cover them. A
 * measured attempt with a hash for the theme bootstrap alone was verified in a
 * real browser and Chrome blocked three further Next-generated inline scripts.
 * The only strict alternative is a per-request nonce, which the Next.js CSP
 * guide notes forces dynamic rendering, and that would convert all 20
 * statically prerendered pages into server-rendered ones.
 *
 * The trade was resolved on actual attack surface. Every byte of content here
 * is authored at build time from files in this repo. There is no user input,
 * no authentication, no user-generated content, and nothing reflects a query
 * parameter into markup, so there is no vector through which an attacker could
 * place inline script on the page. `unsafe-inline` therefore permits nothing
 * that is reachable, while a nonce would measurably slow every page.
 *
 * Every other directive stays strict, and the remaining headers below are
 * unconditional wins. Revisit this the moment the site accepts user input or
 * renders anything it did not author, at which point a nonce and dynamic
 * rendering become the correct cost.
 */
const csp = [
  `default-src 'self'`,
  // 'unsafe-eval' in dev only: React uses eval to rebuild server error stacks
  // for the overlay. Production does not need it.
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  // Styles need 'unsafe-inline' because framer-motion animates via inline
  // style attributes. Far lower risk than the script-src equivalent: inline
  // styles cannot execute code, and script-src stays strict.
  `style-src 'self' 'unsafe-inline'`,
  // data:/blob: cover the optimiser's inline placeholders.
  `img-src 'self' data: blob:`,
  `font-src 'self'`,
  `connect-src 'self'`,
  `object-src 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `frame-ancestors 'none'`,
  `upgrade-insecure-requests`,
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // Opts into HSTS preload. Only meaningful over HTTPS, ignored on localhost.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Stops browsers from MIME-sniffing a response into something executable.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Referrers stay full-path within the origin, origin-only when leaving it.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // frame-ancestors above supersedes this; kept for pre-CSP browsers.
  { key: "X-Frame-Options", value: "DENY" },
  // Nothing here needs these, so they are denied rather than left default.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
];

const nextConfig: NextConfig = {
  // .mdx is included so project bodies in src/content/work/bodies can be
  // imported as components. MDX files are never routes here: they are a
  // content collection rendered through the shared /work/[slug] template.
  pageExtensions: ["ts", "tsx", "mdx"],

  images: {
    // AVIF first: typically 20-30% smaller than WebP at equal quality. Next
    // negotiates per request via Accept, so browsers without AVIF still get
    // WebP and nothing regresses for them.
    formats: ["image/avif", "image/webp"],
    // Long cache on optimised derivatives. Sources are content-addressed by
    // Next, so a changed image produces a different URL rather than serving
    // a stale one.
    minimumCacheTTL: 31_536_000,
  },

  // Strips the header that advertises the framework and version.
  poweredByHeader: false,

  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

const withMDX = createMDX({});

const withAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

export default withAnalyzer(withMDX(nextConfig));
