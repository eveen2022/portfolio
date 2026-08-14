import { MongoClient, type Collection, type Db, type Document } from "mongodb";

// Fixed _id used for every "single object" store (site.json, analytics.json,
// admin.json equivalents) so reads/writes always target the same document
// instead of relying on "there happens to be exactly one doc in the collection".
export const SINGLETON_ID = "singleton";

/** Maps a legacy data filename (e.g. "projects.json") to its Mongo collection name. */
export function collectionName(dataFileName: string): string {
  return dataFileName.replace(/\.json$/, "");
}

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function connect(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "Missing MONGODB_URI environment variable. Set it in .env.local (see .env.example).",
    );
  }
  return new MongoClient(uri).connect();
}

// Cached on `global` so warm serverless invocations (and dev-mode hot reloads)
// reuse the same connection instead of opening a new one per request.
function getClientPromise(): Promise<MongoClient> {
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = connect();
  }
  return global._mongoClientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await getClientPromise();
  return client.db(process.env.MONGODB_DB || "portfolio");
}

export async function getCollection<T extends Document = Document>(
  name: string,
): Promise<Collection<T>> {
  const db = await getDb();
  return db.collection<T>(name);
}

export type DbStorageStats = {
  dataSizeBytes: number;
  storageSizeBytes: number;
  indexSizeBytes: number;
  totalSizeBytes: number;
  collections: number;
  documents: number;
};

export async function getDbStorageStats(): Promise<DbStorageStats> {
  const db = await getDb();
  const stats = await db.command({ dbStats: 1, scale: 1 });

  return {
    dataSizeBytes: stats.dataSize ?? 0,
    storageSizeBytes: stats.storageSize ?? 0,
    indexSizeBytes: stats.indexSize ?? 0,
    totalSizeBytes: (stats.storageSize ?? 0) + (stats.indexSize ?? 0),
    collections: stats.collections ?? 0,
    documents: stats.objects ?? 0,
  };
}
