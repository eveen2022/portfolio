"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { LiveIndicator } from "@/components/admin/LiveIndicator";
import { ClockPill } from "@/components/admin/ClockPill";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Desktop floating sidebar */}
      <aside className="glass glass-sheen fixed inset-y-4 left-4 z-30 hidden w-64 overflow-y-auto rounded-3xl lg:block">
        <AdminSidebar />
      </aside>

      {/* Mobile topbar */}
      <header className="glass-header sticky top-0 z-30 flex h-14 items-center justify-between px-4 lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="flex size-9 items-center justify-center rounded-full text-foreground-secondary"
        >
          <Menu className="size-5" />
        </button>
        <span className="font-mono text-sm font-semibold text-foreground">
          <span className="text-accent">{"</>"}</span> Admin
        </span>
        <LiveIndicator />
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 lg:hidden"
              aria-hidden="true"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="glass fixed inset-y-0 left-0 z-50 w-72 lg:hidden"
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="absolute top-4 right-4 flex size-8 items-center justify-center rounded-full text-muted hover:bg-foreground/5"
              >
                <X className="size-4" />
              </button>
              <AdminSidebar onNavigate={() => setOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="lg:pl-[19rem]">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
          <div className="mb-6 hidden items-center justify-end gap-2 lg:flex">
            <ClockPill />
            <LiveIndicator />
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
