/* Profile drawer — six tabs behind the hero avatar.

   Profile / Addresses / Password / Security / Alerts / Language. Everything
   writes through the shared profile store, so the hero avatar and (later)
   the settings panel stay in sync. Password and session actions are demo
   transitions and say so in their confirmation copy. */
"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n, type Lang } from "@/i18n";
import { Icon, type IconName } from "@/components/Icons";
import {
  initialsOf,
  readPhotoFile,
  useProfile,
  type Address,
  type AlertKey,
} from "@/lib/profile";

type Tab = "prof" | "addr" | "pwd" | "sec" | "alerts" | "lang";

const TABS: { id: Tab; key: string }[] = [
  { id: "prof", key: "cd.tab.prof" },
  { id: "addr", key: "cd.tab.addr" },
  { id: "pwd", key: "cd.tab.pwd" },
  { id: "sec", key: "cd.tab.sec" },
  { id: "alerts", key: "cd.tab.alerts" },
  { id: "lang", key: "cd.tab.lang" },
];

const ALERT_ROWS: { k: AlertKey; key: string }[] = [
  { k: "photos", key: "cd.al.photos" },
  { k: "escrow", key: "cd.al.escrow" },
  { k: "arrival", key: "cd.al.arrival" },
  { k: "voice", key: "cd.al.voice" },
  { k: "sms", key: "cd.al.sms" },
  { k: "email", key: "cd.al.email" },
  { k: "offers", key: "cd.al.offers" },
];

type SessionRow = { icon: IconName; label: string; cur: boolean };

const SESSION_SEED: SessionRow[] = [
  { icon: "phoneDev", label: "Pixel 8 · Vadodara", cur: true },
  { icon: "laptop", label: "MacBook Air · office", cur: false },
  { icon: "monitor", label: "Windows PC · parents' home", cur: false },
];

const GRAD = "linear-gradient(135deg,#E00048,#A80036)";

function Toggle({ on, onToggle, label }: { on: boolean; onToggle: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onToggle}
      className={`relative h-6 w-10 shrink-0 rounded-pill transition-colors ${on ? "bg-saffron" : "bg-line"}`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-pill bg-white shadow-card transition-all ${
          on ? "left-[18px]" : "left-0.5"
        }`}
      />
    </button>
  );
}

const inputCls =
  "w-full rounded-control border border-line bg-white px-3 py-2.5 text-sm font-bold text-navy outline-none transition-colors focus:border-saffron";
const labelCls = "mb-1 block text-xs font-extrabold text-muted";
const btnPrimary =
  "rounded-control bg-saffron px-4 py-2 text-sm font-extrabold text-snow transition-opacity hover:opacity-90";
const btnGhost =
  "rounded-control border border-line px-3 py-1.5 text-xs font-extrabold text-navy transition-colors hover:border-saffron hover:text-saffron";

export function ProfileDrawer({ onClose }: { onClose: () => void }) {
  const { t, lang, setLang } = useI18n();
  const [profile, setProfile] = useProfile();
  const [tab, setTab] = useState<Tab>("prof");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  /* ---- profile tab ---- */
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    city: profile.city,
  });
  const [photoErr, setPhotoErr] = useState(false);
  const [saved, setSaved] = useState(false);

  const pick = async (file: File | undefined) => {
    if (!file) return;
    const res = await readPhotoFile(file);
    if (res.ok) {
      setPhotoErr(false);
      setProfile((p) => ({ ...p, photo: res.dataUrl }));
    } else {
      setPhotoErr(true);
    }
  };

  const saveProfile = () => {
    setProfile((p) => ({ ...p, ...form }));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  /* ---- addresses tab ---- */
  const [newLabel, setNewLabel] = useState("");
  const [newLine, setNewLine] = useState("");
  const setPrimary = (id: string) =>
    setProfile((p) => ({
      ...p,
      addresses: p.addresses.map((a) => ({ ...a, primary: a.id === id })),
    }));
  const removeAddr = (id: string) =>
    setProfile((p) => {
      const rest = p.addresses.filter((a) => a.id !== id);
      if (rest.length && !rest.some((a) => a.primary)) rest[0] = { ...rest[0], primary: true };
      return { ...p, addresses: rest };
    });
  const addAddr = () => {
    const label = newLabel.trim();
    const line = newLine.trim();
    if (!label || !line) return;
    setProfile((p) => ({
      ...p,
      addresses: [
        ...p.addresses,
        { id: `a${Date.now()}`, label, line, primary: p.addresses.length === 0 } as Address,
      ],
    }));
    setNewLabel("");
    setNewLine("");
  };

  /* ---- password tab ---- */
  const [pw, setPw] = useState({ cur: "", nw: "", cf: "" });
  const [pwMsg, setPwMsg] = useState<{ kind: "err" | "ok"; key: string } | null>(null);
  const savePw = () => {
    if (pw.nw.length < 8) return setPwMsg({ kind: "err", key: "cd.pw.short" });
    if (pw.nw !== pw.cf) return setPwMsg({ kind: "err", key: "cd.pw.err" });
    setPw({ cur: "", nw: "", cf: "" });
    setPwMsg({ kind: "ok", key: "cd.pw.done" });
  };

  /* ---- security tab ---- */
  const [sessions, setSessions] = useState(SESSION_SEED);
  const [secMsg, setSecMsg] = useState(false);

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 h-full w-full bg-raatri/60"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("cd.drawer.title")}
        className="absolute right-0 top-0 h-full w-full max-w-md overflow-y-auto rounded-l-sheet bg-white shadow-card"
      >
        <div className="flex items-center justify-between border-b border-line p-5">
          <h2 className="text-lg font-black tracking-[-0.02em] text-navy">
            {t("cd.drawer.title")}
          </h2>
          <button type="button" onClick={onClose} className={btnGhost} aria-label="Close">
            <Icon name="close" className="h-4 w-4" />
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto p-4 pb-0">
          {TABS.map((x) => (
            <button
              key={x.id}
              type="button"
              onClick={() => setTab(x.id)}
              aria-current={tab === x.id ? "page" : undefined}
              className={`shrink-0 rounded-control border px-3 py-1.5 text-xs font-extrabold transition-colors ${
                tab === x.id ? "border-saffron bg-saffron text-snow" : "border-line bg-white text-muted"
              }`}
            >
              {t(x.key)}
            </button>
          ))}
        </div>

        <div className="space-y-5 p-5">
          {tab === "prof" && (
            <>
              <div className="flex flex-wrap items-center gap-4">
                <div
                  className="h-[104px] w-[104px] shrink-0 overflow-hidden rounded-pill border-4 border-snow/70 shadow-card"
                  style={{ background: GRAD }}
                >
                  {profile.photo ? (
                    /* eslint-disable-next-line @next/next/no-img-element -- user upload, data URL */
                    <img src={profile.photo} alt={profile.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-3xl font-black text-snow">
                      {initialsOf(profile.name)}
                    </span>
                  )}
                </div>
                <div className="min-w-0 space-y-2">
                  <button type="button" className={btnPrimary} onClick={() => fileRef.current?.click()}>
                    {t("cd.av.upload")}
                  </button>
                  {profile.photo && (
                    <button
                      type="button"
                      className={btnGhost}
                      onClick={() => setProfile((p) => ({ ...p, photo: "" }))}
                    >
                      {t("cd.av.initials")}
                    </button>
                  )}
                  <p className="text-xs font-bold text-muted">{t("cd.av.hint")}</p>
                  {photoErr && <p className="text-xs font-extrabold text-saffron">{t("cd.av.err")}</p>}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  className="hidden"
                  onChange={(e) => {
                    void pick(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {(
                  [
                    ["name", "cd.pf.name"],
                    ["email", "cd.pf.email"],
                    ["phone", "cd.pf.phone"],
                    ["city", "cd.pf.city"],
                  ] as const
                ).map(([f, key]) => (
                  <div key={f}>
                    <label className={labelCls} htmlFor={`pf-${f}`}>
                      {t(key)}
                    </label>
                    <input
                      id={`pf-${f}`}
                      className={inputCls}
                      value={form[f]}
                      onChange={(e) => setForm((s) => ({ ...s, [f]: e.target.value }))}
                    />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <button type="button" className={btnPrimary} onClick={saveProfile}>
                  {t("cd.pf.save")}
                </button>
                {saved && <span className="text-xs font-extrabold text-saffron">{t("cd.pf.saved")}</span>}
              </div>
            </>
          )}

          {tab === "addr" && (
            <div className="space-y-3">
              <h3 className="text-sm font-extrabold text-navy">{t("cd.ad.h")}</h3>
              {profile.addresses.length === 0 && (
                <p className="text-sm font-bold text-muted">{t("cd.ad.empty")}</p>
              )}
              {profile.addresses.map((a) => (
                <div key={a.id} className="rounded-card border border-line bg-white p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-extrabold text-navy">{a.label}</span>
                    {a.primary && (
                      <span className="rounded-pill bg-chuna px-2 py-0.5 text-[10px] font-extrabold text-saffron">
                        {t("cd.ad.primary")}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs font-bold text-muted">{a.line}</p>
                  <div className="mt-2 flex gap-2">
                    {!a.primary && (
                      <button type="button" className={btnGhost} onClick={() => setPrimary(a.id)}>
                        {t("cd.ad.set")}
                      </button>
                    )}
                    <button type="button" className={btnGhost} onClick={() => removeAddr(a.id)}>
                      {t("cd.ad.del")}
                    </button>
                  </div>
                </div>
              ))}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelCls} htmlFor="ad-label">
                    {t("cd.ad.label")}
                  </label>
                  <input
                    id="ad-label"
                    className={inputCls}
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelCls} htmlFor="ad-line">
                    {t("cd.ad.line")}
                  </label>
                  <input
                    id="ad-line"
                    className={inputCls}
                    value={newLine}
                    onChange={(e) => setNewLine(e.target.value)}
                  />
                </div>
              </div>
              <button
                type="button"
                className={btnPrimary}
                onClick={addAddr}
                disabled={!newLabel.trim() || !newLine.trim()}
              >
                {t("cd.ad.add")}
              </button>
            </div>
          )}

          {tab === "pwd" && (
            <div className="space-y-3">
              {(
                [
                  ["cur", "cd.pw.cur"],
                  ["nw", "cd.pw.new"],
                  ["cf", "cd.pw.conf"],
                ] as const
              ).map(([f, key]) => (
                <div key={f}>
                  <label className={labelCls} htmlFor={`pw-${f}`}>
                    {t(key)}
                  </label>
                  <input
                    id={`pw-${f}`}
                    type="password"
                    className={inputCls}
                    value={pw[f]}
                    onChange={(e) => setPw((s) => ({ ...s, [f]: e.target.value }))}
                  />
                </div>
              ))}
              <button type="button" className={btnPrimary} onClick={savePw}>
                {t("cd.pw.save")}
              </button>
              {pwMsg && <p className="text-xs font-extrabold text-saffron">{t(pwMsg.key)}</p>}
            </div>
          )}

          {tab === "sec" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3 rounded-card border border-line bg-white p-3">
                <span className="text-sm font-extrabold text-navy">{t("cd.sc.two")}</span>
                <Toggle
                  on={profile.twoStep}
                  onToggle={() => setProfile((p) => ({ ...p, twoStep: !p.twoStep }))}
                  label={t("cd.sc.two")}
                />
              </div>
              <div>
                <h3 className="mb-2 text-sm font-extrabold text-navy">{t("cd.sc.sess")}</h3>
                <div className="space-y-2">
                  {sessions.map((s) => (
                    <div
                      key={s.label}
                      className="flex items-center gap-3 rounded-card border border-line bg-white p-3"
                    >
                      <Icon name={s.icon} className="h-5 w-5 shrink-0 text-muted" />
                      <span className="min-w-0 truncate text-sm font-bold text-navy">
                        {s.label}
                      </span>
                      {s.cur && (
                        <span className="ml-auto shrink-0 rounded-pill bg-chuna px-2 py-0.5 text-[10px] font-extrabold text-saffron">
                          {t("cd.sc.this")}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                {sessions.length > 1 && (
                  <button
                    type="button"
                    className={`${btnGhost} mt-3`}
                    onClick={() => {
                      setSessions((s) => s.filter((x) => x.cur));
                      setSecMsg(true);
                    }}
                  >
                    {t("cd.sc.out")}
                  </button>
                )}
                {secMsg && <p className="mt-2 text-xs font-extrabold text-saffron">{t("cd.sc.done")}</p>}
              </div>
            </div>
          )}

          {tab === "alerts" && (
            <div className="space-y-2">
              <h3 className="text-sm font-extrabold text-navy">{t("cd.al.h")}</h3>
              {ALERT_ROWS.map((r) => (
                <div
                  key={r.k}
                  className="flex items-center justify-between gap-3 rounded-card border border-line bg-white p-3"
                >
                  <span className="text-sm font-bold text-navy">{t(r.key)}</span>
                  <Toggle
                    on={profile.alerts[r.k]}
                    onToggle={() =>
                      setProfile((p) => ({
                        ...p,
                        alerts: { ...p.alerts, [r.k]: !p.alerts[r.k] },
                      }))
                    }
                    label={t(r.key)}
                  />
                </div>
              ))}
            </div>
          )}

          {tab === "lang" && (
            <div className="space-y-4">
              <div>
                <h3 className="mb-2 text-sm font-extrabold text-navy">{t("cd.lg.lang")}</h3>
                <div className="flex gap-2">
                  {(
                    [
                      ["en", "English"],
                      ["hi", "हिंदी"],
                      ["gu", "ગુજરાતી"],
                    ] as [Lang, string][]
                  ).map(([code, label]) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => setLang(code)}
                      className={`rounded-control border px-3 py-1.5 text-xs font-extrabold transition-colors ${
                        lang === code ? "border-saffron bg-saffron text-snow" : "border-line bg-white text-muted"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="rounded-card border border-line bg-white p-3">
                <p className="text-xs font-extrabold text-muted">{t("cd.lg.cur")}</p>
                <p className="mt-0.5 text-sm font-bold text-navy">{t("cd.lg.curv")}</p>
              </div>
              <div className="rounded-card border border-line bg-white p-3">
                <p className="text-xs font-extrabold text-muted">{t("cd.lg.tz")}</p>
                <p className="mt-0.5 text-sm font-bold text-navy">{t("cd.lg.tzv")}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}