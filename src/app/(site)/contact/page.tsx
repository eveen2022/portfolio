import type { Metadata } from "next";
import { ContactSection } from "@/components/sections/ContactSection";
import { getSiteConfig } from "@/lib/data";
import { buildPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = await getSiteConfig();
  return buildPageMetadata({
    title: "Contact",
    description: "Get in touch.",
    path: "/contact",
    image: siteConfig.seo.ogImage || siteConfig.photo || undefined,
    noIndex: siteConfig.seo.noIndex,
    siteName: siteConfig.name,
  });
}

export default function ContactPage() {
  return <ContactSection />;
}
