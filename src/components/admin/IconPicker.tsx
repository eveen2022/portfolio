"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X, ChevronDown } from "lucide-react";
import { TECH_ICONS, getTechIcon } from "@/lib/techIcons";
import { cn } from "@/lib/cn";

export function IconPicker({
  value,
  onChange,
  className,
}: {
  value: string | undefined;
  onChange: (key: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = getTechIcon(value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return TECH_ICONS;
    return TECH_ICONS.filter(
      (option) =>
        option.label.toLowerCase().includes(q) || option.key.includes(q),
    );
  }, [query]);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-[38px] w-full items-center justify-between gap-2 rounded-lg border border-border bg-white/70 px-3 text-sm text-foreground focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none dark:bg-card/60"
      >
        <span className="flex items-center gap-2 truncate">
          {selected ? (
            <>
              <selected.Icon className="size-4 shrink-0" />
              <span className="truncate">{selected.label}</span>
            </>
          ) : (
            <span className="text-muted">Choose icon</span>
          )}
        </span>
        <ChevronDown className="size-3.5 shrink-0 text-muted" />
      </button>

      {open && (
        <div className="glass glass-sheen relative z-20 mt-2 w-72 rounded-2xl p-3 shadow-xl shadow-black/10">
          <div className="mb-2 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search icons..."
                className="w-full rounded-lg border border-border bg-white/70 py-1.5 pr-2 pl-8 text-xs text-foreground focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none dark:bg-card/60"
              />
            </div>
            {value && (
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setOpen(false);
                }}
                aria-label="Clear icon"
                className="flex size-7 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-foreground/5"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          <div className="grid max-h-56 grid-cols-6 gap-1 overflow-y-auto">
            {filtered.map((option) => (
              <button
                key={option.key}
                type="button"
                title={option.label}
                onClick={() => {
                  onChange(option.key);
                  setOpen(false);
                  setQuery("");
                }}
                className={cn(
                  "flex size-9 items-center justify-center rounded-lg text-foreground-secondary transition-colors hover:bg-accent/10 hover:text-accent",
                  value === option.key && "bg-accent/15 text-accent",
                )}
              >
                <option.Icon className="size-4" />
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="col-span-6 py-4 text-center text-xs text-muted">
                No icons found.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
