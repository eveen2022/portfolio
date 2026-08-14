import Image from "next/image";
import Link from "next/link";
import { Briefcase, GraduationCap } from "lucide-react";
import { getExperience, getEducation } from "@/lib/data";
import type { TimelineEntry } from "@/lib/types";
import { formatDateRange } from "@/lib/format";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FadeIn } from "@/components/motion/FadeIn";
import { SectionGlow } from "@/components/decor/SectionGlow";

type TimelineType = "work" | "education";

const COPY: Record<
  TimelineType,
  { basePath: string; eyebrow: string; title: string; description: string; empty: string }
> = {
  work: {
    basePath: "/experience",
    eyebrow: "Experience",
    title: "Where I've worked",
    description: "A timeline of roles.",
    empty: "No work experience yet — add entries from /admin/experience.",
  },
  education: {
    basePath: "/education",
    eyebrow: "Education",
    title: "Where I've studied",
    description: "A timeline of education.",
    empty: "No education yet — add entries from /admin/education.",
  },
};

function TimelineList({ entries, basePath }: { entries: TimelineEntry[]; basePath: string }) {
  return (
    <ol className="space-y-6 border-l border-border pl-6">
      {entries.map((entry, index) => (
        <li key={entry.id} className="relative">
          <span className="absolute top-5 -left-[1.95rem] flex size-6 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-accent to-accent-2 text-white">
            {entry.type === "work" ? (
              <Briefcase className="size-3.5" />
            ) : (
              <GraduationCap className="size-3.5" />
            )}
          </span>
          <FadeIn delay={index * 0.06} y={12}>
            <Link
              href={`${basePath}/${entry.id}`}
              className="glass glass-sheen glow-ring relative block rounded-2xl p-5 transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="flex items-start gap-4">
                {entry.logo && (
                  <div className="glass relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl">
                    <Image
                      src={entry.logo}
                      alt={`${entry.organization} logo`}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-muted">
                    {formatDateRange(
                      entry.startDate,
                      entry.endDate,
                      entry.current,
                    )}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-foreground">
                    {entry.role} · {entry.organization}
                  </h3>
                </div>
              </div>
              <p className="mt-2 text-sm text-foreground-secondary">
                {entry.description}
              </p>
              {entry.highlights.length > 0 && (
                <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-foreground-secondary">
                  {entry.highlights.map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                  ))}
                </ul>
              )}
            </Link>
          </FadeIn>
        </li>
      ))}
    </ol>
  );
}

export async function Timeline({ type }: { type: TimelineType }) {
  const copy = COPY[type];
  const entries = type === "work" ? await getExperience() : await getEducation();
  const Icon = type === "work" ? Briefcase : GraduationCap;

  return (
    <section className="relative overflow-hidden py-20">
      <SectionGlow variant="top-left" color={3} />
      <Container>
        <FadeIn>
          <SectionHeading
            as="h1"
            eyebrow={copy.eyebrow}
            title={copy.title}
            description={copy.description}
            icon={Icon}
          />
        </FadeIn>

        {entries.length === 0 ? (
          <p className="text-muted">{copy.empty}</p>
        ) : (
          <TimelineList entries={entries} basePath={copy.basePath} />
        )}
      </Container>
    </section>
  );
}
