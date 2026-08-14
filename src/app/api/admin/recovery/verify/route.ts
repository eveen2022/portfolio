import { NextResponse, type NextRequest } from "next/server";
import { createRecoveryToken, recoveryCookieOptions, RECOVERY_COOKIE_NAME } from "@/lib/auth";
import { verifyRecovery } from "@/lib/credentials";
import { recoveryVerifySchema } from "@/lib/validation";
import { getClientIp, isRateLimited } from "@/lib/rateLimit";

// Stricter window than password login: a 4-digit PIN is a much smaller
// search space, so brute-forcing it needs to be slower per IP.
const RATE_LIMIT_WINDOW_MS = 5 * 60_000;
const MAX_ATTEMPTS_PER_WINDOW = 5;

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (isRateLimited("recovery-verify", ip, MAX_ATTEMPTS_PER_WINDOW, RATE_LIMIT_WINDOW_MS)) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait and try again." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = recoveryVerifySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter your phone number and PIN" }, { status: 400 });
  }

  const { phone, pin } = parsed.data;
  if (!(await verifyRecovery(phone, pin))) {
    return NextResponse.json({ error: "Phone number or PIN is incorrect" }, { status: 401 });
  }

  const token = await createRecoveryToken();
  const response = NextResponse.json({ success: true });
  response.cookies.set(RECOVERY_COOKIE_NAME, token, recoveryCookieOptions);
  return response;
}
