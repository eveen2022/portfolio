import Image from "next/image";
import Link from "next/link";
import { Briefcase, GraduationCap } from "lucide-react";
import { getExperience, getEducation } from "@/lib/data";
import type { TimelineEntry } from "@/lib/types";
import { formatDateRange } from "@/lib/format";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FadeIn } from "@/components/motion/FadeIn";

function sortByDateDesc(entries: TimelineEntry[]) {
  return [...entries].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
  );
}

function TimelineList({ entries }: { entries: TimelineEntry[] }) {
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
              href={`/experience/${entry.id}`}
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
                    {formatDateRange(entry.startDate, entry.endDate, entry.current)}
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

export async function Timeline() {
  const [experience, education] = await Promise.all([
    getExperience(),
    getEducation(),
  ]);
  const work = sortByDateDesc(experience);
  const study = sortByDateDesc(education);

  return (
    <section className="py-20">
      <Container>
        <FadeIn>
          <SectionHeading
            as="h1"
            eyebrow="Experience"
            title="Where I've worked and studied"
            description="A timeline of roles and education, most recent first."
            icon={Briefcase}
          />
        </FadeIn>

        {work.length === 0 && study.length === 0 ? (
          <p className="text-muted">
            No experience yet — add entries from /admin/experience or
            /admin/education.
          </p>
        ) : (
          <div className="space-y-16">
            <div>
              <div className="mb-6 flex items-center gap-2">
                <Briefcase className="size-5 text-accent" />
                <h2 className="text-xl font-semibold text-foreground">
                  Work experience
                </h2>
              </div>
              {work.length === 0 ? (
                <p className="text-muted">No work experience added yet.</p>
              ) : (
                <TimelineList entries={work} />
              )}
            </div>

            <div>
              <div className="mb-6 flex items-center gap-2">
                <GraduationCap className="size-5 text-accent" />
                <h2 className="text-xl font-semibold text-foreground">
                  Education
                </h2>
              </div>
              {study.length === 0 ? (
                <p className="text-muted">No education added yet.</p>
              ) : (
                <TimelineList entries={study} />
              )}
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}
