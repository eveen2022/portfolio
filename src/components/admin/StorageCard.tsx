import { Database } from "lucide-react";
import { getDbStorageStats } from "@/lib/mongodb";
import { formatBytes } from "@/lib/format";
import { Card } from "@/components/admin/form";
import { cn } from "@/lib/cn";

// MongoDB Atlas free tier (M0) storage cap. Bump this (or make it configurable)
// if the cluster gets upgraded to a paid tier.
const ATLAS_M0_LIMIT_BYTES = 512 * 1024 * 1024;

export async function StorageCard() {
  const storage = await getDbStorageStats();
  const usedPercent = Math.min(100, (storage.totalSizeBytes / ATLAS_M0_LIMIT_BYTES) * 100);

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-teal-500/15 text-teal-600 dark:text-teal-400">
            <Database className="size-5" />
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">Database storage</p>
            <p className="text-xs text-muted">
              {storage.collections} collections · {storage.documents} documents
            </p>
          </div>
        </div>
        <p className="text-sm text-muted">
          {formatBytes(storage.totalSizeBytes)} / {formatBytes(ATLAS_M0_LIMIT_BYTES)}
        </p>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-border">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            usedPercent > 90
              ? "bg-rose-500"
              : usedPercent > 70
                ? "bg-amber-500"
                : "bg-accent",
          )}
          style={{ width: `${usedPercent}%` }}
        />
      </div>

      <p className="text-xs text-muted">
        {usedPercent.toFixed(1)}% of the MongoDB Atlas M0 free-tier limit (512 MB) used —
        data {formatBytes(storage.dataSizeBytes)}, indexes {formatBytes(storage.indexSizeBytes)}.
      </p>
    </Card>
  );
}
