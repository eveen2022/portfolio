"use client";

import { useLiveConnected } from "@/components/live/LiveProvider";
import { cn } from "@/lib/cn";

export function LiveIndicator() {
  const connected = useLiveConnected();

  return (
    <span className="glass relative inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-muted dark:text-muted">
      <span className="relative flex size-1.5">
        {connected && (
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-60" />
        )}
        <span
          className={cn(
            "relative inline-flex size-1.5 rounded-full",
            connected ? "bg-emerald-500" : "bg-muted",
          )}
        />
      </span>
      {connected ? "Live" : "Offline"}
    </span>
  );
}
