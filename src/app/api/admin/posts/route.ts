import { NextResponse, type NextRequest } from "next/server";
import { getAllPosts } from "@/lib/data";
import { upsertJsonEntry, writeContentFile } from "@/lib/fsWrite";
import { postSchema } from "@/lib/validation";
import { logActivity } from "@/lib/activity";
import type { Post } from "@/lib/types";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const allPosts = await getAllPosts();
  const existing = allPosts.find((post) => post.slug === parsed.data.slug);
  if (existing) {
    return NextResponse.json(
      { error: `A post with slug "${parsed.data.slug}" already exists.` },
      { status: 409 },
    );
  }

  // Order is drag-and-drop only (no form field for it) — new posts always
  // land at the end of the current order. Date.now() rather than a count
  // read separately from the write: two near-simultaneous creates reading
  // the same array length would both land on the same order value, and any
  // manual reorder afterwards re-stamps everything to a clean sequence
  // anyway, so a large/sparse starting value is harmless.
  const { body: markdownBody, ...rest } = parsed.data;
  const metadata: Post = { ...rest, order: Date.now() };
  // Content before metadata: if the metadata write fails after this
  // succeeds, the result is an orphaned, unreferenced content doc (harmless
  // — nothing points at it). The reverse order would risk a live post page
  // rendering with an empty body if the content write failed instead.
  await writeContentFile(`blog/${parsed.data.slug}.md`, markdownBody);
  await upsertJsonEntry<Post>("posts.json", metadata, "slug");
  await logActivity("create", "post", `Created post "${metadata.title}"`);

  return NextResponse.json({ success: true, slug: parsed.data.slug }, { status: 201 });
}
