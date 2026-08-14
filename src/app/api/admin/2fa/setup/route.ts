import { NextResponse, type NextRequest } from "next/server";
import QRCode from "qrcode";
import { startTotpSetup } from "@/lib/credentials";
import { getClientIp, isRateLimited } from "@/lib/rateLimit";

const RATE_LIMIT_WINDOW_MS = 30_000;
const MAX_ATTEMPTS_PER_WINDOW = 5;

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (isRateLimited("2fa-setup", ip, MAX_ATTEMPTS_PER_WINDOW, RATE_LIMIT_WINDOW_MS)) {
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

  const password =
    typeof body === "object" && body !== null && "password" in body
      ? String((body as { password: unknown }).password ?? "")
      : "";

  if (!password) {
    return NextResponse.json(
      { error: "Current password is required" },
      { status: 400 },
    );
  }

  const result = await startTotpSetup(password);
  if (!result) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  const qrDataUrl = await QRCode.toDataURL(result.otpauthUri);
  return NextResponse.json({ secret: result.secret, qrDataUrl });
}
