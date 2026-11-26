/* Live shelf cards — real store stock rendered inside the marketplace product
   grid, so published items sit among the rest of the catalogue. Reads through
   the published RLS policies as the anonymous role; renders nothing while no
   store has published anything, so the page never shows an empty box. */
"use client";

import { useCallback, useEffect, useState } from "react";
import { getCity, onCityChange } from "@/lib/city";
import { addLine } from "@/lib/cartStore";

type ShelfProduct = {
  id: string;
  brand: string;
  name: string;
  category: string;
  finish: string;
  sizeL: string;
  pricePaise: number;
  mrpPaise: number;
  stock: number;
  imageUrl: string | null;
  hasImage: boolean;
  shop: { id: string; name: string; city: string; zone: string } | null;
};

const rupees = (paise: number) => `Rs ${(paise / 100).toLocaleString("en-IN")}`;

export function LiveShelf() {
  const [items, setItems] = useState<ShelfProduct[] | null>(null);
  const [added, setAdded] = useState<string | null>(null);

  const load = useCallback(() => {
    fetch(`/api/market/products?city=${encodeURIComponent(getCity())}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => setItems(j && j.ok ? (j.products as ShelfProduct[]) : []))
      .catch(() => setItems([]));
  }, []);

  useEffect(() => {
    load();
    return onCityChange(load);
  }, [load]);

  if (!items || items.length === 0) return null;

  return (
    <>
      {items.map((p) => (
        <article key={p.id} className="flex flex-col rounded-card border border-line bg-white p-4 shadow-card">
                    {p.hasImage || p.imageUrl ? (
            <img src={p.hasImage ? `/api/media/product/${p.id}` : (p.imageUrl ?? undefined)} alt={p.name} loading="lazy" className="mb-3 h-32 w-full rounded-control border border-line object-cover" />
          ) : (
            <span className="mb-3 flex h-32 w-full items-center justify-center rounded-control border border-line bg-chuna text-3xl font-black text-muted">
              {(p.brand || p.name).charAt(0).toUpperCase()}
            </span>
          )}
          <p className="text-[10px] font-black uppercase tracking-wide text-muted">{p.brand || p.category}</p>
          <h3 className="mt-1 text-sm font-extrabold leading-snug text-navy">{p.name}</h3>
          <p className="mt-1 truncate text-xs font-semibold text-muted">
            {Number(p.sizeL)} L · {p.finish}
            {p.shop ? ` · ${p.shop.name}, ${p.shop.zone}` : ""}
          </p>
          <p className="mt-2 text-sm font-extrabold tabular-nums text-saffron">
            {rupees(p.pricePaise)}
            {p.mrpPaise > p.pricePaise && (
              <span className="ml-1.5 text-xs font-bold text-muted line-through">{rupees(p.mrpPaise)}</span>
            )}
          </p>
          <p className={`mt-1 text-[10px] font-black ${p.stock > 0 ? "text-neem" : "text-danger"}`}>
            {p.stock > 0 ? `${p.stock} in stock` : "Out of stock"}
          </p>
          <button
            type="button"
            disabled={p.stock <= 0}
            onClick={() => {
              addLine({
                key: `live:${p.id}`,
                title: p.name,
                meta: `${p.brand || p.category} · ${Number(p.sizeL)} L${p.shop ? ` · ${p.shop.name}` : ""}`,
                price: Math.round(p.pricePaise / 100),
                storeId: p.shop?.id ?? "live",
                qty: 1,
              });
              setAdded(p.id);
            }}
            className="mt-3 min-h-10 rounded-control bg-navy px-3 py-2 text-xs font-extrabold text-onnavy hover:shadow-lift disabled:opacity-40"
          >
            {added === p.id ? "Added to basket" : "Add to basket"}
          </button>
        </article>
      ))}
    </>
  );
}