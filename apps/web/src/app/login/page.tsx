/* Login / sign-up — phone OTP first, Google as a fast identity path.
   New users pick their role; admins are provisioned by the team only. */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { setSession } from "@/lib/session";

type Step = "phone" | "otp" | "name";

const ROLES = [
  { id: "customer", title: "Customer", desc: "Book painting services and shop paints" },
  { id: "partner", title: "Partner (Painter)", desc: "Offer services and take on jobs" },
  { id: "shopkeeper", title: "Shopkeeper", desc: "Sell paints and materials" },
] as const;

type RoleId = (typeof ROLES)[number]["id"];

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<RoleId>("customer");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [signupToken, setSignupToken] = useState("");
  const [googleLink, setGoogleLink] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [cool, setCool] = useState(0);

  useEffect(() => {
    if (cool <= 0) return;
    const t = setTimeout(() => setCool((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cool]);

  useEffect(() => {
    const g = new URLSearchParams(window.location.search).get("google");
    if (g === "link") {
      setGoogleLink(true);
      setError("Google account verified. Confirm your mobile number to finish signing up.");
    } else if (g === "ready") {
      void adoptSession();
    } else if (g === "error") {
      setError("Google sign-in could not be completed. Please try again.");
    } else if (g === "blocked") {
      setError("This account is blocked. Contact support.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function adoptSession() {
    const r = await fetch("/api/me");
    const j = (await r.json().catch(() => null)) as { ok?: boolean; role?: string; fullName?: string } | null;
    if (r.ok && j?.ok && j.role && j.fullName) land(j.role, j.fullName);
  }

  async function sendOtp() {
    setError(null);
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }
    setBusy(true);
    try {
      const r = await fetch("/api/auth/otp/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const j = await r.json();
      if (!r.ok || !j.ok) {
        setError(j.error === "rate_limited" ? "Too many requests. Please wait a few minutes." : "Could not send the code. Please try again.");
      } else {
        setDevCode(typeof j.devCode === "string" ? j.devCode : null);
        setCool(30);
        setStep("otp");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  function land(userRole: string, name: string) {
    // DB role -> header chip role (the UI calls partners "providers";
    // admins have no chip — their workspace keeps its own passcode gate).
    if (userRole === "admin") {
      router.push("/admin");
      return;
    }
    const chipRole = userRole === "partner" ? "provider" : userRole === "shopkeeper" ? "shopkeeper" : "customer";
    setSession({ role: chipRole, name, mode: "login", at: Date.now() });
    router.push("/dashboard");
  }

  async function verify() {
    setError(null);
    if (!/^\d{6}$/.test(code)) {
      setError("Enter the 6-digit code.");
      return;
    }
    setBusy(true);
    try {
      const r = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code }),
      });
      const j = await r.json();
      if (!r.ok || !j.ok) {
        setError(
          j.error === "wrong"
            ? `Incorrect code.${typeof j.attemptsLeft === "number" ? ` ${j.attemptsLeft} attempts left.` : ""}`
            : j.error === "locked"
              ? "Too many wrong attempts for this code. Request a new one."
              : j.error === "expired"
                ? "This code has expired. Request a new one."
                : j.error === "blocked"
                  ? "This account is blocked. Contact support."
                  : "Verification failed. Please try again.",
        );
        return;
      }
      if (j.status === "new") {
        setSignupToken(j.signupToken);
        setStep("name");
      } else {
        land(j.role, j.fullName);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function register() {
    setError(null);
    if (fullName.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }
    setBusy(true);
    try {
      const r = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, fullName: fullName.trim(), signupToken, role }),
      });
      const j = await r.json();
      if (!r.ok || !j.ok) {
        setError("Could not create the account. Please request a new code.");
        setStep("phone");
        return;
      }
      land(j.role, j.fullName);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const inputCls =
    "min-h-12 w-full rounded-control border-2 border-line bg-white px-4 text-base font-bold text-navy outline-none transition-colors focus:border-saffron dark:bg-transparent dark:text-snow";
  const ctaCls =
    "min-h-12 w-full rounded-control bg-saffron text-base font-extrabold text-snow shadow-card transition-shadow hover:shadow-lift disabled:opacity-50";
  const googleCls =
    "flex min-h-12 w-full items-center justify-center gap-3 rounded-control border-2 border-line bg-white text-base font-extrabold text-navy transition-colors hover:border-saffron dark:bg-transparent dark:text-snow";

  return (
    <main className="flex min-h-dvh items-center justify-center bg-chuna px-4 py-10">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-6 block text-center text-xs font-extrabold text-muted hover:text-navy">
          ← Paintoor home
        </Link>
        <div className="rounded-card border border-line bg-white p-6 shadow-card dark:bg-navy">
          <h1 className="text-xl font-extrabold text-navy dark:text-snow">Login or sign up</h1>
          <p className="mt-1 text-xs font-semibold text-muted">
            {googleLink
              ? "Finish your Google sign-up with a mobile number."
              : "One-time code on your mobile — no password needed."}
          </p>

          {step === "phone" && (
            <div className="mt-5 space-y-3">
              <button type="button" className={googleCls} onClick={() => { window.location.href = "/api/auth/google"; }}>
                <svg className="h-5 w-5" viewBox="0 0 48 48" aria-hidden="true">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                Continue with Google
              </button>
              <div className="flex items-center gap-3 text-[11px] font-extrabold text-muted">
                <span className="h-px flex-1 bg-line" /> or with mobile number <span className="h-px flex-1 bg-line" />
              </div>
              <input
                className={inputCls}
                inputMode="numeric"
                maxLength={10}
                placeholder="Mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              />
              <button type="button" className={ctaCls} disabled={busy} onClick={() => void sendOtp()}>
                {busy ? "Sending…" : "Send code"}
              </button>
            </div>
          )}

          {step === "otp" && (
            <div className="mt-5 space-y-3">
              {devCode && (
                <div className="rounded-control border border-saffron bg-chuna px-3 py-2 text-center text-xs font-extrabold text-navy">
                  Dev code: <span className="tabular-nums tracking-widest">{devCode}</span>
                  <span className="ml-1 font-semibold text-muted">(real SMS arrives in a later release)</span>
                </div>
              )}
              <input
                className={`${inputCls} text-center tracking-[0.4em] tabular-nums`}
                inputMode="numeric"
                maxLength={6}
                placeholder="------"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              />
              <button type="button" className={ctaCls} disabled={busy} onClick={() => void verify()}>
                {busy ? "Verifying…" : "Verify and continue"}
              </button>
              <button
                type="button"
                className="w-full text-center text-xs font-extrabold text-muted hover:text-navy disabled:opacity-40"
                disabled={cool > 0 || busy}
                onClick={() => void sendOtp()}
              >
                {cool > 0 ? `Resend code in ${cool}s` : "Send a new code"}
              </button>
            </div>
          )}

          {step === "name" && (
            <div className="mt-5 space-y-3">
              <p className="text-xs font-bold text-muted">New here? Set up your account.</p>
              <input
                className={inputCls}
                maxLength={60}
                placeholder="Full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
              <div className="space-y-2">
                {ROLES.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className={`w-full rounded-control border-2 px-4 py-3 text-left transition-colors ${
                      role === r.id ? "border-saffron bg-chuna" : "border-line hover:border-saffron"
                    }`}
                  >
                    <span className="block text-sm font-extrabold text-navy dark:text-snow">{r.title}</span>
                    <span className="block text-[11px] font-semibold text-muted">{r.desc}</span>
                  </button>
                ))}
              </div>
              <button type="button" className={ctaCls} disabled={busy} onClick={() => void register()}>
                {busy ? "Creating…" : "Create account"}
              </button>
              <p className="text-center text-[10px] font-semibold text-muted">
                Admin accounts are provisioned by the team and cannot self-sign-up.
              </p>
            </div>
          )}

          {error && (
            <p className="mt-3 rounded-control border border-danger bg-chuna px-3 py-2 text-xs font-extrabold text-danger">
              {error}
            </p>
          )}
        </div>
        <p className="mt-4 text-center text-[11px] font-semibold text-muted">
          Partners, shopkeepers and admins can sign in with their registered numbers.
        </p>
      </div>
    </main>
  );
}