import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CustomCursor } from "@/components/cursor/CustomCursor";
import { NotFoundContent } from "@/components/sections/NotFoundContent";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

// This is the TRUE root not-found — the (site) route group's own
// not-found.tsx only catches notFound() thrown from within already-matched
// (site) pages (e.g. /projects/[slug] with a bad slug). A genuinely
// unmatched URL never enters that route group's tree, so Next falls back to
// this file instead, which isn't wrapped by (site)/layout.tsx — hence
// rebuilding the same Header/Footer/background shell here directly.
export default function RootNotFound() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <CustomCursor />
      <div className="tech-bg" aria-hidden="true">
        <div className="tech-bg-mid" />
      </div>
      <Header />
      <main className="flex-1 pt-32">
        <NotFoundContent />
      </main>
      <Footer />
    </div>
  );
}
