"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ImageOff } from "lucide-react";
import type { Post } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";

const MotionLink = motion.create(Link);

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(dateString));
}

export function PostCard({ post }: { post: Post }) {
  return (
    <MotionLink
      href={`/blog/${post.slug}`}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="glass glass-sheen glow-ring relative group flex h-full flex-col overflow-hidden rounded-2xl"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-secondary">
        {post.coverImage ? (
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            sizes="(min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted">
            <ImageOff className="size-8" />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <p className="text-xs font-medium text-muted">
          {formatDate(post.publishedAt)} · {post.readingTimeMinutes} min read
        </p>
        <h3 className="text-lg font-semibold text-foreground">
          {post.title}
        </h3>
        <p className="line-clamp-2 flex-1 text-sm text-foreground-secondary">
          {post.excerpt}
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          {post.tags.map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </div>
      </div>
    </MotionLink>
  );
}
