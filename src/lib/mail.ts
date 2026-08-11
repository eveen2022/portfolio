import type { ContactMessage } from "@/lib/types";

function buildEmailBody(message: ContactMessage) {
  const subject = message.subject || `New portfolio contact from ${message.name}`;
  const text = [
    `From: ${message.name} <${message.email}>`,
    `Submitted: ${message.submittedAt}`,
    "",
    message.message,
  ].join("\n");
  return { subject, text };
}

async function sendViaResend(message: ContactMessage): Promise<void> {
  const { Resend } = await import("resend");
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  const to = process.env.CONTACT_TO_EMAIL;

  if (!apiKey || !from || !to) {
    throw new Error(
      "EMAIL_PROVIDER=resend requires RESEND_API_KEY, CONTACT_FROM_EMAIL, and CONTACT_TO_EMAIL",
    );
  }

  const resend = new Resend(apiKey);
  const { subject, text } = buildEmailBody(message);
  const { error } = await resend.emails.send({
    from,
    to,
    replyTo: message.email,
    subject,
    text,
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }
}

async function sendViaSmtp(message: ContactMessage): Promise<void> {
  const nodemailer = await import("nodemailer");
  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS } =
    process.env;
  const to = process.env.CONTACT_TO_EMAIL;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !to) {
    throw new Error(
      "EMAIL_PROVIDER=smtp requires SMTP_HOST, SMTP_USER, SMTP_PASS, and CONTACT_TO_EMAIL",
    );
  }

  const transport = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: SMTP_SECURE === "true",
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  const { subject, text } = buildEmailBody(message);
  await transport.sendMail({
    from: SMTP_USER,
    to,
    replyTo: message.email,
    subject,
    text,
  });
}

function sendViaConsole(message: ContactMessage): void {
  const { subject, text } = buildEmailBody(message);
  console.log("[mail:dry-run] would send email:", { subject, text });
}

export async function sendContactNotification(
  message: ContactMessage,
): Promise<boolean> {
  const provider = process.env.EMAIL_PROVIDER ?? "console";

  try {
    if (provider === "resend") {
      await sendViaResend(message);
    } else if (provider === "smtp") {
      await sendViaSmtp(message);
    } else {
      sendViaConsole(message);
    }
    return true;
  } catch (error) {
    console.error("[mail] failed to send contact notification:", error);
    return false;
  }
}
