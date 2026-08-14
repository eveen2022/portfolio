"use client";

import { useCallback } from "react";
import { useLiveEvent } from "@/components/live/LiveProvider";
import { playNotificationChime } from "@/lib/notificationSound";

/**
 * Renders nothing — exists purely to play the "new message" chime exactly
 * once per event. Mount this a single time (in AdminShell). NotificationBell
 * itself is mounted twice (mobile + desktop, each hidden via CSS at the
 * other breakpoint rather than unmounted), so if each bell instance played
 * its own sound on the same event, the admin would hear it twice.
 */
export function NotificationSoundEffect() {
  useLiveEvent(
    useCallback((event: { type: string; [key: string]: unknown }) => {
      if (event.type === "activity" && event.entity === "message" && event.action === "create") {
        playNotificationChime();
      }
    }, []),
  );

  return null;
}
