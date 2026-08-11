"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, MailOpen, Trash2 } from "lucide-react";
import type { ContactMessage } from "@/lib/types";
import { Card } from "@/components/admin/form";
import { cn } from "@/lib/cn";
import { useToast } from "@/components/admin/toast/ToastProvider";

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateString));
}

export function MessageRow({ message }: { message: ContactMessage }) {
  const router = useRouter();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  async function toggleRead() {
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/messages/${message.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: !message.read }),
      });
      if (!response.ok) throw new Error("Failed to update message");
      toast({
        type: "success",
        title: message.read ? "Marked as unread" : "Marked as read",
      });
      router.refresh();
    } catch {
      toast({ type: "error", title: "Failed to update message" });
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Delete this message? This can't be undone.")) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/messages/${message.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete message");
      toast({ type: "delete", title: "Message deleted" });
      router.refresh();
    } catch {
      toast({ type: "error", title: "Failed to delete message" });
      setBusy(false);
    }
  }

  return (
    <Card
      className={cn(
        "flex flex-col gap-2",
        !message.read && "border-blue-400/50 dark:border-blue-500/40",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium break-words text-foreground">
            {message.name}{" "}
            <span className="font-normal text-muted">
              &lt;{message.email}&gt;
            </span>
          </p>
          <p className="text-xs text-muted">
            {formatDate(message.submittedAt)}
            {message.subject ? ` · ${message.subject}` : ""}
            {!message.emailSent && " · email send failed"}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={toggleRead}
            disabled={busy}
            aria-label={message.read ? "Mark as unread" : "Mark as read"}
            className="flex size-8 items-center justify-center rounded-lg text-foreground-secondary hover:bg-foreground/5 disabled:opacity-50"
          >
            {message.read ? (
              <MailOpen className="size-4" />
            ) : (
              <Mail className="size-4" />
            )}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={busy}
            aria-label="Delete"
            className="flex size-8 items-center justify-center rounded-lg text-red-600 hover:bg-red-500/10 disabled:opacity-50 dark:text-red-400"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>
      <p className="text-sm whitespace-pre-wrap text-foreground-secondary">
        {message.message}
      </p>
    </Card>
  );
}
