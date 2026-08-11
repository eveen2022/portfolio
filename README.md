# Portfolio

A personal portfolio site built with Next.js (App Router) and Tailwind CSS, with a "liquid glass" animated UI, light/dark theme toggle, and a password-protected `/admin` panel for editing content. Content (projects, blog posts, skills, experience/education, site settings) lives in JSON files under `data/` and Markdown files under `content/blog/` instead of a database. Contact form submissions are appended to `data/messages.json`, trigger an email notification, and show up in the admin inbox.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) for the site, or [http://localhost:3001/admin](http://localhost:3001/admin) for the admin panel.

## Admin Panel (`/admin`)

Log in with the password set in `ADMIN_PASSWORD` (see Environment Variables below). From there you can:

- **Projects** — create, edit, delete, upload a cover image
- **Blog** — create, edit, delete posts, including the Markdown body, with a cover image
- **Skills** — edit categories and skill levels
- **Experience** / **Education** — edit timeline entries, with an optional logo
- **Messages** — read, mark read/unread, and delete contact form submissions
- **Settings** — edit name, role, tagline, bio, email, location, and social links (`data/site.json`)

**Before deploying**, change `ADMIN_PASSWORD` and `SESSION_SECRET` in your environment — the values in `.env.local` are local-dev placeholders only (`ADMIN_PASSWORD=admin123` is not safe to use in production). Generate a strong `SESSION_SECRET` with e.g. `openssl rand -base64 32`.

Auth is a single shared password (no per-user accounts) — appropriate for a single-owner portfolio, not a multi-admin CMS. The session is a signed, httpOnly cookie valid for 7 days.

## Content

- `data/projects.json` — projects showcase
- `data/posts.json` — blog post metadata (title, excerpt, tags, dates); the post body is the matching Markdown file in `content/blog/<slug>.md`
- `data/skills.json` — skills grouped by category
- `data/experience.json` / `data/education.json` — timeline entries
- `data/site.json` — site owner's name, bio, contact info, and social links
- `data/messages.json` — contact form submissions (written at runtime, do not hand-edit while the app is running)
- `public/images/...` — project/blog/experience images (can also be uploaded through the admin panel)
- `public/resume.pdf` — replace the placeholder with your real resume

You can edit these files directly, or use `/admin`. Either way, blog/project pages are rendered dynamically (`export const dynamic = 'force-dynamic'`), so content-only changes show up without a rebuild.

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the values you need:

| Variable | Purpose |
|---|---|
| `EMAIL_PROVIDER` | `console` (default, logs instead of sending), `resend`, or `smtp` |
| `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL` | Used when `EMAIL_PROVIDER=resend` |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` | Used when `EMAIL_PROVIDER=smtp` |
| `SITE_URL` | Used for `sitemap.ts`/`robots.ts` absolute URLs |
| `ADMIN_PASSWORD` | Password required to log into `/admin` — **change before deploying** |
| `SESSION_SECRET` | Random 32+ character string used to sign admin session cookies — **change before deploying** |

With `EMAIL_PROVIDER=console` (the default), the app runs with zero email configuration — contact submissions are still saved to `data/messages.json`, and the would-be email is logged to the server console instead of sent.

## Docker / Self-Hosting

```bash
docker compose up --build
```

`docker-compose.yml` bind-mounts `./data` and `./public/images` (+ `resume.pdf`) into the container so contact-form writes, admin edits, and uploaded images persist across rebuilds. Run this as a **single container/replica** — the JSON write lock in `src/lib/fsWrite.ts` is per-process only and isn't safe across multiple concurrent instances. If you outgrow that, swap the JSON files under `data/` for a real database.

## Production Build

```bash
npm run build
npm run start
```
