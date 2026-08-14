import { NextResponse } from "next/server";
import { getMessages } from "@/lib/data";
import { writeDataFile } from "@/lib/fsWrite";
import { logActivity } from "@/lib/activity";
import type { ContactMessage } from "@/lib/types";

export async function POST() {
  const messages = await getMessages();
  const unreadCount = messages.filter((message) => !message.read).length;

  if (unreadCount === 0) {
    return NextResponse.json({ success: true, cleared: 0 });
  }

  const updated: ContactMessage[] = messages.map((message) =>
    message.read ? message : { ...message, read: true },
  );
  await writeDataFile("messages.json", updated);
  await logActivity(
    "update",
    "message",
    `Marked ${unreadCount} message${unreadCount === 1 ? "" : "s"} as read`,
  );

  return NextResponse.json({ success: true, cleared: unreadCount });
}
