import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getPostBody, getPostBySlug } from "@/lib/data";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { MarkdownRenderer } from "@/components/blog/MarkdownRenderer";
import { FadeIn } from "@/components/motion/FadeIn";

export const dynamic = "force-dynamic";

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(dateString));
}

export async function generateMetadata({
  params,
}: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) return {};

  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({
  params,
}: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) notFound();

  const body = await getPostBody(slug);

  return (
    <Container className="py-20">
      <FadeIn className="mx-auto max-w-3xl">
        <Link
          href="/blog"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-foreground-secondary transition-colors hover:text-accent"
        >
          <ArrowLeft className="size-4" /> Back to blog
        </Link>

        <article>
          <p className="mb-2 font-mono text-sm font-medium text-accent">
            <span className="opacity-60">{"// "}</span>Blog
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {post.title}
          </h1>
          <p className="mt-3 text-sm text-muted">
            {formatDate(post.publishedAt)} · {post.readingTimeMinutes} min read
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </div>
          {post.coverImage && (
            <div className="glass glass-sheen relative mt-8 aspect-video w-full overflow-hidden rounded-2xl">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                sizes="768px"
                className="object-cover"
                priority
              />
            </div>
          )}
          <div className="mt-8">
            <MarkdownRenderer content={body} />
          </div>
        </article>
      </FadeIn>
    </Container>
  );
}
