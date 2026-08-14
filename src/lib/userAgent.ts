export type DeviceType = "desktop" | "mobile" | "tablet";

/**
 * Lightweight, dependency-free User-Agent sniffing — good enough for a
 * rough device/browser breakdown on a low-traffic portfolio site. Not meant
 * to be authoritative (UA strings are spoofable and inconsistent), just a
 * reasonable best-effort bucket.
 */
export function parseUserAgent(userAgent: string): { device: DeviceType; browser: string } {
  const ua = userAgent.toLowerCase();

  const device: DeviceType =
    /ipad|tablet|kindle|playbook|silk/.test(ua) && !/mobile/.test(ua)
      ? "tablet"
      : /mobi|android|iphone|ipod/.test(ua)
        ? "mobile"
        : "desktop";

  // Order matters: several browsers embed "chrome"/"safari" in their own UA
  // strings (Edge and Opera are Chromium-based; every WebKit browser on iOS
  // claims "safari"), so the more specific checks must run first.
  let browser = "Other";
  if (/edg\//.test(ua)) browser = "Edge";
  else if (/opr\/|opera/.test(ua)) browser = "Opera";
  else if (/chrome|crios/.test(ua)) browser = "Chrome";
  else if (/firefox|fxios/.test(ua)) browser = "Firefox";
  else if (/safari/.test(ua)) browser = "Safari";

  return { device, browser };
}

/** Normalizes a referrer URL to a bare hostname, or "Direct" for none / same-site. */
export function normalizeReferrer(referrer: string, siteUrl: string): string {
  if (!referrer) return "Direct";
  try {
    const referrerHost = new URL(referrer).hostname.replace(/^www\./, "");
    const siteHost = new URL(siteUrl).hostname.replace(/^www\./, "");
    if (referrerHost === siteHost) return "Direct";
    return referrerHost;
  } catch {
    return "Direct";
  }
}
