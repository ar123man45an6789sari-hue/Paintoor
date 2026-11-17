/* Six-box OTP confirmation used by every escrow money action.

   One modal, three modes (release / refund / dispute) — the mode only
   changes the copy and the header icon. Demo phase: any six digits pass,
   the modal says so honestly. Auto-advance on type, backspace steps back,
   paste spreads across all six boxes. Escape and backdrop close. */
"use client";

import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyEvent } from "react";
import { useI18n } from "@/i18n";
import { Icon } from "@/components/Icons";
import type { OtpMode } from "@/lib/escrow";

const MODE_ICON: Record<OtpMode, "shieldCheck" | "undo" | "alert"> = {
  release: "shieldCheck",
  refund: "undo",
  dispute: "alert",
};

const BOXES = 6;

export function OtpModal({
  mode,
  onClose,
  onVerified,
}: {
  mode: OtpMode;
  onClose: () => void;
  onVerified: () => void;
}) {
  const { t } = useI18n();
  const [digits, setDigits] = useState<string[]>(Array(BOXES).fill(""));
  const [done, setDone] = useState(false);
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current);
  }, []);

  const full = digits.every((d) => d !== "");

  /** Type or paste: digits only, spread across the boxes, auto-advance. */
  function handleChange(i: number, raw: string) {
    if (done) return;
    const vals = raw.replace(/\D/g, "").slice(0, BOXES).split("");
    if (vals.length === 0) {
      setDigits((ds) => ds.map((d, j) => (j === i ? "" : d)));
      return;
    }
    setDigits((ds) => {
      const next = [...ds];
      vals.forEach((v, k) => {
        if (i + k < BOXES) next[i + k] = v;
      });
      return next;
    });
    const focus = Math.min(i + vals.length, BOXES - 1);
    refs.current[focus]?.focus();
  }

  function handleKey(i: number, e: ReactKeyEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && digits[i] === "" && i > 0) {
      refs.current[i - 1]?.focus();
    }
  }

  function verify() {
    if (!full || done) return;
    setDone(true);
    timer.current = window.setTimeout(onVerified, 900);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B0E11]/50 px-4"
      role="dialog"
      aria-modal="true"
      aria-label={t(`cd.otp.t.${mode}`)}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-sheet border border-line bg-white p-6 shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <span
            className={`flex h-11 w-11 items-center justify-center rounded-pill ${
              mode === "dispute" ? "bg-[rgba(199,119,0,0.12)] text-[#C77700]" : "bg-saffron/10 text-saffron"
            }`}
          >
            <Icon name={MODE_ICON[mode]} className="h-5 w-5" />
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("cd.otp.cancel")}
            className="rounded-control p-1.5 text-muted transition-colors hover:bg-chuna hover:text-navy"
          >
            <Icon name="close" className="h-4 w-4" />
          </button>
        </div>

        <h2 className="mt-3 text-lg font-black tracking-[-0.02em] text-navy">
          {t(`cd.otp.t.${mode}`)}
        </h2>
        <p className="mt-1 text-sm font-bold text-muted">{t("cd.otp.sub")}</p>

        <div className="mt-4 flex justify-between gap-2">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => {
                refs.current[i] = el;
              }}
              value={done ? "•" : d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKey(i, e)}
              disabled={done}
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={BOXES}
              aria-label={`${t("cd.otp.box")} ${i + 1}`}
              className="h-[52px] w-full min-w-0 rounded-control border border-line bg-white text-center text-xl font-black text-navy outline-none focus:border-saffron disabled:opacity-60"
            />
          ))}
        </div>

        {done ? (
          <p className="mt-4 flex items-center justify-center gap-2 text-sm font-extrabold text-neem">
            <Icon name="checkCircle" className="h-4 w-4" />
            {t("cd.otp.verified")}
          </p>
        ) : (
          <>
            <button
              type="button"
              onClick={verify}
              disabled={!full}
              className="mt-4 w-full rounded-control bg-saffron py-2.5 text-sm font-extrabold text-snow transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              {t("cd.otp.verify")}
            </button>
            <p className="mt-2 text-center text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted">
              {t("cd.otp.demo")}
            </p>
          </>
        )}
      </div>
    </div>
  );
}