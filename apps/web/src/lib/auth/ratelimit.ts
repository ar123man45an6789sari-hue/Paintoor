/* Sliding-window rate limiter (in-memory, per server instance).
   AVAILABILITY: OTP bombing and brute force never reach the database.
   Limits: 1 start/30s + 5 starts/hr per phone, 10 starts/hr per IP,
           10 verifies/hr per phone, 30 verifies/hr per IP.
   NOTE: on Vercel serverless each instance keeps its own window — fine
   pre-launch; Phase 5 can move this to a shared store if needed. */
const hits = new Map<string, number[]>();

export function allow(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const list = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (list.length >= limit) {
    hits.set(key, list);
    return false;
  }
  list.push(now);
  hits.set(key, list);
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (v.length === 0 || now - v[v.length - 1] > windowMs) hits.delete(k);
  }
  return true;
}

export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  return (xff?.split(",")[0] ?? "local").trim();
}

export function otpStartLimits(phone: string, ip: string): boolean {
  // Development machines run every role test from one IP, so the hourly IP cap
  // is relaxed there only. Production keeps the tight cap.
  const ipCap = process.env.NODE_ENV === "production" ? 10 : 60;
  return (
    allow(`otp30s:${phone}`, 1, 30_000) &&
    allow(`otpHr:${phone}`, 5, 3_600_000) &&
    allow(`otpIpHr:${ip}`, ipCap, 3_600_000)
  );
}