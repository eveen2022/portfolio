"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";

const LiveContext = createContext(false);

export function useLiveConnected() {
  return useContext(LiveContext);
}

type LiveEvent = { type: string; [key: string]: unknown };
type LiveEventListener = (event: LiveEvent) => void;

const LiveEventContext = createContext<{
  subscribe: (listener: LiveEventListener) => () => void;
} | null>(null);

/** Subscribe to raw broadcast() events from the SSE stream (see lib/eventBus),
 * as opposed to useLiveConnected's connection-status flag. Used for anything
 * that needs to react to a *specific* event (e.g. "a message arrived") rather
 * than just re-fetching the current page. */
export function useLiveEvent(listener: LiveEventListener) {
  const context = useContext(LiveEventContext);
  useEffect(() => {
    if (!context) return;
    return context.subscribe(listener);
  }, [context, listener]);
}

export function LiveProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [connected, setConnected] = useState(false);
  const refreshTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listenersRef = useRef(new Set<LiveEventListener>());

  const subscribe = useCallback((listener: LiveEventListener) => {
    listenersRef.current.add(listener);
    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  useEffect(() => {
    const source = new EventSource("/api/events");

    source.onopen = () => setConnected(true);
    source.onerror = () => setConnected(false);
    source.onmessage = (event) => {
      if (refreshTimeout.current) clearTimeout(refreshTimeout.current);
      // Debounced: several admin writes in quick succession only trigger one refresh.
      refreshTimeout.current = setTimeout(() => router.refresh(), 300);

      try {
        const parsed = JSON.parse(event.data) as LiveEvent;
        for (const listener of listenersRef.current) listener(parsed);
      } catch {
        // Not a broadcast() payload (shouldn't happen — comment/heartbeat
        // lines don't reach onmessage at all) — ignore defensively.
      }
    };

    return () => {
      source.close();
      if (refreshTimeout.current) clearTimeout(refreshTimeout.current);
    };
  }, [router]);

  return (
    <LiveContext.Provider value={connected}>
      <LiveEventContext.Provider value={{ subscribe }}>
        {children}
      </LiveEventContext.Provider>
    </LiveContext.Provider>
  );
}
