import { NextResponse, type NextRequest } from "next/server";
import { writeDataFile } from "@/lib/fsWrite";
import { siteConfigSchema } from "@/lib/validation";
import { logActivity } from "@/lib/activity";

export async function PUT(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = siteConfigSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  await writeDataFile("site.json", parsed.data);
  await logActivity("update", "settings", "Updated site settings");
  return NextResponse.json({ success: true });
}
