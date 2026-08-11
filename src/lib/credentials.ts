import { randomBytes, scrypt, createHash, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { readFile } from "fs/promises";
import path from "path";
import { writeDataFile } from "@/lib/fsWrite";

const scryptAsync = promisify(scrypt);
const KEY_LENGTH = 64;

type AdminCredentials = {
  salt: string;
  passwordHash: string;
};

async function readCredentials(): Promise<AdminCredentials | null> {
  try {
    const raw = await readFile(
      path.join(process.cwd(), "data", "admin.json"),
      "utf-8",
    );
    const parsed = JSON.parse(raw) as Partial<AdminCredentials>;
    if (typeof parsed.salt === "string" && typeof parsed.passwordHash === "string") {
      return parsed as AdminCredentials;
    }
    return null;
  } catch {
    return null;
  }
}

function safeCompare(a: string, b: string): boolean {
  const hashA = createHash("sha256").update(a).digest();
  const hashB = createHash("sha256").update(b).digest();
  return timingSafeEqual(hashA, hashB);
}

async function hashPassword(password: string, salt: string): Promise<string> {
  const derived = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
  return derived.toString("hex");
}

/**
 * The admin password lives in one of two places: a hash in data/admin.json
 * once it's ever been changed through the admin UI, or the ADMIN_PASSWORD
 * env var as the initial/fallback credential. The JSON file always wins once
 * it exists, since it reflects the latest change.
 */
export async function verifyAdminPassword(password: string): Promise<boolean> {
  const stored = await readCredentials();

  if (stored) {
    const derivedHash = await hashPassword(password, stored.salt);
    return safeCompare(derivedHash, stored.passwordHash);
  }

  const envPassword = process.env.ADMIN_PASSWORD;
  if (!envPassword) return false;
  return safeCompare(password, envPassword);
}

export async function isAdminAuthConfigured(): Promise<boolean> {
  if (await readCredentials()) return true;
  return Boolean(process.env.ADMIN_PASSWORD);
}

export async function setAdminPassword(newPassword: string): Promise<void> {
  const salt = randomBytes(16).toString("hex");
  const passwordHash = await hashPassword(newPassword, salt);
  await writeDataFile("admin.json", { salt, passwordHash });
}
