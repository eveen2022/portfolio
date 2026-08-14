import * as OTPAuth from "otpauth";

const ISSUER = "Portfolio Admin";
const ACCOUNT_LABEL = "admin";

/** 20 bytes / 160 bits — the same size Google Authenticator itself generates. */
export function generateTotpSecret(): string {
  return new OTPAuth.Secret({ size: 20 }).base32;
}

function buildTotp(secret: string): OTPAuth.TOTP {
  return new OTPAuth.TOTP({
    issuer: ISSUER,
    label: ACCOUNT_LABEL,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secret),
  });
}

/** `otpauth://...` URI to encode as a QR code for the authenticator app to scan. */
export function getOtpAuthUri(secret: string): string {
  return buildTotp(secret).toString();
}

/** Accepts a code from one time-step before/after the current one, to
 * tolerate the phone's and server's clocks not being perfectly in sync. */
export function verifyTotpCode(secret: string, code: string): boolean {
  const trimmed = code.trim();
  if (!/^\d{6}$/.test(trimmed)) return false;
  const delta = buildTotp(secret).validate({ token: trimmed, window: 1 });
  return delta !== null;
}
