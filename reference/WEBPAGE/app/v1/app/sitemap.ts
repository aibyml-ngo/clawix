import type { MetadataRoute } from "next";
import { getBlogSlugs } from "@/lib/blog";
import { getDocSlugs } from "@/lib/docs";

export const dynamic = "force-static";

const BASE_URL = "https://getclawix.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    "",
    "/product",
    "/use-cases",
    "/developers",
    "/enterprise",
    "/learn",
    "/docs",
    "/changelog",
    "/blog",
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPages.map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.8,
  }));

  const docSlugs = getDocSlugs();
  const docEntries: MetadataRoute.Sitemap = docSlugs.map((slug) => ({
    url: `${BASE_URL}/docs/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const blogSlugs = getBlogSlugs();
  const blogEntries: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
    url: `${BASE_URL}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticEntries, ...docEntries, ...blogEntries];
}
