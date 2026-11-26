/* Live order desk — real buyer orders with the two-hour accept window and
   the new / accepted / delivered transitions enforced by the database. */
"use client";

import { useCallback, useEffect, useState } from "react";
import { explain, fetchShop, inr, setOrderStatus, type LiveOrder, type LiveShop } from "@/lib/liveShop";

const PILL: Record<string, string> = {
  new: "border-saffron text-saffron",
  accepted: "border-navy text-navy",
  delivered: "border-neem text-neem",
};

function windowLeft(o: LiveOrder): string {
  if (o.status !== "new" || !o.windowEndsAt) return "";
  const mins = Math.round((new Date(o.windowEndsAt).getTime() - Date.now()) / 60000);
  if (mins <= 0) return "Accept window closed";
  return mins >= 60 ? `Accept within ${Math.floor(mins / 60)}h ${mins % 60}m` : `Accept within ${mins}m`;
}

export function LiveShopOrders() {
  const [shop, setShop] = useState<LiveShop | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setShop(await fetchShop());
    setLoaded(true);
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  async function move(o: LiveOrder, status: "accepted" | "delivered") {
    setBusy(o.id);
    const res = await setOrderStatus(o.id, status);
    setBusy(null);
    setNote(res.ok ? `Order ${status}.` : explain(res.error));
    await reload();
  }

  const orders = shop?.orders ?? [];

  return (
    <div className="space-y-5 p-4 lg:p-6">
      <header>
        <h2 className="text-lg font-extrabold text-navy dark:text-snow">Orders</h2>
        <p className="text-xs font-semibold text-muted">
          Every order here is a real buyer request. Stock is deducted the moment the order is placed.
        </p>
      </header>

      {note && (
        <p className="rounded-control border border-line bg-chuna px-3 py-2 text-xs font-bold text-navy dark:text-snow">
          {note}
        </p>
      )}

      {!loaded && <p className="text-sm font-bold text-muted">Loading…</p>}
      {loaded && orders.length === 0 && (
        <div className="rounded-card border border-line bg-white p-8 text-center shadow-card dark:bg-navy">
          <p className="text-sm font-extrabold text-navy dark:text-snow">No orders yet</p>
          <p className="mt-1 text-xs font-semibold text-muted">
            Orders appear here as soon as a partner or customer buys from your catalog.
          </p>
        </div>
      )}

      {orders.map((o) => (
        <article key={o.id} className="rounded-card border border-line bg-white p-5 shadow-card dark:bg-navy">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-sm font-extrabold text-navy dark:text-snow">
              {o.buyerName} <span className="text-xs font-bold text-muted">· {o.zone}</span>
            </h3>
            <span className={`rounded-pill border px-2.5 py-1 text-[10px] font-extrabold ${PILL[o.status] ?? "border-line text-muted"}`}>
              {o.status}
            </span>
          </div>
          <p className="mt-1 text-xs font-semibold text-muted">
            {new Date(o.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}
            {o.jobId ? " · linked to a live job" : ""}
            {o.status === "new" ? ` · ${windowLeft(o)}` : ""}
          </p>
          <ul className="mt-3 space-y-1">
            {o.items.map((it) => (
              <li key={it.productId} className="flex justify-between text-xs font-semibold text-ink dark:text-snow">
                <span>{it.product.brand ? `${it.product.brand} ` : ""}{it.product.name}</span>
                <span className="tabular-nums">× {it.qty}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="text-sm font-extrabold tabular-nums text-saffron">{inr(o.totalPaise)}</span>
            {o.status === "new" && (
              <button
                type="button"
                disabled={busy === o.id}
                onClick={() => void move(o, "accepted")}
                className="rounded-control bg-saffron px-4 py-1.5 text-xs font-extrabold text-snow hover:shadow-lift disabled:opacity-40"
              >
                Accept order
              </button>
            )}
            {o.status === "accepted" && (
              <button
                type="button"
                disabled={busy === o.id}
                onClick={() => void move(o, "delivered")}
                className="rounded-control bg-neem px-4 py-1.5 text-xs font-extrabold text-snow hover:opacity-90 disabled:opacity-40"
              >
                Mark delivered
              </button>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}