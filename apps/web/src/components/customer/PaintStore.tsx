/* Paint store — the dashboard-native shop shelf.

   A compact mirror of the public marketplace: brand chips (real logos from
   /brands), aisle filter and search over the same 24-product catalogue.
   "Add" writes the global cart (pt_cart) with the exact line convention of
   the public page, so the header badge stays correct everywhere. Checkout
   is a two-step demo: review the cart, then place the order — no payment
   is taken and the UI says so. */
"use client";

import { useMemo, useState } from "react";
import { useI18n } from "@/i18n";
import { Icon } from "@/components/Icons";
import {
  AISLES,
  BRANDS,
  PRODUCTS,
  brandOf,
  cheapest,
  offPct,
  priceAt,
  type Product,
} from "@/lib/marketplace";
import { addLine, cartCount, clearCart, removeLine, setQty, useCart } from "@/lib/cartStore";
import { useProfile } from "@/lib/profile";
import type { Session } from "@/lib/session";
import { inr } from "@/lib/jobs";

function sizeLabel(p: Product): string {
  return p.size === 40 ? "40 kg" : `${p.size} L`;
}

export function PaintStore({ session }: { session: Session }) {
  const { t } = useI18n();
  const [profile] = useProfile();
  const [brand, setBrand] = useState("all");
  const [aisle, setAisle] = useState("all");
  const [query, setQuery] = useState("");
  const [step, setStep] = useState<"cart" | "pay" | "done">("cart");
  const [orderId, setOrderId] = useState("");

  const cart = useCart();
  const count = cartCount(cart);
  const total = cart.reduce((a, l) => a + l.price * l.qty, 0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PRODUCTS.filter(
      (p) =>
        (brand === "all" || p.b === brand) &&
        (aisle === "all" || p.cat === aisle) &&
        (!q || p.n.toLowerCase().includes(q) || brandOf(p.b).name.toLowerCase().includes(q)),
    );
  }, [brand, aisle, query]);

  /* Same line convention as the public marketplace: id@store, priced at
     the cheapest store carrying the brand. */
  function add(p: Product) {
    const s = cheapest(p).s;
    addLine({
      key: `${p.id}@${s.id}`,
      title: p.n,
      meta: `${sizeLabel(p)} · ${s.n}`,
      price: priceAt(p, s),
      storeId: s.id,
      qty: 1,
    });
  }

  function placeOrder() {
    setOrderId(`PT-ORD-${Date.now().toString().slice(-6)}`);
    clearCart();
    setStep("done");
  }

  const shipTo = profile.addresses.find((a) => a.primary)?.line ?? profile.city;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black tracking-[-0.02em] text-navy">{t("cd.nav.store")}</h1>
        <p className="mt-1 text-sm font-bold text-muted">{t("cd.store.sub")}</p>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[1fr_300px]">
        {/* Shelf */}
        <div className="min-w-0 space-y-4">
          <section className="rounded-card border border-line bg-white p-4 shadow-card">
            <span className="flex items-center gap-2 rounded-control border border-line bg-white px-3 focus-within:border-saffron">
              <Icon name="search" className="h-4 w-4 text-muted" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("cd.store.search")}
                aria-label={t("cd.store.search")}
                className="w-full bg-transparent py-2 text-sm font-bold text-navy outline-none"
              />
            </span>
            {/* Brand chips — real logos, same slugs as /brands files */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setBrand("all")}
                className={`rounded-pill border px-3 py-1 text-xs font-extrabold transition-colors ${
                  brand === "all" ? "border-saffron bg-saffron text-snow" : "border-line text-muted hover:border-saffron hover:text-saffron"
                }`}
              >
                {t("cd.store.allbrands")}
              </button>
              {BRANDS.map((b) => (
                <button
                  key={b.slug}
                  type="button"
                  onClick={() => setBrand(brand === b.slug ? "all" : b.slug)}
                  className={`flex items-center gap-1.5 rounded-pill border px-2.5 py-1 text-xs font-extrabold transition-colors ${
                    brand === b.slug ? "border-saffron bg-saffron text-snow" : "border-line text-muted hover:border-saffron hover:text-saffron"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- brand logos ship as static PNGs */}
                  <img src={`/brands/${b.slug}.png`} alt="" className="h-4 w-4 rounded-pill bg-white object-contain" />
                  {b.name}
                </button>
              ))}
            </div>
            {/* Aisle chips */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setAisle("all")}
                className={`rounded-pill px-3 py-1 text-xs font-extrabold transition-colors ${
                  aisle === "all" ? "bg-navy text-snow dark:bg-chuna dark:text-navy" : "bg-chuna text-muted hover:text-navy"
                }`}
              >
                {t("cd.store.allaisles")}
              </button>
              {AISLES.map((a) => (
                <button
                  key={a.key}
                  type="button"
                  onClick={() => setAisle(aisle === a.key ? "all" : a.key)}
                  className={`rounded-pill px-3 py-1 text-xs font-extrabold transition-colors ${
                    aisle === a.key ? "bg-navy text-snow dark:bg-chuna dark:text-navy" : "bg-chuna text-muted hover:text-navy"
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>
            <p className="mt-3 border-t border-line pt-2.5 text-xs font-extrabold text-muted">
              {t("cd.store.count", { n: filtered.length })}
            </p>
          </section>

          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map((p) => {
              const best = cheapest(p);
              return (
                <article key={p.id} className="flex flex-col rounded-card border border-line bg-white p-4 shadow-card">
                  <div className="flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element -- brand logos ship as static PNGs */}
                    <img src={`/brands/${p.b}.png`} alt={brandOf(p.b).name} className="h-6 w-6 rounded-pill bg-chuna object-contain" />
                    <span className="min-w-0 flex-1 truncate text-[11px] font-extrabold uppercase tracking-[0.1em] text-muted">{brandOf(p.b).name}</span>
                    <span className="shrink-0 rounded-pill bg-neem/15 px-2 py-0.5 text-[10px] font-extrabold text-neem">{offPct(p)}% {t("cd.store.off")}</span>
                  </div>
                  <h3 className="mt-2 text-sm font-extrabold text-navy">{p.n}</h3>
                  <p className="mt-0.5 text-xs font-bold text-muted">
                    {sizeLabel(p)}
                    {p.fin ? ` · ${p.fin}` : ""} · <Icon name="star" className="h-3 w-3 text-haldi" /> {p.r}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] font-bold text-muted">{t("cd.store.from", { s: best.s.n })}</p>
                  <div className="mt-auto flex items-end justify-between gap-2 pt-3">
                    <span>
                      <span className="text-base font-black text-navy">{inr(best.p)}</span>{" "}
                      <span className="text-xs font-bold text-muted line-through">{inr(p.mrp)}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => add(p)}
                      className="inline-flex items-center gap-1.5 rounded-control bg-saffron px-3 py-1.5 text-xs font-extrabold text-snow transition-opacity hover:opacity-90"
                    >
                      <Icon name="cart" className="h-3.5 w-3.5" />
                      {t("cd.store.add")}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {/* Two-step checkout */}
        <aside className="rounded-card border border-line bg-white p-4 shadow-card lg:sticky lg:top-24">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em]">
            <span className={step === "cart" ? "text-saffron" : "text-muted"}>1 · {t("cd.store.step1")}</span>
            <span className="h-px flex-1 bg-line" aria-hidden="true" />
            <span className={step === "pay" ? "text-saffron" : step === "done" ? "text-neem" : "text-muted"}>2 · {t("cd.store.step2")}</span>
          </div>

          <h2 className="mt-2 flex items-center justify-between text-sm font-extrabold text-navy">
            {t("cd.store.cart")}
            {count > 0 && (
              <span className="rounded-pill bg-saffron px-2 py-0.5 text-[10px] font-black text-snow">{count}</span>
            )}
          </h2>

          {step === "done" ? (
            <div className="mt-3 text-center">
              <Icon name="checkCircle" className="mx-auto h-10 w-10 text-neem" />
              <p className="mt-2 text-sm font-extrabold text-navy">{orderId}</p>
              <p className="mt-1 text-xs font-bold text-muted">{t("cd.store.done")}</p>
              <button
                type="button"
                onClick={() => setStep("cart")}
                className="mt-3 w-full rounded-control border border-line py-2 text-xs font-extrabold text-navy transition-colors hover:border-saffron hover:text-saffron"
              >
                {t("cd.store.shopmore")}
              </button>
            </div>
          ) : count === 0 && step === "cart" ? (
            <p className="mt-3 rounded-control border border-dashed border-line p-4 text-center text-xs font-bold text-muted">
              {t("cd.store.empty")}
            </p>
          ) : step === "cart" ? (
            <>
              <div className="mt-3 space-y-2.5">
                {cart.map((l) => (
                  <div key={l.key} className="flex items-start gap-2">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-extrabold text-navy">{l.title}</span>
                      <span className="block truncate text-[10px] font-bold text-muted">{l.meta}</span>
                      <span className="mt-1 flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setQty(l.key, -1)}
                          aria-label={t("cd.store.qty")}
                          className="flex h-5 w-5 items-center justify-center rounded-pill border border-line text-muted hover:border-saffron hover:text-saffron"
                        >
                          <Icon name="minus" className="h-2.5 w-2.5" />
                        </button>
                        <span className="w-5 text-center text-xs font-black text-navy">{l.qty}</span>
                        <button
                          type="button"
                          onClick={() => setQty(l.key, 1)}
                          aria-label={t("cd.store.qty")}
                          className="flex h-5 w-5 items-center justify-center rounded-pill border border-line text-muted hover:border-saffron hover:text-saffron"
                        >
                          <Icon name="plus" className="h-2.5 w-2.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeLine(l.key)}
                          aria-label={t("cd.store.remove")}
                          className="ml-1 text-muted transition-colors hover:text-saffron"
                        >
                          <Icon name="trash" className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    </span>
                    <span className="shrink-0 text-xs font-black text-navy">{inr(l.price * l.qty)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
                <span className="text-xs font-extrabold text-muted">{t("cd.store.total")}</span>
                <span className="text-base font-black text-navy">{inr(total)}</span>
              </div>
              <button
                type="button"
                onClick={() => setStep("pay")}
                className="mt-3 w-full rounded-control bg-saffron py-2.5 text-sm font-extrabold text-snow transition-opacity hover:opacity-90"
              >
                {t("cd.store.continue")}
              </button>
            </>
          ) : (
            <>
              <div className="mt-3 space-y-1.5 text-xs font-bold text-muted">
                <p className="flex justify-between"><span>{t("cd.store.items", { n: count })}</span><span>{inr(total)}</span></p>
                <p className="flex justify-between"><span>{t("cd.store.delivery")}</span><span className="text-neem">{t("cd.store.free")}</span></p>
              </div>
              <p className="mt-3 flex items-start gap-1.5 rounded-control bg-ink/10 px-2.5 py-2 text-[11px] font-bold text-ink">
                <Icon name="shield" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span className="min-w-0">
                  <b className="font-extrabold">{t("cd.store.idas")}:</b> {session.name}, {profile.phone}
                  <span className="mt-0.5 block font-bold text-muted">{t("cd.store.idnote")}</span>
                </span>
              </p>
              <p className="mt-2 flex items-start gap-1.5 rounded-control bg-chuna px-2.5 py-2 text-[11px] font-bold text-navy">
                <Icon name="mapPin" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-saffron" />
                <span className="min-w-0"><b className="font-extrabold">{t("cd.store.ship")}:</b> {shipTo}</span>
              </p>
              <p className="mt-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted">{t("cd.store.paynote")}</p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep("cart")}
                  className="rounded-control border border-line px-3 py-2.5 text-xs font-extrabold text-navy transition-colors hover:border-saffron hover:text-saffron"
                >
                  {t("cd.store.back")}
                </button>
                <button
                  type="button"
                  onClick={placeOrder}
                  className="flex-1 rounded-control bg-saffron py-2.5 text-sm font-extrabold text-snow transition-opacity hover:opacity-90"
                >
                  {t("cd.store.place")}
                </button>
              </div>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}