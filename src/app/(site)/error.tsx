"use client";

import { useEffect } from "react";
import { RefreshCw, Home } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { SectionGlow } from "@/components/decor/SectionGlow";

export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Site route error:", error);
  }, [error]);

  return (
    <div className="relative overflow-hidden">
      <SectionGlow variant="top-left" color={1} />
      <SectionGlow variant="bottom-right" color={2} />
      <Container className="flex min-h-[calc(100svh-16rem)] flex-col items-center justify-center gap-5 py-20 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Something went wrong
        </h1>
        <p className="max-w-md text-foreground-secondary">
          This page couldn&apos;t load right now. Please try again in a moment.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button onClick={reset}>
            <RefreshCw className="size-4" /> Try again
          </Button>
          <Button href="/" variant="secondary">
            <Home className="size-4" /> Back to home
          </Button>
        </div>
      </Container>
    </div>
  );
}
