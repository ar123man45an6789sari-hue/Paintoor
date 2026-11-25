/* Sliding-window rate limiter (in-memory, per server instance).
   AVAILABILITY: OTP bombing / brute-force DB tak pahunchta hi nahi.
   Limits: 1 start/30s + 5 start/hr per phone, 10 start/hr per IP,
           10 verify/hr per phone, 30 verify/hr per IP.
   NOTE: Vercel serverless mein window per-instance hoti hai — pre-launch
   ke liye kaafi; Phase 5 mein zaroorat padi to shared store laga denge. */
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
  return (
    allow(`otp30s:${phone}`, 1, 30_000) &&
    allow(`otpHr:${phone}`, 5, 3_600_000) &&
    allow(`otpIpHr:${ip}`, 10, 3_600_000)
  );
}