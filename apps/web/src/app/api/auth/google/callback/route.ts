import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { issueSession, setSessionCookie } from "@/lib/auth/session";
import { signGoogleLink } from "@/lib/auth/jwt";

export const runtime = "nodejs";

type GoogleToken = { access_token?: string };
type GoogleUser = { sub: string; email?: string; email_verified?: boolean; name?: string };

/* Step 2 of OAuth: exchange the code, verify the account, then either
   sign in (known email/sub) or hand off to phone-OTP signup (new user).
   A marketplace needs a reachable phone number, so Google alone never
   creates an account — it only proves the email identity. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const fail = NextResponse.redirect(new URL("/login?google=error", url.origin));

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieState = req.headers.get("cookie")?.match(/pt_google_state=([^;]+)/)?.[1];
  if (!code || !state || !cookieState || state !== cookieState) return fail;

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return fail;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: `${url.origin}/api/auth/google/callback`,
      grant_type: "authorization_code",
    }),
  });
  if (!tokenRes.ok) return fail;
  const tokens = (await tokenRes.json()) as GoogleToken;
  if (!tokens.access_token) return fail;

  const userRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  if (!userRes.ok) return fail;
  const gu = (await userRes.json()) as GoogleUser;
  if (!gu.email || gu.email_verified === false) return fail;

  const profile = await db.profile.findFirst({
    where: { OR: [{ googleSub: gu.sub }, { email: gu.email }] },
  });

  if (profile) {
    if (profile.blocked) return NextResponse.redirect(new URL("/login?google=blocked", url.origin));
    if (!profile.googleSub) {
      await db.profile.update({ where: { id: profile.id }, data: { googleSub: gu.sub } });
    }
    const { token } = await issueSession({ id: profile.id, role: profile.role }, req);
    const res = NextResponse.redirect(new URL("/login?google=ready", url.origin));
    setSessionCookie(res, token);
    res.cookies.set("pt_google_state", "", { path: "/", maxAge: 0 });
    return res;
  }

  // Brand-new Google account: phone OTP finishes the signup (link cookie).
  const link = await signGoogleLink(gu.sub, gu.email, gu.name ?? "");
  const res = NextResponse.redirect(new URL("/login?google=link", url.origin));
  res.cookies.set("pt_google_link", link, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });
  res.cookies.set("pt_google_state", "", { path: "/", maxAge: 0 });
  return res;
}