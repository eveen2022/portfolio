import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Briefcase, GraduationCap, CalendarRange, MapPin } from "lucide-react";
import { getTimelineEntryById } from "@/lib/data";
import { formatDateRange } from "@/lib/format";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/motion/FadeIn";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/experience/[id]">): Promise<Metadata> {
  const { id } = await params;
  const entry = await getTimelineEntryById(id);

  if (!entry) return {};

  return {
    title: `${entry.role} · ${entry.organization}`,
    description: entry.description,
  };
}

export default async function TimelineEntryPage({
  params,
}: PageProps<"/experience/[id]">) {
  const { id } = await params;
  const entry = await getTimelineEntryById(id);

  if (!entry) notFound();

  const TypeIcon = entry.type === "work" ? Briefcase : GraduationCap;

  return (
    <Container className="py-20">
      <FadeIn className="mx-auto max-w-3xl">
        <Link
          href="/experience"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-foreground-secondary transition-colors hover:text-accent"
        >
          <ArrowLeft className="size-4" /> Back to experience
        </Link>

        <div className="glass glass-sheen relative overflow-hidden rounded-3xl">
          <div className="relative h-40 w-full overflow-hidden bg-gradient-to-br from-accent/25 via-accent-2/15 to-transparent sm:h-56">
            {entry.coverImage && (
              <Image
                src={entry.coverImage}
                alt=""
                fill
                sizes="768px"
                className="object-cover"
                priority
              />
            )}
          </div>

          <div className="relative px-6 pb-8 sm:px-10 sm:pb-10">
            {/* Only the logo overlaps the cover image (classic avatar-over-banner
                pattern) — the text below sits on the card's own solid background
                so it stays legible no matter what colors the cover image has. */}
            <div className="-mt-12 sm:-mt-16">
              <div className="glass relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-background bg-card sm:size-32">
                {entry.logo ? (
                  <Image
                    src={entry.logo}
                    alt={`${entry.organization} logo`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <TypeIcon className="size-10 text-accent" />
                )}
              </div>
            </div>

            <div className="mt-4">
              <p className="flex items-center gap-1.5 font-mono text-xs font-medium text-accent">
                <TypeIcon className="size-3.5" />
                {entry.type === "work" ? "Work experience" : "Education"}
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {entry.role}
              </h1>
              <p className="text-lg text-foreground-secondary">
                {entry.organization}
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 border-t border-border pt-6 text-sm text-foreground-secondary">
              <span className="flex items-center gap-1.5">
                <CalendarRange className="size-4" />
                {formatDateRange(entry.startDate, entry.endDate, entry.current)}
              </span>
              {entry.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="size-4" /> {entry.location}
                </span>
              )}
              {entry.showGpa && entry.gpa && (
                <span className="flex items-center gap-1.5 font-medium text-foreground">
                  GPA: {entry.gpa}
                </span>
              )}
            </div>

            <p className="mt-6 text-base leading-relaxed text-foreground-secondary">
              {entry.description}
            </p>

            {entry.highlights.length > 0 && (
              <div className="mt-6">
                <h2 className="mb-2 text-sm font-semibold text-foreground">
                  Highlights
                </h2>
                <ul className="list-inside list-disc space-y-1.5 text-sm text-foreground-secondary">
                  {entry.highlights.map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                  ))}
                </ul>
              </div>
            )}

            {entry.gradesByYear && entry.gradesByYear.length > 0 && (
              <div className="mt-6">
                <h2 className="mb-2 text-sm font-semibold text-foreground">
                  Grades
                </h2>
                <div className="flex flex-col gap-4">
                  {entry.gradesByYear.map((group, groupIndex) => (
                    <div key={`${group.year}-${groupIndex}`}>
                      {group.year && (
                        <h3 className="mb-2 text-xs font-semibold tracking-wide text-foreground-secondary uppercase">
                          {group.year}
                        </h3>
                      )}
                      <div className="overflow-hidden rounded-xl border border-border">
                        <table className="w-full text-left text-sm">
                          <thead>
                            <tr className="border-b border-border bg-secondary/50">
                              <th className="px-4 py-2 font-medium text-foreground-secondary">
                                Subject
                              </th>
                              <th className="px-4 py-2 font-medium text-foreground-secondary">
                                Grade
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {group.courses.map((course, i) => (
                              <tr
                                key={`${course.name}-${i}`}
                                className={i > 0 ? "border-t border-border" : ""}
                              >
                                <td className="px-4 py-2 text-foreground">
                                  {course.name}
                                </td>
                                <td className="px-4 py-2 text-foreground-secondary">
                                  {course.grade}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </FadeIn>
    </Container>
  );
}
