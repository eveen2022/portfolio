import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE_NAME = "portfolio_admin_session";
const SESSION_DURATION = "7d";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

// Short-lived, separate-purpose token issued after a correct password when
// two-factor auth is enabled — proves "password was correct" without
// granting admin access. verifySessionToken (used by proxy.ts to gate every
// /admin route) checks for role "admin" specifically, so this token is inert
// for actual access even if leaked; it only unlocks the TOTP-verify step.
export const PENDING_2FA_COOKIE_NAME = "portfolio_admin_2fa_pending";
const PENDING_2FA_DURATION = "5m";
const PENDING_2FA_MAX_AGE_SECONDS = 5 * 60;

// Same idea as the pending-2FA token, but issued after a correct phone+PIN
// recovery match instead of a password — proves "recovery check passed"
// without granting admin access on its own. Only unlocks the one-time
// password-reset step.
export const RECOVERY_COOKIE_NAME = "portfolio_admin_recovery_pending";
const RECOVERY_DURATION = "10m";
const RECOVERY_MAX_AGE_SECONDS = 10 * 60;

function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  // 32+ chars (256+ bits) matches NIST guidance for an HMAC-SHA256 key.
  if (!secret || secret.length < 32) {
    throw new Error(
      "SESSION_SECRET env var must be set to a random string of at least 32 characters",
    );
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_DURATION)
    .sign(getSecretKey());
}

export async function verifySessionToken(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload.role === "admin";
  } catch {
    return false;
  }
}

export async function createPending2faToken(): Promise<string> {
  return new SignJWT({ role: "admin-pending-2fa" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(PENDING_2FA_DURATION)
    .sign(getSecretKey());
}

export async function verifyPending2faToken(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload.role === "admin-pending-2fa";
  } catch {
    return false;
  }
}

export async function createRecoveryToken(): Promise<string> {
  return new SignJWT({ role: "admin-recovery" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(RECOVERY_DURATION)
    .sign(getSecretKey());
}

export async function verifyRecoveryToken(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload.role === "admin-recovery";
  } catch {
    return false;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_MAX_AGE_SECONDS,
};

export const pending2faCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: PENDING_2FA_MAX_AGE_SECONDS,
};

export const recoveryCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: RECOVERY_MAX_AGE_SECONDS,
};
