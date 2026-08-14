import Link from "next/link";
import { Mail, LayoutDashboard } from "lucide-react";
import { getSiteConfig } from "@/lib/data";
import { Container } from "@/components/ui/Container";
import {
  GithubIcon,
  LinkedinIcon,
  TwitterIcon,
  WhatsappIcon,
} from "@/components/icons/BrandIcons";
import { SectionGlow } from "@/components/decor/SectionGlow";
import { ShareButton } from "@/components/layout/ShareButton";

function IconLink({
  href,
  label,
  children,
  external,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      title={label}
      {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
      className="flex size-9 items-center justify-center rounded-full text-foreground-secondary transition-colors hover:bg-foreground/5 hover:text-accent"
    >
      {children}
    </a>
  );
}

export async function Footer() {
  const siteConfig = await getSiteConfig();
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-12 overflow-hidden border-t border-border py-12">
      <SectionGlow variant="bottom-left" color={3} className="opacity-70" />
      <Container className="relative flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="text-center sm:text-left">
          <Link
            href="/"
            className="text-lg font-bold tracking-tight text-foreground transition-colors hover:text-accent"
          >
            {siteConfig.name}
          </Link>
          <p className="mt-1 text-sm text-muted">{siteConfig.role}</p>
        </div>

        <div className="glass glass-sheen relative flex items-center gap-0.5 rounded-full p-1.5">
          {siteConfig.social.github && (
            <IconLink href={siteConfig.social.github} label="GitHub" external>
              <GithubIcon className="size-4.5" />
            </IconLink>
          )}
          {siteConfig.social.linkedin && (
            <IconLink
              href={siteConfig.social.linkedin}
              label="LinkedIn"
              external
            >
              <LinkedinIcon className="size-4.5" />
            </IconLink>
          )}
          {siteConfig.social.twitter && (
            <IconLink href={siteConfig.social.twitter} label="Twitter" external>
              <TwitterIcon className="size-4.5" />
            </IconLink>
          )}
          {siteConfig.social.whatsapp && (
            <IconLink href={siteConfig.social.whatsapp} label="WhatsApp" external>
              <WhatsappIcon className="size-4.5" />
            </IconLink>
          )}
          <IconLink href={`mailto:${siteConfig.email}`} label="Email">
            <Mail className="size-4.5" />
          </IconLink>
          {siteConfig.shareEnabled && (
            <>
              <span className="mx-1 h-4 w-px bg-border" aria-hidden="true" />
              <ShareButton siteName={siteConfig.name} />
            </>
          )}
          <span className="mx-1 h-4 w-px bg-border" aria-hidden="true" />
          <IconLink href="/admin" label="Admin dashboard" external>
            <LayoutDashboard className="size-4.5" />
          </IconLink>
        </div>
      </Container>

      <Container className="relative mt-8 flex flex-col items-center gap-2 border-t border-border pt-6 text-center text-xs text-muted sm:flex-row sm:justify-between sm:text-left">
        <span>
          © {year} {siteConfig.name}. All rights reserved.
        </span>
        <Link href="/privacy" className="transition-colors hover:text-accent">
          Privacy
        </Link>
      </Container>
    </footer>
  );
}
