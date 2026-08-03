import type { MetadataRoute } from "next";
import { PROJECTS } from "@/content/work";
import { SITE } from "@/content/site";

/**
 * Generated from the same PROJECTS array the Work page renders, so a project
 * cannot exist on the site but be missing from the sitemap. That drift is
 * exactly what the previous site's audit found, where 34 pages were live but
 * unreachable from any index.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const pages: MetadataRoute.Sitemap = [
    { url: SITE.url, lastModified, changeFrequency: "monthly", priority: 1 },
    {
      url: `${SITE.url}/work`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE.url}/about`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE.url}/contact`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.6,
    },
  ];

  const projects: MetadataRoute.Sitemap = PROJECTS.map((project) => ({
    url: `${SITE.url}/work/${project.slug}`,
    lastModified,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...pages, ...projects];
}
