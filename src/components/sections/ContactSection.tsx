import { Mail, MapPin, Phone } from "lucide-react";
import { getSiteConfig } from "@/lib/data";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ContactForm } from "@/components/contact/ContactForm";
import { Button } from "@/components/ui/Button";
import { LinkedinIcon } from "@/components/icons/BrandIcons";
import { FadeIn } from "@/components/motion/FadeIn";

export async function ContactSection() {
  const siteConfig = await getSiteConfig();

  return (
    <section className="py-20">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.5fr]">
          <FadeIn>
            <SectionHeading
              as="h1"
              eyebrow="Contact"
              title="Let's work together"
              description="Have a project in mind or just want to say hi? Send a message and I'll get back to you."
              icon={Mail}
            />
            <div className="flex flex-col gap-3 text-sm text-foreground-secondary">
              <a
                href={`mailto:${siteConfig.email}`}
                className="flex items-center gap-2 hover:text-foreground"
              >
                <Mail className="size-4" /> {siteConfig.email}
              </a>
              {siteConfig.phone && (
                <a
                  href={`tel:${siteConfig.phone.replace(/[^+\d]/g, "")}`}
                  className="flex items-center gap-2 hover:text-foreground"
                >
                  <Phone className="size-4" /> {siteConfig.phone}
                </a>
              )}
              {siteConfig.location && (
                <p className="flex items-center gap-2">
                  <MapPin className="size-4" /> {siteConfig.location}
                </p>
              )}
            </div>
            {siteConfig.social.linkedin && (
              <Button
                href={siteConfig.social.linkedin}
                variant="secondary"
                target="_blank"
                rel="noreferrer noopener"
                className="mt-5"
              >
                <LinkedinIcon className="size-4" /> Connect on LinkedIn
              </Button>
            )}
          </FadeIn>
          <FadeIn delay={0.1} className="glass glass-sheen relative rounded-3xl p-6 sm:p-8">
            <ContactForm />
          </FadeIn>
        </div>
      </Container>
    </section>
  );
}
