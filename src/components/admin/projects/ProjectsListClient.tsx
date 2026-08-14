"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Reorder, useDragControls } from "framer-motion";
import { Plus, Pencil, GripVertical } from "lucide-react";
import type { Project } from "@/lib/types";
import { shouldShowNewBadge } from "@/lib/newBadge";
import { Card } from "@/components/admin/form";
import { Button } from "@/components/ui/Button";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { Modal } from "@/components/admin/Modal";
import { ProjectForm } from "@/components/admin/projects/ProjectForm";
import { useToast } from "@/components/admin/toast/ToastProvider";

function ProjectRow({
  project,
  allProjects,
  reordering,
  onEdit,
  onDragEnd,
}: {
  project: Project;
  allProjects: Project[];
  reordering: boolean;
  onEdit: () => void;
  onDragEnd: () => void;
}) {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={project}
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
        <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-secondary sm:size-16">
          {project.image && (
            <Image src={project.image} alt="" fill className="object-cover" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 truncate font-medium text-foreground">
            {project.title}
            {shouldShowNewBadge(project, allProjects) && (
              <span className="shrink-0 rounded-full bg-gradient-to-r from-accent to-accent-2 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white">
                New
              </span>
            )}
          </p>
          <p className="truncate text-sm text-muted">
            /{project.slug} · {project.status}
            {project.featured ? " · featured" : ""}
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
        <DeleteButton
          endpoint={`/api/admin/projects/${project.slug}`}
          confirmMessage={`Delete "${project.title}"? This can't be undone.`}
          label="project"
        />
      </Card>
    </Reorder.Item>
  );
}

export function ProjectsListClient({ projects }: { projects: Project[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [editing, setEditing] = useState<Project | "new" | null>(null);
  const [items, setItems] = useState(projects);
  const [reordering, setReordering] = useState(false);
  // Re-sync local drag state when the server-sorted prop changes (e.g. after
  // create/edit/delete triggers router.refresh()) — the React-recommended
  // "adjust state during render" pattern, not an effect, so there's no
  // one-render lag where stale items would flash. Skipped while a reorder
  // save is in flight: the app's own activity broadcast triggers a
  // router.refresh() in every open admin tab (including this one) shortly
  // after the PATCH is sent, and applying that server snapshot mid-save
  // would visually snap the list back before the save's own response lands.
  const [prevProjects, setPrevProjects] = useState(projects);
  if (projects !== prevProjects) {
    setPrevProjects(projects);
    if (!reordering) setItems(projects);
  }

  function close() {
    setEditing(null);
    router.refresh();
  }

  async function commitReorder(next: Project[]) {
    setItems(next);
    setReordering(true);
    try {
      const response = await fetch("/api/admin/projects/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slugs: next.map((p) => p.slug) }),
      });
      if (!response.ok) throw new Error("Failed to save order");
      router.refresh();
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

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Projects</h1>
          <p className="text-sm text-muted">{items.length} total</p>
        </div>
        <Button onClick={() => setEditing("new")} className="self-start sm:self-auto">
          <Plus className="size-4" /> New project
        </Button>
      </div>

      {items.length === 0 && (
        <Card className="text-sm text-muted">
          No projects yet. Create your first one.
        </Card>
      )}

      {items.length > 0 && (
        <Reorder.Group
          as="div"
          axis="y"
          values={items}
          onReorder={setItems}
          className="flex flex-col gap-3"
        >
          {items.map((project) => (
            <ProjectRow
              key={project.slug}
              project={project}
              allProjects={items}
              reordering={reordering}
              onEdit={() => setEditing(project)}
              onDragEnd={() => commitReorder(items)}
            />
          ))}
        </Reorder.Group>
      )}

      {editing && (
        <Modal
          title={editing === "new" ? "New project" : `Edit ${editing.title}`}
          onClose={close}
        >
          <ProjectForm
            mode={editing === "new" ? "create" : "edit"}
            initial={editing === "new" ? undefined : editing}
            onSaved={close}
            onCancel={close}
          />
        </Modal>
      )}
    </div>
  );
}
