import type { MetadataRoute } from "next";
import { getSeoContext } from "@/lib/seo";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const { siteUrl } = await getSeoContext();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
