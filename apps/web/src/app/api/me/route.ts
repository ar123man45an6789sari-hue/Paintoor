import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ ok: false, error: "no_session" }, { status: 401 });
  return NextResponse.json({
    ok: true,
    id: session.profileId,
    phone: session.phone,
    role: session.role,
    fullName: session.fullName,
  });
}