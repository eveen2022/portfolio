import { NextResponse, type NextRequest } from "next/server";
import { getProjectBySlug } from "@/lib/data";
import { upsertJsonEntry } from "@/lib/fsWrite";
import { projectSchema } from "@/lib/validation";
import { logActivity } from "@/lib/activity";
import type { Project } from "@/lib/types";

export async function POST(request: NextRequest) {
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

  const existing = await getProjectBySlug(parsed.data.slug);
  if (existing) {
    return NextResponse.json(
      { error: `A project with slug "${parsed.data.slug}" already exists.` },
      { status: 409 },
    );
  }

  // Order is drag-and-drop only (no form field for it) — new projects always
  // land at the end of the current order. Date.now() rather than a count
  // read separately from the write: two near-simultaneous creates reading
  // the same array length would both land on the same order value, and any
  // manual reorder afterwards re-stamps everything to a clean sequence
  // anyway, so a large/sparse starting value is harmless.
  const data: Project = {
    ...parsed.data,
    order: Date.now(),
    uploadedAt: new Date().toISOString(),
  };

  await upsertJsonEntry<Project>("projects.json", data, "slug");
  await logActivity("create", "project", `Created project "${parsed.data.title}"`);
  return NextResponse.json({ success: true, slug: parsed.data.slug }, { status: 201 });
}
