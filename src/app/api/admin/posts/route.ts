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

  const { body: markdownBody, ...metadata } = parsed.data;
  await upsertJsonEntry<Post>("posts.json", metadata, "slug");
  await writeContentFile(`blog/${parsed.data.slug}.md`, markdownBody);
  await logActivity("create", "post", `Created post "${metadata.title}"`);

  return NextResponse.json({ success: true, slug: parsed.data.slug }, { status: 201 });
}
