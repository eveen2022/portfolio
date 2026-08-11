"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ImageIcon, Upload, Loader2, Trash2 } from "lucide-react";
import { Card } from "@/components/admin/form";
import { useToast } from "@/components/admin/toast/ToastProvider";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function FaviconUpload() {
  const { toast } = useToast();
  const [url, setUrl] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/favicon")
      .then((res) => res.json())
      .then((data) => {
        setUrl(data.exists ? data.url : null);
        setUpdatedAt(data.updatedAt ?? null);
      })
      .catch(() => {});
  }, []);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/favicon", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "Failed to upload icon");
      }

      const data = await response.json();
      // Cache-bust so the new icon shows immediately in this tab's preview,
      // even though the URL path itself stays the same across uploads.
      setUrl(`${data.url}?t=${Date.now()}`);
      setUpdatedAt(data.updatedAt);
      toast({ type: "success", title: "Browser tab icon updated" });
    } catch (err) {
      toast({
        type: "error",
        title: "Failed to upload icon",
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleDelete() {
    if (!window.confirm("Remove the custom browser tab icon? This can't be undone.")) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch("/api/admin/favicon", { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "Failed to remove icon");
      }
      setUrl(null);
      setUpdatedAt(null);
      toast({ type: "delete", title: "Browser tab icon removed" });
    } catch (err) {
      toast({
        type: "error",
        title: "Failed to remove icon",
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Card className="flex flex-col gap-4">
      <h2 className="text-sm font-semibold text-foreground">Browser tab icon</h2>

      <div className="flex items-center gap-4">
        <div className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-secondary text-muted">
          {uploading ? (
            <Loader2 className="size-5 animate-spin" />
          ) : url ? (
            <Image src={url} alt="" width={28} height={28} unoptimized />
          ) : (
            <ImageIcon className="size-5" />
          )}
        </div>
        <div className="flex-1">
          {url ? (
            <>
              <p className="text-sm font-medium text-foreground">Custom icon set</p>
              {updatedAt && (
                <p className="text-xs text-muted">Last updated {formatDate(updatedAt)}</p>
              )}
            </>
          ) : (
            <p className="text-sm text-muted">Using the default icon.</p>
          )}
        </div>
      </div>

      <div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="glass relative inline-flex cursor-pointer items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-foreground transition-transform hover:scale-105">
            <Upload className="size-4" />
            {url ? "Replace icon" : "Upload icon"}
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/x-icon,image/vnd.microsoft.icon,.ico,image/svg+xml"
              onChange={handleFileChange}
              disabled={uploading}
              className="hidden"
            />
          </label>
          {url && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting || uploading}
              className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-500/10 disabled:opacity-50 dark:text-red-400"
            >
              <Trash2 className="size-4" />
              {deleting ? "Removing..." : "Remove"}
            </button>
          )}
        </div>
        <p className="mt-1.5 text-xs text-muted">
          PNG, ICO, or SVG, max 2MB. Square images work best (e.g. 32×32 or
          64×64). Changes may take a browser refresh (sometimes a hard
          refresh) to show in the tab.
        </p>
      </div>
    </Card>
  );
}
