"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Fires once when the public site is first loaded in a browser tab. Scoped to
// the (site) layout only (not the admin layout), so admin's own visits to the
// dashboard don't inflate the count. `skip` additionally excludes the site
// owner's own browsing of the public pages while signed in as admin — real
// analytics tools filter out the owner's own traffic the same way.
//
// Two separate signals are tracked, matching how real analytics tools
// distinguish them:
// - /api/track-visit fires once per hard page load and is deduped to once
//   per browser per day server-side (via a cookie) — this is "a distinct
//   visitor arrived," carrying referrer/device/browser context.
// - /api/track-pageview fires on every page, including client-side
//   navigation (this component's layout doesn't remount, but `usePathname`
//   still updates), and is never deduped — this is the raw pageviews signal
//   behind the "Top pages" stat.
export function VisitTracker({ skip = false }: { skip?: boolean }) {
  const pathname = usePathname();

  useEffect(() => {
    if (skip) return;
    fetch("/api/track-visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ referrer: document.referrer }),
    }).catch(() => {});
  }, [skip]);

  useEffect(() => {
    if (skip) return;
    fetch("/api/track-pageview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname }),
    }).catch(() => {});
  }, [skip, pathname]);

  return null;
}
