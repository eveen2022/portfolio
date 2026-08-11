import Link from "next/link";
import { Mail, LayoutDashboard } from "lucide-react";
import { getSiteConfig } from "@/lib/data";
import { Container } from "@/components/ui/Container";
import { GithubIcon, LinkedinIcon, TwitterIcon } from "@/components/icons/BrandIcons";

export async function Footer() {
  const siteConfig = await getSiteConfig();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border py-10">
      <Container className="flex flex-col items-center justify-between gap-4 text-sm text-muted sm:flex-row dark:text-muted">
        <p>
          © {year} {siteConfig.name}. All rights reserved.
        </p>
        <div className="flex items-center gap-4">
          {siteConfig.social.github && (
            <a
              href={siteConfig.social.github}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="GitHub"
              className="hover:text-foreground"
            >
              <GithubIcon className="size-5" />
            </a>
          )}
          {siteConfig.social.linkedin && (
            <a
              href={siteConfig.social.linkedin}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="LinkedIn"
              className="hover:text-foreground"
            >
              <LinkedinIcon className="size-5" />
            </a>
          )}
          {siteConfig.social.twitter && (
            <a
              href={siteConfig.social.twitter}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Twitter"
              className="hover:text-foreground"
            >
              <TwitterIcon className="size-5" />
            </a>
          )}
          <a
            href={`mailto:${siteConfig.email}`}
            aria-label="Email"
            className="hover:text-foreground"
          >
            <Mail className="size-5" />
          </a>
          <span className="h-4 w-px bg-border" aria-hidden="true" />
          <Link
            href="/admin"
            aria-label="Admin dashboard"
            title="Admin dashboard"
            className="text-muted hover:text-accent"
          >
            <LayoutDashboard className="size-5" />
          </Link>
        </div>
      </Container>
    </footer>
  );
}
