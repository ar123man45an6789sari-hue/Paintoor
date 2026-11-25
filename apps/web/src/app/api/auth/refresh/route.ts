import { NextResponse } from "next/server";
import { getCurrentSession, issueSession, revokeSession, setSessionCookie } from "@/lib/auth/session";

export const runtime = "nodejs";

/* Rotation: purani Session row revoke, naya jwtId + cookie.
   Churi ki hui purani cookie agle refresh par mar jaati hai. */
export async function POST(req: Request) {
  const current = await getCurrentSession();
  if (!current) return NextResponse.json({ ok: false, error: "no_session" }, { status: 401 });
  await revokeSession(current.jwtId);
  const { token } = await issueSession({ id: current.profileId, role: current.role }, req);
  const res = NextResponse.json({ ok: true });
  setSessionCookie(res, token);
  return res;
}