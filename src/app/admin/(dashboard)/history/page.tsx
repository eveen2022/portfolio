import {
  Plus,
  Pencil,
  Trash2,
  FolderKanban,
  Newspaper,
  Sparkles,
  Briefcase,
  GraduationCap,
  Settings,
  Mail,
} from "lucide-react";
import { getActivity } from "@/lib/data";
import { Card } from "@/components/admin/form";
import { cn } from "@/lib/cn";
import type { ActivityAction, ActivityEntity } from "@/lib/types";

export const dynamic = "force-dynamic";

const actionMeta: Record<
  ActivityAction,
  { icon: typeof Plus; badge: string }
> = {
  create: { icon: Plus, badge: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" },
  update: { icon: Pencil, badge: "bg-sky-500/15 text-sky-600 dark:text-sky-400" },
  delete: { icon: Trash2, badge: "bg-red-500/15 text-red-600 dark:text-red-400" },
};

const entityIcons: Record<ActivityEntity, typeof FolderKanban> = {
  project: FolderKanban,
  post: Newspaper,
  skills: Sparkles,
  experience: Briefcase,
  education: GraduationCap,
  settings: Settings,
  message: Mail,
};

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateString));
}

export default async function AdminHistoryPage() {
  const activity = await getActivity();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">
          History
        </h1>
        <p className="text-sm text-muted">
          Every change made in this admin panel, newest first — updates live as
          changes happen, in this tab or any other.
        </p>
      </div>

      {activity.length === 0 ? (
        <Card className="text-sm text-muted">
          No activity yet — changes you make will show up here.
        </Card>
      ) : (
        <div className="flex max-w-2xl flex-col gap-2">
          {activity.map((entry) => {
            const ActionIcon = actionMeta[entry.action].icon;
            const EntityIcon = entityIcons[entry.entity];
            return (
              <Card key={entry.id} className="flex items-center gap-3 py-3">
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-xl",
                    actionMeta[entry.action].badge,
                  )}
                >
                  <ActionIcon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {entry.label}
                  </p>
                  <p className="text-xs text-muted">
                    {formatDate(entry.timestamp)}
                  </p>
                </div>
                <EntityIcon className="size-4 shrink-0 text-muted" />
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
