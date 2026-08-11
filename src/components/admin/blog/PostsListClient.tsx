"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Plus, Pencil, Loader2 } from "lucide-react";
import type { Post } from "@/lib/types";
import { Card } from "@/components/admin/form";
import { Button } from "@/components/ui/Button";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { Modal } from "@/components/admin/Modal";
import { PostForm } from "@/components/admin/blog/PostForm";
import { useToast } from "@/components/admin/toast/ToastProvider";

type PostWithBody = Post & { body: string };

export function PostsListClient({ posts }: { posts: Post[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [editing, setEditing] = useState<PostWithBody | "new" | null>(null);
  const [loadingSlug, setLoadingSlug] = useState<string | null>(null);

  function close() {
    setEditing(null);
    router.refresh();
  }

  async function openEdit(post: Post) {
    setLoadingSlug(post.slug);
    try {
      const response = await fetch(`/api/admin/posts/${post.slug}`);
      if (!response.ok) throw new Error("Failed to load post");
      const data = (await response.json()) as PostWithBody;
      setEditing(data);
    } catch {
      toast({ type: "error", title: "Failed to load post" });
    } finally {
      setLoadingSlug(null);
    }
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Blog</h1>
          <p className="text-sm text-muted">{posts.length} total</p>
        </div>
        <Button onClick={() => setEditing("new")} className="self-start sm:self-auto">
          <Plus className="size-4" /> New post
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        {posts.length === 0 && (
          <Card className="text-sm text-muted">
            No posts yet. Create your first one.
          </Card>
        )}
        {posts.map((post) => (
          <Card key={post.slug} className="flex items-center gap-3 sm:gap-4">
            <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-secondary sm:size-16">
              {post.coverImage && (
                <Image src={post.coverImage} alt="" fill className="object-cover" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-foreground">
                {post.title}
              </p>
              <p className="truncate text-sm text-muted">
                /{post.slug} · {post.published ? "published" : "draft"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => openEdit(post)}
              disabled={loadingSlug === post.slug}
              className="flex size-8 shrink-0 items-center justify-center rounded-lg text-foreground-secondary transition-colors hover:bg-foreground/5 disabled:opacity-50"
              aria-label="Edit"
            >
              {loadingSlug === post.slug ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Pencil className="size-4" />
              )}
            </button>
            <DeleteButton
              endpoint={`/api/admin/posts/${post.slug}`}
              confirmMessage={`Delete "${post.title}"? This can't be undone.`}
              label="post"
            />
          </Card>
        ))}
      </div>

      {editing && (
        <Modal
          title={editing === "new" ? "New post" : `Edit ${editing.title}`}
          onClose={close}
        >
          <PostForm
            mode={editing === "new" ? "create" : "edit"}
            initial={editing === "new" ? undefined : editing}
            onSaved={close}
            onCancel={close}
          />
        </Modal>
      )}
    </div>
  );
}
