"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, User, FolderKanban, Briefcase, Newspaper, Mail } from "lucide-react";
import { cn } from "@/lib/cn";

type NavItem = { label: string; href: string };

const iconMap: Record<string, typeof User> = {
  Home: Home,
  About: User,
  Projects: FolderKanban,
  Experience: Briefcase,
  Blog: Newspaper,
  Contact: Mail,
};

export function HeaderNav({ nav }: { nav: NavItem[] }) {
  const pathname = usePathname();

  function isActive(href: string): boolean {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <nav className="flex items-center gap-1.5 sm:gap-1">
      {nav.map((item) => {
        const Icon = iconMap[item.label] ?? User;
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-label={item.label}
            title={item.label}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-2.5 text-sm font-medium transition-all sm:px-3.5 sm:py-2",
              active
                ? "bg-gradient-to-r from-accent to-accent-2 text-white shadow-md shadow-accent-soft"
                : "text-foreground-secondary hover:bg-foreground/5",
            )}
          >
            <Icon className="size-5 shrink-0 sm:size-4" />
            <span className="hidden sm:inline">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
