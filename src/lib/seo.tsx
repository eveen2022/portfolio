import type { Metadata } from "next";
import { siteMeta } from "@/lib/site";

/**
 * Builds the OG/Twitter/canonical/robots slice of a page's Metadata from a
 * few plain inputs — every (site) route uses this so the same fields don't
 * get hand-rolled (and inevitably drift) six times over.
 */
export function buildPageMetadata({
  title,
  description,
  path,
  image,
  noIndex = false,
  type = "website",
  siteName,
}: {
  title: string;
  description: string;
  /** Site-relative path, e.g. "/about", "/blog/some-slug" — resolved against metadataBase. */
  path: string;
  /** Site-relative or absolute image URL. Omit if there's nothing to show. */
  image?: string;
  noIndex?: boolean;
  type?: "website" | "article";
  /** SiteConfig.name — optional since not every call site has it loaded. */
  siteName?: string;
}): Metadata {
  const url = `${siteMeta.siteUrl}${path}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url,
      type,
      siteName,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image] : undefined,
    },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
  };
}

/**
 * Renders a JSON-LD <script> tag. The `<` escape guards against the (rare)
 * case where a title/description contains a literal "</script>" sequence,
 * which would otherwise prematurely close the tag when the JSON is inlined
 * as HTML.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}

export function personJsonLd({
  name,
  role,
  bio,
  photo,
  email,
  social,
}: {
  name: string;
  role: string;
  bio: string;
  photo?: string;
  email?: string;
  social: { github?: string; linkedin?: string; twitter?: string };
}) {
  const sameAs = [social.github, social.linkedin, social.twitter].filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    jobTitle: role,
    description: bio,
    url: siteMeta.siteUrl,
    ...(photo ? { image: `${siteMeta.siteUrl}${photo}` } : {}),
    ...(email ? { email } : {}),
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}

export function websiteJsonLd({ name, description }: { name: string; description: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    description,
    url: siteMeta.siteUrl,
  };
}

export function articleJsonLd({
  title,
  description,
  path,
  image,
  publishedAt,
  updatedAt,
  authorName,
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
  publishedAt: string;
  updatedAt?: string | null;
  authorName: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    url: `${siteMeta.siteUrl}${path}`,
    ...(image ? { image: [image] } : {}),
    ...(publishedAt ? { datePublished: publishedAt } : {}),
    dateModified: updatedAt || publishedAt || undefined,
    author: { "@type": "Person", name: authorName },
  };
}

export function creativeWorkJsonLd({
  name,
  description,
  path,
  image,
}: {
  name: string;
  description: string;
  path: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name,
    description,
    url: `${siteMeta.siteUrl}${path}`,
    ...(image ? { image } : {}),
  };
}
