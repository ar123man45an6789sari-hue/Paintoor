/* OTP engine — the code is never stored or returned in plain text in prod.
   CONFIDENTIALITY: only sha256(code+":"+phone) reaches the database.
   INTEGRITY: 5-minute expiry, max 5 guesses, then burn-on-use. */
import { createHash, randomInt, timingSafeEqual } from "crypto";
import { db } from "@/lib/db";

export const OTP_TTL_MIN = 5;
export const OTP_MAX_ATTEMPTS = 5;

export function hashCode(phone: string, code: string): string {
  return createHash("sha256").update(`${code}:${phone}`).digest("hex");
}

export async function createOtp(phone: string): Promise<{ code: string; expiresAt: Date }> {
  const code = String(randomInt(100000, 1000000)); // uniform 6-digit
  const expiresAt = new Date(Date.now() + OTP_TTL_MIN * 60_000);
  await db.authOtp.create({ data: { phone, codeHash: hashCode(phone, code), expiresAt } });
  return { code, expiresAt };
}

export type OtpCheck =
  | { ok: true }
  | { ok: false; reason: "not_found" | "expired" | "locked" | "wrong"; attemptsLeft?: number };

export async function checkAndBurnOtp(phone: string, code: string): Promise<OtpCheck> {
  const otp = await db.authOtp.findFirst({
    where: { phone, consumedAt: null },
    orderBy: { createdAt: "desc" },
  });
  if (!otp) return { ok: false, reason: "not_found" };
  if (otp.expiresAt.getTime() < Date.now()) return { ok: false, reason: "expired" };
  if (otp.attempts >= OTP_MAX_ATTEMPTS) return { ok: false, reason: "locked" };

  const a = Buffer.from(hashCode(phone, code), "hex");
  const b = Buffer.from(otp.codeHash, "hex");
  const match = a.length === b.length && timingSafeEqual(a, b);

  if (!match) {
    const attempts = otp.attempts + 1;
    await db.authOtp.update({ where: { id: otp.id }, data: { attempts } });
    return { ok: false, reason: "wrong", attemptsLeft: Math.max(0, OTP_MAX_ATTEMPTS - attempts) };
  }
  await db.authOtp.update({ where: { id: otp.id }, data: { consumedAt: new Date() } });
  return { ok: true };
}