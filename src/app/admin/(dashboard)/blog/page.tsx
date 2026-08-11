import { getAllPosts } from "@/lib/data";
import { PostsListClient } from "@/components/admin/blog/PostsListClient";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  const posts = await getAllPosts();

  return <PostsListClient posts={posts} />;
}
