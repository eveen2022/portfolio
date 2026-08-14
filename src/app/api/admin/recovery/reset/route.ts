import { NextResponse, type NextRequest } from "next/server";
import {
  createSessionToken,
  sessionCookieOptions,
  verifyRecoveryToken,
  RECOVERY_COOKIE_NAME,
  SESSION_COOKIE_NAME,
} from "@/lib/auth";
import { resetPasswordViaRecovery } from "@/lib/credentials";
import { recoveryResetSchema } from "@/lib/validation";
import { logActivity } from "@/lib/activity";

export async function POST(request: NextRequest) {
  const recoveryToken = request.cookies.get(RECOVERY_COOKIE_NAME)?.value;
  if (!recoveryToken || !(await verifyRecoveryToken(recoveryToken))) {
    return NextResponse.json(
      { error: "Your recovery session expired. Please start again." },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = recoveryResetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  await resetPasswordViaRecovery(parsed.data.newPassword);
  await logActivity("update", "settings", "Reset admin password via phone recovery");

  const sessionToken = await createSessionToken();
  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE_NAME, sessionToken, sessionCookieOptions);
  response.cookies.delete(RECOVERY_COOKIE_NAME);
  return response;
}
