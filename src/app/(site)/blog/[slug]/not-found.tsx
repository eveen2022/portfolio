import { NotFoundContent } from "@/components/sections/NotFoundContent";

export default function PostNotFound() {
  return (
    <NotFoundContent
      heading="Post not found"
      description="The post you're looking for doesn't exist or has been removed."
      backHref="/blog"
      backLabel="Back to blog"
    />
  );
}
