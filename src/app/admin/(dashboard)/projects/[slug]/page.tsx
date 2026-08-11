import { notFound } from "next/navigation";
import { getProjectBySlug } from "@/lib/data";
import { ProjectForm } from "@/components/admin/projects/ProjectForm";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) notFound();

  return (
    <div>
      <h1 className="mb-8 text-2xl font-semibold text-foreground">
        Edit project
      </h1>
      <div className="max-w-2xl">
        <ProjectForm mode="edit" initial={project} />
      </div>
    </div>
  );
}
