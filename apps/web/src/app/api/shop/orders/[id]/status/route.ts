import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentSession, withActor } from "@/lib/auth/session";

export const runtime = "nodejs";

const Body = z.object({ status: z.enum(["accepted", "delivered"]) });

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ ok: false, error: "no_session" }, { status: 401 });
  if (session.role !== "shopkeeper") {
    return NextResponse.json({ ok: false, error: "shopkeepers_only" }, { status: 403 });
  }
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, error: "bad_input" }, { status: 400 });
  try {
    const rows = await withActor(session, (tx) =>
      tx.$queryRaw<{ status: string }[]>`
        SELECT public.set_shop_order_status(${id}::uuid, ${parsed.data.status}::text) AS status`,
    );
    return NextResponse.json({ ok: true, status: rows[0]?.status ?? null });
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { ok: false, error: process.env.NODE_ENV === "production" ? "rejected" : detail.slice(0, 300) },
      { status: 409 },
    );
  }
}