import { getMessages } from "@/lib/data";
import { MessageRow } from "@/components/admin/messages/MessageRow";
import { Card } from "@/components/admin/form";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  const messages = await getMessages();
  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">
          Messages
        </h1>
        <p className="text-sm text-muted">
          {messages.length} total · {unreadCount} unread
        </p>
      </div>

      <div className="flex max-w-2xl flex-col gap-3">
        {messages.length === 0 && (
          <Card className="text-sm text-muted">
            No messages yet — they&apos;ll show up here when someone submits
            the contact form.
          </Card>
        )}
        {messages.map((message) => (
          <MessageRow key={message.id} message={message} />
        ))}
      </div>
    </div>
  );
}
