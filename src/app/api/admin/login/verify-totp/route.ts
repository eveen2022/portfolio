import { NextResponse, type NextRequest } from "next/server";
import {
  createSessionToken,
  sessionCookieOptions,
  verifyPending2faToken,
  PENDING_2FA_COOKIE_NAME,
  SESSION_COOKIE_NAME,
} from "@/lib/auth";
import { verifyTotpForLogin } from "@/lib/credentials";
import { getClientIp, isRateLimited } from "@/lib/rateLimit";
import { totpCodeSchema } from "@/lib/validation";

const RATE_LIMIT_WINDOW_MS = 30_000;
const MAX_ATTEMPTS_PER_WINDOW = 5;

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (isRateLimited("login-totp", ip, MAX_ATTEMPTS_PER_WINDOW, RATE_LIMIT_WINDOW_MS)) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait and try again." },
      { status: 429 },
    );
  }

  const pendingToken = request.cookies.get(PENDING_2FA_COOKIE_NAME)?.value;
  if (!pendingToken || !(await verifyPending2faToken(pendingToken))) {
    return NextResponse.json(
      { error: "Your session expired. Please sign in again." },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = totpCodeSchema.safeParse(body);
  if (!parsed.success || !(await verifyTotpForLogin(parsed.data.code))) {
    return NextResponse.json({ error: "Invalid code" }, { status: 401 });
  }

  const token = await createSessionToken();
  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE_NAME, token, sessionCookieOptions);
  response.cookies.delete(PENDING_2FA_COOKIE_NAME);
  return response;
}
