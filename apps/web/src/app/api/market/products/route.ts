import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

/* Public catalog. The query runs as the low-privilege `anon` role so the
   published RLS policies decide what is visible — unlisted, admin-removed and
   blocked-shop products can never leak through a bug in this file. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const city = url.searchParams.get("city")?.trim().toLowerCase() ?? null;
  const q = url.searchParams.get("q")?.trim().toLowerCase() ?? null;
  const category = url.searchParams.get("category")?.trim().toLowerCase() ?? null;

  const products = await db.$transaction(async (tx) => {
    await tx.$executeRawUnsafe("SET LOCAL ROLE anon");
    return tx.product.findMany({
      where: {
        ...(city ? { shop: { city, blocked: false } } : {}),
        ...(category ? { category } : {}),
        ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { brand: { contains: q, mode: "insensitive" } }] } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 60,
      select: {
        id: true, brand: true, name: true, category: true, finish: true,
        sizeL: true, pricePaise: true, mrpPaise: true, stock: true, imageUrl: true,
        shop: { select: { id: true, name: true, city: true, zone: true, ratingAvg: true } },
      },
    });
  });
    const imgIds = products.length
    ? await db.productImage.findMany({
        where: { productId: { in: products.map((p) => p.id) } },
        select: { productId: true },
      })
    : [];
  const hasImg = new Set(imgIds.map((r) => r.productId));
  return NextResponse.json({
    ok: true,
    products: products.map((p) => ({ ...p, hasImage: hasImg.has(p.id) })),
  });
}