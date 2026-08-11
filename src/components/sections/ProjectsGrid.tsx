import Link from "next/link";
import { ArrowRight, FolderKanban } from "lucide-react";
import { getProjects } from "@/lib/data";
import { shouldShowNewBadge } from "@/lib/newBadge";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/motion/FadeIn";

export async function ProjectsGrid() {
  const allProjects = await getProjects();
  const projects = allProjects.filter((project) => project.featured);

  if (projects.length === 0) return null;

  return (
    <section className="py-20">
      <Container>
        <FadeIn className="mb-10 flex items-end justify-between">
          <div className="flex items-end justify-between w-full">
            <SectionHeading
              eyebrow="Projects"
              title="Featured work"
              description="A selection of things I've built."
              icon={FolderKanban}
            />
            <Link
              href="/projects"
              className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-foreground hover:underline sm:flex"
            >
              View all <ArrowRight className="size-4" />
            </Link>
          </div>
        </FadeIn>
        <StaggerGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <StaggerItem key={project.slug}>
              <ProjectCard
                project={project}
                isNew={shouldShowNewBadge(project, allProjects)}
              />
            </StaggerItem>
          ))}
        </StaggerGroup>
      </Container>
    </section>
  );
}
