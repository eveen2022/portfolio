"use client";

import { useState } from "react";
import { KeyRound } from "lucide-react";
import { Card } from "@/components/admin/form";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/admin/Modal";
import { ChangePasswordForm } from "@/components/admin/settings/ChangePasswordForm";

export function PasswordCard() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
            <KeyRound className="size-5" />
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">Admin password</p>
            <p className="text-xs text-muted">Used to sign in to this dashboard.</p>
          </div>
        </div>
        <Button type="button" variant="secondary" onClick={() => setOpen(true)}>
          Change password
        </Button>
      </Card>

      {open && (
        <Modal title="Change password" onClose={() => setOpen(false)}>
          <ChangePasswordForm onSuccess={() => setOpen(false)} />
        </Modal>
      )}
    </>
  );
}
