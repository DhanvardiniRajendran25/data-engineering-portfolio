import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  // .mdx is included so case-study bodies in src/content/work/bodies can be
  // imported as components. MDX files are never routes here: they are a
  // content collection rendered through the shared /work/[slug] template.
  pageExtensions: ["ts", "tsx", "mdx"],
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
