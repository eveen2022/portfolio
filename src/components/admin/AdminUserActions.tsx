"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, LogOut } from "lucide-react";
import { useToast } from "@/components/admin/toast/ToastProvider";

/**
 * Session-level actions (leave the panel / sign out) — deliberately separate
 * from AdminSidebar, which is pure content navigation. Rendered in the
 * topbar: icon-only on mobile where space is tight, icon+label on desktop.
 */
export function AdminUserActions({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const { toast } = useToast();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    toast({ type: "info", title: "Thank you, come again." });
    router.push("/admin/login");
    router.refresh();
  }

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        <Link
          href="/"
          target="_blank"
          rel="noreferrer noopener"
          aria-label="View site"
          title="View site"
          className="flex size-9 items-center justify-center rounded-full text-foreground-secondary transition-colors hover:bg-foreground/5"
        >
          <ExternalLink className="size-4" />
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          aria-label="Log out"
          title="Log out"
          className="flex size-9 items-center justify-center rounded-full text-red-600 transition-colors hover:bg-red-500/10 dark:text-red-400"
        >
          <LogOut className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/"
        target="_blank"
        rel="noreferrer noopener"
        className="glass relative inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-foreground-secondary shadow-xl shadow-black/10 transition-colors hover:text-accent"
      >
        <ExternalLink className="size-3" /> View site
      </Link>
      <button
        type="button"
        onClick={handleLogout}
        className="glass relative inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-red-600 shadow-xl shadow-black/10 transition-colors hover:bg-red-500/10 dark:text-red-400"
      >
        <LogOut className="size-3" /> Log out
      </button>
    </div>
  );
}
