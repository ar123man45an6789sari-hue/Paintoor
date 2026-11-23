/* UsersView — everyone on the platform in one list: live partners and
   shops from the seed pools, plus customers seen in job requests. Admin
   can search, filter by role, approve/reject KYC and block/unblock. All
   verdicts are local demo flags (adminState) until the panel meets the
   real database in Phase 2.7. */
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useI18n } from "@/i18n";
import { Icon } from "@/components/Icons";
import { liveProviders, liveShops } from "@paintoor/mock-api";
import { getRequests, onRequestsChange } from "@/lib/requests";
import { getAdmin, onAdminChange, setKyc, toggleBlock } from "@/lib/adminState";

type Row = {
  key: string; // `${role}:${id}` — what adminState flags are keyed by
  role: "partner" | "shop" | "customer";
  name: string;
  city: string;
  detail: string;
  rating: number;
};

type Filter = "all" | "partner" | "shop" | "customer";

export function UsersView({ onToast }: { onToast: (msg: string) => void }) {
  const { t } = useI18n();
  const [tick, setTick] = useState(0);
  const [requests, setRequests] = useState<string[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  const reload = useCallback(() => {
    const names = Array.from(new Set(getRequests().map((r) => r.customer))).filter((n) => n && n !== "Guest");
    setRequests(names);
  }, []);

  useEffect(() => {
    reload();
    const offA = onAdminChange(() => setTick((v) => v + 1));
    const offR = onRequestsChange(reload);
    return () => { offA(); offR(); };
  }, [reload]);

  const rows = useMemo<Row[]>(() => {
    void tick;
    const partners: Row[] = liveProviders.map((p) => ({
      key: `partner:${p.id}`,
      role: "partner",
      name: p.name,
      city: p.city,
      detail: t("ad.usr.partnerDetail", { jobs: p.jobs_done, yrs: p.experience_years }),
      rating: p.rating_avg,
    }));
    const shops: Row[] = liveShops.map((s) => ({
      key: `shop:${s.id}`,
      role: "shop",
      name: s.name,
      city: s.city,
      detail: t("ad.usr.shopDetail", { zone: s.zone }),
      rating: s.rating_avg,
    }));
    const customers: Row[] = requests.map((n, i) => ({
      key: `customer:c${i + 1}`,
      role: "customer",
      name: n,
      city: "—",
      detail: t("ad.usr.custDetail"),
      rating: 0,
    }));
    return [...partners, ...shops, ...customers];
  }, [requests, tick, t]);

  const admin = getAdmin();
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(
      (r) => (filter === "all" || r.role === filter) && (!q || r.name.toLowerCase().includes(q) || r.city.toLowerCase().includes(q)),
    );
  }, [rows, filter, query]);

  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: t("ad.usr.all") },
    { id: "partner", label: t("ad.usr.fPartner") },
    { id: "shop", label: t("ad.usr.fShop") },
    { id: "customer", label: t("ad.usr.fCust") },
  ];

  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.16em] text-saffron">{t("ad.usr.eye")}</p>
      <div className="mt-1">
        <h2 className="text-2xl font-black tracking-[-0.02em] text-navy">{t("ad.usr.h")}</h2>
        <p className="mt-1 text-sm font-bold text-muted">{t("ad.usr.sub", { n: rows.length })}</p>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <label className="relative min-w-0 flex-1 sm:max-w-[280px]">
          <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("ad.usr.search")}
            aria-label={t("ad.usr.search")}
            className="min-h-11 w-full rounded-control border-2 border-line bg-white pl-9 pr-3 py-2.5 text-sm font-bold text-navy placeholder:font-semibold placeholder:text-muted focus:border-saffron focus:outline-none"
          />
        </label>
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label={t("ad.usr.filters")}>
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={`min-h-10 rounded-pill border-2 px-3.5 py-1.5 text-xs font-extrabold transition-colors ${
                filter === f.id ? "border-saffron bg-saffron text-snow" : "border-line bg-white text-muted hover:border-saffron hover:text-saffron"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 space-y-2.5">
        {shown.map((r) => {
          const blocked = Boolean(admin.blocked[r.key]);
          const kyc = admin.kyc[r.key];
          const initials = r.name.split(" ").map((x) => x[0]).slice(0, 2).join("");
          return (
            <article key={r.key} className={`rounded-card border border-line bg-white p-3.5 shadow-card ${blocked ? "opacity-60" : ""}`}>
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-pill bg-saffron/10 text-xs font-black text-saffron">
                  {initials}
                </span>
                <div className="min-w-0 flex-1 basis-[160px]">
                  <h3 className="truncate text-sm font-extrabold text-navy">
                    {r.name}
                    {blocked && <span className="ml-2 rounded-pill bg-[rgba(199,0,60,0.12)] px-2 py-0.5 text-[10px] font-black text-[#C7003C]">{t("ad.usr.blocked")}</span>}
                  </h3>
                  <p className="truncate text-xs font-semibold text-muted">
                    {t(`ad.usr.role.${r.role}`)} · {r.city} · {r.detail}
                  </p>
                </div>
                {r.rating > 0 && (
                  <span className="flex shrink-0 items-center gap-1 rounded-pill bg-chuna px-2.5 py-1 text-[11px] font-black text-navy">
                    <Icon name="star" className="h-3 w-3 text-saffron" />
                    {r.rating}
                  </span>
                )}
                {r.role !== "customer" && (
                  <span
                    className={`shrink-0 rounded-pill px-2.5 py-1 text-[10px] font-black ${
                      kyc === "approved"
                        ? "bg-[rgba(14,159,110,0.12)] text-[#0E9F6E]"
                        : kyc === "rejected"
                          ? "bg-[rgba(199,0,60,0.12)] text-[#C7003C]"
                          : "bg-[rgba(199,119,0,0.12)] text-[#C77700]"
                    }`}
                  >
                    {kyc === "approved" ? t("ad.usr.kycOk") : kyc === "rejected" ? t("ad.usr.kycNo") : t("ad.usr.kycWait")}
                  </span>
                )}
                <div className="flex shrink-0 gap-1.5">
                  {r.role !== "customer" && !kyc && (
                    <button
                      type="button"
                      onClick={() => { setKyc(r.key, "approved"); onToast(t("ad.usr.toastKyc", { name: r.name })); }}
                      className="min-h-10 rounded-control border-2 border-line px-3 py-2 text-xs font-extrabold text-navy hover:border-[#0E9F6E] hover:text-[#0E9F6E]"
                    >
                      <Icon name="shieldCheck" className="mr-1 inline h-3.5 w-3.5" />
                      {t("ad.usr.approve")}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => { toggleBlock(r.key, r.name); onToast(blocked ? t("ad.usr.toastUnblock", { name: r.name }) : t("ad.usr.toastBlock", { name: r.name })); }}
                    className={`min-h-10 rounded-control px-3 py-2 text-xs font-extrabold ${
                      blocked
                        ? "border-2 border-line text-navy hover:border-saffron hover:text-saffron"
                        : "bg-saffron text-snow hover:shadow-lift"
                    }`}
                  >
                    <Icon name={blocked ? "unlock" : "lock"} className="mr-1 inline h-3.5 w-3.5" />
                    {blocked ? t("ad.usr.unblock") : t("ad.usr.block")}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
        {shown.length === 0 && (
          <div className="rounded-card border-2 border-dashed border-line bg-white p-6 text-center">
            <Icon name="users" className="mx-auto h-8 w-8 text-saffron" />
            <p className="mt-2 font-extrabold text-navy">{t("ad.usr.none")}</p>
          </div>
        )}
      </div>
    </div>
  );
}