"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

type ConfirmOptions = {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Red/destructive styling — true by default, since every current caller is a delete. */
  danger?: boolean;
};

type PendingConfirm = ConfirmOptions & {
  resolve: (value: boolean) => void;
};

const ConfirmContext = createContext<((options: ConfirmOptions | string) => Promise<boolean>) | null>(
  null,
);

/** Drop-in replacement for `window.confirm(message)`, styled to match the
 * site instead of the browser's native "localhost:3001 says..." dialog.
 * Usage: `if (!(await confirm("Delete this? This can't be undone."))) return;` */
export function useConfirm() {
  const confirm = useContext(ConfirmContext);
  if (!confirm) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return confirm;
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<PendingConfirm | null>(null);

  const confirm = useCallback((options: ConfirmOptions | string) => {
    const normalized: ConfirmOptions =
      typeof options === "string" ? { message: options } : options;
    return new Promise<boolean>((resolve) => {
      setPending({ ...normalized, resolve });
    });
  }, []);

  function choose(result: boolean) {
    pending?.resolve(result);
    setPending(null);
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}

      <AnimatePresence>
        {pending && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => choose(false)}
            className="fixed inset-0 z-[250] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              onClick={(event) => event.stopPropagation()}
              className="glass glass-sheen relative flex w-full max-w-sm flex-col gap-5 rounded-2xl p-6"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="confirm-title"
            >
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-xl",
                    pending.danger === false
                      ? "bg-accent-soft text-accent"
                      : "bg-red-500/15 text-red-600 dark:text-red-400",
                  )}
                >
                  <AlertTriangle className="size-5" />
                </span>
                <div className="min-w-0">
                  <h2 id="confirm-title" className="text-base font-semibold text-foreground">
                    {pending.title ?? "Are you sure?"}
                  </h2>
                  <p className="mt-1 text-sm text-foreground-secondary">
                    {pending.message}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={() => choose(false)}>
                  {pending.cancelLabel ?? "Cancel"}
                </Button>
                <Button
                  type="button"
                  autoFocus
                  onClick={() => choose(true)}
                  className={
                    pending.danger === false
                      ? undefined
                      : "bg-gradient-to-r from-red-600 to-red-500 shadow-lg shadow-red-500/20 hover:shadow-[0_12px_40px_-8px_rgba(220,38,38,0.45)]"
                  }
                >
                  {pending.confirmLabel ?? "Delete"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  );
}
