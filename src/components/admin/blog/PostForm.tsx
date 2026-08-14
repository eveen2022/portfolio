"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Post } from "@/lib/types";
import { slugify } from "@/lib/slug";
import { Label, Input, Textarea, Checkbox, FormRow } from "@/components/admin/form";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { MarkdownBodyField } from "@/components/admin/blog/MarkdownBodyField";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/admin/toast/ToastProvider";

type Props = {
  mode: "create" | "edit";
  initial?: Post & { body: string };
  onSaved?: () => void;
  onCancel?: () => void;
};

const emptyPost: Post & { body: string } = {
  slug: "",
  title: "",
  excerpt: "",
  coverImage: "",
  tags: [],
  publishedAt: "",
  updatedAt: null,
  published: false,
  readingTimeMinutes: 5,
  body: "",
  order: 0,
  seoTitle: "",
  seoDescription: "",
  noIndex: false,
};

export function PostForm({ mode, initial, onSaved, onCancel }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [post, setPost] = useState(initial ?? emptyPost);
  const [tagsText, setTagsText] = useState((initial?.tags ?? []).join(", "));
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof (Post & { body: string })>(
    key: K,
    value: (Post & { body: string })[K],
  ) {
    setPost((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);

    const payload = {
      ...post,
      tags: tagsText
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      updatedAt: post.updatedAt || null,
    };

    try {
      const endpoint =
        mode === "create" ? "/api/admin/posts" : `/api/admin/posts/${initial?.slug}`;
      const method = mode === "create" ? "POST" : "PUT";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "Failed to save post");
      }

      toast({
        type: "success",
        title: mode === "create" ? "Post created" : "Post updated",
      });
      router.refresh();
      if (onSaved) {
        onSaved();
      } else {
        router.push("/admin/blog");
      }
    } catch (err) {
      toast({
        type: "error",
        title: "Failed to save post",
        description: err instanceof Error ? err.message : undefined,
      });
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <FormRow>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            required
            value={post.title}
            onChange={(e) => {
              const title = e.target.value;
              update("title", title);
              if (!slugTouched) update("slug", slugify(title));
            }}
          />
        </FormRow>

        <FormRow>
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            required
            value={post.slug}
            onChange={(e) => {
              setSlugTouched(true);
              update("slug", e.target.value);
            }}
          />
        </FormRow>

        <FormRow>
          <Label htmlFor="excerpt">Excerpt</Label>
          <Textarea
            id="excerpt"
            required
            rows={2}
            value={post.excerpt}
            onChange={(e) => update("excerpt", e.target.value)}
          />
        </FormRow>

        <ImageUpload
          label="Cover image"
          category="blog"
          nameHint={post.slug || post.title}
          value={post.coverImage}
          onChange={(path) => update("coverImage", path)}
        />

        <FormRow>
          <Label htmlFor="tags">Tags (comma-separated)</Label>
          <Input
            id="tags"
            value={tagsText}
            onChange={(e) => setTagsText(e.target.value)}
            placeholder="Next.js, Architecture"
          />
        </FormRow>

        <div className="grid gap-4 sm:grid-cols-3">
          <FormRow>
            <Label htmlFor="publishedAt">Published date</Label>
            <Input
              id="publishedAt"
              type="date"
              value={post.publishedAt}
              onChange={(e) => update("publishedAt", e.target.value)}
            />
          </FormRow>
          <FormRow>
            <Label htmlFor="readingTimeMinutes">Reading time (min)</Label>
            <Input
              id="readingTimeMinutes"
              type="number"
              min={1}
              value={post.readingTimeMinutes}
              onChange={(e) =>
                update("readingTimeMinutes", Number(e.target.value) || 1)
              }
            />
          </FormRow>
          <div className="flex items-end pb-2">
            <Checkbox
              label="Published"
              checked={post.published}
              onChange={(e) => update("published", e.target.checked)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-xl border border-border p-4">
          <p className="text-sm font-medium text-foreground-secondary">SEO (optional)</p>
          <FormRow>
            <Label htmlFor="seoTitle">Search title override</Label>
            <Input
              id="seoTitle"
              placeholder={post.title || "Falls back to the title above"}
              value={post.seoTitle ?? ""}
              onChange={(e) => update("seoTitle", e.target.value)}
            />
          </FormRow>
          <FormRow>
            <Label htmlFor="seoDescription">Search description override</Label>
            <Textarea
              id="seoDescription"
              rows={2}
              placeholder={post.excerpt || "Falls back to the excerpt above"}
              value={post.seoDescription ?? ""}
              onChange={(e) => update("seoDescription", e.target.value)}
            />
          </FormRow>
          <Checkbox
            label="Hide from search engines"
            checked={post.noIndex}
            onChange={(e) => update("noIndex", e.target.checked)}
          />
        </div>

        <FormRow>
          <Label htmlFor="body">Body (Markdown)</Label>
          <p className="text-xs text-muted">
            Select text to bold, italicize, underline, or resize it.
          </p>
          <MarkdownBodyField
            id="body"
            rows={16}
            value={post.body}
            onChange={(value) => update("body", value)}
          />
        </FormRow>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : "Save post"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => (onCancel ? onCancel() : router.push("/admin/blog"))}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
