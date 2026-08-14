// One-time migration: copies the local data/*.json files and content/blog/*.md
// bodies into MongoDB collections. Run after setting MONGODB_URI in .env.local:
//
//   npm run migrate:mongo
//
// Safe to re-run: each collection is fully replaced with the current file
// contents (or the current doc upserted, for the singleton object stores).
import { readFile, readdir } from "fs/promises";
import path from "path";
import { MongoClient } from "mongodb";

const SINGLETON_ID = "singleton";

const ARRAY_FILES = [
  "projects.json",
  "posts.json",
  "skills.json",
  "experience.json",
  "education.json",
  "messages.json",
  "activity.json",
];

const OBJECT_FILES = ["site.json", "analytics.json", "admin.json"];

const UNIQUE_INDEXES = {
  projects: "slug",
  posts: "slug",
  messages: "id",
  activity: "id",
  experience: "id",
  education: "id",
};

function collectionName(dataFileName) {
  return dataFileName.replace(/\.json$/, "");
}

async function readJsonFile(filePath, fallback) {
  try {
    const raw = await readFile(filePath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error(
      "Missing MONGODB_URI. Set it in .env.local, then run: npm run migrate:mongo",
    );
    process.exit(1);
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(process.env.MONGODB_DB || "portfolio");

  const dataDir = path.join(process.cwd(), "data");
  const blogDir = path.join(process.cwd(), "content", "blog");

  for (const fileName of ARRAY_FILES) {
    const data = await readJsonFile(path.join(dataDir, fileName), []);
    const name = collectionName(fileName);
    const collection = db.collection(name);
    await collection.deleteMany({});
    if (Array.isArray(data) && data.length > 0) {
      await collection.insertMany(data);
    }
    console.log(`${name}: ${Array.isArray(data) ? data.length : 0} document(s)`);

    const uniqueKey = UNIQUE_INDEXES[name];
    if (uniqueKey) {
      try {
        await collection.createIndex({ [uniqueKey]: 1 }, { unique: true });
      } catch (err) {
        console.warn(`  could not create unique index on ${name}.${uniqueKey}:`, err.message);
      }
    }
  }

  for (const fileName of OBJECT_FILES) {
    const data = await readJsonFile(path.join(dataDir, fileName), null);
    const name = collectionName(fileName);
    const collection = db.collection(name);
    if (data && typeof data === "object") {
      await collection.replaceOne(
        { _id: SINGLETON_ID },
        { _id: SINGLETON_ID, ...data },
        { upsert: true },
      );
      console.log(`${name}: 1 document (singleton)`);
    } else {
      console.log(`${name}: skipped (no file / not an object)`);
    }
  }

  let blogFiles = [];
  try {
    blogFiles = (await readdir(blogDir)).filter((f) => f.endsWith(".md"));
  } catch {
    blogFiles = [];
  }

  const contentCollection = db.collection("content");
  for (const fileName of blogFiles) {
    const content = await readFile(path.join(blogDir, fileName), "utf-8");
    const id = `blog/${fileName}`;
    await contentCollection.replaceOne(
      { _id: id },
      { _id: id, content },
      { upsert: true },
    );
  }
  console.log(`content: ${blogFiles.length} blog body document(s)`);

  await client.close();
  console.log("\nMigration complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
