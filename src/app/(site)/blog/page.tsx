import type { Metadata } from "next";
import { Newspaper } from "lucide-react";
import { getPosts } from "@/lib/data";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PostCard } from "@/components/blog/PostCard";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/motion/FadeIn";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog",
  description: "Notes on things I'm building and learning.",
};

export default async function BlogPage() {
  const posts = await getPosts();

  return (
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
  );
}
