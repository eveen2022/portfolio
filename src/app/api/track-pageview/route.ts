import { NextResponse, type NextRequest } from "next/server";
import { incrementCounters, encodeMongoKey } from "@/lib/fsWrite";
import { getClientIp, isRateLimited } from "@/lib/rateLimit";
import { trackPageviewSchema } from "@/lib/validation";

// Fires on every page a visitor loads, including client-side navigation
// (unlike /api/track-visit, which is deduped to once per browser per day) —
// this is the raw "pageviews" signal behind the Top Pages stat, so it needs
// a much more permissive limit than the once-a-day visit beacon: someone
// browsing quickly between pages shouldn't get throttled.
const RATE_LIMIT_WINDOW_MS = 10_000;
const MAX_ATTEMPTS_PER_WINDOW = 30;

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (isRateLimited("track-pageview", ip, MAX_ATTEMPTS_PER_WINDOW, RATE_LIMIT_WINDOW_MS)) {
    return NextResponse.json({ success: true });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = trackPageviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  await incrementCounters("analytics.json", {
    totalPageViews: 1,
    [`pageViews.${encodeMongoKey(parsed.data.path)}`]: 1,
  });

  return NextResponse.json({ success: true });
}
