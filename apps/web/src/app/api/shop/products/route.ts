import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentSession, withActor } from "@/lib/auth/session";

export const runtime = "nodejs";

const Body = z.object({
  id: z.string().uuid().optional(),
  brand: z.string().trim().max(60).optional(),
  name: z.string().trim().min(2).max(120),
  category: z.string().trim().min(2).max(40),
  finish: z.string().trim().max(40).optional(),
  sizeL: z.number().positive().max(9999),
  pricePaise: z.number().int().min(1).max(100_000_000),
  mrpPaise: z.number().int().min(1).max(100_000_000).optional(),
  stock: z.number().int().min(0).max(1_000_000).default(0),
  listed: z.boolean().default(true),
  imageUrl: z.string().trim().url().max(2000).optional(),
});

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
        SELECT public.save_product(
          ${b.id ?? null}::uuid, ${b.brand ?? null}::text, ${b.name}::text,
          ${b.category}::text, ${b.finish ?? null}::text, ${b.sizeL}::numeric,
          ${b.pricePaise}::integer, ${b.mrpPaise ?? null}::integer,
          ${b.stock}::integer, ${b.listed}::boolean, ${b.imageUrl ?? null}::text
        ) AS id`,
    );
    return NextResponse.json({ ok: true, productId: rows[0]?.id ?? null }, { status: 201 });
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { ok: false, error: process.env.NODE_ENV === "production" ? "rejected" : detail.slice(0, 300) },
      { status: 403 },
    );
  }
}