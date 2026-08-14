import Link from "next/link";
import { FolderKanban, Newspaper, Inbox, Mail, Eye, CalendarDays, ArrowUpRight } from "lucide-react";
import { getProjects, getAllPosts, getMessages, getAnalytics, getSiteConfig } from "@/lib/data";
import { Card } from "@/components/admin/form";
import { StorageCard } from "@/components/admin/StorageCard";
import { cn } from "@/lib/cn";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [projects, posts, messages, analytics, siteConfig] = await Promise.all([
    getProjects(),
    getAllPosts(),
    getMessages(),
    getAnalytics(),
    getSiteConfig(),
  ]);

  const unreadCount = messages.filter((message) => !message.read).length;
  const today = new Date().toISOString().slice(0, 10);
  const visitsToday = analytics.dailyVisits[today] ?? 0;

  const stats = [
    {
      label: "Total site visits",
      value: analytics.totalVisits,
      href: "/admin/analytics",
      icon: Eye,
      badge: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
    },
    {
      label: "Visits today",
      value: visitsToday,
      href: "/admin/analytics",
      icon: CalendarDays,
      badge: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400",
    },
    {
      label: "Projects",
      value: projects.length,
      href: "/admin/projects",
      icon: FolderKanban,
      badge: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
    },
    {
      label: "Blog posts",
      value: posts.length,
      href: "/admin/blog",
      icon: Newspaper,
      badge: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
    },
    {
      label: "Unread messages",
      value: unreadCount,
      href: "/admin/messages",
      icon: Inbox,
      badge: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    },
    {
      label: "Total messages",
      value: messages.length,
      href: "/admin/messages",
      icon: Mail,
      badge: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    },
  ];

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold text-foreground">
        Welcome back, {siteConfig.name}
      </h1>
      <p className="mb-8 text-sm text-muted">
        Overview of your site content.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const content = (
            <Card
              className={cn(
                "flex flex-col gap-4",
                stat.href && "glow-ring group transition-transform hover:-translate-y-1",
              )}
            >
              <div className="flex items-start justify-between">
                <span
                  className={cn(
                    "flex size-10 items-center justify-center rounded-xl",
                    stat.badge,
                  )}
                >
                  <Icon className="size-5" />
                </span>
                {stat.href && (
                  <ArrowUpRight className="size-4 text-muted transition-colors group-hover:text-accent" />
                )}
              </div>
              <div>
                <p className="text-3xl font-semibold tracking-tight text-foreground">
                  {stat.value}
                </p>
                <p className="text-sm text-muted">{stat.label}</p>
              </div>
            </Card>
          );

          return stat.href ? (
            <Link key={stat.label} href={stat.href}>
              {content}
            </Link>
          ) : (
            <div key={stat.label}>{content}</div>
          );
        })}
      </div>

      <div className="mt-4">
        <StorageCard />
      </div>
    </div>
  );
}
