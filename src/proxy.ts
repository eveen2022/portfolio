import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

const PUBLIC_ADMIN_PATHS = ["/admin/login"];
const PUBLIC_API_PATHS = ["/api/admin/login"];

function buildCsp(nonce: string): string {
  const isDev = process.env.NODE_ENV !== "production";
  return [
    "default-src 'self'",
    // Nonce + strict-dynamic instead of 'unsafe-inline': Next.js detects the
    // nonce in this header and automatically applies it to every script tag
    // it renders (hydration bootstrap, chunks, etc.), so no script-src
    // allowlist relaxation is needed for the app's own code to run.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    // Inline `style="..."` attributes are unavoidable here (React's `style`
    // prop, and font-size spans in admin-authored blog content) — nonces
    // don't cover arbitrary inline style attributes the way they do for
    // <script>/<style> tags, so this stays permissive. Low-severity trade:
    // CSS-only injection can't execute script.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    `connect-src 'self'${isDev ? " ws:" : ""}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    // Nothing on the site frames anything, same-origin or otherwise, so this
    // is fully locked down — no site can embed this one in an iframe.
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}

function applySecurityHeaders(response: NextResponse, nonce: string): NextResponse {
  response.headers.set("Content-Security-Policy", buildCsp(nonce));
  response.headers.set("X-Content-Type-Options", "nosniff");
  // Legacy fallback for browsers that don't honor CSP's frame-ancestors.
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  );
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload",
  );
  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminArea =
    pathname.startsWith("/admin") || pathname.startsWith("/api/admin");

  if (isAdminArea) {
    const isPublic = pathname.startsWith("/api/admin")
      ? PUBLIC_API_PATHS.some((path) => pathname.startsWith(path))
      : PUBLIC_ADMIN_PATHS.some((path) => pathname.startsWith(path));

    if (!isPublic) {
      const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
      const isValid = token ? await verifySessionToken(token) : false;

      if (!isValid) {
        if (pathname.startsWith("/api/admin")) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const loginUrl = new URL("/admin/login", request.url);
        loginUrl.searchParams.set("from", pathname);
        return NextResponse.redirect(loginUrl);
      }
    }

    // CSRF defense-in-depth for authenticated, state-changing admin API
    // calls: SameSite=Lax on the session cookie already blocks it from being
    // sent on cross-site POST/PUT/PATCH/DELETE, but verifying Origin here
    // costs nothing and doesn't depend on cookie attributes staying correct.
    const isStateChanging = ["POST", "PUT", "PATCH", "DELETE"].includes(
      request.method,
    );
    if (pathname.startsWith("/api/admin") && !isPublic && isStateChanging) {
      const origin = request.headers.get("origin");
      if (origin && origin !== request.nextUrl.origin) {
        return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
      }
    }
  }

  const nonce = crypto.randomUUID().replace(/-/g, "");
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  return applySecurityHeaders(response, nonce);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
