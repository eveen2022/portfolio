import { NextResponse, type NextRequest } from "next/server";
import { getAllPosts, getPostBody } from "@/lib/data";
import { deleteJsonEntry, replaceJsonEntry, writeContentFile, deleteContentFile } from "@/lib/fsWrite";
import { postSchema } from "@/lib/validation";
import { logActivity } from "@/lib/activity";
import { cleanupPostImage } from "@/lib/imageCleanup";
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

  const allPosts = await getAllPosts();

  // A rename must not collide with a different post that already owns the
  // target slug — replaceJsonEntry matches by the OLD slug, so without this
  // check it would happily create two posts with the same slug (and this
  // route would then overwrite that other post's markdown body below).
  if (parsed.data.slug !== slug) {
    const collision = allPosts.find((post) => post.slug === parsed.data.slug);
    if (collision) {
      return NextResponse.json(
        { error: `A post with slug "${parsed.data.slug}" already exists.` },
        { status: 409 },
      );
    }
  }

  // Editing a post must not change its drag-and-drop position — keep
  // whatever it already had rather than trusting the client's copy (the
  // edit form doesn't expose an order field).
  const existing = allPosts.find((post) => post.slug === slug);
  const { body: markdownBody, ...rest } = parsed.data;
  const metadata: Post = { ...rest, order: existing?.order ?? rest.order };

  // Content before metadata, same reasoning as the create route: a failure
  // between the two steps should leave an orphaned content doc rather than
  // a live post whose body silently reverted or went empty.
  await writeContentFile(`blog/${parsed.data.slug}.md`, markdownBody);

  const found = await replaceJsonEntry<Post>("posts.json", "slug", slug, metadata);
  if (!found) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

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
  if (post) {
    await cleanupPostImage(post, await getAllPosts());
  }
  await logActivity("delete", "post", `Deleted post "${post?.title ?? slug}"`);
  return NextResponse.json({ success: true });
}
