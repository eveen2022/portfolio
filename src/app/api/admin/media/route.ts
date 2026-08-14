import { NextResponse, type NextRequest } from "next/server";
import { listUploadedImages } from "@/lib/mediaFiles";
import { deleteUploadedImageStrict } from "@/lib/imageCleanup";
import { logActivity } from "@/lib/activity";

export async function GET() {
  const files = await listUploadedImages();
  return NextResponse.json({ files });
}

export async function DELETE(request: NextRequest) {
  const target = request.nextUrl.searchParams.get("path");
  if (!target) {
    return NextResponse.json({ error: "Missing path" }, { status: 400 });
  }

  try {
    await deleteUploadedImageStrict(target);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete file" },
      { status: 400 },
    );
  }

  await logActivity("delete", "settings", `Deleted uploaded image "${target}"`);
  return NextResponse.json({ success: true });
}
