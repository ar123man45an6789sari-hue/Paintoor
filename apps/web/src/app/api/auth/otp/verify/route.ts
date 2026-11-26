import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { checkAndBurnOtp } from "@/lib/auth/otp";
import { signSignupToken } from "@/lib/auth/jwt";
import { issueSession, setSessionCookie } from "@/lib/auth/session";
import { allow, clientIp } from "@/lib/auth/ratelimit";

export const runtime = "nodejs";

const Body = z.object({ phone: z.string().regex(/^[6-9]\d{9}$/), code: z.string().regex(/^\d{6}$/) });

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, error: "bad_input" }, { status: 400 });
  const { phone, code } = parsed.data;
  const ip = clientIp(req);
  if (!allow(`verifyHr:${phone}`, 10, 3_600_000) || !allow(`verifyIpHr:${ip}`, 30, 3_600_000)) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  const check = await checkAndBurnOtp(phone, code);
  if (!check.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: check.reason,
        ...(check.attemptsLeft != null ? { attemptsLeft: check.attemptsLeft } : {}),
      },
      { status: check.reason === "locked" ? 429 : 401 },
    );
  }

  const profile = await db.profile.findUnique({ where: { phone } });
  if (profile) {
    if (profile.blocked) return NextResponse.json({ ok: false, error: "blocked" }, { status: 403 });
    const { token } = await issueSession({ id: profile.id, role: profile.role }, req);
    const res = NextResponse.json({ ok: true, status: "ok", role: profile.role, fullName: profile.fullName });
    setSessionCookie(res, token);
    return res;
  }
  // First time on Paintoor: OTP is proven, so hand out a 10-minute signup token.
  const signupToken = await signSignupToken(phone);
  return NextResponse.json({ ok: true, status: "new", signupToken });
}