"use client";
import { useEffect, useMemo, useState } from "react";
import {
  AISLES, BRANDS, FAMS, PRODUCTS, STORES, brandOf, cheapest, offPct,
  priceAt, storesFor, type Product,
} from "@/lib/marketplace";
import { addLine, cartCount, requestCartOpen, useCart } from "@/lib/cartStore";
import { Icon } from "@/components/Icons";
import { useI18n } from "@/i18n";
import { FilterBar, type Toggles } from "./FilterBar";
import { ProductCard } from "./ProductCard";
import { StoreCard } from "./StoreCard";
import { ProductModal } from "./ProductModal";
import { CompareModal, CompareTray } from "./Compare";

const SORTS = ["pop", "lo", "hi", "rat", "dis"] as const;
type Sort = (typeof SORTS)[number];

/* localStorage helpers — wishlist + recently-viewed survive refreshes,
   the way Asian Paints / UC remember you between visits. */
function readList(key: string): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    const v = raw ? (JSON.parse(raw) as number[]) : [];
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export function MarketplaceBrowser() {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [suggest, setSuggest] = useState(false);
  const [aisle, setAisle] = useState("all");
  const [packs, setPacks] = useState<number[]>([]);
  const [fins, setFins] = useState<string[]>([]);
  const [rating, setRating] = useState(0);
  const [budget, setBudget] = useState<[number, number]>([200, 7000]);
  const [fam, setFam] = useState("");
  const [storeId, setStoreId] = useState("");
  const [toggles, setToggles] = useState<Toggles>({ stock: false, open: false, offer: false });
  const [sort, setSort] = useState<Sort>("pop");
  const [wish, setWish] = useState<number[]>(() => readList("pt_wish"));
  const [recent, setRecent] = useState<number[]>(() => readList("pt_recent"));
  const [compare, setCompare] = useState<number[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [modal, setModal] = useState<Product | null>(null);
  const [toast, setToast] = useState("");
  const cartLines = useCart();

  useEffect(() => {
    try { window.localStorage.setItem("pt_wish", JSON.stringify(wish)); } catch { /* private mode */ }
  }, [wish]);
  useEffect(() => {
    try { window.localStorage.setItem("pt_recent", JSON.stringify(recent)); } catch { /* private mode */ }
  }, [recent]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(""), 2400);
    return () => clearTimeout(id);
  }, [toast]);

  useEffect(() => {
    document.body.style.overflow = modal || compareOpen ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setModal(null); setCompareOpen(false); setSuggest(false); }
    };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", onKey); };
  }, [modal, compareOpen]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: PRODUCTS.length };
    for (const a of AISLES) c[a.key] = PRODUCTS.filter((p) => p.cat === a.key).length;
    return c;
  }, []);

  /* Type-ahead suggestions: name/brand/pack matches while you type. */
  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return PRODUCTS.filter((p) => `${p.n} ${p.b} ${brandOf(p.b).name} ${p.cat}`.toLowerCase().includes(q)).slice(0, 6);
  }, [query]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const near = STORES.filter((s) => s.km <= 3).map((s) => s.id);
    const openStores = STORES.filter((s) => s.open).map((s) => s.id);
    const list = PRODUCTS.filter((p) => {
      if (q) {
        const hay = `${p.n} ${p.b} ${brandOf(p.b).name} ${p.cat} ${p.fin}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (aisle !== "all" && p.cat !== aisle) return false;
      if (packs.length && !packs.includes(p.size)) return false;
      if (fins.length && !fins.includes(p.fin)) return false;
      if (rating && p.r < rating) return false;
      if (p.price < budget[0]) return false;
      if (budget[1] < 7000 && p.price > budget[1]) return false;
      if (fam && p.fam !== fam) return false;
      if (storeId && !storesFor(p).some((s) => s.id === storeId)) return false;
      if (toggles.open && !storesFor(p).some((s) => openStores.includes(s.id))) return false;
      if (toggles.stock && !storesFor(p).some((s) => near.includes(s.id))) return false;
      if (toggles.offer && offPct(p) < 8) return false;
      return true;
    });
    const by: Record<Sort, (a: Product, b: Product) => number> = {
      pop: (a, b) => b.sold - a.sold,
      lo: (a, b) => a.price - b.price,
      hi: (a, b) => b.price - a.price,
      rat: (a, b) => b.r - a.r,
      dis: (a, b) => offPct(b) - offPct(a),
    };
    return [...list].sort(by[sort]);
  }, [query, aisle, packs, fins, rating, budget, fam, storeId, toggles, sort]);

  const addProduct = (p: Product, sid?: string) => {
    const s = sid ? STORES.find((x) => x.id === sid)! : cheapest(p).s;
    addLine({ key: `${p.id}@${s.id}`, title: p.n, meta: `${p.size === 40 ? "40 kg" : `${p.size} L`} · ${s.n}`, price: priceAt(p, s), storeId: s.id, qty: 1 });
    setToast(`✓ ${p.n} — ${s.n.split(" ")[0]}`);
  };
  const openModal = (p: Product) => {
    setModal(p);
    setSuggest(false);
    setRecent((r) => [p.id, ...r.filter((x) => x !== p.id)].slice(0, 8));
  };
  const toggleCompare = (id: number) =>
    setCompare((c) => (c.includes(id) ? c.filter((x) => x !== id) : c.length >= 3 ? [...c.slice(1), id] : [...c, id]));
  const clearAll = () => {
    setQuery(""); setAisle("all"); setPacks([]); setFins([]); setRating(0);
    setBudget([200, 7000]); setFam(""); setStoreId(""); setToggles({ stock: false, open: false, offer: false });
  };

  const chips: { label: string; clear: () => void }[] = [];
  if (query) chips.push({ label: `“${query}”`, clear: () => setQuery("") });
  if (aisle !== "all") chips.push({ label: AISLES.find((a) => a.key === aisle)?.label ?? aisle, clear: () => setAisle("all") });
  packs.forEach((v) => chips.push({ label: v === 40 ? "40 kg" : `${v} L`, clear: () => setPacks((p) => p.filter((x) => x !== v)) }));
  fins.forEach((v) => chips.push({ label: v, clear: () => setFins((f) => f.filter((x) => x !== v)) }));
  if (rating) chips.push({ label: `${rating}★+`, clear: () => setRating(0) });
  if (budget[0] !== 200 || budget[1] !== 7000) chips.push({ label: `₹${budget[0]}–${budget[1]}${budget[1] === 7000 ? "+" : ""}`, clear: () => setBudget([200, 7000]) });
  if (fam) chips.push({ label: FAMS.find((f) => f.key === fam)?.label ?? fam, clear: () => setFam("") });
  if (storeId) chips.push({ label: STORES.find((s) => s.id === storeId)?.n ?? storeId, clear: () => setStoreId("") });
  if (toggles.stock) chips.push({ label: t("mk.stock"), clear: () => setToggles((g) => ({ ...g, stock: false })) });
  if (toggles.open) chips.push({ label: t("mk.open"), clear: () => setToggles((g) => ({ ...g, open: false })) });
  if (toggles.offer) chips.push({ label: t("mk.offer"), clear: () => setToggles((g) => ({ ...g, offer: false })) });

  const avg = (STORES.reduce((a, s) => a + s.r, 0) / STORES.length).toFixed(1);
  const recentItems = recent.map((id) => PRODUCTS.find((p) => p.id === id)).filter((p): p is Product => !!p);

  return (
    <>
      <div className="mk-stage">
        <svg className="mk-stage-art" aria-hidden="true" focusable="false">
          <defs>
            <filter id="mkBlur"><feGaussianBlur stdDeviation="34" /></filter>
            <linearGradient id="mkRibbon" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#e00048" stopOpacity="0" />
              <stop offset="55%" stopColor="#e00048" />
              <stop offset="100%" stopColor="#a80036" />
            </linearGradient>
          </defs>
          <g filter="url(#mkBlur)">
            <circle cx="-40" cy="90" r="120" fill="#e00048" opacity=".4" />
            <circle cx="102%" cy="60" r="140" fill="#a80036" opacity=".32" />
            <circle cx="55%" cy="-60" r="150" fill="#e00048" opacity=".26" />
          </g>
          <g fill="none" stroke="url(#mkRibbon)" strokeLinecap="round" opacity=".5" filter="url(#mkBlur)">
            <path d="M-20 300 C 240 240, 420 360, 700 300 S 1180 240, 1460 300" strokeWidth="26" />
            <path d="M-20 340 C 260 290, 460 400, 760 340 S 1200 290, 1460 350" strokeWidth="14" />
          </g>
        </svg>
        <div className="relative mx-auto max-w-6xl px-4 pt-10 md:px-8 md:pt-14">
          <span className="inline-block rounded-pill bg-saffron/10 px-4 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-saffron">{t("mk.eyebrow")}</span>
          <h1 className="mt-2 text-4xl font-black text-navy dark:text-snow">{t("mk.h1")}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted md:text-base">{t("mk.sub")}</p>
          <div className="relative mt-6 flex min-h-11 items-center gap-2 rounded-pill border border-line bg-white p-1.5 pl-3 shadow-card dark:bg-raatri">
            <span className="flex items-center gap-1.5 whitespace-nowrap rounded-pill bg-chuna px-3 py-1.5 text-xs font-extrabold text-ink dark:bg-[#12161a] dark:text-snow">
              <Icon name="mapPin" className="h-3.5 w-3.5 text-saffron" /> Vadodara 390001
            </span>
            <button type="button" className="whitespace-nowrap text-xs font-black text-saffron">{t("mk.change")}</button>
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSuggest(true); }}
              onFocus={() => setSuggest(true)}
              placeholder={t("mk.searchPh")}
              className="min-w-0 flex-1 bg-transparent px-2 text-sm font-semibold text-ink placeholder:font-semibold placeholder:text-muted focus:outline-none dark:text-snow"
            />
            <button type="button" className="min-h-9 whitespace-nowrap rounded-pill bg-saffron px-5 py-2 text-sm font-extrabold text-snow transition-colors hover:bg-[#a80036]">{t("mk.search")}</button>
            {suggest && suggestions.length > 0 && (
              <ul className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 overflow-hidden rounded-card border border-line bg-white py-1 shadow-lift dark:bg-raatri">
                {suggestions.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onMouseDown={() => openModal(p)}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-chuna dark:hover:bg-[#12161a]"
                    >
                      <span className="h-6 w-6 flex-none rounded-pill border border-line" style={{ background: p.sh[1] }} aria-hidden="true" />
                      <span className="min-w-0 flex-1 truncate text-sm font-extrabold text-ink dark:text-snow">{p.n}</span>
                      <span className="text-xs font-bold text-muted">{p.size === 40 ? "40 kg" : `${p.size} L`}</span>
                      <span className="text-sm font-black text-saffron">₹{p.price.toLocaleString("en-IN")}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-extrabold text-ink dark:text-snow">
            {([["✅", t("mk.trust.verified")], ["🧾", t("mk.trust.gst")], ["📦", t("mk.trust.return")], ["🎨", t("mk.trust.shade")], ["⚡", t("mk.trust.pickup")], ["🔒", t("mk.trust.escrow")]] as const).map(([e, label]) => (
              <li key={label} className="flex items-center gap-1.5"><span aria-hidden="true">{e}</span>{label}</li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap gap-3">
            {([[String(STORES.length), t("mk.stats.stores")], [String(BRANDS.length), t("mk.stats.brands")], [String(PRODUCTS.length), t("mk.stats.products")], [`${avg}★`, t("mk.stats.rating")], ["18%", t("mk.stats.gst")]] as const).map(([v, label]) => (
              <div key={label} className="mk-glass min-w-[150px] flex-1 rounded-card border border-line px-4 py-3">
                <b className="text-2xl font-black text-ink dark:text-snow">{v}</b>
                <p className="text-xs font-bold text-muted">{label}</p>
              </div>
            ))}
          </div>
          <FilterBar
            aisle={aisle} counts={counts} onAisle={setAisle}
            budget={budget} onBudget={setBudget}
            packs={packs} onPacks={(v) => setPacks((p) => (p.includes(v) ? p.filter((x) => x !== v) : [...p, v]))}
            fins={fins} onFins={(v) => setFins((f) => (f.includes(v) ? f.filter((x) => x !== v) : [...f, v]))}
            rating={rating} onRating={setRating}
            toggles={toggles} onToggle={(k) => setToggles((g) => ({ ...g, [k]: !g[k] }))}
          />
          {chips.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {chips.map((c) => (
                <button key={c.label} type="button" onClick={c.clear} className="flex items-center gap-1.5 rounded-pill bg-saffron/10 px-3 py-1 text-xs font-extrabold text-saffron transition-colors hover:bg-saffron hover:text-snow">
                  {c.label} <span aria-hidden="true">✕</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="mk-fade" aria-hidden="true" />

      {/* Sticky result toolbar — count + sort + clear stay with you while
          the grid scrolls (UC-style persistent controls). */}
      <div className="sticky top-16 z-30 border-b border-line/60 bg-[rgb(var(--c-surface))]/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-3 px-4 py-2 md:px-8">
          <p className="text-sm font-extrabold text-ink dark:text-snow">{filtered.length} <span className="font-bold text-muted">{t("mk.count")}</span></p>
          <div className="ml-auto flex items-center gap-2">
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label={t("mk.sort.pop")} className="min-h-10 rounded-control border border-line bg-white px-3 py-2 text-sm font-extrabold text-ink focus:border-saffron focus:outline-none dark:bg-raatri dark:text-snow">
              {SORTS.map((s) => <option key={s} value={s}>{t(`mk.sort.${s}`)}</option>)}
            </select>
            <button type="button" onClick={clearAll} className="min-h-10 rounded-control border border-line bg-white px-4 py-2 text-sm font-extrabold text-ink transition-colors hover:border-saffron hover:text-saffron dark:bg-raatri dark:text-snow">{t("mk.clear")}</button>
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-[1280px] px-4 pb-4 pt-4 md:px-8">
        {filtered.length === 0 ? (
          <div className="rounded-sheet border border-dashed border-line bg-chuna px-6 py-16 text-center dark:bg-raatri">
            <p className="text-sm font-extrabold text-muted">{t("mk.empty")}</p>
            <button type="button" onClick={clearAll} className="mt-4 min-h-11 rounded-control bg-saffron px-6 py-2.5 text-sm font-extrabold text-snow hover:bg-[#a80036]">{t("mk.clear")}</button>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 min-[1200px]:grid-cols-4">
            {filtered.map((p) => (
              <ProductCard
                key={p.id} p={p}
                wished={wish.includes(p.id)}
                onWish={(id) => setWish((w) => (w.includes(id) ? w.filter((x) => x !== id) : [...w, id]))}
                onAdd={(x) => addProduct(x)}
                onOpen={openModal}
                comparing={compare.includes(p.id)}
                onCompare={toggleCompare}
              />
            ))}
          </div>
        )}
      </section>

      {recentItems.length > 0 && (
        <section className="mx-auto max-w-[1280px] px-4 py-8 md:px-8">
          <h2 className="text-[22px] font-black text-navy md:text-[26px] dark:text-snow">{t("mk.recent")}</h2>
          <div className="mk-rail mt-4">
            {recentItems.map((p) => (
              <button
                key={p.id} type="button" onClick={() => openModal(p)}
                className="w-[220px] flex-none overflow-hidden rounded-card border border-line bg-white text-left shadow-card transition-all hover:-translate-y-1 hover:border-saffron dark:bg-raatri"
              >
                <span className="block h-14" style={{ backgroundImage: `linear-gradient(135deg, ${p.sh[0]}, ${p.sh[2]})` }} aria-hidden="true" />
                <span className="block p-3">
                  <span className="mk-clamp2 block text-sm font-extrabold text-navy dark:text-snow">{p.n}</span>
                  <span className="mt-1 block text-sm font-black text-ink dark:text-snow">₹{p.price.toLocaleString("en-IN")}</span>
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="mt-10 border-y border-line bg-chuna py-14 md:py-[72px] dark:bg-raatri">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <h2 className="text-[22px] font-black text-navy md:text-[26px] dark:text-snow">{t("mk.storesTitle")}</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted">{t("mk.storesSub")}</p>
        </div>
        <div className="mk-rail mx-auto mt-6 max-w-[1400px] px-4 md:px-8">
          {STORES.map((s) => <StoreCard key={s.id} s={s} active={storeId === s.id} onPick={(id) => setStoreId((cur) => (cur === id ? "" : id))} />)}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 md:px-8 md:py-[72px]">
        <h2 className="text-[22px] font-black text-navy md:text-[26px] dark:text-snow">{t("mk.shadesTitle")}</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted">{t("mk.shadesSub")}</p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => setFam("")} className={`rounded-pill border px-4 py-2 text-xs font-extrabold transition-colors ${fam === "" ? "border-saffron bg-saffron text-snow" : "border-line bg-white text-ink hover:border-saffron hover:text-saffron dark:bg-raatri dark:text-snow"}`}>{t("mk.anyColour")}</button>
          {FAMS.map((f) => (
            <button
              key={f.key} type="button" title={f.label} aria-label={f.label} aria-pressed={fam === f.key}
              onClick={() => setFam((cur) => (cur === f.key ? "" : f.key))}
              className={`h-[52px] w-[52px] rounded-card border-2 transition-transform hover:scale-105 ${fam === f.key ? "border-saffron ring-2 ring-saffron/30" : "border-line"}`}
              style={{ background: f.c }}
            />
          ))}
        </div>
      </section>

      <ProductModal p={modal} onClose={() => setModal(null)} onAddAt={(p, sid) => addProduct(p, sid)} />
      <CompareTray ids={compare} onRemove={(id) => setCompare((c) => c.filter((x) => x !== id))} onClear={() => setCompare([])} onOpen={() => setCompareOpen(true)} />
      {compareOpen && <CompareModal ids={compare} onClose={() => setCompareOpen(false)} onAdd={(p) => addProduct(p)} />}
      <button
        type="button"
        onClick={requestCartOpen}
        aria-label={t("mk.cart.title")}
        className={`fixed right-5 z-40 flex h-14 w-14 items-center justify-center rounded-pill bg-saffron text-snow shadow-lift transition-all hover:scale-105 ${compare.length > 0 ? "bottom-24" : "bottom-5"}`}
      >
        <Icon name="cart" className="h-6 w-6" />
        {cartCount(cartLines) > 0 && (
          <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-pill border-2 border-snow bg-navy px-1 text-xs font-black text-snow">{cartCount(cartLines)}</span>
        )}
      </button>
      {toast && <div className="mk-toast rounded-pill bg-navy px-5 py-3 text-sm font-extrabold text-snow shadow-lift dark:bg-[#12161a]">{toast}</div>}
    </>
  );
}