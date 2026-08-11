import { NextResponse, type NextRequest } from "next/server";
import { writeDataFile } from "@/lib/fsWrite";
import { timelineEntriesSchema } from "@/lib/validation";
import { logActivity } from "@/lib/activity";

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

  await writeDataFile("education.json", parsed.data);
  await logActivity("update", "education", "Updated education");
  return NextResponse.json({ success: true });
}
