import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { NextResponse, type NextRequest } from "next/server";
import { logActivity } from "@/lib/activity";
import { verifyFileSignature } from "@/lib/fileSignature";
import { getClientIp, isRateLimited } from "@/lib/rateLimit";
import { FAVICON_EXTENSIONS, faviconFilePath, findCustomFavicon } from "@/lib/favicon";

const EXTENSION_BY_TYPE: Record<string, string> = {
  "image/png": "png",
  "image/x-icon": "ico",
  "image/vnd.microsoft.icon": "ico",
  "image/svg+xml": "svg",
};

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024;
const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_ATTEMPTS_PER_WINDOW = 10;

export async function GET() {
  const existing = await findCustomFavicon();
  if (!existing) {
    return NextResponse.json({ exists: false, url: null, updatedAt: null });
  }
  return NextResponse.json({ exists: true, ...existing });
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (isRateLimited("favicon-upload", ip, MAX_ATTEMPTS_PER_WINDOW, RATE_LIMIT_WINDOW_MS)) {
    return NextResponse.json(
      { error: "Too many uploads. Please wait and try again." },
      { status: 429 },
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const extension = EXTENSION_BY_TYPE[file.type];
  if (!extension) {
    return NextResponse.json(
      { error: "Unsupported file type. Use PNG, ICO, or SVG." },
      { status: 400 },
    );
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json(
      { error: "File is too large (max 2MB)." },
      { status: 400 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (!verifyFileSignature(buffer, file.type)) {
    return NextResponse.json(
      { error: "File content doesn't match its declared type." },
      { status: 400 },
    );
  }

  // Only one favicon variant should exist at a time — clear the others so a
  // stale one can't linger and get picked up by mistake.
  for (const ext of FAVICON_EXTENSIONS) {
    if (ext === extension) continue;
    try {
      await unlink(faviconFilePath(ext));
    } catch {
      // wasn't there
    }
  }

  const targetPath = faviconFilePath(extension);
  await mkdir(path.dirname(targetPath), { recursive: true });
  await writeFile(targetPath, buffer);

  await logActivity("update", "settings", "Updated browser tab icon");

  return NextResponse.json({
    success: true,
    url: `/favicon-custom.${extension}`,
    updatedAt: new Date().toISOString(),
  });
}

export async function DELETE() {
  const existing = await findCustomFavicon();
  if (existing) {
    const extension = existing.url.split(".").pop() ?? "";
    try {
      await unlink(faviconFilePath(extension));
    } catch {
      // already gone
    }
  }

  await logActivity("delete", "settings", "Removed custom browser tab icon");

  return NextResponse.json({ success: true });
}
