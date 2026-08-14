# Portfolio

A personal portfolio site built with Next.js (App Router) and Tailwind CSS, with a "liquid glass" animated UI, light/dark theme toggle, and a password-protected `/admin` panel for editing content. Content (projects, blog posts, skills, experience/education, site settings, uploaded assets) is stored in MongoDB. Contact form submissions are saved the same way, trigger an email notification, and show up in the admin inbox.

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

Everything is stored in MongoDB, one collection per content type — `projects`, `posts` (blog metadata; the post body itself is also stored as content, not a file on disk), `skills`, `experience`, `education`, `site` (owner's name, bio, contact info, social links, page-visibility toggles), `messages` (contact form submissions), `admin` (password hash + 2FA/recovery config), and `activity` (the admin History log). `public/images/...` still holds uploaded project/blog/experience images and the favicon; `public/resume.pdf` is the one file you should replace with your real resume before deploying.

Edit content through `/admin` — there's no reason to touch the database directly. Pages are rendered dynamically (`export const dynamic = 'force-dynamic'`), so content-only changes show up without a rebuild.

**Securing your database**: if you're using MongoDB Atlas's free tier, its network access list defaults to (or is often set to) "allow access from anywhere" during setup — restrict this to your deployment host's IP (or your own IP while developing) rather than leaving it open to the internet. A leaked or guessed `MONGODB_URI` is otherwise a direct path to every piece of content and the admin password hash.

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the values you need:

| Variable | Purpose |
|---|---|
| `MONGODB_URI` | MongoDB connection string (Atlas or self-hosted) — **required** |
| `MONGODB_DB` | Database name (defaults to `portfolio` if unset) |
| `EMAIL_PROVIDER` | `console` (default, logs instead of sending), `resend`, or `smtp` |
| `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL` | Used when `EMAIL_PROVIDER=resend` |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` | Used when `EMAIL_PROVIDER=smtp` |
| `SITE_URL` | Used for `sitemap.ts`/`robots.ts` absolute URLs |
| `ADMIN_PASSWORD` | Password required to log into `/admin` before it's ever been changed through the UI — **change before deploying** |
| `SESSION_SECRET` | Random 32+ character string used to sign admin session/2FA/recovery cookies — **change before deploying** |

With `EMAIL_PROVIDER=console` (the default), the app runs with zero email configuration — contact submissions are still saved to the database, and the would-be email is logged to the server console instead of sent.

## Docker / Self-Hosting

```bash
docker compose up --build
```

`docker-compose.yml` bind-mounts `./public/images` (+ `resume.pdf`) into the container so uploaded images persist across rebuilds — all other content lives in MongoDB, external to the container, so it survives rebuilds regardless. Multiple replicas are safe to run against the same database; the only per-process state is the admin login/contact-form rate limiter (`src/lib/rateLimit.ts`), which just means rate limits aren't shared across replicas, not a correctness issue.

## Production Build

```bash
npm run build
npm run start
```
