"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const LiveContext = createContext(false);

export function useLiveConnected() {
  return useContext(LiveContext);
}

export function LiveProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [connected, setConnected] = useState(false);
  const refreshTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const source = new EventSource("/api/events");

    source.onopen = () => setConnected(true);
    source.onerror = () => setConnected(false);
    source.onmessage = () => {
      if (refreshTimeout.current) clearTimeout(refreshTimeout.current);
      // Debounced: several admin writes in quick succession only trigger one refresh.
      refreshTimeout.current = setTimeout(() => router.refresh(), 300);
    };

    return () => {
      source.close();
      if (refreshTimeout.current) clearTimeout(refreshTimeout.current);
    };
  }, [router]);

  return (
    <LiveContext.Provider value={connected}>{children}</LiveContext.Provider>
  );
}
