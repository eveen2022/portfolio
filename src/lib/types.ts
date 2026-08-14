export type TechStackItem = {
  name: string;
  icon?: string;
};

export type Project = {
  slug: string;
  title: string;
  description: string;
  image: string;
  techStack: TechStackItem[];
  repoUrl?: string;
  liveUrl?: string;
  featured: boolean;
  order: number;
  startDate: string;
  endDate: string | null;
  status: "completed" | "in-progress" | "archived";
  // When this project was added to the portfolio (server-stamped, not the
  // project's own work timeline) — drives the "New" badge's 1-month expiry.
  uploadedAt: string;
  // Admin toggle: master switch for the "New" badge. Even when true, the
  // badge only actually shows while the automatic conditions also hold (see
  // src/lib/newBadge.ts) — turning this off always hides it.
  isNew: boolean;
  // SEO overrides — fall back to title/description when blank. noIndex hides
  // the page from search engines without hiding it from visitors.
  seoTitle?: string;
  seoDescription?: string;
  noIndex: boolean;
};

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  tags: string[];
  publishedAt: string;
  updatedAt: string | null;
  published: boolean;
  readingTimeMinutes: number;
  order: number;
  // SEO overrides — fall back to title/excerpt when blank. noIndex hides
  // the page from search engines without hiding it from visitors.
  seoTitle?: string;
  seoDescription?: string;
  noIndex: boolean;
};

export type SkillLevel = "beginner" | "intermediate" | "advanced";

export type SkillGroup = {
  category: string;
  items: { name: string; level: SkillLevel; icon?: string }[];
};

export type CourseGrade = {
  name: string;
  grade: string;
};

export type YearGrades = {
  year: string;
  courses: CourseGrade[];
};

export type TimelineEntry = {
  id: string;
  type: "work" | "education";
  organization: string;
  role: string;
  location?: string;
  startDate: string;
  endDate: string | null;
  current: boolean;
  description: string;
  highlights: string[];
  logo?: string;
  coverImage?: string;
  showGpa?: boolean;
  gpa?: string;
  gradesByYear?: YearGrades[];
  order: number;
};

export const WORK_ARRANGEMENTS = ["Remote", "On-site", "Hybrid"] as const;
export type WorkArrangement = (typeof WORK_ARRANGEMENTS)[number];

export type SiteConfig = {
  name: string;
  role: string;
  tagline: string;
  bio: string;
  description: string;
  email: string;
  phone: string;
  location: string;
  workArrangement: WorkArrangement[];
  photo: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  notFoundMode: boolean;
  // Shows/hides the "Share portfolio" button (native share sheet, copy
  // link, QR code) that appears in the footer.
  shareEnabled: boolean;
  social: {
    github: string;
    linkedin: string;
    twitter: string;
    whatsapp: string;
  };
  sections: {
    about: boolean;
    skills: boolean;
    projects: boolean;
    blog: boolean;
    experience: boolean;
    education: boolean;
    contact: boolean;
  };
  seo: {
    // Default social-share image, used when a project/post has no cover
    // image of its own. Falls back to `photo` if this is also blank.
    ogImage: string;
    // e.g. "@username" — used for Twitter Card attribution.
    twitterHandle: string;
    // Site-wide kill switch: tells every search engine not to index
    // anything, and empties the sitemap. Useful pre-launch or on staging.
    noIndex: boolean;
    googleSiteVerification: string;
    bingSiteVerification: string;
  };
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  submittedAt: string;
  read: boolean;
  emailSent: boolean;
  ip: string;
};

export type ActivityAction = "create" | "update" | "delete";

export type ActivityEntity =
  | "project"
  | "post"
  | "skills"
  | "experience"
  | "education"
  | "settings"
  | "message"
  | "privacy";

export type ActivityEntry = {
  id: string;
  timestamp: string;
  action: ActivityAction;
  entity: ActivityEntity;
  label: string;
};

export type Analytics = {
  totalVisits: number;
  dailyVisits: Record<string, number>;
  totalPageViews: number;
  // Keyed by path (e.g. "/", "/projects/some-slug") — all-time, not
  // date-bucketed, since the set of distinct paths on a portfolio is small
  // and bounded by its content rather than by time.
  pageViews: Record<string, number>;
  // Keyed by referring hostname (e.g. "google.com"), or "Direct" for no
  // referrer / same-site navigation — all-time.
  referrers: Record<string, number>;
  devices: { desktop: number; mobile: number; tablet: number };
  browsers: Record<string, number>;
};
