import type { MetadataRoute } from "next";
import { getPosts, getProjects, getTimeline } from "@/lib/data";
import { siteMeta } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, posts, timeline] = await Promise.all([
    getProjects(),
    getPosts(),
    getTimeline(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/about",
    "/projects",
    "/experience",
    "/blog",
    "/contact",
  ].map(
    (route) => ({
      url: `${siteMeta.siteUrl}${route}`,
      lastModified: new Date(),
    }),
  );

  const projectRoutes: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${siteMeta.siteUrl}/projects/${project.slug}`,
    lastModified: project.endDate ?? project.startDate,
  }));

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${siteMeta.siteUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt ?? post.publishedAt,
  }));

  const timelineRoutes: MetadataRoute.Sitemap = timeline.map((entry) => ({
    url: `${siteMeta.siteUrl}/experience/${entry.id}`,
    lastModified: entry.endDate ?? entry.startDate,
  }));

  return [...staticRoutes, ...projectRoutes, ...postRoutes, ...timelineRoutes];
}
