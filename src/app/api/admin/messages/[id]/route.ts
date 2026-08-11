import { NextResponse, type NextRequest } from "next/server";
import { getMessages } from "@/lib/data";
import { deleteJsonEntry, replaceJsonEntry } from "@/lib/fsWrite";
import { logActivity } from "@/lib/activity";
import type { ContactMessage } from "@/lib/types";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const read = (body as { read?: unknown })?.read;
  if (typeof read !== "boolean") {
    return NextResponse.json({ error: "'read' must be a boolean" }, { status: 400 });
  }

  const messages = await getMessages();
  const message = messages.find((m) => m.id === id);
  if (!message) {
    return NextResponse.json({ error: "Message not found" }, { status: 404 });
  }

  const updated: ContactMessage = { ...message, read };
  await replaceJsonEntry<ContactMessage>("messages.json", "id", id, updated);

  await logActivity(
    "update",
    "message",
    `Marked message from "${message.name}" as ${read ? "read" : "unread"}`,
  );
  return NextResponse.json({ success: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const messages = await getMessages();
  const message = messages.find((m) => m.id === id);
  const deleted = await deleteJsonEntry<ContactMessage>("messages.json", "id", id);

  if (!deleted) {
    return NextResponse.json({ error: "Message not found" }, { status: 404 });
  }

  await logActivity(
    "delete",
    "message",
    `Deleted message from "${message?.name ?? "unknown"}"`,
  );
  return NextResponse.json({ success: true });
}
