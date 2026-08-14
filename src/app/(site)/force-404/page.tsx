import type { Metadata } from "next";
import { NotFoundContent } from "@/components/sections/NotFoundContent";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

// Rewrite target for proxy.ts's "404 mode" toggle — every public page gets
// rewritten here (URL in the address bar stays whatever was requested).
// Renders the same content as the real (site)/not-found.tsx directly rather
// than calling notFound() (which, reached via a rewrite, triggers a dev-only
// React Profiler timing error — "cannot have a negative time stamp" — an
// unusual combination Next.js doesn't handle cleanly). This is a
// manually-toggled preview, not a real missing page, so skipping the actual
// 404 HTTP status here is an acceptable trade for reliability.
export default function ForceNotFoundPage() {
  return <NotFoundContent />;
}
