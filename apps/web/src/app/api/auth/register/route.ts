import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { db } from "@/lib/db";
import { verifySignupToken, verifyGoogleLink } from "@/lib/auth/jwt";
import { issueSession, setSessionCookie } from "@/lib/auth/session";

export const runtime = "nodejs";

const Body = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/),
  fullName: z.string().trim().min(2).max(60),
  signupToken: z.string().min(20),
  role: z.enum(["customer", "partner", "shopkeeper"]).default("customer"),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, error: "bad_input" }, { status: 400 });
  const { phone, fullName, signupToken, role } = parsed.data;
  if (!(await verifySignupToken(signupToken, phone))) {
    return NextResponse.json({ ok: false, error: "bad_token" }, { status: 401 });
  }

  // Optional Google link (cookie set by the OAuth callback, 10-min lifetime).
  const store = await cookies();
  const linkToken = store.get("pt_google_link")?.value;
  const link = linkToken ? await verifyGoogleLink(linkToken) : null;

  let profile = await db.profile.findUnique({ where: { phone } });
  if (profile) {
    if (profile.blocked) return NextResponse.json({ ok: false, error: "blocked" }, { status: 403 });
    if (link && (!profile.googleSub || !profile.email)) {
      profile = await db.profile.update({
        where: { id: profile.id },
        data: { googleSub: profile.googleSub ?? link.sub, email: profile.email ?? link.email },
      });
    }
  } else {
    try {
      profile = await db.profile.create({
        data: {
          phone,
          fullName,
          role,
          email: link?.email ?? null,
          googleSub: link?.sub ?? null,
        },
      });
    } catch {
      // Email/sub already attached to another profile — create without them.
      profile = await db.profile.create({ data: { phone, fullName, role } });
    }
  }

  const { token } = await issueSession({ id: profile.id, role: profile.role }, req);
  const res = NextResponse.json({ ok: true, id: profile.id, role: profile.role, fullName: profile.fullName });
  setSessionCookie(res, token);
  res.cookies.set("pt_google_link", "", { path: "/", maxAge: 0 });
  return res;
}