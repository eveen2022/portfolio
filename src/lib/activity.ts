import { appendJsonEntryCapped } from "@/lib/fsWrite";
import { broadcast } from "@/lib/eventBus";
import type { ActivityAction, ActivityEntity, ActivityEntry } from "@/lib/types";

const MAX_ACTIVITY_ENTRIES = 300;

export async function logActivity(
  action: ActivityAction,
  entity: ActivityEntity,
  label: string,
): Promise<void> {
  const entry: ActivityEntry = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    action,
    entity,
    label,
  };

  await appendJsonEntryCapped<ActivityEntry>(
    "activity.json",
    entry,
    MAX_ACTIVITY_ENTRIES,
  );

  broadcast({ type: "activity", entity, action });
}
