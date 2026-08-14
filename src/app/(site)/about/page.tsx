import type { Metadata } from "next";
import { About } from "@/components/sections/About";
import { Skills } from "@/components/sections/Skills";
import { getSiteConfig } from "@/lib/data";
import { buildPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = await getSiteConfig();
  return buildPageMetadata({
    title: "About",
    description: "Background, and the technologies I work with.",
    path: "/about",
    image: siteConfig.seo.ogImage || siteConfig.photo || undefined,
    noIndex: siteConfig.seo.noIndex,
    siteName: siteConfig.name,
  });
}

export default async function AboutPage() {
  const siteConfig = await getSiteConfig();

  return (
    <>
      <About />
      {siteConfig.sections.skills && <Skills />}
    </>
  );
}
