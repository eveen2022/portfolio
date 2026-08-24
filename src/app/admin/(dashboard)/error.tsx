"use client";

import { useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function AdminDashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin dashboard route error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-xl font-bold tracking-tight text-foreground">
        Something went wrong
      </h1>
      <p className="max-w-md text-foreground-secondary">
        This page couldn&apos;t load — the database may be unreachable. Try again, or
        check the server logs for details.
      </p>
      <Button onClick={reset}>
        <RefreshCw className="size-4" /> Try again
      </Button>
    </div>
  );
}
