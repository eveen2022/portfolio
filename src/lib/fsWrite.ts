import { collectionName, getCollection, SINGLETON_ID } from "@/lib/mongodb";

export async function appendJsonEntry<T extends object>(
  dataFileName: string,
  entry: T,
): Promise<void> {
  const collection = await getCollection(collectionName(dataFileName));
  await collection.insertOne(entry as never);
}

/** Same as appendJsonEntry, but keeps only the most recent maxEntries (oldest dropped first). */
export async function appendJsonEntryCapped<T extends { timestamp: string }>(
  dataFileName: string,
  entry: T,
  maxEntries: number,
): Promise<void> {
  const collection = await getCollection(collectionName(dataFileName));
  await collection.insertOne(entry as never);

  const count = await collection.countDocuments();
  const excess = count - maxEntries;
  if (excess > 0) {
    const oldest = await collection
      .find({}, { projection: { _id: 1 } })
      .sort({ timestamp: 1 })
      .limit(excess)
      .toArray();
    const ids = oldest.map((doc) => doc._id);
    if (ids.length > 0) {
      await collection.deleteMany({ _id: { $in: ids } } as never);
    }
  }
}

/**
 * Full-collection overwrite (used for whole-object stores like site.json, or
 * whole-array replaces like skills.json/experience.json/education.json).
 *
 * For arrays, pass `matchKey` when entries have a stable per-entry id
 * (experience/education's `id`) — this upserts each entry in place instead
 * of inserting fresh documents, which matters when the collection has a
 * unique index on that field: inserting a new document before the old one
 * with the same id is deleted would violate the index. Upserting also keeps
 * the fail-safe property insert-then-delete was going for (a failure
 * partway through only leaves some entries not-yet-applied, never an
 * emptied collection) without that conflict.
 */
export async function writeDataFile<T>(
  dataFileName: string,
  data: T,
  matchKey?: T extends (infer U)[] ? keyof U & string : never,
): Promise<void> {
  const collection = await getCollection(collectionName(dataFileName));

  if (Array.isArray(data)) {
    if (matchKey) {
      const rows = data as Record<string, unknown>[];
      if (rows.length > 0) {
        await collection.bulkWrite(
          rows.map((doc) => ({
            replaceOne: {
              filter: { [matchKey]: doc[matchKey] },
              replacement: doc,
              upsert: true,
            },
          })) as never,
        );
      }
      const keepValues = rows.map((doc) => doc[matchKey]);
      await collection.deleteMany({ [matchKey]: { $nin: keepValues } } as never);
      return;
    }

    // No stable per-entry key (e.g. skills.json) — insert the new documents
    // before removing the old ones, so a mid-write insertMany failure leaves
    // the previous data intact instead of an already-emptied collection.
    // Safe here specifically because these collections have no unique index
    // that a fresh insert could collide with (unlike matchKey'd ones above).
    const staleIds = (
      await collection.find({}, { projection: { _id: 1 } }).toArray()
    ).map((doc) => doc._id);

    if (data.length > 0) {
      await collection.insertMany(data as object[]);
    }
    if (staleIds.length > 0) {
      await collection.deleteMany({ _id: { $in: staleIds } } as never);
    }
    return;
  }

  await collection.replaceOne(
    { _id: SINGLETON_ID } as never,
    { _id: SINGLETON_ID, ...data } as never,
    { upsert: true },
  );
}

/**
 * Locked read-modify-write for a single JSON object store (as opposed to the
 * array-shaped stores the other helpers here target). Mongo's replaceOne
 * against the fixed singleton _id makes each individual write atomic; a
 * concurrent read-modify-write pair (e.g. two visits arriving at once) can
 * still race and lose an update, same tradeoff the old per-process file lock
 * had once this runs across more than one server instance.
 */
export async function updateJsonObject<T extends Record<string, unknown>>(
  dataFileName: string,
  fallback: T,
  updater: (current: T) => T,
): Promise<T> {
  const collection = await getCollection(collectionName(dataFileName));
  const existing = await collection.findOne({ _id: SINGLETON_ID } as never, {
    projection: { _id: 0 },
  });
  const current = (existing as T | null) ?? fallback;
  const result = updater(current);

  await collection.replaceOne(
    { _id: SINGLETON_ID } as never,
    { _id: SINGLETON_ID, ...result } as never,
    { upsert: true },
  );

  return result;
}

/** Insert, or replace in place if an entry with the same matchKey value already exists. */
export async function upsertJsonEntry<T extends Record<string, unknown>>(
  dataFileName: string,
  entry: T,
  matchKey: keyof T,
): Promise<void> {
  const collection = await getCollection(collectionName(dataFileName));
  await collection.replaceOne(
    { [matchKey]: entry[matchKey] } as never,
    entry as never,
    { upsert: true },
  );
}

/**
 * Replaces whichever entry currently matches matchKey/originalValue with newEntry
 * (which may itself have a different value for matchKey — e.g. a renamed slug).
 * Returns false if no entry matched the original value.
 */
export async function replaceJsonEntry<T extends Record<string, unknown>>(
  dataFileName: string,
  matchKey: keyof T,
  originalValue: unknown,
  newEntry: T,
): Promise<boolean> {
  const collection = await getCollection(collectionName(dataFileName));
  const result = await collection.replaceOne(
    { [matchKey]: originalValue } as never,
    newEntry as never,
  );
  return result.matchedCount > 0;
}

/** Removes any entries matching matchKey/matchValue. Returns true if something was removed. */
export async function deleteJsonEntry<T extends Record<string, unknown>>(
  dataFileName: string,
  matchKey: keyof T,
  matchValue: unknown,
): Promise<boolean> {
  const collection = await getCollection(collectionName(dataFileName));
  const result = await collection.deleteMany({ [matchKey]: matchValue } as never);
  return result.deletedCount > 0;
}

/**
 * Atomically bumps one or more numeric fields on the singleton document via
 * Mongo's `$inc` — safe under concurrent callers, unlike a read-modify-write
 * through updateJsonObject (two requests arriving close together there can
 * both read the same "before" value and one write clobbers the other, losing
 * an increment). Built for counters like analytics where correctness matters
 * more than the convenience of updateJsonObject's plain-object updater.
 * `increments` keys may use dot notation for nested fields (e.g.
 * "dailyVisits.2026-08-14") — see encodeMongoKey for dynamic key segments
 * that might contain a literal dot themselves.
 */
export async function incrementCounters(
  dataFileName: string,
  increments: Record<string, number>,
): Promise<void> {
  if (Object.keys(increments).length === 0) return;
  const collection = await getCollection(collectionName(dataFileName));
  await collection.updateOne(
    { _id: SINGLETON_ID } as never,
    { $inc: increments } as never,
    { upsert: true },
  );
}

// MongoDB interprets "." in a dotted update path (e.g. "referrers.google.com")
// as a nested-field separator, so a literal dot in a dynamically-keyed
// counter (a referrer hostname, a URL path) would corrupt the document
// structure if used as-is in an incrementCounters() key. This percent-style
// escaping keeps atomic updates safe while staying fully reversible for
// display — decodeMongoKey undoes it when reading the data back.
export function encodeMongoKey(key: string): string {
  return key.replace(/%/g, "%25").replace(/\./g, "%2E");
}

export function decodeMongoKey(key: string): string {
  return key.replace(/%2E/g, ".").replace(/%25/g, "%");
}

/**
 * Bulk-sets `order` to each value's index in `orderedValues` (matched by
 * matchKey) — used for drag-and-drop reordering of entries that are
 * otherwise persisted one at a time (upsertJsonEntry/replaceJsonEntry),
 * where writing the whole entry back just to bump `order` would be wasteful
 * and require re-fetching data the caller doesn't have.
 */
export async function updateOrderIndexes(
  dataFileName: string,
  matchKey: string,
  orderedValues: string[],
): Promise<void> {
  if (orderedValues.length === 0) return;
  const collection = await getCollection(collectionName(dataFileName));
  await collection.bulkWrite(
    orderedValues.map((value, index) => ({
      updateOne: {
        filter: { [matchKey]: value },
        update: { $set: { order: index } },
      },
    })) as never,
  );
}

export async function writeContentFile(
  relativePath: string,
  content: string,
): Promise<void> {
  const collection = await getCollection<{ _id: string; content: string }>("content");
  await collection.replaceOne(
    { _id: relativePath } as never,
    { _id: relativePath, content } as never,
    { upsert: true },
  );
}

export async function deleteContentFile(relativePath: string): Promise<void> {
  const collection = await getCollection("content");
  await collection.deleteOne({ _id: relativePath } as never);
}
