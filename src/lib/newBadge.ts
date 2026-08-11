import type { Project } from "@/lib/types";

const NEW_BADGE_WINDOW_DAYS = 30;

/**
 * A project shows the "New" badge only while ALL of these hold:
 * 1. Its admin toggle (`isNew`) is on — the master switch.
 * 2. It was uploaded within the last 30 days.
 * 3. No other project has been uploaded more recently — once something newer
 *    lands, older "New" badges disappear immediately rather than waiting out
 *    the full 30 days.
 *
 * `allProjects` should be the full, unfiltered project list so condition 3
 * is evaluated against everything, not just whatever subset is being
 * rendered (e.g. the featured-only teaser on the homepage).
 */
export function shouldShowNewBadge(project: Project, allProjects: Project[]): boolean {
  if (!project.isNew || !project.uploadedAt) return false;

  const uploadedAt = new Date(project.uploadedAt).getTime();
  if (Number.isNaN(uploadedAt)) return false;

  const ageInDays = (Date.now() - uploadedAt) / (1000 * 60 * 60 * 24);
  if (ageInDays > NEW_BADGE_WINDOW_DAYS) return false;

  const isMostRecent = !allProjects.some((other) => {
    if (other.slug === project.slug || !other.uploadedAt) return false;
    const otherUploadedAt = new Date(other.uploadedAt).getTime();
    return !Number.isNaN(otherUploadedAt) && otherUploadedAt > uploadedAt;
  });

  return isMostRecent;
}
