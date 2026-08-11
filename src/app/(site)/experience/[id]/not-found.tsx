import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export default function TimelineEntryNotFound() {
  return (
    <Container className="flex flex-col items-center gap-4 py-32 text-center">
      <h1 className="text-3xl font-bold text-foreground">Entry not found</h1>
      <p className="text-foreground-secondary">
        That experience or education entry doesn&apos;t exist or has been
        removed.
      </p>
      <Button href="/experience" variant="secondary">
        Back to experience
      </Button>
    </Container>
  );
}
