import { NextResponse } from "next/server";
import { getCurrentSession, withActor } from "@/lib/auth/session";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ ok: false, error: "no_session" }, { status: 401 });
  const rows = await withActor(session, (tx) =>
    tx.serviceRequest.findMany({
      where: { id, customerId: session.profileId },
      include: {
        leads: { select: { partnerId: true, status: true, at: true } },
        job: { include: { milestones: { orderBy: { seq: "asc" } } } },
      },
    }),
  );
  const request = rows[0];
  if (!request) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  const partnerIds = [...new Set(request.leads.map((l) => l.partnerId))];
  const names = partnerIds.length
    ? await db.profile.findMany({
        where: { id: { in: partnerIds } },
        select: { id: true, fullName: true, kycStatus: true },
      })
    : [];
  const nameOf = new Map(names.map((n) => [n.id, n.fullName]));
  return NextResponse.json({
    ok: true,
    request: {
      ...request,
      leads: request.leads.map((l) => ({ ...l, partnerName: nameOf.get(l.partnerId) ?? "Partner" })),
    },
  });
}