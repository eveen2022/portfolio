"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  FolderKanban,
  Newspaper,
  Sparkles,
  Briefcase,
  GraduationCap,
  Inbox,
  History,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/cn";

const navGroups = [
  {
    label: "Overview",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/projects", label: "Projects", icon: FolderKanban },
      { href: "/admin/blog", label: "Blog", icon: Newspaper },
      { href: "/admin/skills", label: "Skills", icon: Sparkles },
      { href: "/admin/experience", label: "Experience", icon: Briefcase },
      { href: "/admin/education", label: "Education", icon: GraduationCap },
      { href: "/admin/privacy", label: "Privacy page", icon: ShieldCheck },
    ],
  },
  {
    label: "Inbox",
    items: [
      { href: "/admin/messages", label: "Messages", icon: Inbox },
      { href: "/admin/history", label: "History", icon: History },
    ],
  },
  {
    label: "System",
    items: [{ href: "/admin/settings", label: "Settings", icon: Settings }],
  },
];

export function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col p-4">
      <div>
        <Link href="/admin" className="mb-6 flex items-center gap-2.5 px-2">
          <span className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent-2 font-mono text-xs font-bold text-white">
            {"</>"}
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">
              Admin
            </p>
            <p className="text-xs text-muted">Content studio</p>
          </div>
        </Link>

        <nav className="flex flex-col gap-5">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="mb-1.5 px-3 font-mono text-[11px] font-medium tracking-wider text-muted uppercase">
                {group.label}
              </p>
              <div className="flex flex-col gap-1">
                {group.items.map((item) => {
                  const active =
                    item.href === "/admin"
                      ? pathname === "/admin"
                      : pathname.startsWith(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onNavigate}
                      className={cn(
                        "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-all",
                        active
                          ? "bg-gradient-to-r from-accent to-accent-2 text-white shadow-md shadow-accent-soft"
                          : "text-foreground-secondary hover:bg-foreground/5",
                      )}
                    >
                      <Icon className="size-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
}
