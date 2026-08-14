"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { Card, Label } from "@/components/admin/form";
import { MarkdownBodyField } from "@/components/admin/blog/MarkdownBodyField";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/admin/toast/ToastProvider";
import { useConfirm } from "@/components/admin/confirm/ConfirmProvider";

export function PrivacyEditorClient({ initialContent }: { initialContent: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const confirm = useConfirm();
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const response = await fetch("/api/admin/privacy", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "Failed to save");
      }
      toast({ type: "success", title: "Privacy page updated" });
      router.refresh();
    } catch (err) {
      toast({
        type: "error",
        title: "Failed to save",
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleResetToDefault() {
    if (
      !(await confirm({
        message:
          "Replace the text below with the default privacy text? This discards your current edits until you save — nothing is saved yet.",
        confirmLabel: "Reset",
        danger: false,
      }))
    ) {
      return;
    }
    setResetting(true);
    try {
      const response = await fetch("/api/admin/privacy?default=true");
      if (!response.ok) throw new Error("Failed to load default text");
      const data = (await response.json()) as { content: string };
      setContent(data.content);
    } catch (err) {
      toast({
        type: "error",
        title: "Failed to load default text",
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setResetting(false);
    }
  }

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="privacy-content">Page content (Markdown)</Label>
        <button
          type="button"
          onClick={handleResetToDefault}
          disabled={resetting}
          className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-foreground-secondary transition-colors hover:bg-foreground/5 disabled:opacity-50"
        >
          <RotateCcw className="size-3.5" /> Reset to default
        </button>
      </div>
      <p className="-mt-2 text-xs text-muted">
        Select text to bold, italicize, underline, or resize it.
      </p>
      <MarkdownBodyField id="privacy-content" rows={20} value={content} onChange={setContent} />

      <div>
        <Button type="button" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </Card>
  );
}
