import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentSession, withActor } from "@/lib/auth/session";

export const runtime = "nodejs";

const Body = z.object({ day: z.number().int().min(1).max(60), pct: z.number().int().min(0).max(100) });

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ ok: false, error: "no_session" }, { status: 401 });
  if (session.role !== "partner") return NextResponse.json({ ok: false, error: "partners_only" }, { status: 403 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, error: "bad_input" }, { status: 400 });
  try {
    await withActor(session, (tx) =>
      tx.$queryRaw`SELECT public.advance_job(${id}::uuid, ${session.profileId}::uuid, ${parsed.data.day}::integer, ${parsed.data.pct}::integer)`,
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