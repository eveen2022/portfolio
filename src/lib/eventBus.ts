// Per-process pub/sub for Server-Sent Events. Sufficient as long as the app
// runs as a single Node instance (same constraint as the JSON file locking
// in fsWrite.ts — see README).
type Listener = (payload: string) => void;

const listeners = new Set<Listener>();

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function broadcast(event: Record<string, unknown>): void {
  const payload = `data: ${JSON.stringify(event)}\n\n`;
  for (const listener of listeners) listener(payload);
}
