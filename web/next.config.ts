import type { NextConfig } from "next";
import createMDX from "@next/mdx";
import withBundleAnalyzer from "@next/bundle-analyzer";

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
};

const withMDX = createMDX({});

const withAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

export default withAnalyzer(withMDX(nextConfig));
