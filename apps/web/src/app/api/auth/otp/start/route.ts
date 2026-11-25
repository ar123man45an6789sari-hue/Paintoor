import { NextResponse } from "next/server";
import { z } from "zod";
import { createOtp } from "@/lib/auth/otp";
import { otpStartLimits, clientIp } from "@/lib/auth/ratelimit";

export const runtime = "nodejs";

const Body = z.object({ phone: z.string().regex(/^[6-9]\d{9}$/, "10-digit Indian mobile expected") });

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, error: "bad_phone" }, { status: 400 });
  const phone = parsed.data.phone;
  if (!otpStartLimits(phone, clientIp(req))) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }
  const { code } = await createOtp(phone);
  // Delivery: asli SMS (MSG91) Phase 5 mein. Tab tak code sirf SERVER LOG mein,
  // plus response mein sirf non-production (ya jaan-boojh kar OTP_ECHO=1 demo deploy).
  console.info(`[otp] ${phone.slice(0, 2)}xxxxxx${phone.slice(-2)} code=${code}`);
  const echo = process.env.NODE_ENV !== "production" || process.env.OTP_ECHO === "1";
  return NextResponse.json({ ok: true, expiresIn: 300, resendIn: 30, ...(echo ? { devCode: code } : {}) });
}