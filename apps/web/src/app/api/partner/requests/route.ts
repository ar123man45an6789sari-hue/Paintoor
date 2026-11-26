import { NextResponse } from "next/server";
import { getCurrentSession, withActor } from "@/lib/auth/session";
import { db } from "@/lib/db";

export const runtime = "nodejs";

/* Open marketplace for the signed-in partner: RLS shows only open /
   interested requests in the partner's own city. */
export async function GET() {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ ok: false, error: "no_session" }, { status: 401 });
  if (session.role !== "partner") return NextResponse.json({ ok: false, error: "partners_only" }, { status: 403 });
  const requests = await withActor(session, (tx) =>
    tx.serviceRequest.findMany({
      where: { status: { in: ["open", "interested"] } },
      include: { leads: { select: { partnerId: true, status: true } } },
      orderBy: { createdAt: "desc" },
    }),
  );
  const customerIds = [...new Set(requests.map((r) => r.customerId))];
  const names = customerIds.length
    ? await db.profile.findMany({ where: { id: { in: customerIds } }, select: { id: true, fullName: true } })
    : [];
  const nameOf = new Map(names.map((n) => [n.id, n.fullName]));
  return NextResponse.json({
    ok: true,
    requests: requests.map((r) => ({ ...r, customerName: nameOf.get(r.customerId) ?? "Customer" })),
  });
}