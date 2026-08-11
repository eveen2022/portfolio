import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export default function ProjectNotFound() {
  return (
    <Container className="flex flex-col items-center gap-4 py-32 text-center">
      <h1 className="text-3xl font-bold text-foreground">
        Project not found
      </h1>
      <p className="text-foreground-secondary">
        The project you&apos;re looking for doesn&apos;t exist or has been removed.
      </p>
      <Button href="/projects" variant="secondary">
        Back to projects
      </Button>
    </Container>
  );
}
