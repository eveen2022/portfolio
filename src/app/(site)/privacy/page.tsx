import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { getPrivacyPolicyContent, getSiteConfig } from "@/lib/data";
import { buildPageMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BackButton } from "@/components/ui/BackButton";
import { MarkdownRenderer } from "@/components/blog/MarkdownRenderer";
import { FadeIn } from "@/components/motion/FadeIn";
import { SectionGlow } from "@/components/decor/SectionGlow";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = await getSiteConfig();
  return buildPageMetadata({
    title: "Privacy",
    description: "What this site collects, why, and how it's used.",
    path: "/privacy",
    noIndex: siteConfig.seo.noIndex,
    siteName: siteConfig.name,
  });
}

export default async function PrivacyPage() {
  const content = await getPrivacyPolicyContent();

  return (
    <div className="relative overflow-hidden">
      <SectionGlow variant="top-left" color={2} />
      <Container className="py-20">
        <FadeIn className="mx-auto max-w-2xl">
          <BackButton />

          <SectionHeading
            as="h1"
            eyebrow="Privacy"
            title="Privacy policy"
            description="A short, plain-language summary of what this site collects and why — not a legal document, just an honest account."
            icon={ShieldCheck}
          />

          <MarkdownRenderer content={content} />
        </FadeIn>
      </Container>
    </div>
  );
}
