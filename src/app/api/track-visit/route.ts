import { NextResponse, type NextRequest } from "next/server";
import { updateJsonObject } from "@/lib/fsWrite";
import type { Analytics } from "@/lib/types";
import { getClientIp, isRateLimited } from "@/lib/rateLimit";

const DEFAULT_ANALYTICS: Analytics = { totalVisits: 0, dailyVisits: {} };
const RETENTION_DAYS = 30;
const RATE_LIMIT_WINDOW_MS = 10_000;
const MAX_ATTEMPTS_PER_WINDOW = 3;

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function cutoffKey(): string {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - RETENTION_DAYS);
  return cutoff.toISOString().slice(0, 10);
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (isRateLimited("track-visit", ip, MAX_ATTEMPTS_PER_WINDOW, RATE_LIMIT_WINDOW_MS)) {
    // Silent no-op: this is a background beacon, not a user-facing action —
    // a spammy caller doesn't need an error response, just no further writes.
    return NextResponse.json({ success: true });
  }

  const today = todayKey();
  const cutoff = cutoffKey();

  await updateJsonObject<Analytics>("analytics.json", DEFAULT_ANALYTICS, (current) => {
    const dailyVisits = { ...current.dailyVisits };
    dailyVisits[today] = (dailyVisits[today] ?? 0) + 1;

    for (const key of Object.keys(dailyVisits)) {
      if (key < cutoff) delete dailyVisits[key];
    }

    return { totalVisits: current.totalVisits + 1, dailyVisits };
  });

  return NextResponse.json({ success: true });
}
