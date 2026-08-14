import { Compass, Home } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { FadeIn } from "@/components/motion/FadeIn";
import { SectionGlow } from "@/components/decor/SectionGlow";

export function NotFoundContent({
  heading = "Lost in the void",
  description = "The page you're looking for doesn't exist, moved, or never did. Let's get you back on track.",
  backHref = "/",
  backLabel = "Back to home",
}: {
  heading?: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <div className="relative overflow-hidden">
      <SectionGlow variant="top-left" color={1} />
      <SectionGlow variant="bottom-right" color={2} />
      <Container className="flex min-h-[calc(100svh-16rem)] flex-col items-center justify-center gap-5 py-20 text-center">
        <FadeIn>
          <div className="glass glass-sheen relative flex size-16 animate-float-slow items-center justify-center rounded-2xl text-accent">
            <Compass className="size-7" />
          </div>
        </FadeIn>
        <FadeIn delay={0.08}>
          <p className="text-gradient text-7xl font-bold tracking-tight sm:text-8xl">
            404
          </p>
        </FadeIn>
        <FadeIn delay={0.16}>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {heading}
          </h1>
        </FadeIn>
        <FadeIn delay={0.22}>
          <p className="max-w-md text-foreground-secondary">{description}</p>
        </FadeIn>
        <FadeIn delay={0.3}>
          <Button href={backHref}>
            <Home className="size-4" /> {backLabel}
          </Button>
        </FadeIn>
      </Container>
    </div>
  );
}
