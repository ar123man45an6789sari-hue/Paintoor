/* Server session: httpOnly cookie -> signed JWT -> Session row (revocable).
   CONFIDENTIALITY: cookie httpOnly + SameSite=Lax (+Secure prod par) —
   client JS padh nahi sakti, doosri site CSRF post nahi kar sakti.
   INTEGRITY: har request par Session row re-check (turant revocation,
   blocked profile bounce) — JWT akela kabhi trusted nahi. */
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { db } from "@/lib/db";
import { SESSION_COOKIE, signSessionJwt, verifySessionJwt } from "./jwt";

export type CurrentSession = {
  profileId: string;
  role: "customer" | "partner" | "shopkeeper" | "admin";
  jwtId: string;
  sessionId: string;
  fullName: string;
  phone: string;
};

const COOKIE_OPTS = () => ({
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
});

export async function issueSession(
  profile: { id: string; role: string },
  req?: Request,
): Promise<{ token: string; jwtId: string }> {
  const jwtId = randomUUID();
  await db.session.create({
    data: {
      profileId: profile.id,
      jwtId,
      userAgent: req?.headers.get("user-agent")?.slice(0, 200) ?? null,
      ip: req ? (req.headers.get("x-forwarded-for")?.split(",")[0] ?? "").trim().slice(0, 45) || null : null,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    },
  });
  const token = await signSessionJwt(profile.id, profile.role, jwtId);
  return { token, jwtId };
}

export function setSessionCookie(res: NextResponse, token: string): void {
  res.cookies.set(SESSION_COOKIE, token, COOKIE_OPTS());
}

export function clearSessionCookie(res: NextResponse): void {
  res.cookies.set(SESSION_COOKIE, "", { ...COOKIE_OPTS(), maxAge: 0 });
}

export async function getCurrentSession(): Promise<CurrentSession | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const claims = await verifySessionJwt(token);
  if (!claims) return null;
  const row = await db.session.findUnique({ where: { jwtId: claims.sid }, include: { profile: true } });
  if (!row || row.revokedAt || row.expiresAt.getTime() < Date.now()) return null;
  if (row.profile.blocked) return null;
  if (row.profile.role !== claims.role) return null; // token ke baad role badla = reject
  return {
    profileId: row.profile.id,
    role: row.profile.role,
    jwtId: row.jwtId,
    sessionId: row.id,
    fullName: row.profile.fullName,
    phone: row.profile.phone,
  };
}

export async function revokeSession(jwtId: string): Promise<void> {
  await db.session.updateMany({ where: { jwtId, revokedAt: null }, data: { revokedAt: new Date() } });
}