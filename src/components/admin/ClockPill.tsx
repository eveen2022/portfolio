"use client";

import { useEffect, useReducer, useSyncExternalStore } from "react";
import { Clock } from "lucide-react";

const noopSubscribe = () => () => {};

// Avoids a hydration mismatch: the server has no notion of the viewer's
// local clock/timezone, so this renders a placeholder during SSR/first paint.
function useMounted() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

export function ClockPill() {
  const mounted = useMounted();
  // Ticks once a second to force a re-render; `now` itself is read fresh from
  // the browser's clock on each render rather than stored in state, so there's
  // no setState call inside the effect body (only inside the interval's own
  // callback, which is the sanctioned "subscribe to an external system" case).
  const [, tick] = useReducer((count: number) => count + 1, 0);

  useEffect(() => {
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (!mounted) {
    return (
      <span
        className="glass relative inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-muted shadow-xl shadow-black/10"
        aria-hidden="true"
      >
        <Clock className="size-3" />
        <span className="opacity-0">00:00:00 · Jan 1, 0000</span>
      </span>
    );
  }

  const now = new Date();
  const time = new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(now);
  const date = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(now);

  return (
    <span className="glass relative inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-muted shadow-xl shadow-black/10">
      <Clock className="size-3" />
      <span className="font-mono tabular-nums">{time}</span>
      <span className="opacity-50">·</span>
      <span>{date}</span>
    </span>
  );
}
