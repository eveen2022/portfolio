import { NextResponse, type NextRequest } from "next/server";
import { appendJsonEntry } from "@/lib/fsWrite";
import { sendContactNotification } from "@/lib/mail";
import { logActivity } from "@/lib/activity";
import type { ContactMessage } from "@/lib/types";
import { contactFormSchema } from "@/lib/validation";
import { getClientIp, isRateLimited } from "@/lib/rateLimit";

const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_ATTEMPTS_PER_WINDOW = 1;

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = contactFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { name, email, subject, message, company } = parsed.data;

  // Honeypot tripped: pretend success, do nothing further.
  if (company) {
    return NextResponse.json({ success: true }, { status: 201 });
  }

  const ip = getClientIp(request);
  if (isRateLimited("contact", ip, MAX_ATTEMPTS_PER_WINDOW, RATE_LIMIT_WINDOW_MS)) {
    return NextResponse.json(
      { error: "Too many submissions, please try again shortly." },
      { status: 429 },
    );
  }

  const contactMessage: ContactMessage = {
    id: crypto.randomUUID(),
    name,
    email,
    subject,
    message,
    submittedAt: new Date().toISOString(),
    read: false,
    emailSent: false,
    ip,
  };

  contactMessage.emailSent = await sendContactNotification(contactMessage);

  await appendJsonEntry<ContactMessage>("messages.json", contactMessage);
  await logActivity("create", "message", `New message from "${name}"`);

  return NextResponse.json({ success: true }, { status: 201 });
}
