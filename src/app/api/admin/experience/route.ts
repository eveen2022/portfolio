import { NextResponse, type NextRequest } from "next/server";
import { getExperience } from "@/lib/data";
import { writeDataFile } from "@/lib/fsWrite";
import { timelineEntriesSchema } from "@/lib/validation";
import { logActivity } from "@/lib/activity";
import { cleanupRemovedTimelineImages } from "@/lib/imageCleanup";

export async function PUT(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = timelineEntriesSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // TimelineEditor has no per-entry DELETE route — every add/edit/delete/
  // reorder goes through this same PUT with the whole array, so a removed
  // entry's logo/coverImage is only detectable by diffing against what was
  // there before the write.
  const oldEntries = await getExperience();
  await writeDataFile("experience.json", parsed.data, "id");
  await cleanupRemovedTimelineImages("experience", oldEntries, parsed.data);
  await logActivity("update", "experience", "Updated experience");
  return NextResponse.json({ success: true });
}
