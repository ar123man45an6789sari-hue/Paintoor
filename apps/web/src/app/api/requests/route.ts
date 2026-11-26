import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentSession, withActor } from "@/lib/auth/session";
import { db } from "@/lib/db";

export const runtime = "nodejs";

const Body = z.object({
  city: z.string().trim().min(2).max(60),
  zone: z.string().trim().min(2).max(60),
  category: z.string().trim().min(2).max(60),
  description: z.string().trim().min(10).max(2000),
  budgetPaise: z.number().int().min(0).max(1_000_000_000),
  materialNeeded: z.boolean().default(false),
  preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  slot: z.string().trim().max(40).optional(),
});

export async function GET() {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ ok: false, error: "no_session" }, { status: 401 });
  const requests = await withActor(session, (tx) =>
    tx.serviceRequest.findMany({
      where: { customerId: session.profileId },
      include: { leads: { select: { partnerId: true, status: true, at: true } }, job: true },
      orderBy: { createdAt: "desc" },
    }),
  );
  // Partner display names fetched as engine (RLS hides other profiles' rows
  // from the actor; names are public fields, ids already RLS-filtered).
  const partnerIds = [...new Set(requests.flatMap((r) => r.leads.map((l) => l.partnerId)))];
  const names = partnerIds.length
    ? await db.profile.findMany({
        where: { id: { in: partnerIds } },
        select: { id: true, fullName: true, kycStatus: true },
      })
    : [];
  const nameOf = new Map(names.map((n) => [n.id, n.fullName]));
  return NextResponse.json({
    ok: true,
    requests: requests.map((r) => ({
      ...r,
      leads: r.leads.map((l) => ({ ...l, partnerName: nameOf.get(l.partnerId) ?? "Partner" })),
    })),
  });
}

export async function POST(req: Request) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ ok: false, error: "no_session" }, { status: 401 });
  if (session.role !== "customer") {
    return NextResponse.json({ ok: false, error: "customers_only" }, { status: 403 });
  }
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, error: "bad_input" }, { status: 400 });
  const b = parsed.data;
  try {
    const ids = await withActor(session, (tx) =>
      tx.$queryRaw<{ id: string }[]>`
       SELECT public.create_request(
          ${session.profileId}::uuid, ${b.city}, ${b.zone}, ${b.category}, ${b.description},
          ${b.budgetPaise}::integer, ${b.materialNeeded}, ${b.preferredDate ?? null}::date, ${b.slot ?? null}::text
        ) AS id`,
    );
    return NextResponse.json({ ok: true, id: ids[0]?.id ?? null }, { status: 201 });
    } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { ok: false, error: process.env.NODE_ENV === "production" ? "rejected" : detail.slice(0, 300) },
      { status: 403 },
    );
  }
}