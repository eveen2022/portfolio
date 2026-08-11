import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { VisitTracker } from "@/components/analytics/VisitTracker";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <VisitTracker />
      <div className="tech-bg" aria-hidden="true">
        <div className="tech-bg-mid" />
      </div>
      <Header />
      <main className="flex-1 pt-32">{children}</main>
      <Footer />
    </div>
  );
}
