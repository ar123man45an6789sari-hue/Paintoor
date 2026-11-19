/* ChatView — order-linked trade chat. One thread per order (painter on the
   left, your replies on the right). Conversations stay on this device, so
   the counter can draft replies without claiming live messaging. */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/i18n";
import { Icon } from "@/components/Icons";
import { getShopState, onShopStateChange } from "@/lib/shopState";
import type { ShopOrder } from "@/lib/shopState";
import { onFlowChange, sendShopMsg, threadFor } from "@/lib/shopflow";

export function ChatView({ focusOrderId }: { focusOrderId?: string }) {
  const { t } = useI18n();
  const [orders, setOrders] = useState<ShopOrder[]>([]);
  const [tick, setTick] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    setOrders(getShopState().orders);
    const offS = onShopStateChange(() => setOrders(getShopState().orders));
    const offF = onFlowChange(() => setTick((v) => v + 1));
    return () => { offS(); offF(); };
  }, []);

  useEffect(() => {
    if (focusOrderId) setActiveId(focusOrderId);
  }, [focusOrderId]);

  /* tick re-renders after every shopflow change so threads stay fresh. */
  const threads = useMemo(() => {
    void tick;
    return orders.map((o) => ({ order: o, msgs: threadFor(o.id) }));
  }, [orders, tick]);
  const active = threads.find((x) => x.order.id === activeId) ?? null;

  function send() {
    const text = draft.trim();
    if (!text || !activeId) return;
    sendShopMsg(activeId, text);
    setDraft("");
  }

  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.16em] text-saffron">{t("sw.chat.eye")}</p>
      <div className="mt-1">
        <h2 className="text-2xl font-black tracking-[-0.02em] text-navy">{t("sw.chat.h")}</h2>
        <p className="mt-1 text-sm font-bold text-muted">{t("sw.chat.sub")}</p>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        {/* Thread list */}
        <aside className="space-y-2 lg:max-h-[600px] lg:overflow-y-auto">
          {threads.length === 0 && (
            <p className="rounded-card border-2 border-dashed border-line bg-white p-4 text-center text-xs font-extrabold text-muted">
              {t("sw.chat.empty")}
            </p>
          )}
          {threads.map(({ order, msgs }) => {
            const last = msgs[msgs.length - 1];
            return (
              <button
                key={order.id}
                type="button"
                onClick={() => setActiveId(order.id)}
                className={`flex w-full min-h-12 items-center gap-2.5 rounded-control border-2 px-3 py-2.5 text-left transition-colors ${
                  activeId === order.id ? "border-saffron bg-saffron/10" : "border-line bg-white hover:border-saffron"
                }`}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-pill bg-saffron/10 text-[11px] font-black text-saffron">
                  {order.providerName.split(" ").map((x) => x[0]).slice(0, 2).join("")}
                </span>
                <span className="min-w-0 flex-1">
                  <b className="block truncate text-sm font-extrabold text-navy">{order.providerName}</b>
                  <span className="block truncate text-xs font-semibold text-muted">
                    {last ? last.text : t("sw.chat.noMsg", { ref: order.jobRef })}
                  </span>
                </span>
              </button>
            );
          })}
        </aside>

        {/* Active thread */}
        <section className="flex min-h-[420px] flex-col rounded-card border border-line bg-white shadow-card">
          {active ? (
            <>
              <header className="flex items-center gap-3 border-b border-line p-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-pill bg-saffron/10 text-xs font-black text-saffron">
                  {active.order.providerName.split(" ").map((x) => x[0]).slice(0, 2).join("")}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-extrabold text-navy">{active.order.providerName}</h3>
                  <p className="truncate text-xs font-semibold text-muted">
                    {t("sh.jobRef", { ref: active.order.jobRef })} · ₹{active.order.total.toLocaleString("en-IN")}
                  </p>
                </div>
                <span className="shrink-0 rounded-pill bg-chuna px-2.5 py-0.5 text-[11px] font-black text-muted">
                  {t("sw.st." + active.order.status)}
                </span>
              </header>
              <div className="flex-1 space-y-3 overflow-y-auto p-4" style={{ maxHeight: "380px" }}>
                {active.msgs.length === 0 && (
                  <p className="rounded-control bg-chuna p-3 text-center text-xs font-bold text-muted">{t("sw.chat.hint")}</p>
                )}
                {active.msgs.map((m, i) => (
                  <div key={i} className={`flex ${m.from === "out" ? "justify-end" : "justify-start"}`}>
                    <p
                      className={`max-w-[85%] rounded-card px-3 py-2 text-sm font-bold leading-relaxed ${
                        m.from === "out" ? "bg-saffron text-snow" : "border border-line bg-white text-navy"
                      }`}
                    >
                      {m.text}
                      <span className={`mt-0.5 block text-[10px] font-extrabold ${m.from === "out" ? "text-snow/75" : "text-muted"}`}>
                        {new Date(m.at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 border-t border-line p-3">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") send(); }}
                  placeholder={t("sw.chat.ph")}
                  aria-label={t("sw.chat.ph")}
                  className="min-h-11 flex-1 rounded-control border-2 border-line bg-white px-3 py-2.5 text-sm font-bold text-navy placeholder:font-semibold placeholder:text-muted focus:border-saffron focus:outline-none"
                />
                <button type="button" onClick={send} disabled={!draft.trim()} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-control bg-saffron text-snow hover:shadow-lift disabled:opacity-40" aria-label={t("sw.chat.send")}>
                  <Icon name="send" className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
              <Icon name="chat" className="h-8 w-8 text-saffron" />
              <p className="text-sm font-extrabold text-navy">{t("sw.chat.pick")}</p>
              <p className="text-xs font-semibold text-muted">{t("sw.chat.pickSub")}</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}