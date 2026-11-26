import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentSession, withActor } from "@/lib/auth/session";
import { db } from "@/lib/db";

export const runtime = "nodejs";

const Body = z.object({
  name: z.string().trim().min(2).max(80),
  address: z.string().trim().max(200).optional(),
  city: z.string().trim().min(2).max(60),
  zone: z.string().trim().max(60).optional(),
  gstin: z.string().trim().regex(/^[0-9A-Z]{15}$/).optional(),
});

export async function GET() {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ ok: false, error: "no_session" }, { status: 401 });
  if (session.role !== "shopkeeper") {
    return NextResponse.json({ ok: false, error: "shopkeepers_only" }, { status: 403 });
  }
  const shop = await withActor(session, (tx) =>
    tx.shop.findFirst({
      where: { ownerId: session.profileId },
      include: {
        products: { orderBy: { createdAt: "desc" } },
        orders: {
          orderBy: { createdAt: "desc" },
          take: 50,
          include: { items: { include: { product: { select: { id: true, name: true, brand: true } } } } },
        },
      },
    }),
  );
  if (!shop) return NextResponse.json({ ok: true, shop: null });
  const names = await db.profile.findMany({
    where: { id: { in: shop.orders.map((o) => o.buyerId) } },
    select: { id: true, fullName: true },
  });
  const nameOf = new Map(names.map((n) => [n.id, n.fullName]));
  const imgIds = shop.products.length
    ? await db.productImage.findMany({
        where: { productId: { in: shop.products.map((p) => p.id) } },
        select: { productId: true },
      })
    : [];
  const hasImg = new Set(imgIds.map((r) => r.productId));
  return NextResponse.json({
    ok: true,
    shop: {
      ...shop,
      products: shop.products.map((p) => ({ ...p, hasImage: hasImg.has(p.id) })),
      orders: shop.orders.map((o) => ({ ...o, buyerName: nameOf.get(o.buyerId) ?? "Buyer" })),
    },
  });
}

export async function POST(req: Request) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ ok: false, error: "no_session" }, { status: 401 });
  if (session.role !== "shopkeeper") {
    return NextResponse.json({ ok: false, error: "shopkeepers_only" }, { status: 403 });
  }
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, error: "bad_input" }, { status: 400 });
  const b = parsed.data;
  try {
    const rows = await withActor(session, (tx) =>
      tx.$queryRaw<{ id: string }[]>`
        SELECT public.upsert_shop(
          ${b.name}::text, ${b.address ?? null}::text, ${b.city}::text,
          ${b.zone ?? null}::text, ${b.gstin ?? null}::text
        ) AS id`,
    );
    return NextResponse.json({ ok: true, shopId: rows[0]?.id ?? null });
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { ok: false, error: process.env.NODE_ENV === "production" ? "rejected" : detail.slice(0, 300) },
      { status: 403 },
    );
  }
}