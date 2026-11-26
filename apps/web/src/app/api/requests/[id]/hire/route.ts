import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentSession, withActor } from "@/lib/auth/session";

export const runtime = "nodejs";

const Body = z.object({ partnerId: z.string().uuid() });

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ ok: false, error: "no_session" }, { status: 401 });
  if (session.role !== "customer") return NextResponse.json({ ok: false, error: "customers_only" }, { status: 403 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, error: "bad_input" }, { status: 400 });
  try {
    const ids = await withActor(session, (tx) =>
      tx.$queryRaw<{ id: string }[]>`
        SELECT public.hire_partner(${id}::uuid, ${session.profileId}::uuid, ${parsed.data.partnerId}::uuid) AS id`,
    );
    return NextResponse.json({ ok: true, jobId: ids[0]?.id ?? null }, { status: 201 });
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { ok: false, error: process.env.NODE_ENV === "production" ? "rejected" : detail.slice(0, 300) },
      { status: 409 },
    );
  }
}