import type { Metadata } from "next";
import { Wrench, Mail } from "lucide-react";
import { getSiteConfig } from "@/lib/data";
import { Button } from "@/components/ui/Button";
import { SectionGlow } from "@/components/decor/SectionGlow";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Under maintenance",
  robots: { index: false, follow: false },
};

export default async function MaintenancePage() {
  const siteConfig = await getSiteConfig();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6">
      <div className="tech-bg" aria-hidden="true">
        <div className="tech-bg-mid" />
      </div>
      <SectionGlow variant="top-left" color={2} />
      <SectionGlow variant="bottom-right" color={3} />

      <div className="glass glass-sheen relative flex max-w-md flex-col items-center gap-4 rounded-3xl p-8 text-center sm:p-10">
        <div className="flex size-14 animate-float-slow items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-accent-2 text-white">
          <Wrench className="size-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          We&apos;ll be right back
        </h1>
        <p className="text-foreground-secondary">
          {siteConfig.maintenanceMessage ||
            "We're making some updates. Please check back soon."}
        </p>
        {siteConfig.email && (
          <Button href={`mailto:${siteConfig.email}`} variant="secondary" className="mt-2">
            <Mail className="size-4" /> Get in touch
          </Button>
        )}
      </div>
    </div>
  );
}
