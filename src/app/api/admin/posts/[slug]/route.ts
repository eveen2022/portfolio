import { NextResponse, type NextRequest } from "next/server";
import { getAllPosts, getPostBody } from "@/lib/data";
import { deleteJsonEntry, replaceJsonEntry, writeContentFile, deleteContentFile } from "@/lib/fsWrite";
import { postSchema } from "@/lib/validation";
import { logActivity } from "@/lib/activity";
import type { Post } from "@/lib/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const posts = await getAllPosts();
  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const body = await getPostBody(slug);
  return NextResponse.json({ ...post, body });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

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

  const { body: markdownBody, ...metadata } = parsed.data;

  const found = await replaceJsonEntry<Post>("posts.json", "slug", slug, metadata);
  if (!found) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  await writeContentFile(`blog/${parsed.data.slug}.md`, markdownBody);
  if (parsed.data.slug !== slug) {
    await deleteContentFile(`blog/${slug}.md`);
  }

  await logActivity("update", "post", `Updated post "${metadata.title}"`);
  return NextResponse.json({ success: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const posts = await getAllPosts();
  const post = posts.find((p) => p.slug === slug);
  const deleted = await deleteJsonEntry<Post>("posts.json", "slug", slug);

  if (!deleted) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  await deleteContentFile(`blog/${slug}.md`);
  await logActivity("delete", "post", `Deleted post "${post?.title ?? slug}"`);
  return NextResponse.json({ success: true });
}
