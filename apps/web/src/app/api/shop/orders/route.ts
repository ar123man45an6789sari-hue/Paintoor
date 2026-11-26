import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentSession, withActor } from "@/lib/auth/session";

export const runtime = "nodejs";

const Body = z.object({
  shopId: z.string().uuid(),
  jobId: z.string().uuid().optional(),
  items: z
    .array(z.object({ productId: z.string().uuid(), qty: z.number().int().min(1).max(500) }))
    .min(1)
    .max(40),
});

export async function GET() {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ ok: false, error: "no_session" }, { status: 401 });
  const orders = await withActor(session, (tx) =>
    tx.shopOrder.findMany({
      where: { buyerId: session.profileId },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        items: { include: { product: { select: { id: true, name: true, brand: true, sizeL: true } } } },
        shop: { select: { id: true, name: true, city: true, zone: true } },
      },
    }),
  );
  return NextResponse.json({ ok: true, orders });
}

export async function POST(req: Request) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ ok: false, error: "no_session" }, { status: 401 });
  if (session.role === "admin") {
    return NextResponse.json({ ok: false, error: "buyers_only" }, { status: 403 });
  }
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, error: "bad_input" }, { status: 400 });
  const b = parsed.data;
  try {
    const rows = await withActor(session, (tx) =>
      tx.$queryRaw<{ id: string }[]>`
        SELECT public.place_shop_order(
          ${b.shopId}::uuid, ${b.jobId ?? null}::uuid, ${JSON.stringify(b.items)}::jsonb
        ) AS id`,
    );
    return NextResponse.json({ ok: true, orderId: rows[0]?.id ?? null }, { status: 201 });
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { ok: false, error: process.env.NODE_ENV === "production" ? "rejected" : detail.slice(0, 300) },
      { status: 409 },
    );
  }
}