import type { Metadata } from "next";
import { FolderKanban } from "lucide-react";
import { getProjects } from "@/lib/data";
import { shouldShowNewBadge } from "@/lib/newBadge";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/motion/FadeIn";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Projects",
  description: "A collection of projects I've built.",
};

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <Container className="py-20">
      <FadeIn>
        <SectionHeading
          as="h1"
          eyebrow="Projects"
          title="All projects"
          description="Everything I've built, from side projects to production apps."
          icon={FolderKanban}
        />
      </FadeIn>
      {projects.length === 0 ? (
        <p className="text-muted">
          No projects yet — add entries from /admin/projects.
        </p>
      ) : (
        <StaggerGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <StaggerItem key={project.slug}>
              <ProjectCard
                project={project}
                isNew={shouldShowNewBadge(project, projects)}
              />
            </StaggerItem>
          ))}
        </StaggerGroup>
      )}
    </Container>
  );
}
