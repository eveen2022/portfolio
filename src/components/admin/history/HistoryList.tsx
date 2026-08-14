"use client";

import { useMemo, useState } from "react";
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
  FileQuestion,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import type { ActivityAction, ActivityEntity, ActivityEntry } from "@/lib/types";
import { Card, Select, Label, FormRow } from "@/components/admin/form";
import { cn } from "@/lib/cn";

const PAGE_SIZE = 4;

const actionMeta: Record<ActivityAction, { icon: typeof Plus; badge: string; label: string }> = {
  create: { icon: Plus, badge: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400", label: "Created" },
  update: { icon: Pencil, badge: "bg-sky-500/15 text-sky-600 dark:text-sky-400", label: "Updated" },
  delete: { icon: Trash2, badge: "bg-red-500/15 text-red-600 dark:text-red-400", label: "Deleted" },
};

const entityMeta: Record<ActivityEntity, { icon: typeof FolderKanban; label: string }> = {
  project: { icon: FolderKanban, label: "Projects" },
  post: { icon: Newspaper, label: "Blog posts" },
  skills: { icon: Sparkles, label: "Skills" },
  experience: { icon: Briefcase, label: "Experience" },
  education: { icon: GraduationCap, label: "Education" },
  settings: { icon: Settings, label: "Settings" },
  message: { icon: Mail, label: "Messages" },
  privacy: { icon: ShieldCheck, label: "Privacy page" },
};

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateString));
}

export function HistoryList({ initial }: { initial: ActivityEntry[] }) {
  const [entityFilter, setEntityFilter] = useState<ActivityEntity | "all">("all");
  const [actionFilter, setActionFilter] = useState<ActivityAction | "all">("all");
  const [page, setPage] = useState(1);

  // Only offer entity types that actually appear in the log — avoids a
  // dropdown full of options that would always show "no results" plus
  // silently ignores any stale entity value from a since-removed feature.
  const availableEntities = useMemo(() => {
    const present = new Set(initial.map((entry) => entry.entity));
    return (Object.keys(entityMeta) as ActivityEntity[]).filter((entity) =>
      present.has(entity),
    );
  }, [initial]);

  const filtered = useMemo(() => {
    return initial.filter((entry) => {
      if (entityFilter !== "all" && entry.entity !== entityFilter) return false;
      if (actionFilter !== "all" && entry.action !== actionFilter) return false;
      return true;
    });
  }, [initial, entityFilter, actionFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageEntries = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  function updateEntityFilter(value: string) {
    setEntityFilter(value as ActivityEntity | "all");
    setPage(1);
  }

  function updateActionFilter(value: string) {
    setActionFilter(value as ActivityAction | "all");
    setPage(1);
  }

  const isFiltered = entityFilter !== "all" || actionFilter !== "all";

  return (
    <div>
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end">
        <FormRow className="sm:w-48">
          <Label htmlFor="history-entity-filter">Filter by section</Label>
          <Select
            id="history-entity-filter"
            value={entityFilter}
            onChange={(e) => updateEntityFilter(e.target.value)}
          >
            <option value="all">All sections</option>
            {availableEntities.map((entity) => (
              <option key={entity} value={entity}>
                {entityMeta[entity].label}
              </option>
            ))}
          </Select>
        </FormRow>
        <FormRow className="sm:w-40">
          <Label htmlFor="history-action-filter">Filter by action</Label>
          <Select
            id="history-action-filter"
            value={actionFilter}
            onChange={(e) => updateActionFilter(e.target.value)}
          >
            <option value="all">All actions</option>
            <option value="create">Created</option>
            <option value="update">Updated</option>
            <option value="delete">Deleted</option>
          </Select>
        </FormRow>
        <p className="pb-2 text-sm text-muted sm:ml-auto">
          {filtered.length} {filtered.length === 1 ? "entry" : "entries"}
        </p>
      </div>

      {filtered.length === 0 ? (
        <Card className="text-sm text-muted">
          {isFiltered
            ? "No activity matches these filters."
            : "No activity yet — changes you make will show up here."}
        </Card>
      ) : (
        <>
          <div className="flex max-w-2xl flex-col gap-2">
            {pageEntries.map((entry) => {
              const ActionIcon = actionMeta[entry.action].icon;
              // Falls back for entity types logged by a feature that's since
              // been removed — old activity entries can reference a value no
              // longer in entityMeta.
              const EntityIcon = entityMeta[entry.entity]?.icon ?? FileQuestion;
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

          {pageCount > 1 && (
            <div className="mt-4 flex max-w-2xl items-center justify-between">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-foreground-secondary transition-colors hover:bg-foreground/5 disabled:opacity-40"
              >
                <ChevronLeft className="size-4" /> Previous
              </button>
              <p className="text-sm text-muted">
                Page {currentPage} of {pageCount}
              </p>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                disabled={currentPage === pageCount}
                className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-foreground-secondary transition-colors hover:bg-foreground/5 disabled:opacity-40"
              >
                Next <ChevronRight className="size-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
