import Link from "next/link";
import { ArrowRight, Newspaper } from "lucide-react";
import { getPosts, getSiteConfig } from "@/lib/data";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PostCard } from "@/components/blog/PostCard";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/motion/FadeIn";
import { SectionGlow } from "@/components/decor/SectionGlow";

export async function BlogPreview() {
  const siteConfig = await getSiteConfig();
  if (!siteConfig.sections.blog) return null;

  const posts = (await getPosts()).slice(0, 3);

  if (posts.length === 0) return null;

  return (
    <section className="relative overflow-hidden bg-secondary/50 py-20 pb-28">
      <SectionGlow variant="top-left" color={3} />
      <Container>
        <FadeIn className="mb-10">
          <div className="flex items-end justify-between">
            <SectionHeading
              eyebrow="Blog"
              title="Recent writing"
              description="Notes on things I'm building and learning."
              icon={Newspaper}
            />
            <Link
              href="/blog"
              className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-foreground hover:underline sm:flex"
            >
              View all <ArrowRight className="size-4" />
            </Link>
          </div>
        </FadeIn>
        <StaggerGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <StaggerItem key={post.slug}>
              <PostCard post={post} />
            </StaggerItem>
          ))}
        </StaggerGroup>
      </Container>
    </section>
  );
}
