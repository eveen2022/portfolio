"use client";

import { useEffect } from "react";

// Fires once when the public site is first loaded in a browser tab. Scoped to
// the (site) layout only (not the admin layout), so admin's own visits to the
// dashboard don't inflate the count. Client-side navigation between site
// pages doesn't remount this layout, so this intentionally counts "a visitor
// arrived" rather than every page view.
export function VisitTracker() {
  useEffect(() => {
    fetch("/api/track-visit", { method: "POST" }).catch(() => {});
  }, []);

  return null;
}
