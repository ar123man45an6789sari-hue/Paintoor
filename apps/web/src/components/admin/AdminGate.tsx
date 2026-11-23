/* AdminGate — the hidden lock screen at /admin. A passcode opens the
   control room; normal login/signup never offers an admin role. In the
   demo phase the code is checked on-device (adminState.passcode) and the
   card says so honestly — real server-side admin auth lands with Phase 2. */
"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useI18n } from "@/i18n";
import { Icon } from "@/components/Icons";
import { DEMO_PASSCODE, getAdmin } from "@/lib/adminState";

const GRAD = "linear-gradient(135deg,#E00048,#A80036)";
const UNLOCKED = "gs_admin_unlocked";

export function AdminGate({ onUnlock }: { onUnlock: () => void }) {
  const { t } = useI18n();
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const [show, setShow] = useState(false);

  /* One unlock per browser tab: reloads keep the room open, a new tab
     asks again. */
  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(UNLOCKED) === "1") onUnlock();
    } catch {
      /* private mode */
    }
  }, [onUnlock]);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (code.trim() === getAdmin().passcode) {
      try {
        window.sessionStorage.setItem(UNLOCKED, "1");
      } catch {
        /* private mode */
      }
      onUnlock();
    } else {
      setError(true);
      setCode("");
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center px-4 py-14">
      <div className="rounded-sheet border border-line bg-white p-6 shadow-card md:p-8">
        <span
          className="flex h-14 w-14 items-center justify-center rounded-pill text-snow shadow-card"
          style={{ background: GRAD }}
          aria-hidden="true"
        >
          <Icon name="shieldCheck" className="h-7 w-7" />
        </span>
        <h1 className="mt-4 text-2xl font-black tracking-[-0.02em] text-navy">{t("ad.gate.h")}</h1>
        <p className="mt-1 text-sm font-bold text-muted">{t("ad.gate.sub")}</p>

        <form onSubmit={submit} className="mt-5 space-y-3">
          <label className="block">
            <span className="mb-1 block text-xs font-black uppercase tracking-[0.14em] text-muted">{t("ad.gate.code")}</span>
            <span className="relative block">
              <input
                type={show ? "text" : "password"}
                value={code}
                onChange={(e) => { setCode(e.target.value); setError(false); }}
                placeholder="••••••••••••"
                autoComplete="current-password"
                aria-label={t("ad.gate.code")}
                aria-invalid={error}
                className={`min-h-12 w-full rounded-control border-2 bg-white px-3 py-3 pr-12 text-sm font-bold tracking-widest text-navy placeholder:tracking-normal placeholder:font-semibold placeholder:text-muted focus:outline-none ${
                  error ? "border-[#C7003C]" : "border-line focus:border-saffron"
                }`}
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                aria-label={show ? t("ad.gate.hide") : t("ad.gate.show")}
                className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-control text-muted hover:text-saffron"
              >
                <Icon name="eye" className="h-4 w-4" />
              </button>
            </span>
          </label>

          {error && (
            <p className="flex items-center gap-2 text-xs font-extrabold text-[#C7003C]" role="alert">
              <Icon name="alert" className="h-3.5 w-3.5 shrink-0" />
              {t("ad.gate.wrong")}
            </p>
          )}

          <button type="submit" className="min-h-12 w-full rounded-control bg-saffron px-4 py-3 text-sm font-extrabold text-snow hover:shadow-lift">
            <Icon name="unlock" className="mr-1.5 inline h-4 w-4 align-[-0.2em]" />
            {t("ad.gate.go")}
          </button>
        </form>

        <p className="mt-4 flex items-start gap-2 rounded-control bg-chuna px-3 py-2.5 text-[11px] font-bold leading-relaxed text-muted">
          <Icon name="info" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-saffron" />
          {t("ad.gate.demo", { code: DEMO_PASSCODE })}
        </p>

        <Link href="/" className="mt-4 flex min-h-11 items-center justify-center gap-1.5 text-xs font-extrabold text-muted hover:text-saffron">
          <Icon name="arrowLeft" className="h-3.5 w-3.5" />
          {t("ad.gate.back")}
        </Link>
      </div>
    </div>
  );
}