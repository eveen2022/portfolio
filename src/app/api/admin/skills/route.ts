import { NextResponse, type NextRequest } from "next/server";
import { writeDataFile } from "@/lib/fsWrite";
import { skillGroupsSchema } from "@/lib/validation";
import { logActivity } from "@/lib/activity";

export async function PUT(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = skillGroupsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  await writeDataFile("skills.json", parsed.data);
  await logActivity("update", "skills", "Updated skills");
  return NextResponse.json({ success: true });
}
