"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import type { Project } from "@/lib/types";
import { slugify } from "@/lib/slug";
import { Label, Input, Textarea, Select, Checkbox, FormRow } from "@/components/admin/form";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { IconPicker } from "@/components/admin/IconPicker";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/admin/toast/ToastProvider";

type Props = {
  mode: "create" | "edit";
  initial?: Project;
  onSaved?: () => void;
  onCancel?: () => void;
};

const emptyProject: Project = {
  slug: "",
  title: "",
  description: "",
  image: "",
  techStack: [],
  repoUrl: "",
  liveUrl: "",
  featured: false,
  order: 0,
  startDate: "",
  endDate: null,
  status: "completed",
  uploadedAt: "",
  isNew: true,
};

export function ProjectForm({ mode, initial, onSaved, onCancel }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [project, setProject] = useState<Project>(initial ?? emptyProject);
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof Project>(key: K, value: Project[K]) {
    setProject((prev) => ({ ...prev, [key]: value }));
  }

  function addTech() {
    update("techStack", [...project.techStack, { name: "", icon: "" }]);
  }

  function updateTech(index: number, field: "name" | "icon", value: string) {
    update(
      "techStack",
      project.techStack.map((tech, i) =>
        i === index ? { ...tech, [field]: value } : tech,
      ),
    );
  }

  function removeTech(index: number) {
    update(
      "techStack",
      project.techStack.filter((_, i) => i !== index),
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);

    const payload: Project = {
      ...project,
      techStack: project.techStack
        .map((tech) => ({ ...tech, name: tech.name.trim() }))
        .filter((tech) => tech.name.length > 0),
      endDate: project.endDate || null,
    };

    try {
      const endpoint =
        mode === "create"
          ? "/api/admin/projects"
          : `/api/admin/projects/${initial?.slug}`;
      const method = mode === "create" ? "POST" : "PUT";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "Failed to save project");
      }

      toast({
        type: "success",
        title: mode === "create" ? "Project created" : "Project updated",
      });
      router.refresh();
      if (onSaved) {
        onSaved();
      } else {
        router.push("/admin/projects");
      }
    } catch (err) {
      toast({
        type: "error",
        title: "Failed to save project",
        description: err instanceof Error ? err.message : undefined,
      });
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <FormRow>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            required
            value={project.title}
            onChange={(e) => {
              const title = e.target.value;
              update("title", title);
              if (!slugTouched) update("slug", slugify(title));
            }}
          />
        </FormRow>

        <FormRow>
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            required
            value={project.slug}
            onChange={(e) => {
              setSlugTouched(true);
              update("slug", e.target.value);
            }}
          />
        </FormRow>

        <FormRow>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            required
            rows={4}
            value={project.description}
            onChange={(e) => update("description", e.target.value)}
          />
        </FormRow>

        <ImageUpload
          label="Cover image"
          category="projects"
          nameHint={project.slug || project.title}
          value={project.image}
          onChange={(path) => update("image", path)}
        />

        <FormRow>
          <Label>Tech stack</Label>
          <div className="flex flex-col gap-2">
            {project.techStack.map((tech, index) => (
              <div key={index} className="flex flex-wrap items-center gap-2">
                <IconPicker
                  value={tech.icon}
                  onChange={(icon) => updateTech(index, "icon", icon)}
                  className="w-32 shrink-0 sm:w-36"
                />
                <Input
                  value={tech.name}
                  onChange={(e) => updateTech(index, "name", e.target.value)}
                  placeholder="e.g. Next.js"
                  className="min-w-[8rem] flex-1"
                />
                <button
                  type="button"
                  onClick={() => removeTech(index)}
                  className="flex size-9 shrink-0 items-center justify-center rounded-lg text-red-600 hover:bg-red-500/10 dark:text-red-400"
                  aria-label="Remove tech"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addTech}
              className="flex items-center gap-1.5 self-start rounded-lg px-2 py-1 text-sm font-medium text-foreground-secondary hover:bg-foreground/5"
            >
              <Plus className="size-3.5" /> Add tech
            </button>
          </div>
        </FormRow>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormRow>
            <Label htmlFor="repoUrl">Repo URL</Label>
            <Input
              id="repoUrl"
              value={project.repoUrl ?? ""}
              onChange={(e) => update("repoUrl", e.target.value)}
            />
          </FormRow>
          <FormRow>
            <Label htmlFor="liveUrl">Live URL</Label>
            <Input
              id="liveUrl"
              value={project.liveUrl ?? ""}
              onChange={(e) => update("liveUrl", e.target.value)}
            />
          </FormRow>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <FormRow>
            <Label htmlFor="startDate">Start date</Label>
            <Input
              id="startDate"
              placeholder="2025-01"
              value={project.startDate}
              onChange={(e) => update("startDate", e.target.value)}
            />
          </FormRow>
          <FormRow>
            <Label htmlFor="endDate">End date</Label>
            <Input
              id="endDate"
              placeholder="2025-03 (blank = ongoing)"
              value={project.endDate ?? ""}
              onChange={(e) => update("endDate", e.target.value || null)}
            />
          </FormRow>
          <FormRow>
            <Label htmlFor="status">Status</Label>
            <Select
              id="status"
              value={project.status}
              onChange={(e) =>
                update("status", e.target.value as Project["status"])
              }
            >
              <option value="completed">Completed</option>
              <option value="in-progress">In progress</option>
              <option value="archived">Archived</option>
            </Select>
          </FormRow>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormRow>
            <Label htmlFor="order">Sort order</Label>
            <Input
              id="order"
              type="number"
              value={project.order}
              onChange={(e) => update("order", Number(e.target.value) || 0)}
            />
          </FormRow>
          <div className="flex items-end pb-2">
            <Checkbox
              label="Featured on homepage"
              checked={project.featured}
              onChange={(e) => update("featured", e.target.checked)}
            />
          </div>
        </div>

        <div className="rounded-xl border border-border p-4">
          <Checkbox
            label={'Show "New" badge'}
            checked={project.isNew}
            onChange={(e) => update("isNew", e.target.checked)}
          />
          <p className="mt-1.5 text-xs text-muted">
            Only actually shows while this is the most recently uploaded
            project and it&apos;s been up for less than a month — turn this
            off anytime to hide it early.
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : "Save project"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => (onCancel ? onCancel() : router.push("/admin/projects"))}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
