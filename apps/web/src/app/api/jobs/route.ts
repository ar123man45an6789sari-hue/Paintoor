import { NextResponse } from "next/server";
import { getCurrentSession, withActor } from "@/lib/auth/session";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ ok: false, error: "no_session" }, { status: 401 });
  const jobs = await withActor(session, (tx) =>
    tx.job.findMany({
      where: { customerId: session.profileId },
      include: { milestones: { orderBy: { seq: "asc" } } },
      orderBy: { startedAt: "desc" },
    }),
  );
    const partnerIds = [...new Set(jobs.map((j) => j.partnerId))];
  const names = partnerIds.length
    ? await db.profile.findMany({ where: { id: { in: partnerIds } }, select: { id: true, fullName: true } })
    : [];
  const nameOf = new Map(names.map((n) => [n.id, n.fullName]));
  return NextResponse.json({
    ok: true,
    jobs: jobs.map((j) => ({ ...j, partnerName: nameOf.get(j.partnerId) ?? "Partner" })),
  });
}