import { NextResponse, type NextRequest } from "next/server";
import { updateOrderIndexes } from "@/lib/fsWrite";
import { reorderSchema } from "@/lib/validation";
import { logActivity } from "@/lib/activity";

export async function PATCH(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = reorderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  await updateOrderIndexes("projects.json", "slug", parsed.data.slugs);
  await logActivity("update", "project", "Reordered projects");
  return NextResponse.json({ success: true });
}
