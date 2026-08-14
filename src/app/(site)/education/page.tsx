import type { Metadata } from "next";
import { Timeline } from "@/components/sections/Timeline";
import { getSiteConfig } from "@/lib/data";
import { buildPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = await getSiteConfig();
  return buildPageMetadata({
    title: "Education",
    description: "Where I've studied.",
    path: "/education",
    image: siteConfig.seo.ogImage || siteConfig.photo || undefined,
    noIndex: siteConfig.seo.noIndex,
    siteName: siteConfig.name,
  });
}

export default function EducationPage() {
  return <Timeline type="education" />;
}
