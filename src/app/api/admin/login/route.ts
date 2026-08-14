import { NextResponse, type NextRequest } from "next/server";
import {
  createPending2faToken,
  createSessionToken,
  pending2faCookieOptions,
  sessionCookieOptions,
  PENDING_2FA_COOKIE_NAME,
  SESSION_COOKIE_NAME,
} from "@/lib/auth";
import { getTotpStatus, isAdminAuthConfigured, verifyAdminPassword } from "@/lib/credentials";
import { getClientIp, isRateLimited } from "@/lib/rateLimit";
import { loginSchema } from "@/lib/validation";

const RATE_LIMIT_WINDOW_MS = 30_000;
const MAX_ATTEMPTS_PER_WINDOW = 5;

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (isRateLimited("login", ip, MAX_ATTEMPTS_PER_WINDOW, RATE_LIMIT_WINDOW_MS)) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait and try again." },
      { status: 429 },
    );
  }

  if (!(await isAdminAuthConfigured())) {
    return NextResponse.json(
      { error: "Admin login is not configured (ADMIN_PASSWORD is not set)." },
      { status: 500 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  if (!(await verifyAdminPassword(parsed.data.password))) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  const { enabled: totpEnabled } = await getTotpStatus();
  if (totpEnabled) {
    const pendingToken = await createPending2faToken();
    const response = NextResponse.json({ success: true, requiresTotp: true });
    response.cookies.set(PENDING_2FA_COOKIE_NAME, pendingToken, pending2faCookieOptions);
    return response;
  }

  const token = await createSessionToken();
  const response = NextResponse.json({ success: true, requiresTotp: false });
  response.cookies.set(SESSION_COOKIE_NAME, token, sessionCookieOptions);
  return response;
}
