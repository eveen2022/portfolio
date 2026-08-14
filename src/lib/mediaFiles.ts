import { readdir, stat } from "fs/promises";
import path from "path";
import { getProjects, getAllPosts, getExperience, getEducation, getSiteConfig } from "@/lib/data";

// Mirrors upload/route.ts's CATEGORY_DIRS.
const CATEGORY_DIRS: Record<string, string> = {
  projects: "images/projects",
  blog: "images/blog",
  experience: "images/experience",
  site: "images/site",
};

// Mirrors upload/route.ts's IMAGE_EXTENSIONS — anything else in these
// directories (namely the .gitkeep placeholders that keep the otherwise-empty
// folders tracked in git) isn't something the upload flow ever produced.
const IMAGE_EXTENSIONS = new Set(["png", "jpg", "jpeg", "webp", "gif", "svg"]);

export type MediaFile = {
  path: string;
  category: string;
  fileName: string;
  sizeBytes: number;
  modifiedAt: string;
  usedBy: string[];
};

async function computeImageUsage(): Promise<Map<string, string[]>> {
  const usage = new Map<string, string[]>();
  function record(imagePath: string | undefined | null, label: string) {
    if (!imagePath) return;
    const list = usage.get(imagePath) ?? [];
    list.push(label);
    usage.set(imagePath, list);
  }

  const [projects, posts, experience, education, siteConfig] = await Promise.all([
    getProjects(),
    getAllPosts(),
    getExperience(),
    getEducation(),
    getSiteConfig(),
  ]);

  for (const project of projects) record(project.image, `Project: ${project.title}`);
  for (const post of posts) record(post.coverImage, `Post: ${post.title}`);
  for (const entry of [...experience, ...education]) {
    const label = `${entry.type === "work" ? "Experience" : "Education"}: ${entry.organization}`;
    record(entry.logo, label);
    record(entry.coverImage, label);
  }
  record(siteConfig.photo, "Site: Profile photo");
  record(siteConfig.seo.ogImage, "Site: Default share image");

  return usage;
}

/**
 * Lists every file sitting in an upload category directory, regardless of
 * whether it's referenced by any content — uploads have no database record
 * of their own (see upload/route.ts), so this is a filesystem scan rather
 * than a query. Only meaningful on a deployment where the filesystem
 * actually persists between requests (not, e.g., a fresh serverless
 * instance) — same caveat that already applies to uploads themselves.
 */
export async function listUploadedImages(): Promise<MediaFile[]> {
  const usage = await computeImageUsage();
  const files: MediaFile[] = [];

  for (const [category, dir] of Object.entries(CATEGORY_DIRS)) {
    const fullDir = path.join(process.cwd(), "public", dir);
    let entries: string[];
    try {
      entries = await readdir(fullDir);
    } catch {
      continue;
    }

    for (const fileName of entries) {
      const extension = fileName.split(".").pop()?.toLowerCase() ?? "";
      if (!IMAGE_EXTENSIONS.has(extension)) continue;

      const filePath = path.join(fullDir, fileName);
      const stats = await stat(filePath);
      if (!stats.isFile()) continue;

      const relativePath = `/${dir}/${fileName}`;
      files.push({
        path: relativePath,
        category,
        fileName,
        sizeBytes: stats.size,
        modifiedAt: stats.mtime.toISOString(),
        usedBy: usage.get(relativePath) ?? [],
      });
    }
  }

  return files.sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt));
}
