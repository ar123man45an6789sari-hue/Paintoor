/* AuthModal v5 — role FIRST, then switchable [Create account | Log in] tabs,
   role-branded login extras, session write, dashboard redirect. */
"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { RoleSelect } from "./RoleSelect";
import { SignupForm } from "./SignupForm";
import type { AuthMode, AuthStep, Role } from "./types";
import { useI18n } from "@/i18n";
import { setSession } from "@/lib/session";

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
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [step, setStep] = useState<AuthStep>("role");
  const [role, setRole] = useState<Role | null>(null);
  const [name, setName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");

  useEffect(() => {
    if (open) {
      setMode(initialMode);
      setStep("role");
      setRole(null);
      setName("");
      setIdentifier("");
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

  if (!open || !role && step !== "role") return null;

  function finishSignup(data: Record<string, string>) {
    setName(data.full_name ?? data.owner_name ?? data.shop_name ?? "");
    setStep("otp");
  }

  function verifyOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (otp.length !== 6 || !role) return;
    setSession({
      role,
      name: mode === "signup" ? name : identifier,
      mode,
      at: Date.now(),
    });
    setStep("done");
  }

  function goDashboard() {
    onClose();
    router.push("/dashboard");
  }

  const tabClass = (active: boolean) =>
    `flex-1 rounded-control px-3 py-2 text-sm font-extrabold transition-colors ${
      active ? "bg-navy text-white" : "text-muted hover:bg-chuna hover:text-navy"
    }`;

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

        {step === "role" && (
          <>
            <h2 className="mb-1 text-2xl font-black text-navy">{t("auth.roleQ")}</h2>
            <p className="mb-4 text-sm text-muted">{t("auth.roleSub")}</p>
            <RoleSelect
              onPick={(picked) => {
                setRole(picked);
                setStep("form");
              }}
            />
          </>
        )}

        {step === "form" && role && (
          <>
            <div className="mb-4 flex gap-2 rounded-control bg-chuna p-1">
              <button type="button" className={tabClass(mode === "signup")} onClick={() => setMode("signup")}>
                {t("tab.signup")}
              </button>
              <button type="button" className={tabClass(mode === "login")} onClick={() => setMode("login")}>
                {t("tab.login")}
              </button>
            </div>

            {mode === "signup" ? (
              <SignupForm role={role} onBack={() => setStep("role")} onSubmit={finishSignup} />
            ) : (
              <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); setStep("otp"); }}>
                <h3 className="text-lg font-extrabold text-navy">{t("auth.loginTitle")}</h3>
                <button
                  type="button"
                  onClick={() => { setName(identifier || "Google user"); setStep("otp"); }}
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
                    value={identifier}
                    onChange={(event) => setIdentifier(event.target.value)}
                    placeholder={t("auth.idPh")}
                    className="w-full rounded-control border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-saffron"
                  />
                </label>
                {role === "provider" && (
                  <label className="flex items-center gap-2 text-sm text-muted">
                    <input type="checkbox" defaultChecked className="accent-saffron" /> {t("login.online")}
                  </label>
                )}
                {role === "shopkeeper" && (
                  <label className="flex items-center gap-2 text-sm text-muted">
                    <input type="checkbox" defaultChecked className="accent-saffron" /> {t("login.counter")}
                  </label>
                )}
                {role === "customer" && (
                  <label className="flex items-center gap-2 text-sm text-muted">
                    <input type="checkbox" defaultChecked className="accent-saffron" /> {t("login.remember")}
                  </label>
                )}
                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep("role")} className="rounded-control border-2 border-line px-4 py-2.5 text-sm font-extrabold text-muted hover:border-navy hover:text-navy">
                    {t("auth.back")}
                  </button>
                  <button type="submit" className="flex-1 rounded-control bg-saffron px-4 py-2.5 text-sm font-extrabold text-white hover:shadow-lift">
                    {t("auth.send")}
                  </button>
                </div>
              </form>
            )}
          </>
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
            <p className="text-sm text-muted">{t("auth.doneDash")}</p>
            <button type="button" onClick={goDashboard} className="w-full rounded-control bg-navy px-4 py-3 font-extrabold text-white">
              {t("dash.open")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}