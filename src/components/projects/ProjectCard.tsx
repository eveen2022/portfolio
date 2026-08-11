"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ExternalLink, ImageOff } from "lucide-react";
import type { Project } from "@/lib/types";
import { getTechIcon } from "@/lib/techIcons";
import { Badge } from "@/components/ui/Badge";
import { GithubIcon } from "@/components/icons/BrandIcons";

export function ProjectCard({
  project,
  isNew = false,
}: {
  project: Project;
  isNew?: boolean;
}) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="glass glass-sheen glow-ring relative group flex h-full flex-col overflow-hidden rounded-2xl"
    >
      <Link
        href={`/projects/${project.slug}`}
        className="relative aspect-video w-full overflow-hidden bg-secondary"
      >
        {isNew && (
          <span className="absolute top-3 left-3 z-10 rounded-full bg-gradient-to-r from-accent to-accent-2 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-white shadow-lg shadow-black/20">
            New
          </span>
        )}
        {project.image ? (
          <Image
            src={project.image}
            alt={project.title}
            fill
            sizes="(min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted">
            <ImageOff className="size-8" />
          </div>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <Link href={`/projects/${project.slug}`}>
          <h3 className="text-lg font-semibold text-foreground">
            {project.title}
          </h3>
        </Link>
        <p className="line-clamp-3 flex-1 text-sm text-foreground-secondary">
          {project.description}
        </p>
        <div className="flex flex-wrap gap-2">
          {project.techStack.slice(0, 4).map((tech) => {
            const techIcon = getTechIcon(tech.icon);
            return (
              <Badge key={tech.name} className="gap-1.5">
                {techIcon && <techIcon.Icon className="size-3.5 shrink-0" />}
                {tech.name}
              </Badge>
            );
          })}
        </div>
        <div className="flex items-center gap-4 pt-1 text-sm font-medium text-foreground-secondary">
          {project.repoUrl && (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="flex items-center gap-1 hover:text-accent"
            >
              <GithubIcon className="size-4" /> Code
            </a>
          )}
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="flex items-center gap-1 hover:text-accent"
            >
              <ExternalLink className="size-4" /> Live
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}
