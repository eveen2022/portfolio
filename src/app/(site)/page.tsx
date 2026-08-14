import type { Metadata } from "next";
import { Hero } from "@/components/sections/Hero";
import { ProjectsGrid } from "@/components/sections/ProjectsGrid";
import { BlogPreview } from "@/components/sections/BlogPreview";
import { getSiteConfig } from "@/lib/data";
import { siteMeta } from "@/lib/site";
import { JsonLd, personJsonLd, websiteJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

// No `title`/`description` here on purpose — the homepage inherits the root
// layout's default title/description as-is rather than re-templating them.
export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = await getSiteConfig();
  const ogImage = siteConfig.seo.ogImage || siteConfig.photo || undefined;

  return {
    alternates: { canonical: "/" },
    openGraph: {
      url: siteMeta.siteUrl,
      type: "website",
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      images: ogImage ? [ogImage] : undefined,
    },
    robots: siteConfig.seo.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

export default async function Home() {
  const siteConfig = await getSiteConfig();

  return (
    <>
      <JsonLd
        data={personJsonLd({
          name: siteConfig.name,
          role: siteConfig.role,
          bio: siteConfig.bio,
          photo: siteConfig.photo,
          email: siteConfig.email,
          social: siteConfig.social,
        })}
      />
      <JsonLd
        data={websiteJsonLd({ name: siteConfig.name, description: siteConfig.description })}
      />
      <Hero />
      <ProjectsGrid />
      <BlogPreview />
    </>
  );
}
