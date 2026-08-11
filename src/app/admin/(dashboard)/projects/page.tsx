import { getProjects } from "@/lib/data";
import { ProjectsListClient } from "@/components/admin/projects/ProjectsListClient";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  const projects = await getProjects();

  return <ProjectsListClient projects={projects} />;
}
