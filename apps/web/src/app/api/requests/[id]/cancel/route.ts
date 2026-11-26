import { NextResponse } from "next/server";
import { getCurrentSession, withActor } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ ok: false, error: "no_session" }, { status: 401 });
  try {
    await withActor(session, (tx) =>
      tx.$queryRaw`SELECT public.cancel_request(${id}::uuid, ${session.profileId}::uuid)`,
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    const status = msg.includes("too late") || msg.includes("job already") ? 409 : 403;
    return NextResponse.json({ ok: false, error: "rejected" }, { status });
  }
}