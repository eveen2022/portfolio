import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse, type NextRequest } from "next/server";
import { slugify } from "@/lib/slug";
import { verifyFileSignature, sanitizeSvg } from "@/lib/fileSignature";
import { getClientIp, isRateLimited } from "@/lib/rateLimit";

// Image categories are stored under public/images/<category> (existing
// behavior, preserved for backward compatibility with already-saved paths).
const CATEGORY_DIRS: Record<string, string> = {
  projects: "images/projects",
  blog: "images/blog",
  experience: "images/experience",
  site: "images/site",
};

const IMAGE_EXTENSIONS: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
};

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_ATTEMPTS_PER_WINDOW = 30;

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (isRateLimited("upload", ip, MAX_ATTEMPTS_PER_WINDOW, RATE_LIMIT_WINDOW_MS)) {
    return NextResponse.json(
      { error: "Too many uploads. Please wait and try again." },
      { status: 429 },
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const category = String(formData.get("category") ?? "");
  const nameHint = String(formData.get("nameHint") ?? "image");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const dir = CATEGORY_DIRS[category];
  if (!dir) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }

  const extension = IMAGE_EXTENSIONS[file.type];
  if (!extension) {
    return NextResponse.json(
      { error: "Unsupported file type. Use PNG, JPEG, WebP, GIF, or SVG." },
      { status: 400 },
    );
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json(
      { error: "File is too large (max 10MB)." },
      { status: 400 },
    );
  }

  let buffer: Buffer = Buffer.from(await file.arrayBuffer());

  if (!verifyFileSignature(buffer, file.type)) {
    return NextResponse.json(
      { error: "File content doesn't match its declared type." },
      { status: 400 },
    );
  }

  if (file.type === "image/svg+xml") {
    buffer = sanitizeSvg(buffer);
  }

  const safeName = slugify(nameHint) || "file";
  const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const fileName = `${safeName}-${uniqueSuffix}.${extension}`;

  const targetDir = path.join(process.cwd(), "public", dir);
  await mkdir(targetDir, { recursive: true });
  await writeFile(path.join(targetDir, fileName), buffer);

  return NextResponse.json({
    path: `/${dir}/${fileName}`,
  });
}
