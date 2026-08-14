"use client";

import { cn } from "@/lib/cn";

type Tab = {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

export function SettingsTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: Tab[];
  active: string;
  onChange: (key: string) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Settings sections"
      className="glass mb-8 flex w-full gap-1 rounded-2xl p-1"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={tab.key === active}
            title={tab.label}
            onClick={() => onChange(tab.key)}
            className={cn(
              "flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full px-2 py-2 text-sm font-medium transition-all",
              tab.key === active
                ? "bg-gradient-to-r from-accent to-accent-2 text-white shadow-md shadow-accent-soft"
                : "text-foreground-secondary hover:bg-foreground/5",
            )}
          >
            {/* Icon never shrinks — at narrow widths it's what keeps tabs
                visually distinguishable once the label alongside it has
                truncated away to almost nothing. */}
            <Icon className="size-4 shrink-0" />
            <span className="min-w-0 truncate">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
