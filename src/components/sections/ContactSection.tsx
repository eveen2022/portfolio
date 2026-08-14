import { Mail, MapPin, Phone } from "lucide-react";
import { getSiteConfig } from "@/lib/data";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ContactForm } from "@/components/contact/ContactForm";
import { LinkedinIcon, WhatsappIcon } from "@/components/icons/BrandIcons";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/motion/FadeIn";
import { SectionGlow } from "@/components/decor/SectionGlow";

function ContactCard({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  href?: string;
}) {
  const inner = (
    <div className="glass glass-sheen relative flex items-center gap-3.5 rounded-2xl p-4 transition-transform duration-300 hover:-translate-y-0.5">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent-2 text-white">
        <Icon className="size-4.5" />
      </span>
      <div className="min-w-0">
        <p className="font-mono text-[11px] font-medium tracking-wide text-muted uppercase">
          {label}
        </p>
        <p className="truncate text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );

  if (!href) return inner;

  const isExternal = href.startsWith("http");
  return (
    <a
      href={href}
      {...(isExternal ? { target: "_blank", rel: "noreferrer noopener" } : {})}
      className="block"
    >
      {inner}
    </a>
  );
}

export async function ContactSection() {
  const siteConfig = await getSiteConfig();

  return (
    <section className="relative overflow-hidden py-20">
      <SectionGlow variant="bottom-right" color={2} />
      <SectionGlow variant="top-left" color={1} className="opacity-60" />
      <Container>
        <FadeIn>
          <SectionHeading
            as="h1"
            eyebrow="Contact"
            title="Let's work together"
            description="Have a project in mind or just want to say hi? Send a message and I'll get back to you."
            icon={Mail}
          />
        </FadeIn>

        <div className="grid gap-8 lg:grid-cols-[1fr_1.5fr] lg:items-start">
          <div className="flex flex-col gap-6">
            <StaggerGroup className="flex flex-col gap-3">
              <StaggerItem>
                <ContactCard icon={Mail} label="Email" value={siteConfig.email} href={`mailto:${siteConfig.email}`} />
              </StaggerItem>
              {siteConfig.phone && (
                <StaggerItem>
                  <ContactCard
                    icon={Phone}
                    label="Phone"
                    value={siteConfig.phone}
                    href={`tel:${siteConfig.phone.replace(/[^+\d]/g, "")}`}
                  />
                </StaggerItem>
              )}
              {siteConfig.location && (
                <StaggerItem>
                  <ContactCard icon={MapPin} label="Location" value={siteConfig.location} />
                </StaggerItem>
              )}
              {siteConfig.social.whatsapp && (
                <StaggerItem>
                  <ContactCard
                    icon={WhatsappIcon}
                    label="WhatsApp"
                    value="Chat on WhatsApp"
                    href={siteConfig.social.whatsapp}
                  />
                </StaggerItem>
              )}
              {siteConfig.social.linkedin && (
                <StaggerItem>
                  <ContactCard
                    icon={LinkedinIcon}
                    label="LinkedIn"
                    value="Connect on LinkedIn"
                    href={siteConfig.social.linkedin}
                  />
                </StaggerItem>
              )}
            </StaggerGroup>
          </div>

          <FadeIn
            delay={0.1}
            className="glass glass-sheen glow-ring relative rounded-3xl p-6 sm:p-8"
          >
            <h2 className="mb-5 text-lg font-semibold text-foreground">Send a message</h2>
            <ContactForm />
          </FadeIn>
        </div>
      </Container>
    </section>
  );
}
