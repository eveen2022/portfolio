"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Plus, Pencil } from "lucide-react";
import type { Project } from "@/lib/types";
import { shouldShowNewBadge } from "@/lib/newBadge";
import { Card } from "@/components/admin/form";
import { Button } from "@/components/ui/Button";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { Modal } from "@/components/admin/Modal";
import { ProjectForm } from "@/components/admin/projects/ProjectForm";

export function ProjectsListClient({ projects }: { projects: Project[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Project | "new" | null>(null);

  function close() {
    setEditing(null);
    router.refresh();
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Projects</h1>
          <p className="text-sm text-muted">{projects.length} total</p>
        </div>
        <Button onClick={() => setEditing("new")} className="self-start sm:self-auto">
          <Plus className="size-4" /> New project
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        {projects.length === 0 && (
          <Card className="text-sm text-muted">
            No projects yet. Create your first one.
          </Card>
        )}
        {projects.map((project) => (
          <Card key={project.slug} className="flex items-center gap-3 sm:gap-4">
            <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-secondary sm:size-16">
              {project.image && (
                <Image src={project.image} alt="" fill className="object-cover" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 truncate font-medium text-foreground">
                {project.title}
                {shouldShowNewBadge(project, projects) && (
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
              onClick={() => setEditing(project)}
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
        ))}
      </div>

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
