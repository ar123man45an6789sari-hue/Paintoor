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
  // Delivery: real SMS (MSG91) arrives in Phase 5. Until then the code lives
  // only in server logs, plus the response body in non-production builds
  // (or when OTP_ECHO=1 is deliberately set for a pre-launch demo).
  console.info(`[otp] ${phone.slice(0, 2)}xxxxxx${phone.slice(-2)} code=${code}`);
  const echo = process.env.NODE_ENV !== "production" || process.env.OTP_ECHO === "1";
  return NextResponse.json({ ok: true, expiresIn: 300, resendIn: 30, ...(echo ? { devCode: code } : {}) });
}