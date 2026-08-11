import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export default function PostNotFound() {
  return (
    <Container className="flex flex-col items-center gap-4 py-32 text-center">
      <h1 className="text-3xl font-bold text-foreground">
        Post not found
      </h1>
      <p className="text-foreground-secondary">
        The post you&apos;re looking for doesn&apos;t exist or has been removed.
      </p>
      <Button href="/blog" variant="secondary">
        Back to blog
      </Button>
    </Container>
  );
}
