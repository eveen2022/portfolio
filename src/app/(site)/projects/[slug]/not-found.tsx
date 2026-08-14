import { NotFoundContent } from "@/components/sections/NotFoundContent";

export default function ProjectNotFound() {
  return (
    <NotFoundContent
      heading="Project not found"
      description="The project you're looking for doesn't exist or has been removed."
      backHref="/projects"
      backLabel="Back to projects"
    />
  );
}
