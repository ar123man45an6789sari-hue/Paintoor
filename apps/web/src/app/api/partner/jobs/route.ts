import { NextResponse } from "next/server";
import { getCurrentSession, withActor } from "@/lib/auth/session";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ ok: false, error: "no_session" }, { status: 401 });
  if (session.role !== "partner") return NextResponse.json({ ok: false, error: "partners_only" }, { status: 403 });
  const jobs = await withActor(session, (tx) =>
    tx.job.findMany({
      where: { partnerId: session.profileId },
      include: { milestones: { orderBy: { seq: "asc" } } },
      orderBy: { startedAt: "desc" },
    }),
  );
  const customerIds = [...new Set(jobs.map((j) => j.customerId))];
  const names = customerIds.length
    ? await db.profile.findMany({ where: { id: { in: customerIds } }, select: { id: true, fullName: true } })
    : [];
  const nameOf = new Map(names.map((n) => [n.id, n.fullName]));
  return NextResponse.json({
    ok: true,
    jobs: jobs.map((j) => ({ ...j, customerName: nameOf.get(j.customerId) ?? "Customer" })),
  });
}