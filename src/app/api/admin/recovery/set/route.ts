import { NextResponse, type NextRequest } from "next/server";
import { setRecoveryPin } from "@/lib/credentials";
import { recoverySetupSchema } from "@/lib/validation";
import { logActivity } from "@/lib/activity";
import { getClientIp, isRateLimited } from "@/lib/rateLimit";

const RATE_LIMIT_WINDOW_MS = 30_000;
const MAX_ATTEMPTS_PER_WINDOW = 5;

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (isRateLimited("recovery-set", ip, MAX_ATTEMPTS_PER_WINDOW, RATE_LIMIT_WINDOW_MS)) {
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

  const parsed = recoverySetupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { currentPassword, phone, pin } = parsed.data;
  const success = await setRecoveryPin(currentPassword, phone, pin);
  if (!success) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
  }

  await logActivity("update", "settings", "Set up password recovery (phone + PIN)");
  return NextResponse.json({ success: true });
}
