"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { RoleSelect } from "./RoleSelect";
import { SignupForm } from "./SignupForm";
import type { AuthStep, Role } from "./types";

const DONE_COPY: Record<Role, string> = {
  customer: "Post your first job — verified workers respond in minutes.",
  provider: "Complete KYC next to start receiving leads in Vadodara.",
  shopkeeper: "Add your first 10 products to open your digital counter.",
};

type Props = { open: boolean; onClose: () => void };

export function AuthModal({ open, onClose }: Props) {
  const [step, setStep] = useState<AuthStep>("role");
  const [role, setRole] = useState<Role | null>(null);
  const [otp, setOtp] = useState("");

  /* ESC closes the modal — small kindness, big accessibility win. */
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!open) return null;

  function close() {
    onClose();
    setStep("role");
    setRole(null);
    setOtp("");
  }

  function verifyOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (otp.length === 6) setStep("done");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm" onClick={close}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Sign in or create account"
        className="w-full max-w-md rounded-sheet bg-white p-6 shadow-card"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-saffron">
            {step === "role" ? "Welcome" : step === "otp" ? "Verify mobile" : step === "done" ? "All set" : "Almost there"}
          </span>
          <button type="button" onClick={close} aria-label="Close" className="rounded-control px-2 py-1 text-muted hover:bg-chuna hover:text-navy">
            ✕
          </button>
        </div>

        {step === "role" && (
          <>
            <h2 className="mb-1 text-2xl font-black text-navy">Which best describes you?</h2>
            <p className="mb-4 text-sm text-muted">Pick your side — the form adapts to you.</p>
            <RoleSelect
              onPick={(picked) => {
                setRole(picked);
                setStep("form");
              }}
            />
          </>
        )}

        {step === "form" && role && (
          <SignupForm role={role} onBack={() => setStep("role")} onSubmit={() => setStep("otp")} />
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
              placeholder="______"
              className="w-full rounded-control border border-line bg-white px-3 py-3 text-center text-2xl font-black tracking-[0.5em] outline-none focus:border-saffron"
            />
            <button type="submit" disabled={otp.length !== 6} className="w-full rounded-control bg-saffron px-4 py-3 font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-40">
              Verify & continue
            </button>
          </form>
        )}

        {step === "done" && role && (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-pill bg-neem/15 text-3xl">✅</div>
            <h3 className="text-xl font-black text-navy">Welcome to GharSahayak!</h3>
            <p className="text-sm text-muted">{DONE_COPY[role]}</p>
            <button type="button" onClick={close} className="w-full rounded-control bg-navy px-4 py-3 font-extrabold text-white">
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}