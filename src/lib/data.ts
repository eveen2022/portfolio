import { getCollection, SINGLETON_ID } from "@/lib/mongodb";
import { decodeMongoKey } from "@/lib/fsWrite";
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
  photo: "",
  maintenanceMode: false,
  maintenanceMessage: "",
  notFoundMode: false,
  shareEnabled: true,
  social: { github: "", linkedin: "", twitter: "", whatsapp: "" },
  sections: {
    about: true,
    skills: true,
    projects: true,
    blog: true,
    experience: true,
    education: true,
    contact: true,
  },
  seo: {
    ogImage: "",
    twitterHandle: "",
    noIndex: false,
    googleSiteVerification: "",
    bingSiteVerification: "",
  },
};

async function findAll<T extends object>(collectionName: string): Promise<T[]> {
  const collection = await getCollection(collectionName);
  const docs = await collection.find({}, { projection: { _id: 0 } }).toArray();
  return docs as unknown as T[];
}

async function findSingleton<T extends object>(collectionName: string): Promise<T | null> {
  const collection = await getCollection(collectionName);
  const doc = await collection.findOne({ _id: SINGLETON_ID } as never, {
    projection: { _id: 0 },
  });
  return doc as T | null;
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
    noIndex: project.noIndex ?? false,
  };
}

export async function getProjects(): Promise<Project[]> {
  const projects = await findAll<Project>("projects");
  return projects.map(normalizeProject).sort((a, b) => a.order - b.order);
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
  const posts = await findAll<Post>("posts");
  // Posts predating manual drag-and-drop ordering don't have `order` set yet
  // — backfill it from the previous default (newest first) so nothing
  // visually reshuffles until the admin actually drags something.
  const dateDesc = [...posts].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
  let fallbackIndex = 0;
  const withOrder = dateDesc.map((post) => ({
    ...post,
    order: typeof post.order === "number" ? post.order : fallbackIndex++,
    noIndex: post.noIndex ?? false,
  }));
  return withOrder.sort((a, b) => a.order - b.order);
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
  const collection = await getCollection<{ _id: string; content: string }>("content");
  const doc = await collection.findOne({ _id: `blog/${slug}.md` });
  return doc?.content ?? "";
}

const PRIVACY_CONTENT_ID = "privacy-policy.md";

// Used until the admin saves their own text from /admin/privacy — keeps the
// page honest out of the box instead of blank, and stays in sync with the
// site's actual name/email since it's computed fresh rather than stored.
const DEFAULT_PRIVACY_CONTENT = `## Contact form

If you send a message through the [contact form](/contact), the name, email address, subject, and message you enter are stored so {{siteName}} can read and reply to it. The IP address the message was sent from is also logged, purely to help catch spam. Messages aren't shared with anyone else or used for marketing, and they stay stored until {{siteName}} deletes them.

## Analytics

Page visits are counted to understand how the site is used — total visits, visits per day, which pages get viewed, which sites sent you here (just the domain, e.g. "google.com", not the full URL), and a rough device/browser breakdown. These are aggregate counts, not a profile tied to you individually: nothing here is linked to your name, email, or IP address, there's no cross-site tracking, and no data is sold or shared with advertisers. Daily visit counts older than 30 days are automatically deleted.

## Cookies & local storage

- A small cookie remembers that your browser has already been counted as a visit today, so refreshing the page or browsing around doesn't inflate the numbers above. It just holds a date, nothing that identifies you.
- Your light/dark theme preference is saved in your browser's local storage, not a cookie — it never leaves your device.
- A sign-in cookie is used only when {{siteName}} is logged into the admin dashboard — it plays no role for anyone just browsing the site.

## Third parties

This site doesn't use third-party analytics, ad networks, or embedded trackers. Everything described above runs on this site's own server.

## Questions

For anything about this page or your data, reach out at [{{siteEmail}}](mailto:{{siteEmail}}).
`;

function renderPrivacyTemplate(template: string, siteName: string, siteEmail: string): string {
  return template.replaceAll("{{siteName}}", siteName).replaceAll("{{siteEmail}}", siteEmail);
}

/** The computed fallback text — used by the admin editor's "Reset to default" action. */
export async function getDefaultPrivacyPolicyContent(): Promise<string> {
  const siteConfig = await getSiteConfig();
  return renderPrivacyTemplate(DEFAULT_PRIVACY_CONTENT, siteConfig.name, siteConfig.email);
}

export async function getPrivacyPolicyContent(): Promise<string> {
  const collection = await getCollection<{ _id: string; content: string }>("content");
  const doc = await collection.findOne({ _id: PRIVACY_CONTENT_ID });
  if (doc?.content) return doc.content;
  return getDefaultPrivacyPolicyContent();
}

export async function getSkills(): Promise<SkillGroup[]> {
  return findAll<SkillGroup>("skills");
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

// Entries predating manual drag-and-drop ordering don't have `order` set yet
// — backfill it from the previous default (most recent start date first) so
// nothing visually reshuffles until the admin actually drags something.
function withFallbackOrder(entries: TimelineEntry[]): TimelineEntry[] {
  const dateDesc = [...entries].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
  );
  let fallbackIndex = 0;
  const withOrder = dateDesc.map((entry) => ({
    ...entry,
    order: typeof entry.order === "number" ? entry.order : fallbackIndex++,
  }));
  return withOrder.sort((a, b) => a.order - b.order);
}

export async function getExperience(): Promise<TimelineEntry[]> {
  const entries = await findAll<TimelineEntry>("experience");
  return withFallbackOrder(entries.map(normalizeTimelineEntry));
}

export async function getEducation(): Promise<TimelineEntry[]> {
  const entries = await findAll<TimelineEntry>("education");
  return withFallbackOrder(entries.map(normalizeTimelineEntry));
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
  const messages = await findAll<ContactMessage>("messages");
  return [...messages].sort(
    (a, b) =>
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
  );
}

const DEFAULT_ANALYTICS: Analytics = {
  totalVisits: 0,
  dailyVisits: {},
  totalPageViews: 0,
  pageViews: {},
  referrers: {},
  devices: { desktop: 0, mobile: 0, tablet: 0 },
  browsers: {},
};

// Referrer hostnames and page paths are stored with dots percent-escaped
// (see encodeMongoKey) so they're safe as dynamic Mongo update-path segments
// — decode them back to their real form for anything that reads this data.
function decodeKeys(record: Record<string, number>): Record<string, number> {
  return Object.fromEntries(
    Object.entries(record).map(([key, value]) => [decodeMongoKey(key), value]),
  );
}

export async function getAnalytics(): Promise<Analytics> {
  const analytics = await findSingleton<Partial<Analytics>>("analytics");
  return {
    ...DEFAULT_ANALYTICS,
    ...analytics,
    dailyVisits: { ...DEFAULT_ANALYTICS.dailyVisits, ...analytics?.dailyVisits },
    pageViews: decodeKeys({ ...DEFAULT_ANALYTICS.pageViews, ...analytics?.pageViews }),
    referrers: decodeKeys({ ...DEFAULT_ANALYTICS.referrers, ...analytics?.referrers }),
    devices: { ...DEFAULT_ANALYTICS.devices, ...analytics?.devices },
    browsers: decodeKeys({ ...DEFAULT_ANALYTICS.browsers, ...analytics?.browsers }),
  };
}

export async function getActivity(): Promise<ActivityEntry[]> {
  const entries = await findAll<ActivityEntry>("activity");
  return [...entries].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
}

// Called from the root layout and (site) layout on every single request, so
// a DB/env misconfiguration here must not take the whole site down — fall
// back to defaults and let the page render instead of throwing.
export async function getSiteConfig(): Promise<SiteConfig> {
  let config: Partial<SiteConfig> | null = null;
  try {
    config = await findSingleton<Partial<SiteConfig>>("site");
  } catch (error) {
    console.error("getSiteConfig: falling back to defaults —", error);
  }
  return {
    ...DEFAULT_SITE_CONFIG,
    ...config,
    social: { ...DEFAULT_SITE_CONFIG.social, ...config?.social },
    sections: { ...DEFAULT_SITE_CONFIG.sections, ...config?.sections },
    seo: { ...DEFAULT_SITE_CONFIG.seo, ...config?.seo },
  };
}
