// Per-process pub/sub for Server-Sent Events. Sufficient as long as the app
// runs as a single Node instance (same constraint as the JSON file locking
// in fsWrite.ts — see README).
//
// Stored on `global` (same pattern as the Mongo client in lib/mongodb.ts) —
// Next.js dev mode (Turbopack) can give separate route handlers their own
// module instance on recompilation, which would otherwise split this into
// two disconnected `listeners` sets: one that /api/events subscribes to,
// and a different one that broadcast() calls from other routes write to.
// `global` is a true Node.js process-wide singleton, unaffected by that.
type Listener = (payload: string) => void;

declare global {
  var _sseListeners: Set<Listener> | undefined;
}

function getListeners(): Set<Listener> {
  if (!global._sseListeners) {
    global._sseListeners = new Set();
  }
  return global._sseListeners;
}

export function subscribe(listener: Listener): () => void {
  const listeners = getListeners();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function broadcast(event: Record<string, unknown>): void {
  const payload = `data: ${JSON.stringify(event)}\n\n`;
  for (const listener of getListeners()) listener(payload);
}
