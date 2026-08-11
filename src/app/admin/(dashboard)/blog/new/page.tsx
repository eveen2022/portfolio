import { PostForm } from "@/components/admin/blog/PostForm";

export default function NewPostPage() {
  return (
    <div>
      <h1 className="mb-8 text-2xl font-semibold text-foreground">
        New post
      </h1>
      <div className="max-w-2xl">
        <PostForm mode="create" />
      </div>
    </div>
  );
}
