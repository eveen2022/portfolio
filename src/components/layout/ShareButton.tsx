"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Share2, Copy, Check, X } from "lucide-react";
import { siteMeta } from "@/lib/site";

const noopSubscribe = () => () => {};

// Feature-detected client-side only, via useSyncExternalStore rather than a
// state-setting effect — navigator isn't available during SSR, and the
// server snapshot (false) must differ from the client's real value without
// tripping the "no setState in an effect" lint rule.
function useCanNativeShare() {
  return useSyncExternalStore(
    noopSubscribe,
    () => typeof navigator !== "undefined" && "share" in navigator,
    () => false,
  );
}

export function ShareButton({ siteName }: { siteName: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const canNativeShare = useCanNativeShare();

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  async function handleNativeShare() {
    try {
      await navigator.share({
        title: siteName,
        text: `Check out ${siteName}'s portfolio`,
        url: siteMeta.siteUrl,
      });
    } catch {
      // AbortError when the user cancels the share sheet — nothing to do.
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(siteMeta.siteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be denied by the browser — the URL is still
      // shown as selectable text, so this fails silently rather than
      // surfacing an error for something this low-stakes.
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Share this portfolio"
        title="Share this portfolio"
        className="flex size-9 items-center justify-center rounded-full text-foreground-secondary transition-colors hover:bg-foreground/5 hover:text-accent"
      >
        <Share2 className="size-4.5" />
      </button>

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
                onClick={() => setOpen(false)}
              >
                <motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 12, scale: 0.96 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="glass glass-sheen relative flex w-full max-w-sm flex-col gap-5 rounded-2xl p-6"
                  onClick={(event) => event.stopPropagation()}
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold text-foreground">
                      Share this portfolio
                    </h2>
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      aria-label="Close"
                      className="flex size-8 items-center justify-center rounded-lg text-muted hover:bg-foreground/5"
                    >
                      <X className="size-4" />
                    </button>
                  </div>

                  <div className="flex justify-center">
                    <div className="rounded-xl bg-white p-3 shadow-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element -- a
                          server-generated SVG from /api/qr, not a Next-optimizable image */}
                      <img
                        src="/api/qr"
                        alt={`QR code that opens ${siteName}'s portfolio`}
                        width={180}
                        height={180}
                      />
                    </div>
                  </div>
                  <p className="text-center text-xs text-muted">
                    Scan to open this site on another device
                  </p>

                  <div className="flex items-center gap-2 rounded-xl border border-border p-2 pl-3">
                    <span className="flex-1 truncate text-sm text-foreground-secondary">
                      {siteMeta.siteUrl}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="flex shrink-0 items-center gap-1.5 rounded-lg bg-foreground/5 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-foreground/10"
                    >
                      {copied ? (
                        <>
                          <Check className="size-3.5 text-emerald-500" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="size-3.5" /> Copy link
                        </>
                      )}
                    </button>
                  </div>

                  {canNativeShare && (
                    <button
                      type="button"
                      onClick={handleNativeShare}
                      className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-accent to-accent-2 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-black/10 transition-transform hover:scale-[1.02] active:scale-95"
                    >
                      <Share2 className="size-4" /> Share via…
                    </button>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
