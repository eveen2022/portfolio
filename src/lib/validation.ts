import { z } from "zod";
import { WORK_ARRANGEMENTS } from "@/lib/types";

export const contactFormSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(100),
  email: z.string().trim().email("Invalid email address").max(200),
  subject: z.string().trim().max(150).optional().default(""),
  message: z.string().trim().min(10, "Message is too short").max(5000),
  // Honeypot: real visitors never fill this in. Checked (not validated) in the route handler
  // so a filled honeypot can be silently dropped instead of surfaced as a validation error.
  company: z.string().optional().default(""),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;

export const trackVisitSchema = z.object({
  referrer: z.string().trim().max(500).optional().default(""),
});

export const trackPageviewSchema = z.object({
  path: z.string().trim().min(1).max(300),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters").max(200),
});

export const loginSchema = z.object({
  password: z.string().min(1, "Password is required").max(200),
});

export const totpCodeSchema = z.object({
  code: z.string().regex(/^\d{6}$/, "Code must be exactly 6 digits"),
});

export const recoverySetupSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  phone: z.string().trim().min(7, "Enter a valid phone number").max(30),
  pin: z.string().regex(/^\d{4}$/, "PIN must be exactly 4 digits"),
});

export const recoveryVerifySchema = z.object({
  phone: z.string().trim().min(1, "Phone number is required").max(30),
  pin: z.string().regex(/^\d{4}$/, "PIN must be exactly 4 digits"),
});

export const recoveryResetSchema = z.object({
  newPassword: z.string().min(8, "New password must be at least 8 characters").max(200),
});

// For fields rendered as a clickable <a href> (repo/live links, social
// profiles) — blocks a "javascript:" or other non-http(s) scheme from ever
// being stored, since that would make it a clickable XSS vector wherever the
// link renders. Empty string stays allowed (these are all optional).
const externalUrlField = (maxLength: number) =>
  z
    .string()
    .trim()
    .max(maxLength)
    .refine((value) => value === "" || /^https?:\/\//i.test(value), {
      message: "Must be a valid http:// or https:// URL",
    })
    .optional()
    .default("");

const slugSchema = z
  .string()
  .trim()
  .min(1, "Slug is required")
  .max(80)
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only");

export const projectSchema = z.object({
  slug: slugSchema,
  title: z.string().trim().min(1, "Title is required").max(150),
  description: z.string().trim().min(1, "Description is required").max(2000),
  image: z.string().trim().max(500).default(""),
  techStack: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(60),
        icon: z.string().trim().max(60).optional().default(""),
      }),
    )
    .default([]),
  repoUrl: externalUrlField(500),
  liveUrl: externalUrlField(500),
  featured: z.boolean().default(false),
  order: z.number().int().default(0),
  startDate: z.string().trim().max(20).default(""),
  endDate: z.string().trim().max(20).nullable().default(null),
  status: z.enum(["completed", "in-progress", "archived"]).default("completed"),
  // uploadedAt is server-stamped (see the projects API routes), not trusted
  // from the client — the default here only matters as a safe fallback.
  uploadedAt: z.string().trim().max(40).optional().default(""),
  isNew: z.boolean().default(false),
  seoTitle: z.string().trim().max(150).optional().default(""),
  seoDescription: z.string().trim().max(300).optional().default(""),
  noIndex: z.boolean().optional().default(false),
});

export type ProjectInput = z.infer<typeof projectSchema>;

export const postSchema = z.object({
  slug: slugSchema,
  title: z.string().trim().min(1, "Title is required").max(200),
  excerpt: z.string().trim().min(1, "Excerpt is required").max(500),
  coverImage: z.string().trim().max(500).default(""),
  tags: z.array(z.string().trim().min(1)).default([]),
  publishedAt: z.string().trim().max(20).default(""),
  updatedAt: z.string().trim().max(20).nullable().default(null),
  published: z.boolean().default(false),
  readingTimeMinutes: z.number().int().min(1).max(999).default(5),
  body: z.string().max(200_000).default(""),
  order: z.number().int().default(0),
  seoTitle: z.string().trim().max(150).optional().default(""),
  seoDescription: z.string().trim().max(300).optional().default(""),
  noIndex: z.boolean().optional().default(false),
});

export type PostInput = z.infer<typeof postSchema>;

export const skillGroupSchema = z.object({
  category: z.string().trim().min(1).max(80),
  items: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(60),
        level: z.enum(["beginner", "intermediate", "advanced"]),
        icon: z.string().trim().max(60).optional().default(""),
      }),
    )
    .default([]),
});

export const skillGroupsSchema = z.array(skillGroupSchema);

export const timelineEntrySchema = z.object({
  id: z.string().trim().min(1).max(100),
  type: z.enum(["work", "education"]),
  organization: z.string().trim().min(1).max(150),
  role: z.string().trim().min(1).max(150),
  location: z.string().trim().max(150).optional().default(""),
  startDate: z.string().trim().max(20).default(""),
  endDate: z.string().trim().max(20).nullable().default(null),
  current: z.boolean().default(false),
  description: z.string().trim().max(2000).default(""),
  highlights: z.array(z.string().trim().min(1)).default([]),
  logo: z.string().trim().max(500).optional().default(""),
  coverImage: z.string().trim().max(500).optional().default(""),
  showGpa: z.boolean().default(false),
  gpa: z.string().trim().max(20).optional().default(""),
  gradesByYear: z
    .array(
      z.object({
        // Optional — a flat single-sitting exam (e.g. O-Levels) has no
        // "Year 1/Year 2" subdivision, so an empty label just renders the
        // table without a heading above it.
        year: z.string().trim().max(60).optional().default(""),
        courses: z
          .array(
            z.object({
              name: z.string().trim().min(1).max(120),
              grade: z.string().trim().max(20),
            }),
          )
          .default([]),
      }),
    )
    .default([]),
  order: z.number().int().default(0),
});

export const timelineEntriesSchema = z.array(timelineEntrySchema);

export const reorderSchema = z.object({
  slugs: z.array(z.string().trim().min(1)).min(1),
});

export const privacyContentSchema = z.object({
  content: z.string().max(20_000).default(""),
});

export const siteConfigSchema = z.object({
  name: z.string().trim().min(1).max(100),
  role: z.string().trim().min(1).max(150),
  tagline: z.string().trim().min(1).max(300),
  bio: z.string().trim().min(1).max(2000),
  description: z.string().trim().min(1).max(300),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(30).optional().default(""),
  location: z.string().trim().max(150).optional().default(""),
  workArrangement: z.array(z.enum(WORK_ARRANGEMENTS)).min(1, "Select at least one"),
  photo: z.string().trim().max(500).optional().default(""),
  maintenanceMode: z.boolean().optional().default(false),
  maintenanceMessage: z.string().trim().max(500).optional().default(""),
  notFoundMode: z.boolean().optional().default(false),
  shareEnabled: z.boolean().optional().default(true),
  social: z.object({
    github: externalUrlField(300),
    linkedin: externalUrlField(300),
    twitter: externalUrlField(300),
    whatsapp: externalUrlField(300),
  }),
  sections: z.object({
    about: z.boolean().optional().default(true),
    skills: z.boolean().optional().default(true),
    projects: z.boolean().optional().default(true),
    blog: z.boolean().optional().default(true),
    experience: z.boolean().optional().default(true),
    education: z.boolean().optional().default(true),
    contact: z.boolean().optional().default(true),
  }),
  seo: z.object({
    ogImage: z.string().trim().max(500).optional().default(""),
    twitterHandle: z.string().trim().max(50).optional().default(""),
    noIndex: z.boolean().optional().default(false),
    googleSiteVerification: z.string().trim().max(200).optional().default(""),
    bingSiteVerification: z.string().trim().max(200).optional().default(""),
  }),
});
