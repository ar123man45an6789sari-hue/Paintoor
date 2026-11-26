import { NextResponse } from "next/server";
import { getCurrentSession, withActor } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ ok: false, error: "no_session" }, { status: 401 });
  if (session.role !== "shopkeeper") {
    return NextResponse.json({ ok: false, error: "shopkeepers_only" }, { status: 403 });
  }
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "bad_input" }, { status: 400 });
  }
  if (file.size > 3_000_000) {
    return NextResponse.json({ ok: false, error: "IMAGE_TOO_LARGE" }, { status: 400 });
  }
  const buf = Buffer.from(await file.arrayBuffer());
  try {
    await withActor(session, (tx) =>
      tx.$executeRaw`SELECT public.set_product_image(${id}::uuid, ${file.type}::text, ${buf}::bytea)`,
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

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ ok: false, error: "no_session" }, { status: 401 });
  if (session.role !== "shopkeeper") {
    return NextResponse.json({ ok: false, error: "shopkeepers_only" }, { status: 403 });
  }
  try {
    await withActor(session, (tx) =>
      tx.$executeRaw`SELECT public.remove_product_image(${id}::uuid)`,
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