import type { NextRequest } from "next/server";

type Entry = { count: number; windowStart: number };

// Per-process, per-bucket rate limiting. Sufficient as long as the app runs
// as a single Node instance (see README's note on the JSON-file write lock —
// the same constraint applies here: this resets on restart and doesn't
// coordinate across replicas).
const buckets = new Map<string, Map<string, Entry>>();

/**
 * Returns true if `key` (e.g. an IP address) has exceeded `maxAttempts`
 * within the trailing `windowMs` for the given `bucket` (a name scoping this
 * limiter to one endpoint, e.g. "login" or "contact").
 */
export function isRateLimited(
  bucket: string,
  key: string,
  maxAttempts: number,
  windowMs: number,
): boolean {
  let store = buckets.get(bucket);
  if (!store) {
    store = new Map();
    buckets.set(bucket, store);
  }

  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now - entry.windowStart > windowMs) {
    store.set(key, { count: 1, windowStart: now });
    return false;
  }

  entry.count += 1;
  return entry.count > maxAttempts;
}

// X-Forwarded-For is only trustworthy when something in front of Node
// actually sets it authoritatively (Vercel's edge network, or a correctly
// configured reverse proxy). Without that, it's just a request header a
// client can set to whatever they want — trusting it blindly would let
// every rate limit in the app (login, TOTP, recovery PIN, upload) be
// bypassed by sending a different spoofed IP on every request. Set
// TRUST_PROXY_HEADERS=true only when the deployment genuinely sits behind
// such a proxy; otherwise every caller collapses into one shared bucket per
// limiter, which is a global rather than per-IP limit but can't be spoofed
// away, so brute-forcing still gets locked out.
const TRUST_PROXY_HEADERS = process.env.TRUST_PROXY_HEADERS === "true";

export function getClientIp(request: NextRequest): string {
  if (TRUST_PROXY_HEADERS) {
    const forwardedFor = request.headers.get("x-forwarded-for");
    if (forwardedFor) return forwardedFor.split(",")[0].trim();
  }
  return "shared";
}
