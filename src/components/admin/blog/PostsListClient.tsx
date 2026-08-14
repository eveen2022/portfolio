"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Reorder, useDragControls } from "framer-motion";
import { Plus, Pencil, Loader2, GripVertical } from "lucide-react";
import type { Post } from "@/lib/types";
import { Card } from "@/components/admin/form";
import { Button } from "@/components/ui/Button";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { Modal } from "@/components/admin/Modal";
import { PostForm } from "@/components/admin/blog/PostForm";
import { useToast } from "@/components/admin/toast/ToastProvider";

type PostWithBody = Post & { body: string };

function PostRow({
  post,
  loading,
  reordering,
  onEdit,
  onDragEnd,
}: {
  post: Post;
  loading: boolean;
  reordering: boolean;
  onEdit: () => void;
  onDragEnd: () => void;
}) {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={post}
      as="div"
      dragListener={false}
      dragControls={dragControls}
      onDragEnd={onDragEnd}
    >
      <Card className="flex items-center gap-3 sm:gap-4">
        <button
          type="button"
          disabled={reordering}
          onPointerDown={(event) => {
            if (!reordering) dragControls.start(event);
          }}
          className="flex size-8 shrink-0 cursor-grab touch-none items-center justify-center rounded-lg text-muted transition-colors hover:bg-foreground/5 active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Drag to reorder"
        >
          <GripVertical className="size-4" />
        </button>
        <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-secondary sm:size-16">
          {post.coverImage && (
            <Image src={post.coverImage} alt="" fill className="object-cover" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-foreground">{post.title}</p>
          <p className="truncate text-sm text-muted">
            /{post.slug} · {post.published ? "published" : "draft"}
          </p>
        </div>
        <button
          type="button"
          onClick={onEdit}
          disabled={loading}
          className="flex size-8 shrink-0 items-center justify-center rounded-lg text-foreground-secondary transition-colors hover:bg-foreground/5 disabled:opacity-50"
          aria-label="Edit"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Pencil className="size-4" />}
        </button>
        <DeleteButton
          endpoint={`/api/admin/posts/${post.slug}`}
          confirmMessage={`Delete "${post.title}"? This can't be undone.`}
          label="post"
        />
      </Card>
    </Reorder.Item>
  );
}

export function PostsListClient({ posts }: { posts: Post[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [editing, setEditing] = useState<PostWithBody | "new" | null>(null);
  const [loadingSlug, setLoadingSlug] = useState<string | null>(null);
  const [items, setItems] = useState(posts);
  const [reordering, setReordering] = useState(false);
  // Re-sync local drag state when the server-sorted prop changes (e.g. after
  // create/edit/delete triggers router.refresh()) — the React-recommended
  // "adjust state during render" pattern, not an effect, so there's no
  // one-render lag where stale items would flash. Skipped while a reorder
  // save is in flight: the app's own activity broadcast triggers a
  // router.refresh() in every open admin tab (including this one) shortly
  // after the PATCH is sent, and applying that server snapshot mid-save
  // would visually snap the list back before the save's own response lands.
  const [prevPosts, setPrevPosts] = useState(posts);
  if (posts !== prevPosts) {
    setPrevPosts(posts);
    if (!reordering) setItems(posts);
  }

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

  async function commitReorder(next: Post[]) {
    setItems(next);
    setReordering(true);
    try {
      const response = await fetch("/api/admin/posts/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slugs: next.map((p) => p.slug) }),
      });
      if (!response.ok) throw new Error("Failed to save order");
      router.refresh();
    } catch (err) {
      toast({
        type: "error",
        title: "Failed to save order",
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setReordering(false);
    }
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Blog</h1>
          <p className="text-sm text-muted">{items.length} total</p>
        </div>
        <Button onClick={() => setEditing("new")} className="self-start sm:self-auto">
          <Plus className="size-4" /> New post
        </Button>
      </div>

      {items.length === 0 && (
        <Card className="text-sm text-muted">
          No posts yet. Create your first one.
        </Card>
      )}

      {items.length > 0 && (
        <Reorder.Group
          as="div"
          axis="y"
          values={items}
          onReorder={setItems}
          className="flex flex-col gap-3"
        >
          {items.map((post) => (
            <PostRow
              key={post.slug}
              post={post}
              loading={loadingSlug === post.slug}
              reordering={reordering}
              onEdit={() => openEdit(post)}
              onDragEnd={() => commitReorder(items)}
            />
          ))}
        </Reorder.Group>
      )}

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
