/* OrdersView — the order bell: 2-hour SLA countdowns, accept with a
   ready-time promise (the painter is notified), decline with a reason,
   packed flag and pickup/delivery handover. Stock and sales move only
   when the handover confirms delivery (shopState.deliverOrder). */
"use client";

import { useCallback, useEffect, useState } from "react";
import { useI18n } from "@/i18n";
import { Icon } from "@/components/Icons";
import { acceptOrder, addDemoOrder, deliverOrder, getShopState, onShopStateChange } from "@/lib/shopState";
import type { ShopOrder, ShopProduct, ShopProfile } from "@/lib/shopState";
import { confirmReady, declineFor, declineOrder, getFlow, onFlowChange, packedFor, readyFor, setPacked } from "@/lib/shopflow";
import { pushNotification } from "@/lib/notifications";

const READY_CHOICES = [30, 60, 90, 120];
const DECLINE_REASONS = ["sw.dec.r1", "sw.dec.r2", "sw.dec.r3"];

type Tab = "new" | "active" | "done";

export function OrdersView({
  profile,
  onMessage,
  onToast,
}: {
  profile: ShopProfile;
  onMessage: (orderId: string) => void;
  onToast: (msg: string) => void;
}) {
  const { t } = useI18n();
  const [orders, setOrders] = useState<ShopOrder[]>([]);
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [flowTick, setFlowTick] = useState(0);
  const [clock, setClock] = useState(0);
  const [tab, setTab] = useState<Tab>("new");
  const [acceptId, setAcceptId] = useState<string | null>(null);
  const [readyMins, setReadyMins] = useState(60);
  const [declineId, setDeclineId] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState(DECLINE_REASONS[0]);
  const [mode, setMode] = useState<Record<string, "pickup" | "delivery">>({});

  /* SLA badges re-compute every 30s so they never go stale. */
  useEffect(() => {
    const id = window.setInterval(() => setClock((v) => v + 1), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const reload = useCallback(() => {
    const s = getShopState();
    setOrders(s.orders);
    setProducts(s.products);
  }, []);

  useEffect(() => {
    reload();
    const offS = onShopStateChange(reload);
    const offF = onFlowChange(() => setFlowTick((v) => v + 1));
    return () => { offS(); offF(); };
  }, [reload]);

  void flowTick;
  void clock;

  const nameOf = (pid: string) => products.find((p) => p.id === pid)?.name ?? pid;
  const priceOf = (pid: string) => products.find((p) => p.id === pid)?.price ?? 0;

  const live = orders.filter((o) => !declineFor(o.id));
  const tabs: { id: Tab; label: string; n: number }[] = [
    { id: "new", label: t("sw.tab.new"), n: live.filter((o) => o.status === "new").length },
    { id: "active", label: t("sw.tab.active"), n: live.filter((o) => o.status === "accepted").length },
    { id: "done", label: t("sw.tab.done"), n: orders.filter((o) => o.status === "delivered").length },
  ];
  const statusOf = (x: Tab): ShopOrder["status"] => (x === "new" ? "new" : x === "active" ? "accepted" : "delivered");
  const shown = live.filter((o) => o.status === statusOf(tab)).slice(0, 12);

  function demo() {
    const order = addDemoOrder(profile);
    pushNotification({
      kind: "system",
      audience: "shopkeeper",
      titleKey: "notif.newOrder.title",
      bodyKey: "notif.newOrder.body",
      params: { name: order.providerName, zone: order.zone },
    });
    onToast(t("sh.demoAdded"));
  }

  function confirmAccept() {
    if (!acceptId) return;
    const order = orders.find((o) => o.id === acceptId);
    acceptOrder(acceptId);
    confirmReady(acceptId, readyMins);
    pushNotification({
      kind: "system",
      audience: "provider",
      titleKey: "notif.orderAccepted.title",
      bodyKey: "notif.orderAccepted.body",
      params: { shop: profile.name },
    });
    setAcceptId(null);
    onToast(t("sw.toastAccept", { mins: readyMins, name: order?.providerName ?? "" }));
  }

  function confirmDecline() {
    if (!declineId) return;
    declineOrder(declineId, t(declineReason));
    setDeclineId(null);
    onToast(t("sw.toastDecline"));
  }

  function handover(order: ShopOrder) {
    const m = mode[order.id] ?? "pickup";
    deliverOrder(order.id);
    pushNotification({
      kind: "system",
      audience: "provider",
      titleKey: "sw.notif.hand.title",
      bodyKey: "sw.notif.hand.body",
      params: { shop: profile.name, mode: t(m === "pickup" ? "sw.hand.pickup" : "sw.hand.delivery") },
    });
    onToast(t("sw.toastHand", { mode: t(m === "pickup" ? "sw.hand.pickup" : "sw.hand.delivery") }));
  }

  const ghostBtn =
    "min-h-10 rounded-control border-2 border-line px-3 py-2 text-xs font-extrabold text-navy hover:border-saffron hover:text-saffron";

  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.16em] text-saffron">{t("sw.orders.eye")}</p>
      <div className="mt-1 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-2xl font-black tracking-[-0.02em] text-navy">{t("sw.orders.h")}</h2>
          <p className="mt-1 text-sm font-bold text-muted">{t("sw.orders.sub")}</p>
        </div>
        <button type="button" onClick={demo} className={ghostBtn}>
          <Icon name="sparkle" className="mr-1 inline h-3.5 w-3.5" />
          {t("sh.demoOrder")}
        </button>
      </div>

      <div className="mt-4 flex gap-1.5 rounded-control bg-chuna p-1" role="tablist" aria-label={t("sw.orders.h")}>
        {tabs.map((x) => (
          <button
            key={x.id}
            type="button"
            role="tab"
            aria-selected={tab === x.id}
            onClick={() => setTab(x.id)}
            className={`min-h-11 flex-1 rounded-control px-3 py-2 text-xs font-extrabold transition-colors ${
              tab === x.id ? "bg-saffron text-snow" : "text-muted hover:text-navy"
            }`}
          >
            {x.label} {x.n > 0 && <span className={`ml-1 rounded-pill px-1.5 text-[10px] font-black ${tab === x.id ? "bg-snow/25" : "bg-saffron/15 text-saffron"}`}>{x.n}</span>}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="mt-4 rounded-card border-2 border-dashed border-line bg-white p-6 text-center">
          <Icon name="cart" className="mx-auto h-8 w-8 text-saffron" />
          <p className="mt-2 font-extrabold text-navy">{t("sh.emptyOrders")}</p>
        </div>
      ) : (
        <div className="mt-4 grid gap-3">
          {shown.map((o) => {
            const minsLeft = Math.ceil((o.windowEndsAt - Date.now()) / 60000);
            const ready = readyFor(o.id);
            const packed = packedFor(o.id);
            const units = o.items.reduce((a, x) => a + x.qty, 0);
            return (
              <article key={o.id} className="rounded-card border border-line bg-white p-4 shadow-card md:p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-extrabold text-navy">
                      <Icon name="user" className="mr-1.5 inline h-[1.05em] w-[1.05em] align-[-0.18em] text-saffron" />
                      {t("sh.orderFrom", { name: o.providerName })}
                    </h3>
                    <p className="mt-0.5 text-xs font-semibold text-muted">
                      {t("sh.jobRef", { ref: o.jobRef })} · {o.zone} · {new Date(o.at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                  <span
                    className={`rounded-pill px-2.5 py-0.5 text-[11px] font-black ${
                      o.status === "new"
                        ? minsLeft < 0
                          ? "bg-[rgba(199,0,60,0.12)] text-[#C7003C]"
                          : "bg-saffron/15 text-saffron"
                        : o.status === "accepted"
                          ? "bg-ink/10 text-ink"
                          : "bg-[rgba(14,159,110,0.12)] text-[#0E9F6E]"
                    }`}
                  >
                    {o.status === "new"
                      ? minsLeft < 0
                        ? t("sh.slaMissed")
                        : t("sh.sla", { mins: minsLeft })
                      : o.status === "accepted"
                        ? t("sh.acceptedNote")
                        : t("sw.st.delivered")}
                  </span>
                </div>

                <ul className="mt-3 divide-y divide-line rounded-control border border-line">
                  {o.items.map((it) => (
                    <li key={it.productId} className="flex items-center justify-between gap-3 px-3 py-2 text-xs font-semibold text-ink">
                      <span className="min-w-0 truncate">
                        {nameOf(it.productId)} <span className="text-muted">× {it.qty}</span>
                      </span>
                      <span className="shrink-0 font-black tabular-nums text-navy">₹{(priceOf(it.productId) * it.qty).toLocaleString("en-IN")}</span>
                    </li>
                  ))}
                  <li className="flex items-center justify-between gap-3 bg-chuna px-3 py-2 text-xs font-extrabold text-navy">
                    <span>
                      {t("sw.total", { n: units })} <span className="font-bold text-muted">· {t("sw.gstNote")}</span>
                    </span>
                    <span className="tabular-nums">₹{o.total.toLocaleString("en-IN")}</span>
                  </li>
                </ul>

                {o.status === "new" && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" onClick={() => { setReadyMins(60); setAcceptId(o.id); }} className="min-h-11 rounded-control bg-saffron px-4 py-2.5 text-xs font-extrabold text-snow hover:shadow-lift">
                      <Icon name="check" className="mr-1 inline h-3.5 w-3.5" />
                      {t("sw.accept")}
                    </button>
                    <button type="button" onClick={() => { setDeclineReason(DECLINE_REASONS[0]); setDeclineId(o.id); }} className={ghostBtn}>
                      {t("sw.decline")}
                    </button>
                    <button type="button" onClick={() => onMessage(o.id)} className={ghostBtn}>
                      <Icon name="chat" className="mr-1 inline h-3.5 w-3.5" />
                      {t("sw.msg")}
                    </button>
                  </div>
                )}

                {o.status === "accepted" && (
                  <div className="mt-3 space-y-2.5">
                    {ready && (
                      <p className="flex items-center gap-2 text-xs font-extrabold text-navy">
                        <Icon name="clock" className="h-3.5 w-3.5 text-saffron" />
                        {t("sw.readyPill", { mins: ready.mins })}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPacked(o.id, !packed)}
                        className={`min-h-10 rounded-control border-2 px-3 py-2 text-xs font-extrabold transition-colors ${
                          packed ? "border-[#0E9F6E] bg-[rgba(14,159,110,0.12)] text-[#0E9F6E]" : "border-line text-navy hover:border-saffron hover:text-saffron"
                        }`}
                      >
                        <Icon name={packed ? "checkCircle" : "package"} className="mr-1 inline h-3.5 w-3.5" />
                        {packed ? t("sw.packed") : t("sw.markPacked")}
                      </button>
                      <span className="flex items-center gap-1 rounded-control border-2 border-line p-1">
                        {(["pickup", "delivery"] as const).map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setMode((cur) => ({ ...cur, [o.id]: m }))}
                            className={`min-h-8 rounded-control px-2.5 py-1 text-[11px] font-extrabold transition-colors ${
                              (mode[o.id] ?? "pickup") === m ? "bg-saffron text-snow" : "text-muted hover:text-navy"
                            }`}
                          >
                            {t(m === "pickup" ? "sw.hand.pickup" : "sw.hand.delivery")}
                          </button>
                        ))}
                      </span>
                      <button
                        type="button"
                        onClick={() => handover(o)}
                        disabled={!packed}
                        className="min-h-10 rounded-control bg-saffron px-4 py-2 text-xs font-extrabold text-snow hover:shadow-lift disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Icon name="truck" className="mr-1 inline h-3.5 w-3.5" />
                        {t("sw.handover")}
                      </button>
                      <button type="button" onClick={() => onMessage(o.id)} className={ghostBtn}>
                        <Icon name="chat" className="mr-1 inline h-3.5 w-3.5" />
                        {t("sw.msg")}
                      </button>
                    </div>
                    {!packed && <p className="text-[11px] font-bold text-muted">{t("sw.packFirst")}</p>}
                  </div>
                )}

                {o.status === "delivered" && (
                  <p className="mt-3 flex items-center gap-2 text-xs font-extrabold text-[#0E9F6E]">
                    <Icon name="checkCircle" className="h-4 w-4" />
                    {t("sw.doneNote", { n: o.total.toLocaleString("en-IN") })}
                  </p>
                )}
              </article>
            );
          })}
        </div>
      )}

      {/* Accept modal — stock check + ready-time promise */}
      {acceptId && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/45 p-4 sm:items-center" role="dialog" aria-modal="true">
          <div className="w-[min(94vw,440px)] rounded-card border border-line bg-white p-5 shadow-lift">
            <h3 className="text-lg font-black text-navy">{t("sw.acc.h", { id: acceptId.slice(-4).toUpperCase() })}</h3>
            <p className="mt-1 text-xs font-bold text-muted">{t("sw.acc.sub")}</p>
            <p className="mt-3 rounded-control bg-chuna px-3 py-2 text-xs font-extrabold text-navy">
              {(() => {
                const o = orders.find((x) => x.id === acceptId);
                const units = o?.items.reduce((a, x) => a + x.qty, 0) ?? 0;
                return t("sw.acc.qty", { n: o?.items.length ?? 0, units });
              })()}
            </p>
            <p className="mt-4 text-xs font-black uppercase tracking-[0.14em] text-muted">{t("sw.acc.ready")}</p>
            <div className="mt-2 flex gap-1.5">
              {READY_CHOICES.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setReadyMins(m)}
                  className={`min-h-10 flex-1 rounded-control border-2 text-xs font-extrabold transition-colors ${
                    readyMins === m ? "border-saffron bg-saffron text-snow" : "border-line text-muted hover:border-saffron hover:text-saffron"
                  }`}
                >
                  {t("sw.acc.mins", { n: m })}
                </button>
              ))}
            </div>
            <div className="mt-5 flex gap-2">
              <button type="button" onClick={confirmAccept} className="min-h-11 flex-1 rounded-control bg-saffron px-4 py-2.5 text-sm font-extrabold text-snow hover:shadow-lift">
                {t("sw.acc.go")}
              </button>
              <button type="button" onClick={() => setAcceptId(null)} className={ghostBtn}>
                {t("sw.cancel")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Decline modal — a reason keeps the painter informed */}
      {declineId && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/45 p-4 sm:items-center" role="dialog" aria-modal="true">
          <div className="w-[min(94vw,440px)] rounded-card border border-line bg-white p-5 shadow-lift">
            <h3 className="text-lg font-black text-navy">{t("sw.dec.h")}</h3>
            <p className="mt-1 text-xs font-bold text-muted">{t("sw.dec.sub")}</p>
            <div className="mt-4 space-y-1.5">
              {DECLINE_REASONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setDeclineReason(r)}
                  className={`flex min-h-11 w-full items-center gap-2.5 rounded-control border-2 px-3 py-2 text-left text-xs font-extrabold transition-colors ${
                    declineReason === r ? "border-saffron bg-saffron/10 text-saffron" : "border-line text-navy hover:border-saffron"
                  }`}
                >
                  <Icon name={declineReason === r ? "checkCircle" : "chevRight"} className="h-4 w-4 shrink-0" />
                  {t(r)}
                </button>
              ))}
            </div>
            <div className="mt-5 flex gap-2">
              <button type="button" onClick={confirmDecline} className="min-h-11 flex-1 rounded-control border-2 border-line px-4 py-2.5 text-sm font-extrabold text-navy hover:border-saffron hover:text-saffron">
                {t("sw.dec.go")}
              </button>
              <button type="button" onClick={() => setDeclineId(null)} className={ghostBtn}>
                {t("sw.cancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}