import { randomBytes, scrypt, createHash, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { getCollection, SINGLETON_ID } from "@/lib/mongodb";
import { writeDataFile } from "@/lib/fsWrite";
import { generateTotpSecret, getOtpAuthUri, verifyTotpCode } from "@/lib/totp";

const scryptAsync = promisify(scrypt);
const KEY_LENGTH = 64;

type AdminCredentials = {
  salt: string;
  passwordHash: string;
  totpSecret?: string;
  totpEnabled?: boolean;
  recoveryPhone?: string;
  recoverySalt?: string;
  recoveryPinHash?: string;
};

async function readCredentials(): Promise<AdminCredentials | null> {
  const collection = await getCollection<AdminCredentials & { _id: string }>("admin");
  const doc = await collection.findOne({ _id: SINGLETON_ID });
  if (doc && typeof doc.salt === "string" && typeof doc.passwordHash === "string") {
    return {
      salt: doc.salt,
      passwordHash: doc.passwordHash,
      totpSecret: typeof doc.totpSecret === "string" ? doc.totpSecret : undefined,
      totpEnabled: Boolean(doc.totpEnabled),
      recoveryPhone: typeof doc.recoveryPhone === "string" ? doc.recoveryPhone : undefined,
      recoverySalt: typeof doc.recoverySalt === "string" ? doc.recoverySalt : undefined,
      recoveryPinHash:
        typeof doc.recoveryPinHash === "string" ? doc.recoveryPinHash : undefined,
    };
  }
  return null;
}

function safeCompare(a: string, b: string): boolean {
  const hashA = createHash("sha256").update(a).digest();
  const hashB = createHash("sha256").update(b).digest();
  return timingSafeEqual(hashA, hashB);
}

// Digits-only comparison so "+94 71 234 5678" and "0712345678" style
// re-entries of the same number still match.
function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

async function hashPassword(password: string, salt: string): Promise<string> {
  const derived = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
  return derived.toString("hex");
}

/**
 * The admin password lives in one of two places: a hash in the "admin"
 * Mongo collection once it's ever been changed through the admin UI, or the
 * ADMIN_PASSWORD env var as the initial/fallback credential. The stored hash
 * always wins once it exists, since it reflects the latest change.
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
  const stored = await readCredentials();
  // Preserve TOTP and recovery fields across a password change — independent settings.
  await writeDataFile("admin.json", {
    salt,
    passwordHash,
    totpSecret: stored?.totpSecret,
    totpEnabled: stored?.totpEnabled ?? false,
    recoveryPhone: stored?.recoveryPhone,
    recoverySalt: stored?.recoverySalt,
    recoveryPinHash: stored?.recoveryPinHash,
  });
}

export async function getTotpStatus(): Promise<{ enabled: boolean }> {
  const stored = await readCredentials();
  return { enabled: Boolean(stored?.totpEnabled) };
}

/**
 * Begins 2FA setup: verifies the current password (required, since this is a
 * security-sensitive change), then generates and persists a new secret as
 * "pending" — totpEnabled stays false until confirmTotpSetup succeeds, so an
 * abandoned setup never actually locks anything.
 *
 * If no admin doc exists yet (still on the ADMIN_PASSWORD env var), this
 * also persists a real salt/hash for the password just verified. Without
 * this, writing a doc with an empty passwordHash just to hold the TOTP
 * secret would make verifyAdminPassword() start checking against that empty
 * hash instead of the env var — silently locking the admin out.
 */
export async function startTotpSetup(
  currentPassword: string,
): Promise<{ secret: string; otpauthUri: string } | null> {
  const isValid = await verifyAdminPassword(currentPassword);
  if (!isValid) return null;

  const stored = await readCredentials();
  const secret = generateTotpSecret();

  if (stored) {
    await writeDataFile("admin.json", {
      ...stored,
      totpSecret: secret,
      totpEnabled: false,
    });
  } else {
    const salt = randomBytes(16).toString("hex");
    const passwordHash = await hashPassword(currentPassword, salt);
    await writeDataFile("admin.json", {
      salt,
      passwordHash,
      totpSecret: secret,
      totpEnabled: false,
    });
  }

  return { secret, otpauthUri: getOtpAuthUri(secret) };
}

export async function confirmTotpSetup(code: string): Promise<boolean> {
  const stored = await readCredentials();
  if (!stored?.totpSecret) return false;
  if (!verifyTotpCode(stored.totpSecret, code)) return false;

  await writeDataFile("admin.json", { ...stored, totpEnabled: true });
  return true;
}

export async function disableTotp(code: string): Promise<boolean> {
  const stored = await readCredentials();
  if (!stored?.totpEnabled || !stored.totpSecret) return false;
  if (!verifyTotpCode(stored.totpSecret, code)) return false;

  await writeDataFile("admin.json", {
    ...stored,
    totpSecret: undefined,
    totpEnabled: false,
  });
  return true;
}

export async function verifyTotpForLogin(code: string): Promise<boolean> {
  const stored = await readCredentials();
  if (!stored?.totpEnabled || !stored.totpSecret) return false;
  return verifyTotpCode(stored.totpSecret, code);
}

export async function getRecoveryStatus(): Promise<{ configured: boolean; phone?: string }> {
  const stored = await readCredentials();
  return {
    configured: Boolean(stored?.recoveryPinHash && stored?.recoveryPhone),
    phone: stored?.recoveryPhone,
  };
}

/**
 * Sets (or replaces) the phone+PIN recovery fallback. Requires the current
 * password, same reasoning as startTotpSetup — this is a security-sensitive
 * change, and if no admin doc exists yet, persists a real hash for the
 * password just verified so the doc's existence doesn't break password login.
 */
export async function setRecoveryPin(
  currentPassword: string,
  phone: string,
  pin: string,
): Promise<boolean> {
  const isValid = await verifyAdminPassword(currentPassword);
  if (!isValid) return false;

  const stored = await readCredentials();
  const recoverySalt = randomBytes(16).toString("hex");
  const recoveryPinHash = await hashPassword(pin, recoverySalt);

  if (stored) {
    await writeDataFile("admin.json", {
      ...stored,
      recoveryPhone: phone,
      recoverySalt,
      recoveryPinHash,
    });
  } else {
    const salt = randomBytes(16).toString("hex");
    const passwordHash = await hashPassword(currentPassword, salt);
    await writeDataFile("admin.json", {
      salt,
      passwordHash,
      recoveryPhone: phone,
      recoverySalt,
      recoveryPinHash,
    });
  }

  return true;
}

export async function clearRecoveryPin(currentPassword: string): Promise<boolean> {
  const isValid = await verifyAdminPassword(currentPassword);
  if (!isValid) return false;

  const stored = await readCredentials();
  if (!stored) return false;

  await writeDataFile("admin.json", {
    ...stored,
    recoveryPhone: undefined,
    recoverySalt: undefined,
    recoveryPinHash: undefined,
  });
  return true;
}

// Fallback salt used only when no recovery is configured (or the phone
// doesn't match), so the scrypt hash below always runs — otherwise a wrong
// phone number would return in sub-millisecond time while a correct one
// takes tens of milliseconds (real scrypt work), letting an attacker probe
// for the right phone number by response timing alone before ever guessing
// a PIN. The extra hash's result is discarded; only its cost matters.
const DUMMY_RECOVERY_SALT = randomBytes(16).toString("hex");

export async function verifyRecovery(phone: string, pin: string): Promise<boolean> {
  const stored = await readCredentials();
  const configured = Boolean(
    stored?.recoveryPinHash && stored.recoverySalt && stored.recoveryPhone,
  );

  const phoneMatches =
    configured &&
    safeCompare(normalizePhone(phone), normalizePhone(stored!.recoveryPhone!));

  const derivedHash = await hashPassword(
    pin,
    phoneMatches ? stored!.recoverySalt! : DUMMY_RECOVERY_SALT,
  );

  if (!phoneMatches) return false;
  return safeCompare(derivedHash, stored!.recoveryPinHash!);
}

/**
 * Resets the password after a successful phone+PIN recovery check, without
 * needing the old password. Also clears TOTP — if 2FA is enabled and the
 * admin loses their authenticator app on top of forgetting the password, this
 * is the only way back in, so it must fully restore access rather than trade
 * one lockout for another. The recovery phone/PIN themselves are preserved so
 * the fallback still works next time.
 */
export async function resetPasswordViaRecovery(newPassword: string): Promise<void> {
  const stored = await readCredentials();
  const salt = randomBytes(16).toString("hex");
  const passwordHash = await hashPassword(newPassword, salt);

  await writeDataFile("admin.json", {
    ...stored,
    salt,
    passwordHash,
    totpSecret: undefined,
    totpEnabled: false,
  });
}
