import { mkdir, readFile, rename, unlink, writeFile } from "fs/promises";
import path from "path";

// Per-process, per-file write queue. Sufficient as long as the app runs as a
// single Node instance (see README — do not scale this container horizontally
// without replacing the JSON files under data/ with a real datastore).
const writeQueues = new Map<string, Promise<unknown>>();

function withFileLock<T>(filePath: string, fn: () => Promise<T>): Promise<T> {
  const prior = writeQueues.get(filePath) ?? Promise.resolve();
  const run = prior.then(fn, fn);
  writeQueues.set(
    filePath,
    run.then(
      () => undefined,
      () => undefined,
    ),
  );
  return run;
}

async function readJsonArraySafe<T>(filePath: string): Promise<T[]> {
  try {
    const raw = await readFile(filePath, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

async function readJsonObjectSafe<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await readFile(filePath, "utf-8");
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? { ...fallback, ...(parsed as Partial<T>) }
      : fallback;
  } catch {
    return fallback;
  }
}

async function atomicWrite(filePath: string, content: string): Promise<void> {
  const tmpPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(tmpPath, content, "utf-8");
  await rename(tmpPath, filePath);
}

function dataFilePath(dataFileName: string): string {
  return path.join(process.cwd(), "data", dataFileName);
}

function contentFilePath(relativePath: string): string {
  return path.join(process.cwd(), "content", relativePath);
}

export async function appendJsonEntry<T>(
  dataFileName: string,
  entry: T,
): Promise<void> {
  const filePath = dataFilePath(dataFileName);

  await withFileLock(filePath, async () => {
    const current = await readJsonArraySafe<T>(filePath);
    current.push(entry);
    await atomicWrite(filePath, JSON.stringify(current, null, 2));
  });
}

/** Same as appendJsonEntry, but keeps only the most recent maxEntries (oldest dropped first). */
export async function appendJsonEntryCapped<T>(
  dataFileName: string,
  entry: T,
  maxEntries: number,
): Promise<void> {
  const filePath = dataFilePath(dataFileName);

  await withFileLock(filePath, async () => {
    const current = await readJsonArraySafe<T>(filePath);
    current.push(entry);
    const trimmed =
      current.length > maxEntries
        ? current.slice(current.length - maxEntries)
        : current;
    await atomicWrite(filePath, JSON.stringify(trimmed, null, 2));
  });
}

/** Full-file overwrite (used for whole-object stores like site.json, or whole-array replaces like skills.json). */
export async function writeDataFile<T>(
  dataFileName: string,
  data: T,
): Promise<void> {
  const filePath = dataFilePath(dataFileName);
  await withFileLock(filePath, () =>
    atomicWrite(filePath, JSON.stringify(data, null, 2)),
  );
}

/**
 * Locked read-modify-write for a single JSON object file (as opposed to the
 * array-shaped stores the other helpers here target). The read and write
 * happen inside the same per-file lock, so concurrent callers (e.g. two
 * visits arriving at once) can't race and lose an update the way a bare
 * `readJson` + `writeDataFile` pair would.
 */
export async function updateJsonObject<T extends Record<string, unknown>>(
  dataFileName: string,
  fallback: T,
  updater: (current: T) => T,
): Promise<T> {
  const filePath = dataFilePath(dataFileName);
  let result: T = fallback;

  await withFileLock(filePath, async () => {
    const current = await readJsonObjectSafe<T>(filePath, fallback);
    result = updater(current);
    await atomicWrite(filePath, JSON.stringify(result, null, 2));
  });

  return result;
}

/** Insert, or replace in place if an entry with the same matchKey value already exists. */
export async function upsertJsonEntry<T extends Record<string, unknown>>(
  dataFileName: string,
  entry: T,
  matchKey: keyof T,
): Promise<void> {
  const filePath = dataFilePath(dataFileName);

  await withFileLock(filePath, async () => {
    const current = await readJsonArraySafe<T>(filePath);
    const index = current.findIndex(
      (item) => item[matchKey] === entry[matchKey],
    );
    if (index >= 0) {
      current[index] = entry;
    } else {
      current.push(entry);
    }
    await atomicWrite(filePath, JSON.stringify(current, null, 2));
  });
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
  const filePath = dataFilePath(dataFileName);
  let found = false;

  await withFileLock(filePath, async () => {
    const current = await readJsonArraySafe<T>(filePath);
    const index = current.findIndex((item) => item[matchKey] === originalValue);
    if (index >= 0) {
      found = true;
      current[index] = newEntry;
      await atomicWrite(filePath, JSON.stringify(current, null, 2));
    }
  });

  return found;
}

/** Removes any entries matching matchKey/matchValue. Returns true if something was removed. */
export async function deleteJsonEntry<T extends Record<string, unknown>>(
  dataFileName: string,
  matchKey: keyof T,
  matchValue: unknown,
): Promise<boolean> {
  const filePath = dataFilePath(dataFileName);
  let deleted = false;

  await withFileLock(filePath, async () => {
    const current = await readJsonArraySafe<T>(filePath);
    const next = current.filter((item) => item[matchKey] !== matchValue);
    deleted = next.length !== current.length;
    await atomicWrite(filePath, JSON.stringify(next, null, 2));
  });

  return deleted;
}

export async function writeContentFile(
  relativePath: string,
  content: string,
): Promise<void> {
  const filePath = contentFilePath(relativePath);
  await withFileLock(filePath, () => atomicWrite(filePath, content));
}

export async function deleteContentFile(relativePath: string): Promise<void> {
  const filePath = contentFilePath(relativePath);
  await withFileLock(filePath, async () => {
    try {
      await unlink(filePath);
    } catch {
      // already gone — nothing to do
    }
  });
}
