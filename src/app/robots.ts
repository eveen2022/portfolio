import type { MetadataRoute } from "next";
import { siteMeta } from "@/lib/site";
import { getSiteConfig } from "@/lib/data";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const siteConfig = await getSiteConfig();

  return {
    rules: {
      userAgent: "*",
      // Site-wide SEO kill switch (Settings → SEO → "Hide from search
      // engines") disallows everything at the crawl-directive level, on top
      // of the per-page <meta name="robots"> tags this also drives.
      allow: siteConfig.seo.noIndex ? undefined : "/",
      disallow: siteConfig.seo.noIndex ? "/" : ["/admin", "/api"],
    },
    sitemap: `${siteMeta.siteUrl}/sitemap.xml`,
  };
}
