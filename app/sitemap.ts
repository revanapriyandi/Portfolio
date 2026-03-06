import type { MetadataRoute } from "next";
import { getSeoContext, createPageUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { siteUrl, pages } = await getSeoContext();

  return pages.map((page) => ({
    url: createPageUrl(siteUrl, page.slug),
    lastModified: page.updated_at ?? undefined,
    changeFrequency: page.slug === "home" ? "daily" : "weekly",
    priority: page.slug === "home" ? 1 : 0.7,
  }));
}
