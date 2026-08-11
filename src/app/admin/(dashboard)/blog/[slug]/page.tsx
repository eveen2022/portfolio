import { notFound } from "next/navigation";
import { getAllPosts, getPostBody } from "@/lib/data";
import { PostForm } from "@/components/admin/blog/PostForm";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const posts = await getAllPosts();
  const post = posts.find((p) => p.slug === slug);

  if (!post) notFound();

  const body = await getPostBody(slug);

  return (
    <div>
      <h1 className="mb-8 text-2xl font-semibold text-foreground">
        Edit post
      </h1>
      <div className="max-w-2xl">
        <PostForm mode="edit" initial={{ ...post, body }} />
      </div>
    </div>
  );
}
