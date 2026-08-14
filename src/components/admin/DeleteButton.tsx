"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useToast } from "@/components/admin/toast/ToastProvider";
import { useConfirm } from "@/components/admin/confirm/ConfirmProvider";

export function DeleteButton({
  endpoint,
  confirmMessage = "Delete this item? This can't be undone.",
  label = "item",
}: {
  endpoint: string;
  confirmMessage?: string;
  label?: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const confirm = useConfirm();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!(await confirm(confirmMessage))) return;
    setDeleting(true);
    try {
      const response = await fetch(endpoint, { method: "DELETE" });
      if (!response.ok) throw new Error("Delete failed");
      toast({ type: "delete", title: `Deleted ${label}` });
      router.refresh();
    } catch {
      toast({
        type: "error",
        title: "Failed to delete",
        description: "Please try again.",
      });
      setDeleting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={deleting}
      aria-label="Delete"
      className="flex size-8 items-center justify-center rounded-lg text-red-600 transition-colors hover:bg-red-500/10 disabled:opacity-50 dark:text-red-400"
    >
      <Trash2 className="size-4" />
    </button>
  );
}
