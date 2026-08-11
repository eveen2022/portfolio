import { ArrowRight, Mail } from "lucide-react";
import { getSiteConfig } from "@/lib/data";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { FadeIn } from "@/components/motion/FadeIn";
import { ScrollDownIndicator } from "@/components/sections/ScrollDownIndicator";

export async function Hero() {
  const siteConfig = await getSiteConfig();

  return (
    <section className="relative flex min-h-[calc(100svh-8rem)] items-center overflow-hidden">
      <Container className="flex flex-col items-center gap-7 py-16 text-center">
        <FadeIn>
          <div className="glass relative inline-flex items-center gap-2.5 rounded-full px-4 py-1.5">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60" />
              <span className="relative inline-flex size-1.5 rounded-full bg-accent" />
            </span>
            <span className="cursor-blink font-mono text-xs text-foreground-secondary">
              {siteConfig.role.toLowerCase()} ·{" "}
              {siteConfig.workArrangement.join(" / ").toLowerCase()}
            </span>
          </div>
        </FadeIn>
        <FadeIn delay={0.08}>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            Hi, I&apos;m{" "}
            <span className="text-gradient">{siteConfig.name}</span>.
          </h1>
        </FadeIn>
        <FadeIn delay={0.16}>
          <p className="mx-auto max-w-2xl text-lg text-foreground-secondary">
            {siteConfig.tagline}
          </p>
        </FadeIn>
        <FadeIn delay={0.24} className="flex flex-wrap justify-center gap-3 pt-2">
          <div className="flex flex-wrap justify-center gap-3">
            <Button href="/projects">
              View Projects <ArrowRight className="size-4" />
            </Button>
            <Button href="/contact" variant="secondary">
              <Mail className="size-4" /> Get in touch
            </Button>
          </div>
        </FadeIn>
      </Container>
      <ScrollDownIndicator />
    </section>
  );
}
