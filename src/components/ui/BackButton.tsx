"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

// Unlike the other "Back to X" links (blog/project detail pages, which
// always return to one fixed listing page), this page is linked from the
// footer of every page on the site, so there's no single sensible fixed
// destination — browser history is the only thing that actually knows
// where the visitor came from.
export function BackButton({ label = "Back", fallbackHref = "/" }: { label?: string; fallbackHref?: string }) {
  const router = useRouter();

  function handleClick() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-foreground-secondary transition-colors hover:text-accent"
    >
      <ArrowLeft className="size-4" /> {label}
    </button>
  );
}
