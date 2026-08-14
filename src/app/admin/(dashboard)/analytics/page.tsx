import {
  Eye,
  CalendarDays,
  TrendingUp,
  Layers,
  FileText,
  MousePointerClick,
  Monitor,
  Smartphone,
  Tablet,
} from "lucide-react";
import { getAnalytics } from "@/lib/data";
import { Card } from "@/components/admin/form";
import { cn } from "@/lib/cn";

export const dynamic = "force-dynamic";

function lastNDaysKeys(n: number): string[] {
  const keys: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    keys.push(d.toISOString().slice(0, 10));
  }
  return keys;
}

function sumRange(dailyVisits: Record<string, number>, keys: string[]): number {
  return keys.reduce((sum, key) => sum + (dailyVisits[key] ?? 0), 0);
}

function topEntries(
  record: Record<string, number>,
  limit: number,
): { label: string; count: number }[] {
  return Object.entries(record)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

function pageLabel(path: string): string {
  return path === "/" ? "Home (/)" : path;
}

function formatShortDate(key?: string): string {
  if (!key) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(key));
}

function RankedBar({ label, count, max }: { label: string; count: number; max: number }) {
  const percent = count > 0 ? Math.max(4, Math.round((count / max) * 100)) : 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-2 text-sm">
        <span className="truncate text-foreground">{label}</span>
        <span className="shrink-0 text-muted">{count}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
        <div className="h-full rounded-full bg-accent" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function DeviceStat({
  icon: Icon,
  label,
  count,
  percent,
}: {
  icon: typeof Monitor;
  label: string;
  count: number;
  percent: number;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-border p-4 text-center">
      <Icon className="size-5 text-accent" />
      <p className="text-lg font-semibold text-foreground">{percent}%</p>
      <p className="text-xs text-muted">
        {label} · {count}
      </p>
    </div>
  );
}

export default async function AdminAnalyticsPage() {
  const analytics = await getAnalytics();

  const last7 = lastNDaysKeys(7);
  const last30 = lastNDaysKeys(30);
  const today = last30[last30.length - 1];
  const visitsToday = analytics.dailyVisits[today] ?? 0;
  const visits7d = sumRange(analytics.dailyVisits, last7);
  const visits30d = sumRange(analytics.dailyVisits, last30);
  const pagesPerVisit =
    analytics.totalVisits > 0
      ? (analytics.totalPageViews / analytics.totalVisits).toFixed(1)
      : "0.0";

  const chartData = last30.map((key) => ({ key, count: analytics.dailyVisits[key] ?? 0 }));
  const chartMax = Math.max(1, ...chartData.map((d) => d.count));

  const topPages = topEntries(analytics.pageViews, 8);
  const maxPageViews = Math.max(1, ...topPages.map((p) => p.count));

  const topReferrers = topEntries(analytics.referrers, 6);
  const maxReferrer = Math.max(1, ...topReferrers.map((r) => r.count));

  const topBrowsers = topEntries(analytics.browsers, 6);
  const maxBrowser = Math.max(1, ...topBrowsers.map((b) => b.count));

  const totalDeviceHits =
    analytics.devices.desktop + analytics.devices.mobile + analytics.devices.tablet;
  const devicePercent = (n: number) =>
    totalDeviceHits > 0 ? Math.round((n / totalDeviceHits) * 100) : 0;

  const stats = [
    {
      label: "Total visits",
      value: analytics.totalVisits,
      icon: Eye,
      badge: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
    },
    {
      label: "Visits today",
      value: visitsToday,
      icon: CalendarDays,
      badge: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400",
    },
    {
      label: "Last 7 days",
      value: visits7d,
      icon: TrendingUp,
      badge: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
    },
    {
      label: "Last 30 days",
      value: visits30d,
      icon: Layers,
      badge: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    },
    {
      label: "Total pageviews",
      value: analytics.totalPageViews,
      icon: FileText,
      badge: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Pages per visit",
      value: pagesPerVisit,
      icon: MousePointerClick,
      badge: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
    },
  ];

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold text-foreground">Analytics</h1>
      <p className="mb-8 text-sm text-muted">How visitors find and use your site.</p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="flex flex-col gap-4">
              <span
                className={cn(
                  "flex size-10 items-center justify-center rounded-xl",
                  stat.badge,
                )}
              >
                <Icon className="size-5" />
              </span>
              <div>
                <p className="text-3xl font-semibold tracking-tight text-foreground">
                  {stat.value}
                </p>
                <p className="text-sm text-muted">{stat.label}</p>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="mt-4 flex flex-col gap-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Visits — last 30 days</h2>
          <p className="text-xs text-muted">Unique visitors per day.</p>
        </div>
        <div className="flex h-32 items-end gap-1">
          {chartData.map((d) => (
            <div
              key={d.key}
              className="group relative flex h-full flex-1 items-end"
              title={`${d.key}: ${d.count} visit${d.count === 1 ? "" : "s"}`}
            >
              <div
                className={cn(
                  "w-full rounded-t transition-colors",
                  d.count > 0 ? "bg-accent/70 group-hover:bg-accent" : "bg-border",
                )}
                style={{ height: `${d.count > 0 ? Math.max(4, (d.count / chartMax) * 100) : 3}%` }}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between text-[11px] text-muted">
          <span>{formatShortDate(chartData[0]?.key)}</span>
          <span>{formatShortDate(chartData[chartData.length - 1]?.key)}</span>
        </div>
      </Card>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-foreground">Top pages</h2>
          {topPages.length === 0 ? (
            <p className="text-sm text-muted">No pageviews recorded yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {topPages.map((page) => (
                <RankedBar
                  key={page.label}
                  label={pageLabel(page.label)}
                  count={page.count}
                  max={maxPageViews}
                />
              ))}
            </div>
          )}
        </Card>

        <Card className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-foreground">Top referrers</h2>
          {topReferrers.length === 0 ? (
            <p className="text-sm text-muted">No visits recorded yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {topReferrers.map((ref) => (
                <RankedBar key={ref.label} label={ref.label} count={ref.count} max={maxReferrer} />
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-foreground">Devices</h2>
          <div className="grid grid-cols-3 gap-3">
            <DeviceStat
              icon={Monitor}
              label="Desktop"
              count={analytics.devices.desktop}
              percent={devicePercent(analytics.devices.desktop)}
            />
            <DeviceStat
              icon={Smartphone}
              label="Mobile"
              count={analytics.devices.mobile}
              percent={devicePercent(analytics.devices.mobile)}
            />
            <DeviceStat
              icon={Tablet}
              label="Tablet"
              count={analytics.devices.tablet}
              percent={devicePercent(analytics.devices.tablet)}
            />
          </div>
        </Card>

        <Card className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-foreground">Browsers</h2>
          {topBrowsers.length === 0 ? (
            <p className="text-sm text-muted">No visits recorded yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {topBrowsers.map((browser) => (
                <RankedBar
                  key={browser.label}
                  label={browser.label}
                  count={browser.count}
                  max={maxBrowser}
                />
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
