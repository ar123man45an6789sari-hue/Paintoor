/* AuthModal v3 — entry (login | signup) → role → form → otp → done. Replace whole file. */
"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { RoleSelect } from "./RoleSelect";
import { SignupForm } from "./SignupForm";
import type { AuthMode, AuthStep, Role } from "./types";

const DONE_COPY: Record<Role, string> = {
  customer: "Post your first job — verified workers respond in minutes.",
  provider: "Complete KYC next to start receiving leads in Vadodara.",
  shopkeeper: "Add your first 10 products to open your digital counter.",
};

const STEP_LABEL: Record<AuthStep, string> = {
  entry: "Welcome",
  role: "Welcome",
  form: "Almost there",
  otp: "Verify mobile",
  done: "All set",
};

type Props = { open: boolean; initialMode: AuthMode; onClose: () => void };

export function AuthModal({ open, initialMode, onClose }: Props) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [step, setStep] = useState<AuthStep>("entry");
  const [role, setRole] = useState<Role | null>(null);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  /* Fresh open = fresh flow; old state must never leak between sessions. */
  useEffect(() => {
    if (open) {
      setMode(initialMode);
      setStep("entry");
      setRole(null);
      setPhone("");
      setOtp("");
    }
  }, [open, initialMode]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!open) return null;

  function verifyOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (otp.length === 6) setStep("done");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Sign in or create account"
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-sheet bg-white p-6 shadow-card"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-saffron">
            {STEP_LABEL[step]}
          </span>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-control px-2 py-1 text-muted hover:bg-chuna hover:text-navy">
            ✕
          </button>
        </div>

        {step === "entry" && (
          <div className="space-y-3">
            <h2 className="text-2xl font-black text-navy">Welcome to GharSahayak</h2>
            <p className="text-sm text-muted">New here? Create an account. Already with us? Log in.</p>
            <button
              type="button"
              autoFocus
              onClick={() => { setMode("signup"); setStep("role"); }}
              className="w-full rounded-card bg-saffron p-4 text-left text-white transition-transform hover:-translate-y-0.5 hover:shadow-lift"
            >
              <span className="block font-extrabold">Create account</span>
              <span className="block text-sm text-orange-100">New to GharSahayak — choose your role</span>
            </button>
            <button
              type="button"
              onClick={() => { setMode("login"); setStep("form"); }}
              className="w-full rounded-card border-2 border-navy p-4 text-left text-navy transition-colors hover:bg-navy hover:text-white"
            >
              <span className="block font-extrabold">Log in</span>
              <span className="block text-sm opacity-80">Existing account — verify with OTP</span>
            </button>
          </div>
        )}

        {step === "role" && mode === "signup" && (
          <>
            <h2 className="mb-1 text-2xl font-black text-navy">Which best describes you?</h2>
            <p className="mb-4 text-sm text-muted">Pick your side — the form adapts to you.</p>
            <RoleSelect onPick={(picked) => { setRole(picked); setStep("form"); }} />
            <button type="button" onClick={() => setStep("entry")} className="mt-4 text-sm font-bold text-muted hover:text-navy">
              ← Back
            </button>
          </>
        )}

        {step === "form" && mode === "signup" && role && (
          <SignupForm role={role} onBack={() => setStep("role")} onSubmit={() => setStep("otp")} />
        )}

        {step === "form" && mode === "login" && (
          <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); setStep("otp"); }}>
            <h3 className="text-lg font-extrabold text-navy">Log in to your account</h3>
            <p className="text-sm text-muted">We will verify your mobile with a 6-digit code.</p>
            <label className="block">
              <span className="mb-1 block text-sm font-bold text-ink">Mobile number</span>
              <input
                type="tel"
                required
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+91 98765 43210"
                className="w-full rounded-control border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-saffron"
              />
            </label>
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep("entry")} className="rounded-control border-2 border-line px-4 py-2.5 text-sm font-extrabold text-muted hover:border-navy hover:text-navy">
                Back
              </button>
              <button type="submit" className="flex-1 rounded-control bg-saffron px-4 py-2.5 text-sm font-extrabold text-white hover:shadow-lift">
                Send code
              </button>
            </div>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={verifyOtp} className="space-y-4">
            <h3 className="text-lg font-extrabold text-navy">Enter the 6-digit code</h3>
            <p className="text-sm text-muted">
              Sent to your mobile. <span className="rounded bg-haldi/20 px-1.5 py-0.5 font-bold text-ink">Demo mode: any 6 digits work.</span>
            </p>
            <input
              value={otp}
              onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric"
              autoFocus
              aria-label="One-time code"
              className="w-full rounded-control border border-line bg-white px-3 py-3 text-center text-2xl font-black tracking-[0.5em] outline-none focus:border-saffron"
            />
            <button type="submit" disabled={otp.length !== 6} className="w-full rounded-control bg-saffron px-4 py-3 font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-40">
              Verify & continue
            </button>
          </form>
        )}

        {step === "done" && (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-pill bg-neem/15 text-3xl">✅</div>
            <h3 className="text-xl font-black text-navy">
              {mode === "login" ? "Welcome back!" : "Welcome to GharSahayak!"}
            </h3>
            <p className="text-sm text-muted">
              {mode === "login" ? "Your dashboard opens in Lesson 7." : role ? DONE_COPY[role] : ""}
            </p>
            <button type="button" onClick={onClose} className="w-full rounded-control bg-navy px-4 py-3 font-extrabold text-white">
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}