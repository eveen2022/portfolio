"use client";

import { useState, useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreVertical, X, Sun, Moon, Monitor, Mail, Download } from "lucide-react";
import { WhatsappIcon } from "@/components/icons/BrandIcons";
import { cn } from "@/lib/cn";

const themeCycle = ["light", "dark", "system"] as const;
const themeIcons = { light: Sun, dark: Moon, system: Monitor } as const;

const noopSubscribe = () => () => {};

// Avoids a hydration mismatch: the resolved theme is only known on the
// client, so the segmented control renders as unselected during SSR/first paint.
function useMounted() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

export function FloatingMenu({
  hideContact = false,
  whatsapp = "",
}: {
  hideContact?: boolean;
  whatsapp?: string;
}) {
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();
  const current = mounted ? ((theme as (typeof themeCycle)[number]) ?? "system") : "system";
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin") ?? false;
  const showContact = !isAdmin && !hideContact;

  return (
    <div className="fixed right-4 bottom-4 z-50 flex flex-col items-end gap-3 sm:right-6 sm:bottom-6">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.94 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="glass glass-sheen glow-ring relative flex flex-col gap-2 rounded-2xl p-2.5 shadow-xl shadow-black/10"
          >
            <div
              className="flex items-center gap-1 rounded-full bg-foreground/5 p-1"
              role="radiogroup"
              aria-label="Theme"
            >
              {themeCycle.map((t) => {
                const Icon = themeIcons[t];
                const active = mounted && current === t;
                return (
                  <button
                    key={t}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    aria-label={t}
                    title={t}
                    onClick={() => setTheme(t)}
                    className={cn(
                      "flex size-9 items-center justify-center rounded-full transition-colors",
                      active
                        ? "bg-accent text-white"
                        : "text-foreground-secondary hover:text-accent",
                    )}
                  >
                    <Icon className="size-4" />
                  </button>
                );
              })}
            </div>

            {showContact && (
              <Link
                href="/contact"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-full px-3 py-2.5 text-sm font-medium text-foreground-secondary transition-colors hover:bg-foreground/5 hover:text-accent"
              >
                <Mail className="size-4" /> Contact
              </Link>
            )}

            {showContact && whatsapp && (
              <a
                href={whatsapp}
                target="_blank"
                rel="noreferrer noopener"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-full px-3 py-2.5 text-sm font-medium text-foreground-secondary transition-colors hover:bg-foreground/5 hover:text-accent"
              >
                <WhatsappIcon className="size-4" /> WhatsApp
              </a>
            )}

            <a
              href="/resume.pdf"
              download
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-full px-3 py-2.5 text-sm font-medium text-foreground-secondary transition-colors hover:bg-foreground/5 hover:text-accent sm:hidden"
            >
              <Download className="size-4" /> Resume
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        className="glass glow-ring flex size-12 items-center justify-center rounded-full text-foreground-secondary shadow-xl shadow-black/10 transition-transform hover:scale-105 active:scale-95"
      >
        {open ? <X className="size-5" /> : <MoreVertical className="size-5" />}
      </button>
    </div>
  );
}
