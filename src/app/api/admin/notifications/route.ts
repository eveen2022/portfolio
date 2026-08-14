import { NextResponse } from "next/server";
import { getMessages } from "@/lib/data";

const MAX_ITEMS = 8;

export async function GET() {
  const messages = await getMessages();
  const unread = messages.filter((message) => !message.read);

  return NextResponse.json({
    unreadCount: unread.length,
    messages: unread.slice(0, MAX_ITEMS).map((message) => ({
      id: message.id,
      name: message.name,
      subject: message.subject,
      submittedAt: message.submittedAt,
    })),
  });
}
