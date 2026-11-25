import { NextResponse } from "next/server";
import { clearSessionCookie, getCurrentSession, revokeSession } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function POST() {
  const current = await getCurrentSession();
  if (current) await revokeSession(current.jwtId);
  const res = NextResponse.json({ ok: true });
  clearSessionCookie(res);
  return res;
}