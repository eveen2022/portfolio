"use client";

import { useEffect } from "react";

// Only fires if the root layout itself throws (getSiteConfig() already falls
// back to defaults, so this should be rare) — must render its own <html>/
// <body> since it replaces the entire root layout when active.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global application error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          display: "flex",
          minHeight: "100svh",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          padding: "1.5rem",
          textAlign: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#0a0a0a",
          color: "#fafafa",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Something went wrong</h1>
        <p style={{ maxWidth: "28rem", color: "#a1a1aa" }}>
          The site couldn&apos;t load right now. Please try again in a moment.
        </p>
        <button
          onClick={reset}
          style={{
            borderRadius: "9999px",
            padding: "0.625rem 1.25rem",
            fontSize: "0.875rem",
            fontWeight: 600,
            color: "#0a0a0a",
            background: "#fafafa",
            border: "none",
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
