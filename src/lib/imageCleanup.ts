import { unlink } from "fs/promises";
import path from "path";
import { getEducation, getExperience } from "@/lib/data";
import type { Project, Post, TimelineEntry } from "@/lib/types";

// Mirrors upload/route.ts's CATEGORY_DIRS — only ever unlink a file inside
// one of these upload directories, never an arbitrary path. imagePath
// ultimately comes from a stored DB field that admins can hand-edit via
// ImageUpload's raw path input, so it isn't fully trusted input.
const ALLOWED_PREFIXES = [
  "/images/projects/",
  "/images/blog/",
  "/images/experience/",
  "/images/site/",
];

export function isAllowedUploadPath(imagePath: string): boolean {
  if (!imagePath) return false;
  const normalized = path.posix.normalize(imagePath);
  if (normalized !== imagePath || normalized.includes("..")) return false;
  return ALLOWED_PREFIXES.some((prefix) => normalized.startsWith(prefix));
}

/** Best-effort disk cleanup for an uploaded image — never throws, never blocks a delete. */
export async function deleteUploadedImage(imagePath: string): Promise<void> {
  if (!isAllowedUploadPath(imagePath)) return;

  try {
    await unlink(path.join(process.cwd(), "public", imagePath));
  } catch {
    // Missing file (already gone, or a read-only/ephemeral filesystem like
    // serverless) is fine to ignore — this is optional cleanup, not a
    // correctness-critical step in deleting the content itself.
  }
}

/**
 * Same disk deletion as deleteUploadedImage, but for a direct admin action
 * (the media library's delete button) rather than best-effort cleanup after
 * some other operation — so failures are reported instead of swallowed.
 */
export async function deleteUploadedImageStrict(imagePath: string): Promise<void> {
  if (!isAllowedUploadPath(imagePath)) {
    throw new Error("Invalid image path");
  }
  try {
    await unlink(path.join(process.cwd(), "public", imagePath));
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
  }
}

/** Deletes a project's cover image from disk, unless another remaining project still uses it. */
export async function cleanupProjectImage(
  deleted: Project,
  remainingProjects: Project[],
): Promise<void> {
  if (!deleted.image) return;
  const stillUsed = remainingProjects.some((p) => p.image === deleted.image);
  if (!stillUsed) await deleteUploadedImage(deleted.image);
}

/** Deletes a post's cover image from disk, unless another remaining post still uses it. */
export async function cleanupPostImage(
  deleted: Post,
  remainingPosts: Post[],
): Promise<void> {
  if (!deleted.coverImage) return;
  const stillUsed = remainingPosts.some((p) => p.coverImage === deleted.coverImage);
  if (!stillUsed) await deleteUploadedImage(deleted.coverImage);
}

/**
 * Deletes logo/coverImage files for whichever entries existed in
 * `oldEntries` but not `newEntries` (matched by id) — covers a timeline
 * entry being removed, since experience/education have no per-entry DELETE
 * route (TimelineEditor persists the whole array instead). Experience and
 * education share the same upload directory, so an image is only deleted
 * once nothing in either collection still points at it.
 */
export async function cleanupRemovedTimelineImages(
  collection: "experience" | "education",
  oldEntries: TimelineEntry[],
  newEntries: TimelineEntry[],
): Promise<void> {
  const removed = oldEntries.filter(
    (old) => !newEntries.some((entry) => entry.id === old.id),
  );
  if (removed.length === 0) return;

  const otherEntries =
    collection === "experience" ? await getEducation() : await getExperience();

  const stillInUse = new Set<string>();
  for (const entry of [...newEntries, ...otherEntries]) {
    if (entry.logo) stillInUse.add(entry.logo);
    if (entry.coverImage) stillInUse.add(entry.coverImage);
  }

  for (const entry of removed) {
    for (const image of [entry.logo, entry.coverImage]) {
      if (image && !stillInUse.has(image)) {
        await deleteUploadedImage(image);
      }
    }
  }
}
