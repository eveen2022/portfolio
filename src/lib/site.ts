// Structural site config that isn't part of the editable content model.
// Editable content (name, bio, socials, etc.) lives in data/site.json —
// see getSiteConfig() in lib/data.ts and the /admin/settings page.
export const siteMeta = {
  nav: [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Projects", href: "/projects" },
    { label: "Experience", href: "/experience" },
    { label: "Education", href: "/education" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
  ],
  siteUrl: process.env.SITE_URL ?? "http://localhost:3000",
};
