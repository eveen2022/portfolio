import Image from "next/image";
import { User, Briefcase, MapPin, Mail } from "lucide-react";
import { getSiteConfig } from "@/lib/data";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FadeIn } from "@/components/motion/FadeIn";
import { SectionGlow } from "@/components/decor/SectionGlow";

export async function About() {
  const siteConfig = await getSiteConfig();

  const facts = [
    { icon: Briefcase, label: siteConfig.role },
    { icon: MapPin, label: siteConfig.workArrangement.join(" / ") },
    { icon: Mail, label: siteConfig.email },
  ];

  return (
    <section className="relative overflow-hidden py-20">
      <SectionGlow variant="top-right" color={2} />
      <Container>
        <FadeIn>
          <SectionHeading
            as="h1"
            eyebrow="About"
            title="A bit about me"
            description="A quick introduction — who I am, what I do, and how to reach me."
            icon={User}
          />
        </FadeIn>
        <div className="grid gap-8 lg:grid-cols-[12rem_1.4fr_1fr] lg:items-start">
          <FadeIn className="flex justify-center lg:justify-start">
            <div className="glass glass-sheen relative aspect-square w-48 shrink-0 overflow-hidden rounded-3xl lg:w-full">
              {siteConfig.photo ? (
                <Image
                  src={siteConfig.photo}
                  alt={siteConfig.name}
                  fill
                  sizes="192px"
                  className="object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center text-muted">
                  <User className="size-12" />
                </div>
              )}
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="text-lg leading-relaxed text-foreground-secondary">
              {siteConfig.bio}
            </p>
          </FadeIn>
          <FadeIn
            delay={0.16}
            className="glass glass-sheen relative flex h-fit flex-col gap-4 rounded-2xl p-6"
          >
            <h2 className="font-mono text-xs font-medium text-accent">
              <span className="opacity-60">{"// "}</span>Quick facts
            </h2>
            <dl className="flex flex-col gap-3">
              {facts.map((fact) => (
                <div
                  key={fact.label}
                  className="flex items-center gap-2.5 text-sm text-foreground-secondary"
                >
                  <fact.icon className="size-4 shrink-0 text-accent" />
                  <span>{fact.label}</span>
                </div>
              ))}
            </dl>
          </FadeIn>
        </div>
      </Container>
    </section>
  );
}
