import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getTimelineEntryById, getSiteConfig } from "@/lib/data";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import { TimelineEntryDetail } from "@/components/sections/TimelineEntryDetail";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/education/[id]">): Promise<Metadata> {
  const { id } = await params;
  const entry = await getTimelineEntryById(id);

  if (!entry || entry.type !== "education") return {};

  return {
    title: `${entry.role} · ${entry.organization}`,
    description: entry.description,
  };
}

export default async function EducationEntryPage({
  params,
}: PageProps<"/education/[id]">) {
  const { id } = await params;
  const [entry, siteConfig, cookieStore] = await Promise.all([
    getTimelineEntryById(id),
    getSiteConfig(),
    cookies(),
  ]);

  if (!entry || entry.type !== "education") notFound();

  // Same admin-preview bypass as everywhere else a section toggle is
  // checked (proxy.ts, Header nav, the root layout's contact banner) — an
  // admin who's disabled Education can still browse to an entry via the
  // (proxy-bypassed) list page, so this detail page must not 404 on them too.
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const isAdminSession = token ? await verifySessionToken(token) : false;
  if (!siteConfig.sections.education && !isAdminSession) notFound();

  return <TimelineEntryDetail entry={entry} backHref="/education" backLabel="Back to education" />;
}
