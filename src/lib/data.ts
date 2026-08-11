import { readFile } from "fs/promises";
import path from "path";
import type {
  Project,
  Post,
  SkillGroup,
  TimelineEntry,
  YearGrades,
  CourseGrade,
  SiteConfig,
  ContactMessage,
  ActivityEntry,
  Analytics,
} from "@/lib/types";

const DATA_DIR = path.join(process.cwd(), "data");
const CONTENT_DIR = path.join(process.cwd(), "content");

const DEFAULT_SITE_CONFIG: SiteConfig = {
  name: "Your Name",
  role: "Software Engineer",
  tagline: "I build reliable, well-crafted software for the web.",
  bio: "Write a couple of sentences here about your background.",
  description: "Portfolio of a software engineer.",
  email: "your-email@example.com",
  phone: "",
  location: "",
  workArrangement: ["Remote"],
  social: { github: "", linkedin: "", twitter: "" },
};

async function readJson<T>(fileName: string, fallback: T): Promise<T> {
  try {
    const raw = await readFile(path.join(DATA_DIR, fileName), "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

// Normalizes projects written before icons / the "New" badge were supported:
// techStack items used to be plain strings instead of { name, icon }, and
// uploadedAt/isNew didn't exist at all (backfilled conservatively so old
// projects don't suddenly all show as "New").
function normalizeProject(project: Project): Project {
  const techStack = (project.techStack as unknown as (string | { name: string; icon?: string })[]).map(
    (tech) => (typeof tech === "string" ? { name: tech, icon: "" } : tech),
  );
  return {
    ...project,
    techStack,
    uploadedAt: project.uploadedAt || project.startDate || "",
    isNew: project.isNew ?? false,
  };
}

export async function getProjects(): Promise<Project[]> {
  const projects = await readJson<Project[]>("projects.json", []);
  return [...projects].map(normalizeProject).sort((a, b) => a.order - b.order);
}

export async function getFeaturedProjects(): Promise<Project[]> {
  const projects = await getProjects();
  return projects.filter((project) => project.featured);
}

export async function getProjectBySlug(
  slug: string,
): Promise<Project | undefined> {
  const projects = await getProjects();
  return projects.find((project) => project.slug === slug);
}

export async function getAllPosts(): Promise<Post[]> {
  const posts = await readJson<Post[]>("posts.json", []);
  return [...posts].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

export async function getPosts(): Promise<Post[]> {
  const posts = await getAllPosts();
  return posts.filter((post) => post.published);
}

export async function getPostBySlug(slug: string): Promise<Post | undefined> {
  const posts = await getPosts();
  return posts.find((post) => post.slug === slug);
}

export async function getPostBody(slug: string): Promise<string> {
  try {
    return await readFile(
      path.join(CONTENT_DIR, "blog", `${slug}.md`),
      "utf-8",
    );
  } catch {
    return "";
  }
}

export async function getSkills(): Promise<SkillGroup[]> {
  return readJson<SkillGroup[]>("skills.json", []);
}

// Migrates grades written before they were grouped by year: what used to be
// a flat `courses: [{ name, grade }]` list becomes a single unlabeled group
// (blank, not "Year 1" — the old data could just as easily have been a
// single-sitting exam like O-Levels as a multi-year degree, so it's left for
// the admin to label if they want to), so existing entries keep showing
// their marks instead of losing them.
function normalizeTimelineEntry(entry: TimelineEntry): TimelineEntry {
  const legacyCourses = (entry as unknown as { courses?: CourseGrade[] }).courses;

  const gradesByYear: YearGrades[] =
    entry.gradesByYear ??
    (Array.isArray(legacyCourses) && legacyCourses.length > 0
      ? [{ year: "", courses: legacyCourses }]
      : []);

  return { ...entry, gradesByYear };
}

export async function getExperience(): Promise<TimelineEntry[]> {
  const entries = await readJson<TimelineEntry[]>("experience.json", []);
  return entries.map(normalizeTimelineEntry);
}

export async function getEducation(): Promise<TimelineEntry[]> {
  const entries = await readJson<TimelineEntry[]>("education.json", []);
  return entries.map(normalizeTimelineEntry);
}

export async function getTimeline(): Promise<TimelineEntry[]> {
  const [experience, education] = await Promise.all([
    getExperience(),
    getEducation(),
  ]);
  return [...experience, ...education].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
  );
}

export async function getTimelineEntryById(
  id: string,
): Promise<TimelineEntry | undefined> {
  const entries = await getTimeline();
  return entries.find((entry) => entry.id === id);
}

export async function getMessages(): Promise<ContactMessage[]> {
  const messages = await readJson<ContactMessage[]>("messages.json", []);
  return [...messages].sort(
    (a, b) =>
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
  );
}

export async function getAnalytics(): Promise<Analytics> {
  return readJson<Analytics>("analytics.json", { totalVisits: 0, dailyVisits: {} });
}

export async function getActivity(): Promise<ActivityEntry[]> {
  const entries = await readJson<ActivityEntry[]>("activity.json", []);
  return [...entries].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
}

export async function getSiteConfig(): Promise<SiteConfig> {
  const config = await readJson<Partial<SiteConfig>>("site.json", {});
  return {
    ...DEFAULT_SITE_CONFIG,
    ...config,
    social: { ...DEFAULT_SITE_CONFIG.social, ...config.social },
  };
}
