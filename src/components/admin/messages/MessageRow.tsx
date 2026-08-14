"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, MailOpen, Trash2 } from "lucide-react";
import type { ContactMessage } from "@/lib/types";
import { Card } from "@/components/admin/form";
import { Modal } from "@/components/admin/Modal";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { useToast } from "@/components/admin/toast/ToastProvider";
import { useConfirm } from "@/components/admin/confirm/ConfirmProvider";

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateString));
}

export function MessageRow({ message }: { message: ContactMessage }) {
  const router = useRouter();
  const { toast } = useToast();
  const confirm = useConfirm();
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);

  async function setRead(read: boolean, announce: boolean) {
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/messages/${message.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read }),
      });
      if (!response.ok) throw new Error("Failed to update message");
      if (announce) {
        toast({ type: "success", title: read ? "Marked as read" : "Marked as unread" });
      }
      router.refresh();
    } catch {
      if (announce) toast({ type: "error", title: "Failed to update message" });
    } finally {
      setBusy(false);
    }
  }

  function toggleRead(event: React.MouseEvent) {
    event.stopPropagation();
    setRead(!message.read, true);
  }

  function handleOpen() {
    setOpen(true);
    // Opening the message to read it should count as reading it — no toast,
    // since this is an automatic side effect, not something the admin asked for.
    if (!message.read) setRead(true, false);
  }

  async function handleDelete(event?: React.MouseEvent) {
    event?.stopPropagation();
    if (!(await confirm("Delete this message? This can't be undone."))) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/messages/${message.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete message");
      toast({ type: "delete", title: "Message deleted" });
      setOpen(false);
      router.refresh();
    } catch {
      toast({ type: "error", title: "Failed to delete message" });
      setBusy(false);
    }
  }

  return (
    <>
      <Card
        onClick={handleOpen}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleOpen();
          }
        }}
        className={cn(
          "flex cursor-pointer flex-col gap-2 transition-colors hover:bg-foreground/5",
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
        <p className="line-clamp-2 text-sm text-foreground-secondary">
          {message.message}
        </p>
      </Card>

      {open && (
        <Modal title="Message" onClose={() => setOpen(false)}>
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-xs font-medium tracking-wide text-muted uppercase">
                From
              </p>
              <p className="text-sm text-foreground">
                {message.name}{" "}
                <span className="text-foreground-secondary">
                  &lt;{message.email}&gt;
                </span>
              </p>
            </div>

            <div>
              <p className="text-xs font-medium tracking-wide text-muted uppercase">
                Received
              </p>
              <p className="text-sm text-foreground">
                {formatDate(message.submittedAt)}
              </p>
            </div>

            {message.subject && (
              <div>
                <p className="text-xs font-medium tracking-wide text-muted uppercase">
                  Subject
                </p>
                <p className="text-sm text-foreground">{message.subject}</p>
              </div>
            )}

            <div>
              <p className="text-xs font-medium tracking-wide text-muted uppercase">
                Message
              </p>
              <p className="mt-1 text-sm whitespace-pre-wrap text-foreground-secondary">
                {message.message}
              </p>
            </div>

            {!message.emailSent && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                The email notification for this message failed to send.
              </p>
            )}

            <div className="flex gap-3 border-t border-border pt-4">
              <Button type="button" variant="secondary" onClick={toggleRead} disabled={busy}>
                {message.read ? (
                  <>
                    <Mail className="size-4" /> Mark as unread
                  </>
                ) : (
                  <>
                    <MailOpen className="size-4" /> Mark as read
                  </>
                )}
              </Button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={busy}
                className="flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-500/10 disabled:opacity-50 dark:text-red-400"
              >
                <Trash2 className="size-4" /> Delete
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
