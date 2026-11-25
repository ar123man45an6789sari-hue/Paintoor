import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

export const runtime = "nodejs";

/* Step 1 of OAuth: send the browser to Google with a CSRF state cookie. */
export async function GET(req: Request) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) return NextResponse.json({ ok: false, error: "google_not_configured" }, { status: 503 });

  const state = randomBytes(16).toString("hex");
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", `${new URL(req.url).origin}/api/auth/google/callback`);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", state);
  url.searchParams.set("prompt", "select_account");

  const res = NextResponse.redirect(url);
  res.cookies.set("pt_google_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });
  return res;
}