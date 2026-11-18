/* PartnerHero — cover strip, big avatar with photo upload, time greeting,
   KYC/rating/zone pills and the availability switch. Mirrors the customer
   hero pattern so both roles feel like the same product. */
"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useI18n } from "@/i18n";
import { Icon } from "@/components/Icons";
import { getPartnerState, onPartnerChange, setPartnerAvatar } from "@/lib/partner";
import { toggleOnline } from "@/lib/providerstate";
import { getProviderState, onProviderStateChange } from "@/lib/providerstate";
import { levelKeyFor } from "@/lib/providers";
import type { ProviderProfile } from "@/lib/providers";

const GRAD = "linear-gradient(135deg,#E00048,#A80036)";

/** Spec greeting windows: night / morning / afternoon / evening / night. */
function greetingKey(d: Date): string {
  const h = d.getHours();
  if (h < 5) return "cd.greet.night";
  if (h < 12) return "cd.greet.morning";
  if (h < 17) return "cd.greet.afternoon";
  if (h < 21) return "cd.greet.evening";
  return "cd.greet.night";
}

function initialsOf(name: string): string {
  return name.split(" ").map((x) => x[0]).slice(0, 2).join("").toUpperCase();
}

export function PartnerHero({ profile }: { profile: ProviderProfile }) {
  const { t } = useI18n();
  const first = profile.name.split(" ")[0];
  const fileRef = useRef<HTMLInputElement>(null);
  const [avatar, setAvatar] = useState("");
  const [online, setOnline] = useState(true);
  /* Null until the client mounts so server and client first renders match. */
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const load = () => {
      setAvatar(getPartnerState().avatar);
      setOnline(getProviderState().online);
    };
    load();
    const offP = onPartnerChange(load);
    const offS = onProviderStateChange(load);
    return () => { offP(); offS(); };
  }, []);

  /* Same data-URL route as the customer dashboard: pick a file, it lands in
     the shared partner store and every avatar instance updates at once. */
  const onPick = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setPartnerAvatar(String(reader.result));
    reader.readAsDataURL(f);
    e.target.value = "";
  };

  const kyc = profile.badges.includes("kyc_verified");

  return (
    <section className="overflow-hidden rounded-sheet border border-line bg-white shadow-card">
      <div className="relative h-28 md:h-36" style={{ background: GRAD }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- static cover, decorative */}
        <img src="/services/hands.jpg" alt="" className="h-full w-full object-cover opacity-35" />
        <span className="absolute right-3 top-3 rounded-pill bg-raatri/45 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-snow">
          {t("pw.hero.cover")}
        </span>
      </div>

      <div className="relative flex flex-wrap items-end gap-4 px-5 pb-5 md:px-7 md:pb-6">
        <span className="relative -mt-10 inline-block shrink-0 md:-mt-12">
          <span
            className="flex h-[84px] w-[84px] items-center justify-center overflow-hidden rounded-pill border-4 border-white text-2xl font-black text-snow shadow-card md:h-[100px] md:w-[100px] md:text-3xl"
            style={{ background: GRAD }}
          >
            {avatar ? (
              /* eslint-disable-next-line @next/next/no-img-element -- user upload, data URL */
              <img src={avatar} alt={profile.name} className="h-full w-full object-cover" />
            ) : (
              initialsOf(profile.name)
            )}
          </span>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            aria-label={t("cd.photo.change")}
            className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-pill bg-saffron shadow-card transition-transform hover:scale-110"
          >
            <Icon name="camera" className="h-4 w-4 text-snow" />
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPick} />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-muted">
            {now ? `${t(greetingKey(now))}, ${first}` : "\u00A0"}
          </p>
          <h1 className="mt-0.5 text-2xl font-black tracking-[-0.02em] text-navy md:text-3xl">
            {t("pw.hero.tagline")}
          </h1>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {kyc && (
              <span className="rounded-pill bg-ink/10 px-3 py-1 text-xs font-extrabold text-ink">
                <Icon name="shieldCheck" className="mr-1 inline h-[1.05em] w-[1.05em] align-[-0.18em]" />{t("pw.kyc")}
              </span>
            )}
            <span className="rounded-pill bg-chuna px-3 py-1 text-xs font-extrabold text-muted">
              <Icon name="mapPin" className="mr-1 inline h-[1.05em] w-[1.05em] align-[-0.18em]" />{profile.zone}, {profile.city}
            </span>
            <span className="rounded-pill bg-chuna px-3 py-1 text-xs font-extrabold text-muted">
              <Icon name="star" className="mr-1 inline h-[1.05em] w-[1.05em] align-[-0.18em] text-saffron" />
              {profile.rating} · {t(levelKeyFor(profile.jobsDone))}
            </span>
          </div>
        </div>

        <div className="flex w-full items-center justify-between gap-3 rounded-card border border-line bg-chuna px-4 py-3 sm:w-auto">
          <div>
            <p className="text-xs font-black text-navy">{t("pw.avail")}</p>
            <p className="text-[11px] font-semibold text-muted">{t("pw.availOn")}</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={online}
            aria-label={t("pw.avail")}
            onClick={() => setOnline(toggleOnline())}
            className={`relative h-7 w-12 shrink-0 rounded-pill transition-colors ${online ? "bg-saffron" : "bg-line"}`}
          >
            <span className={`absolute top-0.5 h-6 w-6 rounded-pill bg-white shadow-card transition-all ${online ? "left-[22px]" : "left-0.5"}`} />
          </button>
          <span className={`text-xs font-black ${online ? "text-saffron" : "text-muted"}`}>
            {online ? t("pd.online") : t("pd.offline")}
          </span>
        </div>
      </div>
    </section>
  );
}