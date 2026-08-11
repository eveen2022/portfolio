import { NextResponse, type NextRequest } from "next/server";
import { getProjectBySlug } from "@/lib/data";
import { deleteJsonEntry, replaceJsonEntry } from "@/lib/fsWrite";
import { projectSchema } from "@/lib/validation";
import { logActivity } from "@/lib/activity";
import type { Project } from "@/lib/types";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = projectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // Editing a project must not reset its "New" badge clock — keep whatever
  // uploadedAt it already had rather than trusting the client's copy.
  const existing = await getProjectBySlug(slug);
  const data: Project = {
    ...parsed.data,
    uploadedAt: existing?.uploadedAt || new Date().toISOString(),
  };

  const found = await replaceJsonEntry<Project>("projects.json", "slug", slug, data);

  if (!found) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  await logActivity("update", "project", `Updated project "${parsed.data.title}"`);
  return NextResponse.json({ success: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  const deleted = await deleteJsonEntry<Project>("projects.json", "slug", slug);

  if (!deleted) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  await logActivity(
    "delete",
    "project",
    `Deleted project "${project?.title ?? slug}"`,
  );
  return NextResponse.json({ success: true });
}
