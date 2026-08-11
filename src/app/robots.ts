import type { MetadataRoute } from "next";
import { siteMeta } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api"],
    },
    sitemap: `${siteMeta.siteUrl}/sitemap.xml`,
  };
}
