import type { Metadata } from "next";
import { Newspaper } from "lucide-react";
import { getPosts, getSiteConfig } from "@/lib/data";
import { buildPageMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PostCard } from "@/components/blog/PostCard";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/motion/FadeIn";
import { SectionGlow } from "@/components/decor/SectionGlow";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = await getSiteConfig();
  return buildPageMetadata({
    title: "Blog",
    description: "Notes on things I'm building and learning.",
    path: "/blog",
    image: siteConfig.seo.ogImage || siteConfig.photo || undefined,
    noIndex: siteConfig.seo.noIndex,
    siteName: siteConfig.name,
  });
}

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <div className="relative overflow-hidden">
      <SectionGlow variant="top-left" color={3} />
      <Container className="py-20">
        <FadeIn>
          <SectionHeading
            as="h1"
            eyebrow="Blog"
            title="All posts"
            description="Notes on things I'm building and learning."
            icon={Newspaper}
          />
        </FadeIn>
        {posts.length === 0 ? (
          <p className="text-muted">
            No posts yet — add entries from /admin/blog.
          </p>
        ) : (
          <StaggerGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <StaggerItem key={post.slug}>
                <PostCard post={post} />
              </StaggerItem>
            ))}
          </StaggerGroup>
        )}
      </Container>
    </div>
  );
}
