/* JWT helpers (HS256 via jose — runs in Node route handlers and edge).
   session token: 7 days, sid = Session.jwtId (server can revoke instantly).
   signup token : 10 minutes, proves "this device just passed the OTP".
   INTEGRITY: the secret lives only in server env, never in the client bundle. */
import { SignJWT, jwtVerify } from "jose";

const ALG = "HS256";
export const SESSION_COOKIE = "pt_session";
const SESSION_TTL_S = 60 * 60 * 24 * 7;
const SIGNUP_TTL_S = 60 * 10;

function secretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET missing/too short (min 32 chars) — see .env.example");
  }
  return new TextEncoder().encode(secret);
}

export type SessionClaims = { sub: string; role: string; sid: string };

export async function signSessionJwt(profileId: string, role: string, jwtId: string): Promise<string> {
  return new SignJWT({ role, sid: jwtId })
    .setProtectedHeader({ alg: ALG })
    .setSubject(profileId)
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + SESSION_TTL_S)
    .sign(secretKey());
}

export async function signSignupToken(phone: string): Promise<string> {
  return new SignJWT({ kind: "signup" })
    .setProtectedHeader({ alg: ALG })
    .setSubject(phone)
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + SIGNUP_TTL_S)
    .sign(secretKey());
}

export async function verifySessionJwt(token: string): Promise<SessionClaims | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (!payload.sub || typeof payload.sid !== "string" || typeof payload.role !== "string") return null;
    return { sub: payload.sub, role: payload.role, sid: payload.sid };
  } catch {
    return null; // expired / tampered / galat secret = logged out
  }
}

export async function verifySignupToken(token: string, phone: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return payload.kind === "signup" && payload.sub === phone;
  } catch {
    return false;
  }
}
export async function signGoogleLink(sub: string, email: string, name: string): Promise<string> {
  return new SignJWT({ kind: "google_link", email, name })
    .setProtectedHeader({ alg: ALG })
    .setSubject(sub)
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + SIGNUP_TTL_S)
    .sign(secretKey());
}

export async function verifyGoogleLink(
  token: string,
): Promise<{ sub: string; email: string; name: string } | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (payload.kind !== "google_link" || !payload.sub || typeof payload.email !== "string") return null;
    return { sub: payload.sub, email: payload.email, name: typeof payload.name === "string" ? payload.name : "" };
  } catch {
    return null;
  }
}