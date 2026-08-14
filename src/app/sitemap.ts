import type { MetadataRoute } from "next";
import { getPosts, getProjects, getTimeline, getSiteConfig } from "@/lib/data";
import { siteMeta } from "@/lib/site";

// Reads from the DB — must run per-request, not at build time (see other
// routes' `dynamic = "force-dynamic"` for the same reason).
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, posts, timeline, siteConfig] = await Promise.all([
    getProjects(),
    getPosts(),
    getTimeline(),
    getSiteConfig(),
  ]);
  const { sections } = siteConfig;

  // Site-wide SEO kill switch — nothing should be indexed, so nothing
  // belongs in the sitemap either.
  if (siteConfig.seo.noIndex) return [];

  const staticRoutes: MetadataRoute.Sitemap = (
    [
      { route: "", enabled: true },
      { route: "/about", enabled: sections.about },
      { route: "/projects", enabled: sections.projects },
      { route: "/experience", enabled: sections.experience },
      { route: "/education", enabled: sections.education },
      { route: "/blog", enabled: sections.blog },
      { route: "/contact", enabled: sections.contact },
    ] as const
  )
    .filter((entry) => entry.enabled)
    .map((entry) => ({
      url: `${siteMeta.siteUrl}${entry.route}`,
      lastModified: new Date(),
    }));

  const projectRoutes: MetadataRoute.Sitemap = sections.projects
    ? projects
        .filter((project) => !project.noIndex)
        .map((project) => ({
          url: `${siteMeta.siteUrl}/projects/${project.slug}`,
          lastModified: project.endDate ?? project.startDate,
        }))
    : [];

  const postRoutes: MetadataRoute.Sitemap = sections.blog
    ? posts
        .filter((post) => !post.noIndex)
        .map((post) => ({
          url: `${siteMeta.siteUrl}/blog/${post.slug}`,
          lastModified: post.updatedAt ?? post.publishedAt,
        }))
    : [];

  const timelineRoutes: MetadataRoute.Sitemap = timeline
    .filter((entry) => (entry.type === "work" ? sections.experience : sections.education))
    .map((entry) => ({
      url: `${siteMeta.siteUrl}/${entry.type === "work" ? "experience" : "education"}/${entry.id}`,
      lastModified: entry.endDate ?? entry.startDate,
    }));

  return [...staticRoutes, ...projectRoutes, ...postRoutes, ...timelineRoutes];
}
