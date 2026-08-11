"use client";

import { useEffect, useRef, useState } from "react";
import { Bold, Italic, Underline } from "lucide-react";
import { getSelectionCoords } from "@/lib/caretCoordinates";

const FONT_SIZES = [
  { label: "S", value: "0.85em" },
  { label: "M", value: "1.15em" },
  { label: "L", value: "1.4em" },
  { label: "XL", value: "1.8em" },
];

type SelectionState = {
  top: number;
  left: number;
  start: number;
  end: number;
};

export function MarkdownBodyField({
  id,
  value,
  onChange,
  rows = 16,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [toolbar, setToolbar] = useState<SelectionState | null>(null);
  const pendingSelectionRef = useRef<{ start: number; end: number } | null>(null);

  // After a formatting wrap changes `value`, the textarea remounts its text —
  // restore the selection to cover the newly-wrapped text once that happens.
  useEffect(() => {
    const pending = pendingSelectionRef.current;
    const el = textareaRef.current;
    if (pending && el) {
      el.focus();
      el.setSelectionRange(pending.start, pending.end);
      pendingSelectionRef.current = null;
    }
  }, [value]);

  function handleSelect() {
    const el = textareaRef.current;
    if (!el) return;
    const { selectionStart, selectionEnd } = el;

    if (selectionStart === selectionEnd) {
      setToolbar(null);
      return;
    }

    const coords = getSelectionCoords(el, selectionStart);
    const rect = el.getBoundingClientRect();
    const top = coords.top - rect.top - 46;
    const left = Math.min(Math.max(coords.left - rect.left, 0), Math.max(rect.width - 260, 0));

    setToolbar({ top: Math.max(top, 0), left, start: selectionStart, end: selectionEnd });
  }

  function applyWrap(before: string, after: string) {
    if (!toolbar) return;
    const { start, end } = toolbar;
    const selected = value.slice(start, end);
    const next = value.slice(0, start) + before + selected + after + value.slice(end);

    pendingSelectionRef.current = {
      start: start + before.length,
      end: start + before.length + selected.length,
    };
    onChange(next);
    setToolbar(null);
  }

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        id={id}
        required
        rows={rows}
        className="w-full rounded-lg border border-border bg-white/70 px-3 py-2 font-mono text-sm text-foreground focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none dark:bg-card/60"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onSelect={handleSelect}
        onBlur={() => setToolbar(null)}
      />

      {toolbar && (
        <div
          className="glass glass-sheen absolute z-20 flex items-center gap-0.5 rounded-xl p-1 shadow-xl shadow-black/10"
          style={{ top: toolbar.top, left: toolbar.left }}
        >
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => applyWrap("**", "**")}
            aria-label="Bold"
            title="Bold"
            className="flex size-8 items-center justify-center rounded-lg text-foreground-secondary hover:bg-foreground/10"
          >
            <Bold className="size-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => applyWrap("*", "*")}
            aria-label="Italic"
            title="Italic"
            className="flex size-8 items-center justify-center rounded-lg text-foreground-secondary hover:bg-foreground/10"
          >
            <Italic className="size-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => applyWrap("<u>", "</u>")}
            aria-label="Underline"
            title="Underline"
            className="flex size-8 items-center justify-center rounded-lg text-foreground-secondary hover:bg-foreground/10"
          >
            <Underline className="size-4" />
          </button>

          <div className="mx-1 h-5 w-px bg-border" aria-hidden="true" />

          {FONT_SIZES.map((size) => (
            <button
              key={size.value}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() =>
                applyWrap(`<span style="font-size:${size.value}">`, "</span>")
              }
              aria-label={`Font size ${size.label}`}
              title={`Font size ${size.label}`}
              className="flex h-8 min-w-8 items-center justify-center rounded-lg px-1.5 text-xs font-semibold text-foreground-secondary hover:bg-foreground/10"
            >
              {size.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
