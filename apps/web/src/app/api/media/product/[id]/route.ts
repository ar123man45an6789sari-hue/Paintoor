import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

/* Public photo stream for listed products. Unlisted or admin-removed products
   answer 404 so a pulled product leaves no trace behind. */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const product = await db.product.findUnique({
    where: { id },
    select: { listed: true, removedByAdmin: true },
  });
  if (!product || !product.listed || product.removedByAdmin) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }
  const row = await db.productImage.findUnique({ where: { productId: id } });
  if (!row) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  return new Response(new Uint8Array(row.bytes), {
    headers: { "Content-Type": row.mime, "Cache-Control": "public, max-age=86400" },
  });
}