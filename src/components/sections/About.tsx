import { User, Briefcase, MapPin, Mail } from "lucide-react";
import { getSiteConfig } from "@/lib/data";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FadeIn } from "@/components/motion/FadeIn";

export async function About() {
  const siteConfig = await getSiteConfig();

  const facts = [
    { icon: Briefcase, label: siteConfig.role },
    { icon: MapPin, label: siteConfig.workArrangement.join(" / ") },
    { icon: Mail, label: siteConfig.email },
  ];

  return (
    <section className="py-20">
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
        <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
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
