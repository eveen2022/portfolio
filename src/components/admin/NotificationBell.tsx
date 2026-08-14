"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, Mail, Check } from "lucide-react";
import { useLiveEvent } from "@/components/live/LiveProvider";
import { useToast } from "@/components/admin/toast/ToastProvider";
import { cn } from "@/lib/cn";

type NotificationMessage = {
  id: string;
  name: string;
  subject: string;
  submittedAt: string;
};

function formatRelative(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function NotificationBell({ compact = false }: { compact?: boolean }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [recent, setRecent] = useState<NotificationMessage[]>([]);
  const [clearing, setClearing] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const refresh = useCallback(() => {
    fetch("/api/admin/notifications")
      .then((res) => res.json())
      .then((data: { unreadCount: number; messages: NotificationMessage[] }) => {
        setUnreadCount(data.unreadCount);
        setRecent(data.messages);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleLiveEvent = useCallback(
    (event: { type: string; [key: string]: unknown }) => {
      if (event.type !== "activity" || event.entity !== "message") return;
      refresh();
    },
    [refresh],
  );
  useLiveEvent(handleLiveEvent);

  async function handleClear() {
    setClearing(true);
    try {
      const response = await fetch("/api/admin/notifications/clear", {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to clear notifications");
      // Instant local feedback — the broadcast()-driven refresh() will also
      // fire shortly after and confirm the same state (and keep any other
      // open tab in sync).
      setUnreadCount(0);
      setRecent([]);
    } catch {
      toast({ type: "error", title: "Failed to clear notifications" });
    } finally {
      setClearing(false);
    }
  }

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        title="Notifications"
        className={cn(
          "relative flex items-center justify-center transition-colors",
          compact
            ? "size-9 rounded-full text-foreground-secondary hover:bg-foreground/5"
            : "glass gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-foreground-secondary shadow-xl shadow-black/10 hover:text-accent",
        )}
      >
        <Bell className={compact ? "size-4" : "size-3"} />
        {!compact && "Notifications"}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex min-w-[1.05rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] leading-[1.05rem] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="glass glass-sheen absolute top-full right-0 z-30 mt-2 w-80 rounded-2xl p-2 shadow-xl shadow-black/10">
          <div className="flex items-center justify-between px-2 py-1.5">
            <p className="text-sm font-semibold text-foreground">Notifications</p>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleClear}
                disabled={clearing}
                className="flex items-center gap-1 rounded-lg px-1.5 py-0.5 text-xs font-medium text-accent transition-colors hover:bg-accent/10 disabled:opacity-50"
              >
                <Check className="size-3" /> {clearing ? "Clearing..." : "Clear all"}
              </button>
            )}
          </div>

          <div className="flex max-h-80 flex-col gap-1 overflow-y-auto">
            {recent.length === 0 ? (
              <p className="px-2 py-6 text-center text-sm text-muted">
                No new messages
              </p>
            ) : (
              recent.map((message) => (
                <Link
                  key={message.id}
                  href="/admin/messages"
                  onClick={() => setOpen(false)}
                  className="flex items-start gap-2.5 rounded-xl px-2 py-2 transition-colors hover:bg-foreground/5"
                >
                  <Mail className="mt-0.5 size-4 shrink-0 text-accent" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {message.name}
                    </p>
                    <p className="truncate text-xs text-muted">
                      {message.subject || "No subject"} ·{" "}
                      {formatRelative(message.submittedAt)}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>

          <Link
            href="/admin/messages"
            onClick={() => setOpen(false)}
            className="mt-1 block rounded-xl px-2 py-2 text-center text-sm font-medium text-accent transition-colors hover:bg-accent/10"
          >
            View all messages
          </Link>
        </div>
      )}
    </div>
  );
}
