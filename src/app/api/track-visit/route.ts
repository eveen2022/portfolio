import { NextResponse, type NextRequest } from "next/server";
import { incrementCounters, encodeMongoKey } from "@/lib/fsWrite";
import { collectionName, getCollection, SINGLETON_ID } from "@/lib/mongodb";
import type { Analytics } from "@/lib/types";
import { getClientIp, isRateLimited } from "@/lib/rateLimit";
import { trackVisitSchema } from "@/lib/validation";
import { parseUserAgent, normalizeReferrer } from "@/lib/userAgent";
import { siteMeta } from "@/lib/site";

const RETENTION_DAYS = 30;
const RATE_LIMIT_WINDOW_MS = 10_000;
const MAX_ATTEMPTS_PER_WINDOW = 3;

// Marks a browser as already counted for a given day — the value is that
// day's date, not just a boolean, so a stale cookie from a previous day is
// self-evidently stale without depending on exact cookie-expiry timing.
// Long-lived on purpose: correctness comes from comparing the stored value
// against today's date, not from the cookie expiring on schedule.
const VISIT_COOKIE_NAME = "pf_last_visit";
const VISIT_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 400;

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function cutoffKey(): string {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - RETENTION_DAYS);
  return cutoff.toISOString().slice(0, 10);
}

export async function POST(request: NextRequest) {
  const today = todayKey();

  // Same browser already counted today — a page refresh or another tab
  // shouldn't inflate the count. This is what makes "visits" mean "distinct
  // visitors," not "requests," matching how real analytics tools count.
  if (request.cookies.get(VISIT_COOKIE_NAME)?.value === today) {
    return NextResponse.json({ success: true });
  }

  const ip = getClientIp(request);
  if (isRateLimited("track-visit", ip, MAX_ATTEMPTS_PER_WINDOW, RATE_LIMIT_WINDOW_MS)) {
    // Silent no-op: this is a background beacon, not a user-facing action —
    // a spammy caller doesn't need an error response, just no further writes.
    return NextResponse.json({ success: true });
  }

  let body: unknown = {};
  try {
    body = await request.json();
  } catch {
    // No/invalid body is fine — referrer is optional context, not required input.
  }
  const parsed = trackVisitSchema.safeParse(body);
  const referrer = parsed.success ? parsed.data.referrer : "";
  const source = normalizeReferrer(referrer, siteMeta.siteUrl);
  const { device, browser } = parseUserAgent(request.headers.get("user-agent") ?? "");

  await incrementCounters("analytics.json", {
    totalVisits: 1,
    [`dailyVisits.${today}`]: 1,
    [`referrers.${encodeMongoKey(source)}`]: 1,
    [`devices.${device}`]: 1,
    [`browsers.${encodeMongoKey(browser)}`]: 1,
  });

  // Best-effort retention cleanup, separate from the atomic increment above
  // — losing a rare race here only delays trimming a stale day key by one
  // request, not a correctness issue like losing a visit count would be.
  const cutoff = cutoffKey();
  const collection = await getCollection<Analytics & { _id: string }>(
    collectionName("analytics.json"),
  );
  const doc = await collection.findOne(
    { _id: SINGLETON_ID } as never,
    { projection: { dailyVisits: 1 } },
  );
  const staleKeys = Object.keys(doc?.dailyVisits ?? {}).filter((key) => key < cutoff);
  if (staleKeys.length > 0) {
    const unset = Object.fromEntries(staleKeys.map((key) => [`dailyVisits.${key}`, ""]));
    await collection.updateOne({ _id: SINGLETON_ID } as never, { $unset: unset } as never);
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(VISIT_COOKIE_NAME, today, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: VISIT_COOKIE_MAX_AGE_SECONDS,
  });
  return response;
}
