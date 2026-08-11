"use client";

import { useEffect, useRef, useState } from "react";
import { FileText, Upload, Loader2, ExternalLink, Trash2 } from "lucide-react";
import { Card } from "@/components/admin/form";
import { useToast } from "@/components/admin/toast/ToastProvider";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function ResumeUpload() {
  const { toast } = useToast();
  const [exists, setExists] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/resume")
      .then((res) => res.json())
      .then((data) => {
        setExists(Boolean(data.exists));
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

      const response = await fetch("/api/admin/resume", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "Failed to upload resume");
      }

      const data = await response.json();
      setExists(true);
      setUpdatedAt(data.updatedAt);
      toast({ type: "success", title: "Resume updated" });
    } catch (err) {
      toast({
        type: "error",
        title: "Failed to upload resume",
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleDelete() {
    if (!window.confirm("Delete the current resume? This can't be undone.")) return;

    setDeleting(true);
    try {
      const response = await fetch("/api/admin/resume", { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "Failed to delete resume");
      }
      setExists(false);
      setUpdatedAt(null);
      toast({ type: "delete", title: "Resume deleted" });
    } catch (err) {
      toast({
        type: "error",
        title: "Failed to delete resume",
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Card className="flex flex-col gap-4">
      <h2 className="text-sm font-semibold text-foreground">Resume</h2>

      <div className="flex items-center gap-4">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary text-muted">
          {uploading ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <FileText className="size-5" />
          )}
        </div>
        <div className="flex-1">
          {exists ? (
            <>
              <a
                href="/resume.pdf"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-sm font-medium text-accent hover:underline"
              >
                View current resume <ExternalLink className="size-3.5" />
              </a>
              {updatedAt && (
                <p className="text-xs text-muted">
                  Last updated {formatDate(updatedAt)}
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-muted">No resume uploaded yet.</p>
          )}
        </div>
      </div>

      <div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="glass relative inline-flex cursor-pointer items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-foreground transition-transform hover:scale-105">
            <Upload className="size-4" />
            {exists ? "Replace resume" : "Upload resume"}
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              disabled={uploading}
              className="hidden"
            />
          </label>
          {exists && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting || uploading}
              className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-500/10 disabled:opacity-50 dark:text-red-400"
            >
              <Trash2 className="size-4" />
              {deleting ? "Deleting..." : "Delete"}
            </button>
          )}
        </div>
        <p className="mt-1.5 text-xs text-muted">
          PDF only, max 10MB. Replaces the file linked from the site&apos;s
          Resume button.
        </p>
      </div>
    </Card>
  );
}
