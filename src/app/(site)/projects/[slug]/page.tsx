import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { getProjectBySlug, getProjects } from "@/lib/data";
import { getTechIcon } from "@/lib/techIcons";
import { shouldShowNewBadge } from "@/lib/newBadge";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { GithubIcon } from "@/components/icons/BrandIcons";
import { FadeIn } from "@/components/motion/FadeIn";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) return {};

  return {
    title: project.title,
    description: project.description,
  };
}

export default async function ProjectPage({
  params,
}: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) notFound();

  const allProjects = await getProjects();
  const isNew = shouldShowNewBadge(project, allProjects);

  return (
    <Container className="py-20">
      <FadeIn className="mx-auto max-w-3xl">
        <Link
          href="/projects"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-foreground-secondary transition-colors hover:text-accent"
        >
          <ArrowLeft className="size-4" /> Back to projects
        </Link>

        <div>
          <p className="mb-2 font-mono text-sm font-medium text-accent">
            <span className="opacity-60">{"// "}</span>Project
          </p>
          <h1 className="flex flex-wrap items-center gap-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {project.title}
            {isNew && (
              <span className="rounded-full bg-gradient-to-r from-accent to-accent-2 px-3 py-1 text-xs font-semibold tracking-wide text-white">
                New
              </span>
            )}
          </h1>
          {project.image && (
            <div className="glass glass-sheen relative mt-8 aspect-video w-full overflow-hidden rounded-2xl">
              <Image
                src={project.image}
                alt={project.title}
                fill
                sizes="768px"
                className="object-cover"
                priority
              />
            </div>
          )}
          <p className="mt-8 text-lg leading-relaxed text-foreground-secondary">
            {project.description}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {project.techStack.map((tech) => {
              const techIcon = getTechIcon(tech.icon);
              return (
                <Badge key={tech.name} className="gap-1.5">
                  {techIcon && <techIcon.Icon className="size-3.5 shrink-0" />}
                  {tech.name}
                </Badge>
              );
            })}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            {project.repoUrl && (
              <Button href={project.repoUrl} variant="secondary" target="_blank" rel="noreferrer noopener">
                <GithubIcon className="size-4" /> View code
              </Button>
            )}
            {project.liveUrl && (
              <Button href={project.liveUrl} target="_blank" rel="noreferrer noopener">
                <ExternalLink className="size-4" /> View live
              </Button>
            )}
          </div>
        </div>
      </FadeIn>
    </Container>
  );
}
