"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Loader2, Trash2, ImageOff } from "lucide-react";
import { Card } from "@/components/admin/form";
import { formatBytes } from "@/lib/format";
import { useToast } from "@/components/admin/toast/ToastProvider";
import { useConfirm } from "@/components/admin/confirm/ConfirmProvider";

type MediaFile = {
  path: string;
  category: string;
  fileName: string;
  sizeBytes: number;
  modifiedAt: string;
  usedBy: string[];
};

const CATEGORY_LABELS: Record<string, string> = {
  projects: "Projects",
  blog: "Blog",
  experience: "Experience & education",
  site: "Site",
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(iso));
}

export function MediaLibraryTab() {
  const { toast } = useToast();
  const confirm = useConfirm();
  const [files, setFiles] = useState<MediaFile[] | null>(null);
  const [deletingPath, setDeletingPath] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/media")
      .then((res) => res.json())
      .then((data) => setFiles(data.files ?? []))
      .catch(() => setFiles([]));
  }, []);

  async function handleDelete(file: MediaFile) {
    const message =
      file.usedBy.length > 0
        ? `"${file.fileName}" is currently used by ${file.usedBy.join(", ")}. Deleting it will leave a broken image there until you update it. Delete anyway?`
        : `Delete "${file.fileName}"? This can't be undone.`;

    if (!(await confirm({ message, confirmLabel: "Delete" }))) return;

    setDeletingPath(file.path);
    try {
      const response = await fetch(`/api/admin/media?path=${encodeURIComponent(file.path)}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "Failed to delete file");
      }
      setFiles((prev) => (prev ? prev.filter((f) => f.path !== file.path) : prev));
      toast({ type: "delete", title: "Image deleted" });
    } catch (err) {
      toast({
        type: "error",
        title: "Failed to delete image",
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setDeletingPath(null);
    }
  }

  if (files === null) {
    return (
      <Card className="flex items-center justify-center gap-2 py-12 text-sm text-muted">
        <Loader2 className="size-4 animate-spin" /> Loading images...
      </Card>
    );
  }

  if (files.length === 0) {
    return (
      <Card className="flex flex-col items-center gap-2 py-12 text-center text-sm text-muted">
        <ImageOff className="size-6" />
        No uploaded images found.
      </Card>
    );
  }

  const grouped = files.reduce<Record<string, MediaFile[]>>((acc, file) => {
    (acc[file.category] ??= []).push(file);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-6">
      <p className="text-xs text-muted">
        Every image ever uploaded through a form on this site, grouped by
        where it was uploaded from. Deleting one here removes the file from
        the server — it won&apos;t un-set it from whatever content still
        references it.
      </p>

      {Object.entries(grouped).map(([category, categoryFiles]) => (
        <div key={category}>
          <h2 className="mb-3 text-sm font-semibold text-foreground">
            {CATEGORY_LABELS[category] ?? category} ({categoryFiles.length})
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {categoryFiles.map((file) => (
              <Card key={file.path} className="flex flex-col gap-2 p-3">
                <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-secondary">
                  <Image src={file.path} alt={file.fileName} fill unoptimized className="object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-foreground" title={file.fileName}>
                    {file.fileName}
                  </p>
                  <p className="text-[11px] text-muted">
                    {formatBytes(file.sizeBytes)} · {formatDate(file.modifiedAt)}
                  </p>
                  {file.usedBy.length > 0 && (
                    <p className="mt-1 truncate text-[11px] text-accent" title={file.usedBy.join(", ")}>
                      Used by {file.usedBy.length} {file.usedBy.length === 1 ? "item" : "items"}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(file)}
                  disabled={deletingPath === file.path}
                  className="flex items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-500/10 disabled:opacity-50 dark:text-red-400"
                >
                  {deletingPath === file.path ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="size-3.5" />
                  )}
                  Delete
                </button>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
