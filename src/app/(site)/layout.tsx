import { cookies } from "next/headers";
import { AlertTriangle } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { VisitTracker } from "@/components/analytics/VisitTracker";
import { CustomCursor } from "@/components/cursor/CustomCursor";
import { Container } from "@/components/ui/Container";
import { getSiteConfig } from "@/lib/data";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [siteConfig, cookieStore] = await Promise.all([getSiteConfig(), cookies()]);
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const isAdminSession = token ? await verifySessionToken(token) : false;
  const statusBannerMessage = !isAdminSession
    ? null
    : siteConfig.maintenanceMode
      ? "Maintenance mode is on — visitors see a maintenance page. You're seeing the live site because you're signed in as admin."
      : siteConfig.notFoundMode
        ? "404 mode is on — visitors see the 404 page on every URL. You're seeing the live site because you're signed in as admin."
        : null;

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <VisitTracker skip={isAdminSession} />
      <CustomCursor />
      <div className="tech-bg" aria-hidden="true">
        <div className="tech-bg-mid" />
      </div>
      <Header isAdminSession={isAdminSession} />
      <main className="flex-1 pt-32">
        {statusBannerMessage && (
          <Container className="mb-6">
            <div className="glass glass-sheen relative flex items-center gap-2.5 rounded-2xl px-4 py-3 text-sm text-foreground-secondary">
              <AlertTriangle className="size-4 shrink-0 text-amber-500" />
              {statusBannerMessage}
            </div>
          </Container>
        )}
        {children}
      </main>
      <Footer />
    </div>
  );
}
