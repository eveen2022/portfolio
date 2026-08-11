import { ProjectForm } from "@/components/admin/projects/ProjectForm";

export default function NewProjectPage() {
  return (
    <div>
      <h1 className="mb-8 text-2xl font-semibold text-foreground">
        New project
      </h1>
      <div className="max-w-2xl">
        <ProjectForm mode="create" />
      </div>
    </div>
  );
}
