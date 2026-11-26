import { NextResponse } from "next/server";
import { getCurrentSession, withActor } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ ok: false, error: "no_session" }, { status: 401 });
  if (session.role !== "partner") return NextResponse.json({ ok: false, error: "partners_only" }, { status: 403 });
  try {
    await withActor(session, (tx) =>
      tx.$queryRaw`SELECT public.express_interest(${id}::uuid, ${session.profileId}::uuid)`,
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { ok: false, error: process.env.NODE_ENV === "production" ? "rejected" : detail.slice(0, 300) },
      { status: 409 },
    );
  }
}