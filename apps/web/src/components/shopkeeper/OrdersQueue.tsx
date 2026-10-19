/* OrdersQueue v1 — the counter's order bell: accept within the 2h SLA, then
   mark delivered (stock decrements, sales rise). Blueprint Ch. 09.7 + 12. */
"use client";

import { useCallback, useEffect, useState } from "react";
import { useI18n } from "@/i18n";
import { acceptOrder, addDemoOrder, deliverOrder, getShopState, onShopStateChange } from "@/lib/shopState";
import type { ShopOrder, ShopProduct, ShopProfile } from "@/lib/shopState";
import { pushNotification } from "@/lib/notifications";

export function OrdersQueue({ profile }: { profile: ShopProfile }) {
  const { t } = useI18n();
  const [orders, setOrders] = useState<ShopOrder[]>([]);
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const reload = useCallback(() => {
    const s = getShopState();
    setOrders(s.orders.filter((o) => o.status !== "delivered"));
    setProducts(s.products);
  }, []);

  useEffect(() => {
    reload();
    return onShopStateChange(reload);
  }, [reload]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(id);
  }, [toast]);

  function accept(order: ShopOrder) {
    acceptOrder(order.id);
    pushNotification({
      kind: "system",
      audience: "provider",
      titleKey: "notif.orderAccepted.title",
      bodyKey: "notif.orderAccepted.body",
      params: { shop: profile.name },
    });
    setToast(t("sh.toastAccept"));
  }

  function deliver(order: ShopOrder) {
    deliverOrder(order.id);
    setToast(t("sh.toastDeliver"));
  }

  function demo() {
    const order = addDemoOrder(profile);
    pushNotification({
      kind: "system",
      audience: "shopkeeper",
      titleKey: "notif.newOrder.title",
      bodyKey: "notif.newOrder.body",
      params: { name: order.providerName, zone: order.zone },
    });
    setToast(t("sh.demoAdded"));
  }

  const nameOf = (pid: string) => products.find((p) => p.id === pid)?.name ?? pid;
  const priceOf = (pid: string) => products.find((p) => p.id === pid)?.price ?? 0;

  if (orders.length === 0) {
    return (
      <div className="rounded-card border-2 border-dashed border-line bg-white p-10 text-center">
        <p className="text-3xl">🛍️</p>
        <p className="mt-2 font-extrabold text-navy">{t("sh.emptyOrders")}</p>
        <button
          type="button"
          onClick={demo}
          className="mt-4 min-h-12 rounded-control border-2 border-neem px-5 py-3 text-sm font-extrabold text-neem hover:bg-neem hover:text-white"
        >
          ✨ {t("sh.demoOrder")}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((o) => {
        const minsLeft = Math.ceil((o.windowEndsAt - Date.now()) / 60000);
        return (
          <article key={o.id} className="rounded-card border border-line bg-white p-5 shadow-card">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-extrabold text-navy">🛒 {t("sh.orderFrom", { name: o.providerName })}</h3>
              <span
                className={`rounded-pill px-3 py-1 text-[11px] font-black ${
                  o.status === "new"
                    ? minsLeft < 0
                      ? "bg-danger/15 text-danger"
                      : "bg-haldi/20 text-navy"
                    : "bg-neem/15 text-neem"
                }`}
              >
                {o.status === "new"
                  ? minsLeft < 0
                    ? t("sh.slaMissed")
                    : t("sh.sla", { mins: minsLeft })
                  : t("sh.acceptedNote")}
              </span>
            </div>
            <p className="mt-1 text-xs font-semibold text-muted">
              {t("sh.jobRef", { ref: o.jobRef })} · {o.zone}
            </p>
            <ul className="mt-3 space-y-1">
              {o.items.map((it) => (
                <li key={it.productId} className="flex justify-between text-sm font-semibold text-ink">
                  <span>
                    {nameOf(it.productId)} × {it.qty}
                  </span>
                  <span className="tabular-nums text-muted">₹{(priceOf(it.productId) * it.qty).toLocaleString("en-IN")}</span>
                </li>
              ))}
            </ul>
            <p className="mt-2 flex justify-between border-t border-line pt-2 text-sm font-black text-navy">
              <span>{t("sh.total")}</span>
              <span className="tabular-nums">₹{o.total.toLocaleString("en-IN")}</span>
            </p>
            <div className="mt-4">
              {o.status === "new" ? (
                <button
                  type="button"
                  onClick={() => accept(o)}
                  className="min-h-12 w-full rounded-control bg-neem px-4 py-3 text-sm font-extrabold text-white hover:shadow-lift"
                >
                  ✓ {t("sh.accept")}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => deliver(o)}
                  className="min-h-12 w-full rounded-control bg-saffron px-4 py-3 text-sm font-extrabold text-white hover:shadow-lift"
                >
                  🚚 {t("sh.deliver")}
                </button>
              )}
            </div>
          </article>
        );
      })}

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-toast w-[min(92vw,420px)] -translate-x-1/2 rounded-control bg-navy px-4 py-3 text-center text-sm font-bold text-white shadow-lift">
          {toast}
        </div>
      )}
    </div>
  );
}