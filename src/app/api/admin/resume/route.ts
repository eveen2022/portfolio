import { mkdir, stat, unlink, writeFile } from "fs/promises";
import path from "path";
import { NextResponse, type NextRequest } from "next/server";
import { logActivity } from "@/lib/activity";
import { verifyFileSignature } from "@/lib/fileSignature";
import { getClientIp, isRateLimited } from "@/lib/rateLimit";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const RESUME_PATH = path.join(process.cwd(), "public", "resume.pdf");
const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_ATTEMPTS_PER_WINDOW = 10;

export async function GET() {
  try {
    const stats = await stat(RESUME_PATH);
    return NextResponse.json({ exists: true, updatedAt: stats.mtime.toISOString() });
  } catch {
    return NextResponse.json({ exists: false, updatedAt: null });
  }
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (isRateLimited("resume-upload", ip, MAX_ATTEMPTS_PER_WINDOW, RATE_LIMIT_WINDOW_MS)) {
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

  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "Resume must be a PDF file." }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json({ error: "File is too large (max 10MB)." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  if (!verifyFileSignature(buffer, "application/pdf")) {
    return NextResponse.json(
      { error: "File content doesn't match its declared type." },
      { status: 400 },
    );
  }

  await mkdir(path.dirname(RESUME_PATH), { recursive: true });
  await writeFile(RESUME_PATH, buffer);

  await logActivity("update", "settings", "Updated resume");

  return NextResponse.json({ success: true, updatedAt: new Date().toISOString() });
}

export async function DELETE(request: NextRequest) {
  const ip = getClientIp(request);
  if (isRateLimited("resume-delete", ip, MAX_ATTEMPTS_PER_WINDOW, RATE_LIMIT_WINDOW_MS)) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait and try again." },
      { status: 429 },
    );
  }

  try {
    await unlink(RESUME_PATH);
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code !== "ENOENT") {
      return NextResponse.json({ error: "Failed to delete resume" }, { status: 500 });
    }
  }

  await logActivity("delete", "settings", "Deleted resume");

  return NextResponse.json({ success: true });
}
