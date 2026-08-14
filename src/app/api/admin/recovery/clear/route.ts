import { NextResponse, type NextRequest } from "next/server";
import { clearRecoveryPin } from "@/lib/credentials";
import { logActivity } from "@/lib/activity";
import { getClientIp, isRateLimited } from "@/lib/rateLimit";

const RATE_LIMIT_WINDOW_MS = 30_000;
const MAX_ATTEMPTS_PER_WINDOW = 5;

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (isRateLimited("recovery-clear", ip, MAX_ATTEMPTS_PER_WINDOW, RATE_LIMIT_WINDOW_MS)) {
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

  const currentPassword =
    typeof body === "object" && body !== null && "currentPassword" in body
      ? String((body as { currentPassword: unknown }).currentPassword ?? "")
      : "";

  const success = await clearRecoveryPin(currentPassword);
  if (!success) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
  }

  await logActivity("update", "settings", "Removed password recovery (phone + PIN)");
  return NextResponse.json({ success: true });
}
