/* AdminSettingsView — panel settings: change the demo passcode, see the
   session model (one unlock per browser tab), reset every admin flag back
   to the seeded demo state, and review the audit trail limits. Real
   server-side admin auth (roles, sessions, 2FA) lands in Phase 2.7/4. */
"use client";

import { useState } from "react";
import { useI18n } from "@/i18n";
import { Icon } from "@/components/Icons";
import { DEMO_PASSCODE, getAdmin, resetAdmin, setPasscode } from "@/lib/adminState";

export function AdminSettingsView({ onToast }: { onToast: (msg: string) => void }) {
  const { t } = useI18n();
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [resetting, setResetting] = useState(false);

  const admin = getAdmin();

  const onSave = () => {
    if (next.length < 4) { onToast(t("ad.set.tooShort")); return; }
    if (next !== confirm) { onToast(t("ad.set.mismatch")); return; }
    setPasscode(next);
    sessionStorage.removeItem("gs_admin_unlocked"); // old passcode: re-lock this tab
    setNext(""); setConfirm("");
    onToast(t("ad.set.toastSaved"));
  };

  const onReset = () => {
    if (!resetting) { setResetting(true); return; }
    resetAdmin();
    setResetting(false);
    onToast(t("ad.set.toastReset"));
  };

  return (
    <div className="max-w-2xl">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-saffron">{t("ad.set.eye")}</p>
      <div className="mt-1">
        <h2 className="text-2xl font-black tracking-[-0.02em] text-navy">{t("ad.set.h")}</h2>
        <p className="mt-1 text-sm font-bold text-muted">{t("ad.set.sub")}</p>
      </div>

      {/* Passcode */}
      <section className="mt-4 rounded-card border border-line bg-white p-5 shadow-card">
        <h3 className="flex items-center gap-2 text-sm font-black text-navy">
          <Icon name="lock" className="h-4 w-4 text-saffron" />
          {t("ad.set.passcodeH")}
        </h3>
        <p className="mt-1 text-xs font-semibold leading-relaxed text-muted">{t("ad.set.passcodeSub")}</p>
        <div className="mt-3 space-y-2">
          <label className="block">
            <span className="text-xs font-bold text-muted">{t("ad.set.newPass")}</span>
            <input
              type="password"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              className="mt-1 min-h-11 w-full rounded-control border-2 border-line bg-white px-3 py-2 font-mono text-sm text-ink outline-none focus:border-saffron"
            />
          </label>
          <label className="block">
            <span className="text-xs font-bold text-muted">{t("ad.set.confirmPass")}</span>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              className="mt-1 min-h-11 w-full rounded-control border-2 border-line bg-white px-3 py-2 font-mono text-sm text-ink outline-none focus:border-saffron"
            />
          </label>
          <button
            type="button"
            onClick={onSave}
            className="min-h-11 w-full rounded-control bg-saffron px-4 py-2.5 text-sm font-black text-snow hover:shadow-lift"
          >
            {t("ad.set.savePass")}
          </button>
        </div>
      </section>

      {/* Session + audit info */}
      <section className="mt-4 rounded-card border border-line bg-white p-5 shadow-card">
        <h3 className="flex items-center gap-2 text-sm font-black text-navy">
          <Icon name="shieldCheck" className="h-4 w-4 text-saffron" />
          {t("ad.set.modelH")}
        </h3>
        <ul className="mt-2 space-y-1.5 text-xs font-semibold leading-relaxed text-muted">
          <li>· {t("ad.set.model1")}</li>
          <li>· {t("ad.set.model2")}</li>
          <li>· {t("ad.set.model3", { n: admin.log.length })}</li>
          <li>· {t("ad.set.model4")}</li>
        </ul>
      </section>

      {/* Danger zone */}
      <section className="mt-4 rounded-card border-2 border-saffron/40 bg-white p-5 shadow-card">
        <h3 className="flex items-center gap-2 text-sm font-black text-saffron">
          <Icon name="alert" className="h-4 w-4" />
          {t("ad.set.resetH")}
        </h3>
        <p className="mt-1 text-xs font-semibold leading-relaxed text-muted">{t("ad.set.resetSub", { code: DEMO_PASSCODE })}</p>
        <button
          type="button"
          onClick={onReset}
          className={`min-h-11 w-full rounded-control px-4 py-2.5 text-sm font-black transition-colors ${
            resetting ? "bg-saffron text-snow" : "border-2 border-saffron text-saffron hover:bg-saffron hover:text-snow"
          }`}
        >
          {resetting ? t("ad.set.resetSure") : t("ad.set.reset")}
        </button>
      </section>
    </div>
  );
}