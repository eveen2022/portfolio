"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/cn";

const fieldClasses =
  "w-full rounded-lg border border-border bg-white/70 px-3 py-2 pr-10 text-sm text-foreground focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none dark:bg-card/60";

export function PasswordInput(
  props: Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">,
) {
  const { className, ...rest } = props;
  const [visible, setVisible] = useState(false);

  return (
    // `className` (spacing utilities like `mb-4`, layout overrides, etc.) is applied
    // here on the wrapper rather than the <input> — the eye button is centered
    // against this wrapper's box, so a margin on the input itself would offset the
    // wrapper's height without the input growing to match, throwing the icon off-center.
    <div className={cn("relative", className)}>
      <input
        type={visible ? "text" : "password"}
        className={fieldClasses}
        {...rest}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        tabIndex={-1}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute inset-y-0 right-0 flex w-9 items-center justify-center text-muted transition-colors hover:text-foreground"
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}
