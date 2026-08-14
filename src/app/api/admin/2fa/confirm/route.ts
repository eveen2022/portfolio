import { NextResponse, type NextRequest } from "next/server";
import { confirmTotpSetup } from "@/lib/credentials";
import { logActivity } from "@/lib/activity";
import { getClientIp, isRateLimited } from "@/lib/rateLimit";
import { totpCodeSchema } from "@/lib/validation";

const RATE_LIMIT_WINDOW_MS = 30_000;
const MAX_ATTEMPTS_PER_WINDOW = 5;

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (isRateLimited("2fa-confirm", ip, MAX_ATTEMPTS_PER_WINDOW, RATE_LIMIT_WINDOW_MS)) {
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

  const parsed = totpCodeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid code. Please try again." },
      { status: 400 },
    );
  }

  const success = await confirmTotpSetup(parsed.data.code);
  if (!success) {
    return NextResponse.json(
      { error: "Invalid code. Please try again." },
      { status: 400 },
    );
  }

  await logActivity("update", "settings", "Enabled two-factor authentication");
  return NextResponse.json({ success: true });
}
