/* AuthModal v4 — fully localised; entry → role → form → otp → done. */
"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { RoleSelect } from "./RoleSelect";
import { SignupForm } from "./SignupForm";
import type { AuthMode, AuthStep, Role } from "./types";
import { useI18n } from "@/i18n";

const STEP_KEY: Record<AuthStep, string> = {
  entry: "st.entry",
  role: "st.entry",
  form: "st.form",
  otp: "st.otp",
  done: "st.done",
};

type Props = { open: boolean; initialMode: AuthMode; onClose: () => void };

export function AuthModal({ open, initialMode, onClose }: Props) {
  const { t } = useI18n();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [step, setStep] = useState<AuthStep>("entry");
  const [role, setRole] = useState<Role | null>(null);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

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

  const doneCopy =
    mode === "login" ? t("auth.doneDash") : role === "customer" ? t("done.c") : role === "provider" ? t("done.p") : t("done.s");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("auth.hello")}
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-sheet bg-white p-6 shadow-card"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-saffron">{t(STEP_KEY[step])}</span>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-control px-2 py-1 text-muted hover:bg-chuna hover:text-navy">
            ✕
          </button>
        </div>

        {step === "entry" && (
          <div className="space-y-3">
            <h2 className="text-2xl font-black text-navy">{t("auth.hello")}</h2>
            <p className="text-sm text-muted">{t("auth.newq")}</p>
            <button
              type="button"
              autoFocus
              onClick={() => { setMode("signup"); setStep("role"); }}
              className="w-full rounded-card bg-saffron p-4 text-left text-white transition-transform hover:-translate-y-0.5 hover:shadow-lift"
            >
              <span className="block font-extrabold">{t("auth.create")}</span>
              <span className="block text-sm text-orange-100">{t("auth.createSub")}</span>
            </button>
            <button
              type="button"
              onClick={() => { setMode("login"); setStep("form"); }}
              className="w-full rounded-card border-2 border-navy p-4 text-left text-navy transition-colors hover:bg-navy hover:text-white"
            >
              <span className="block font-extrabold">{t("auth.login")}</span>
              <span className="block text-sm opacity-80">{t("auth.loginSub")}</span>
            </button>
          </div>
        )}

        {step === "role" && mode === "signup" && (
          <>
            <h2 className="mb-1 text-2xl font-black text-navy">{t("auth.roleQ")}</h2>
            <p className="mb-4 text-sm text-muted">{t("auth.roleSub")}</p>
            <RoleSelect
              onPick={(picked) => { setRole(picked); setStep("form"); }}
            />
            <button type="button" onClick={() => setStep("entry")} className="mt-4 text-sm font-bold text-muted hover:text-navy">
              {t("auth.back")}
            </button>
          </>
        )}

        {step === "form" && mode === "signup" && role && (
          <SignupForm role={role} onBack={() => setStep("role")} onSubmit={() => setStep("otp")} />
        )}

        {step === "form" && mode === "login" && (
          <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); setStep("otp"); }}>
            <h3 className="text-lg font-extrabold text-navy">{t("auth.loginTitle")}</h3>
            <p className="text-sm text-muted">{t("auth.loginSub2")}</p>
            <button
              type="button"
              onClick={() => setStep("done")}
              className="flex w-full items-center justify-center gap-2 rounded-control border-2 border-line bg-white px-4 py-2.5 text-sm font-extrabold text-ink transition-colors hover:border-navy"
            >
              <span aria-hidden="true" className="text-base font-black text-[#4285F4]">G</span>
              {t("auth.google")}
            </button>
            <div className="flex items-center gap-3 text-[11px] font-bold text-muted">
              <span className="h-px flex-1 bg-line" /> {t("auth.or")} <span className="h-px flex-1 bg-line" />
            </div>
            <label className="block">
              <span className="mb-1 block text-sm font-bold text-ink">{t("auth.identifier")}</span>
              <input
                type="text"
                required
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder={t("auth.idPh")}
                className="w-full rounded-control border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-saffron"
              />
            </label>
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep("entry")} className="rounded-control border-2 border-line px-4 py-2.5 text-sm font-extrabold text-muted hover:border-navy hover:text-navy">
                {t("auth.back")}
              </button>
              <button type="submit" className="flex-1 rounded-control bg-saffron px-4 py-2.5 text-sm font-extrabold text-white hover:shadow-lift">
                {t("auth.send")}
              </button>
            </div>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={verifyOtp} className="space-y-4">
            <h3 className="text-lg font-extrabold text-navy">{t("auth.otpTitle")}</h3>
            <p className="text-sm text-muted">
              {t("auth.otpSub")} <span className="rounded bg-haldi/20 px-1.5 py-0.5 font-bold text-ink">{t("auth.demo")}</span>
            </p>
            <input
              value={otp}
              onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric"
              autoFocus
              aria-label={t("auth.otpTitle")}
              className="w-full rounded-control border border-line bg-white px-3 py-3 text-center text-2xl font-black tracking-[0.5em] outline-none focus:border-saffron"
            />
            <button type="submit" disabled={otp.length !== 6} className="w-full rounded-control bg-saffron px-4 py-3 font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-40">
              {t("auth.verify")}
            </button>
          </form>
        )}

        {step === "done" && (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-pill bg-neem/15 text-3xl">✅</div>
            <h3 className="text-xl font-black text-navy">{mode === "login" ? t("auth.doneLogin") : t("auth.doneTitle")}</h3>
            <p className="text-sm text-muted">{doneCopy}</p>
            <button type="button" onClick={onClose} className="w-full rounded-control bg-navy px-4 py-3 font-extrabold text-white">
              {t("auth.close")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}