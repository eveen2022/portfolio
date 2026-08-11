import { stat } from "fs/promises";
import path from "path";

// A custom-uploaded favicon lives at public/favicon-custom.<ext> — a fixed
// basename so both the admin upload route and the root layout's metadata
// resolution agree on where to look. Only one extension exists on disk at a
// time (the upload route removes the others), checked in this order.
const FAVICON_BASENAME = "favicon-custom";
const FAVICON_EXTENSIONS = ["png", "ico", "svg"] as const;

export function faviconFilePath(extension: string): string {
  return path.join(process.cwd(), "public", `${FAVICON_BASENAME}.${extension}`);
}

export async function findCustomFavicon(): Promise<{
  url: string;
  updatedAt: string;
} | null> {
  for (const extension of FAVICON_EXTENSIONS) {
    try {
      const stats = await stat(faviconFilePath(extension));
      return { url: `/${FAVICON_BASENAME}.${extension}`, updatedAt: stats.mtime.toISOString() };
    } catch {
      // Not this extension — try the next one.
    }
  }
  return null;
}

export { FAVICON_EXTENSIONS };
