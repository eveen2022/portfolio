"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Reorder, useDragControls } from "framer-motion";
import { Plus, Pencil, Trash2, GripVertical, Briefcase, GraduationCap } from "lucide-react";
import type { TimelineEntry } from "@/lib/types";
import { Card } from "@/components/admin/form";
import { formatDateRange } from "@/lib/format";
import { TimelineEntryModal } from "@/components/admin/timeline/TimelineEntryModal";
import { useToast } from "@/components/admin/toast/ToastProvider";
import { useConfirm } from "@/components/admin/confirm/ConfirmProvider";

function emptyEntry(type: "work" | "education"): TimelineEntry {
  return {
    id: `${type}-${Date.now()}`,
    type,
    organization: "",
    role: "",
    location: "",
    startDate: "",
    endDate: null,
    current: false,
    description: "",
    highlights: [],
    logo: "",
    coverImage: "",
    showGpa: false,
    gpa: "",
    gradesByYear: [],
    order: 0,
  };
}

function TimelineRow({
  entry,
  TypeIcon,
  deleting,
  reordering,
  onEdit,
  onDelete,
  onDragEnd,
}: {
  entry: TimelineEntry;
  TypeIcon: typeof Briefcase;
  deleting: boolean;
  reordering: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onDragEnd: () => void;
}) {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={entry}
      as="div"
      dragListener={false}
      dragControls={dragControls}
      onDragEnd={onDragEnd}
    >
      <Card className="flex items-center gap-3 sm:gap-4">
        <button
          type="button"
          disabled={reordering}
          onPointerDown={(event) => {
            if (!reordering) dragControls.start(event);
          }}
          className="flex size-8 shrink-0 cursor-grab touch-none items-center justify-center rounded-lg text-muted transition-colors hover:bg-foreground/5 active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Drag to reorder"
        >
          <GripVertical className="size-4" />
        </button>
        <div className="glass relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg sm:size-14">
          {entry.logo ? (
            <Image src={entry.logo} alt="" fill className="object-cover" />
          ) : (
            <TypeIcon className="size-5 text-accent" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-foreground">
            {entry.role || "Untitled"}
            {entry.organization ? ` · ${entry.organization}` : ""}
          </p>
          <p className="truncate text-sm text-muted">
            {formatDateRange(entry.startDate, entry.endDate, entry.current) ||
              "No dates set"}
          </p>
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="flex size-8 shrink-0 items-center justify-center rounded-lg text-foreground-secondary transition-colors hover:bg-foreground/5"
          aria-label="Edit"
        >
          <Pencil className="size-4" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={deleting}
          aria-label="Delete"
          className="flex size-8 shrink-0 items-center justify-center rounded-lg text-red-600 transition-colors hover:bg-red-500/10 disabled:opacity-50 dark:text-red-400"
        >
          <Trash2 className="size-4" />
        </button>
      </Card>
    </Reorder.Item>
  );
}

export function TimelineEditor({
  initial,
  type,
  endpoint,
}: {
  initial: TimelineEntry[];
  type: "work" | "education";
  endpoint: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const confirm = useConfirm();
  const [entries, setEntries] = useState<TimelineEntry[]>(initial);
  const [editing, setEditing] = useState<{ entry: TimelineEntry; index: number | null } | null>(
    null,
  );
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);

  async function persist(next: TimelineEntry[]) {
    // Every save re-stamps order to match array position — covers add/edit/
    // delete/reorder with one rule instead of tracking order separately.
    const withOrder = next.map((entry, index) => ({ ...entry, order: index }));
    const response = await fetch(endpoint, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(withOrder),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw new Error(data?.error ?? "Failed to save");
    }
    setEntries(withOrder);
    router.refresh();
  }

  async function commitReorder(next: TimelineEntry[]) {
    setReordering(true);
    try {
      await persist(next);
    } catch (err) {
      toast({
        type: "error",
        title: "Failed to save order",
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setReordering(false);
    }
  }

  async function handleModalSave(entry: TimelineEntry) {
    const index = editing?.index ?? null;
    const isNew = index === null;
    const next = isNew
      ? [...entries, entry]
      : entries.map((e, i) => (i === index ? entry : e));

    setSaving(true);
    try {
      await persist(next);
      toast({ type: "success", title: isNew ? "Entry added" : "Entry updated" });
      setEditing(null);
    } catch (err) {
      toast({
        type: "error",
        title: "Failed to save",
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(index: number) {
    const entry = entries[index];
    if (!(await confirm(`Delete "${entry.role || "this entry"}"? This can't be undone.`))) {
      return;
    }
    setDeletingId(entry.id);
    const next = entries.filter((_, i) => i !== index);
    try {
      await persist(next);
      toast({ type: "delete", title: "Entry deleted" });
    } catch (err) {
      toast({
        type: "error",
        title: "Failed to delete",
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setDeletingId(null);
    }
  }

  const TypeIcon = type === "work" ? Briefcase : GraduationCap;

  return (
    <div className="flex flex-col gap-3">
      {entries.length === 0 && (
        <Card className="text-sm text-muted">No entries yet. Add your first one.</Card>
      )}

      {entries.length > 0 && (
        <Reorder.Group
          as="div"
          axis="y"
          values={entries}
          onReorder={setEntries}
          className="flex flex-col gap-3"
        >
          {entries.map((entry, index) => (
            <TimelineRow
              key={entry.id}
              entry={entry}
              TypeIcon={TypeIcon}
              deleting={deletingId === entry.id}
              reordering={reordering}
              onEdit={() => setEditing({ entry, index })}
              onDelete={() => handleDelete(index)}
              onDragEnd={() => commitReorder(entries)}
            />
          ))}
        </Reorder.Group>
      )}

      <button
        type="button"
        onClick={() => setEditing({ entry: emptyEntry(type), index: null })}
        className="glass relative flex items-center justify-center gap-1.5 rounded-2xl p-4 text-sm font-medium text-foreground-secondary"
      >
        <Plus className="size-4" /> Add entry
      </button>

      {editing && (
        <TimelineEntryModal
          entry={editing.entry}
          type={type}
          isNew={editing.index === null}
          saving={saving}
          onSave={handleModalSave}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
