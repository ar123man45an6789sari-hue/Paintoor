/* Live catalog — shop details, product publishing, photos, stock and removal,
   straight from the database. Changes apply optimistically where safe and are
   confirmed by the server otherwise; any rejection rolls the row back and
   explains itself in plain words. */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  adjustStock, deleteProduct, explain, fetchShop, inr, saveProduct, saveShopDetails,
  type LiveProduct, type LiveShop, type ProductDraft,
} from "@/lib/liveShop";

const CATEGORIES = ["interior", "exterior", "primer", "putty", "wood", "metal", "tools"];
const FINISHES = ["matte", "satin", "gloss"];

type Draft = {
  id: string | null;
  name: string;
  brand: string;
  category: string;
  finish: string;
  sizeL: string;
  price: string;
  mrp: string;
  stock: string;
  listed: boolean;
};

const EMPTY: Draft = {
  id: null, name: "", brand: "", category: "interior", finish: "matte",
  sizeL: "10", price: "", mrp: "", stock: "0", listed: true,
};

function fromPayload(d: ProductDraft, id: string, prev: LiveProduct | null): LiveProduct {
  return {
    id,
    brand: d.brand ?? prev?.brand ?? "",
    name: d.name,
    category: d.category,
    finish: d.finish ?? prev?.finish ?? "matte",
    sizeL: String(d.sizeL),
    pricePaise: d.pricePaise,
    mrpPaise: d.mrpPaise ?? prev?.mrpPaise ?? d.pricePaise,
    stock: d.stock,
    listed: d.listed,
    removedByAdmin: prev?.removedByAdmin ?? false,
    createdAt: prev?.createdAt ?? new Date().toISOString(),
    imageUrl: d.imageUrl ?? prev?.imageUrl ?? null,
    hasImage: prev?.hasImage ?? false,
  };
}

function photoSrc(p: LiveProduct): string | null {
  if (p.hasImage) return `/api/media/product/${p.id}`;
  return p.imageUrl;
}

export function LiveCatalog({ section = "catalog" }: { section?: "catalog" | "stock" }) {
  const [shop, setShop] = useState<LiveShop | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [details, setDetails] = useState({ name: "", address: "", city: "", zone: "", gstin: "" });
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [photoTarget, setPhotoTarget] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [editPhoto, setEditPhoto] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const reload = useCallback(async () => {
    const s = await fetchShop();
    setShop(s);
    setLoaded(true);
    if (s) setDetails({ name: s.name, address: s.address, city: s.city, zone: s.zone, gstin: s.gstin ?? "" });
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);
    useEffect(() => {
    if (!note) return;
    const t = setTimeout(() => setNote(null), 5000);
    return () => clearTimeout(t);
  }, [note]);

  const patch = useCallback((fn: (p: LiveProduct) => LiveProduct) => {
    setShop((s) => (s ? { ...s, products: s.products.map(fn) } : s));
  }, []);

  function pickFile(f: File | null) {
    setPendingFile(f);
    setPreview((old) => {
      if (old) URL.revokeObjectURL(old);
      return f ? URL.createObjectURL(f) : null;
    });
  }

  async function uploadPhoto(id: string, file: File) {
    const fd = new FormData();
    fd.append("file", file);
    try {
      const r = await fetch(`/api/shop/products/${id}/image`, { method: "POST", body: fd });
      const j = (await r.json().catch(() => null)) as { ok: boolean; error?: string } | null;
      if (!r.ok || !j?.ok) {
        setNote(explain(j?.error ?? `http_${r.status}`));
        return;
      }
      patch((x) => (x.id === id ? { ...x, hasImage: true } : x));
      setNote("Photo uploaded.");
    } catch {
      setNote(explain("network"));
    }
  }

  async function saveDetails() {
    setSaving(true);
    const res = await saveShopDetails({
      name: details.name, address: details.address, city: details.city,
      zone: details.zone, gstin: details.gstin || undefined,
    });
    setSaving(false);
    setNote(res.ok ? "Shop details saved." : explain(res.error));
    if (res.ok) void reload();
  }

  async function submitProduct() {
    const price = Math.round(Number(draft.price) * 100);
    const sizeL = Number(draft.sizeL);
    if (draft.name.trim().length < 2) return setNote("Product name needs at least 2 characters.");
    if (!(price > 0)) return setNote("Enter a selling price above zero.");
    const mrpCheck = draft.mrp ? Math.round(Number(draft.mrp) * 100) : 0;
    if (draft.mrp && mrpCheck < price) return setNote("MRP cannot be lower than the selling price.");
    const payload: ProductDraft = {
      id: draft.id ?? undefined,
      brand: draft.brand.trim() || undefined,
      name: draft.name.trim(),
      category: draft.category,
      finish: draft.finish,
      sizeL,
      pricePaise: price,
      mrpPaise: draft.mrp ? Math.round(Number(draft.mrp) * 100) : undefined,
      stock: Number(draft.stock || 0),
      listed: draft.listed,
    };
    setSaving(true);
    const res = await saveProduct(payload);
    setSaving(false);
    if (!res.ok) return setNote(explain(res.error));
    const id = draft.id ?? res.data.productId;
    const existed = (shop?.products ?? []).some((p) => p.id === id);
    setShop((s) =>
      s
        ? {
            ...s,
            products: existed
              ? s.products.map((p) => (p.id === id ? fromPayload(payload, id, p) : p))
              : [fromPayload(payload, id, null), ...s.products],
          }
        : s,
    );
    setNote(draft.id ? "Product updated." : "Product added.");
    const file = pendingFile;
    pickFile(null);
    setDraft(EMPTY);
    if (file) await uploadPhoto(id, file);
    void reload();
  }

  function quickStock(p: LiveProduct, delta: number) {
    patch((x) => (x.id === p.id ? { ...x, stock: Math.max(0, x.stock + delta) } : x));
    void adjustStock(p.id, delta).then(async (res) => {
      if (!res.ok) {
        setNote(explain(res.error));
        await reload();
      }
    });
  }

  async function toggleListed(p: LiveProduct) {
    if (p.removedByAdmin) return;
    const before = p.listed;
    patch((x) => (x.id === p.id ? { ...x, listed: !before } : x));
    const res = await saveProduct({
      id: p.id, brand: p.brand, name: p.name, category: p.category, finish: p.finish,
      sizeL: Number(p.sizeL), pricePaise: p.pricePaise, mrpPaise: p.mrpPaise,
      stock: p.stock, listed: !before, imageUrl: p.imageUrl ?? undefined,
    });
    if (!res.ok) {
      patch((x) => (x.id === p.id ? { ...x, listed: before } : x));
      setNote(explain(res.error));
      return;
    }
    setNote(before ? "Hidden from the marketplace." : "Published to the marketplace.");
  }

  async function removeProduct(p: LiveProduct) {
    setConfirmId(null);
    const res = await deleteProduct(p.id);
    if (!res.ok) {
      setNote(explain(res.error));
      return;
    }
    setShop((s) => (s ? { ...s, products: s.products.filter((x) => x.id !== p.id) } : s));
    setNote("Product deleted from the platform.");
  }

  function edit(p: LiveProduct) {
    setDraft({
      id: p.id, name: p.name, brand: p.brand, category: p.category, finish: p.finish,
      sizeL: String(Number(p.sizeL)), price: String(p.pricePaise / 100),
      mrp: String(p.mrpPaise / 100), stock: String(p.stock), listed: p.listed,
    });
    setEditPhoto(photoSrc(p));
    setNote(null);
  }

  const products = shop?.products ?? [];

  return (
    <div className="space-y-5 p-4 lg:p-6">
      <header>
        <h2 className="text-lg font-extrabold text-navy dark:text-snow">
          {section === "stock" ? "Stock control" : "Catalog"}
        </h2>
        <p className="text-xs font-semibold text-muted">
          Live from the database — changes appear for every buyer the moment you make them.
        </p>
      </header>

      {note && (
        <div className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center px-4 lg:bottom-8">
          <p className="pointer-events-auto max-w-md rounded-control border border-line bg-navy px-4 py-2 text-center text-xs font-bold text-snow shadow-lift">
            {note}
          </p>
        </div>
      )}

      {loaded && !shop && (
        <div className="rounded-card border border-line bg-white p-6 shadow-card dark:bg-navy">
          <p className="text-sm font-extrabold text-navy dark:text-snow">Set up your shop</p>
          <p className="mt-1 text-xs font-semibold text-muted">Save your shop details once, then start adding products.</p>
        </div>
      )}

      {section === "catalog" && (
        <section className="rounded-card border border-line bg-white p-5 shadow-card dark:bg-navy">
          <h3 className="text-sm font-extrabold text-navy dark:text-snow">Shop details</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Field label="Shop name" value={details.name} onChange={(v) => setDetails({ ...details, name: v })} />
            <Field label="City" value={details.city} onChange={(v) => setDetails({ ...details, city: v })} />
            <Field label="Address" value={details.address} onChange={(v) => setDetails({ ...details, address: v })} />
            <Field label="Zone" value={details.zone} onChange={(v) => setDetails({ ...details, zone: v })} />
            <Field label="GSTIN (15 characters)" value={details.gstin} onChange={(v) => setDetails({ ...details, gstin: v.toUpperCase() })} />
          </div>
          <button
            type="button"
            disabled={saving}
            onClick={() => void saveDetails()}
            className="mt-4 rounded-control bg-saffron px-4 py-2 text-xs font-extrabold text-snow hover:shadow-lift disabled:opacity-40"
          >
            Save shop details
          </button>
        </section>
      )}

      {section === "catalog" && (
        <section className="rounded-card border border-line bg-white p-5 shadow-card dark:bg-navy">
          <h3 className="text-sm font-extrabold text-navy dark:text-snow">
            {draft.id ? "Edit product" : "Add a product"}
          </h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Product name" value={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} />
            <Field label="Brand" value={draft.brand} onChange={(v) => setDraft({ ...draft, brand: v })} />
            <Pick label="Category" value={draft.category} options={CATEGORIES} onChange={(v) => setDraft({ ...draft, category: v })} />
            <Pick label="Finish" value={draft.finish} options={FINISHES} onChange={(v) => setDraft({ ...draft, finish: v })} />
            <Field label="Pack size (L or kg)" value={draft.sizeL} type="number" onChange={(v) => setDraft({ ...draft, sizeL: v })} />
            <Field label="Selling price (Rs)" value={draft.price} type="number" onChange={(v) => setDraft({ ...draft, price: v })} />
            <Field label="MRP (Rs)" value={draft.mrp} type="number" onChange={(v) => setDraft({ ...draft, mrp: v })} />
            <Field label="Stock" value={draft.stock} type="number" onChange={(v) => setDraft({ ...draft, stock: v })} />
            <label className="flex items-center gap-2 self-end pb-2 text-xs font-extrabold text-navy dark:text-snow">
              <input
                type="checkbox"
                checked={draft.listed}
                onChange={(e) => setDraft({ ...draft, listed: e.target.checked })}
                className="h-4 w-4"
              />
              Published on marketplace
            </label>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <label className="rounded-control border-2 border-line px-3 py-2 text-xs font-extrabold text-navy hover:border-saffron hover:text-saffron dark:text-snow">
              Upload photo from device
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
              />
            </label>
            {preview && (
              <img src={preview} alt="" className="h-20 w-20 rounded-control border-2 border-line object-cover" />
            )}
            {pendingFile && (
              <span className="text-[10px] font-bold text-muted">
                {pendingFile.name} · {Math.round(pendingFile.size / 1000)} KB
              </span>
            )}
              {!preview && editPhoto && draft.id && (
              <img src={editPhoto} alt="" className="h-20 w-20 rounded-control border-2 border-line object-cover" />
            )}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={() => void submitProduct()}
              className="rounded-control bg-saffron px-4 py-2 text-xs font-extrabold text-snow hover:shadow-lift disabled:opacity-40"
            >
                            {saving ? "Saving…" : draft.id ? "Update product" : "Add product"}
            </button>
            {draft.id && (
              <button
                type="button"
                onClick={() => { setDraft(EMPTY);setEditPhoto(null); pickFile(null); setNote(null); }}
                className="rounded-control border-2 border-line px-4 py-2 text-xs font-extrabold text-muted hover:border-navy hover:text-navy"
              >
                Cancel edit
              </button>
            )}
          </div>
        </section>
      )}

      <section className="rounded-card border border-line bg-white p-4 shadow-card sm:p-5 dark:bg-navy">
        <h3 className="text-sm font-extrabold text-navy dark:text-snow">
          Products <span className="text-xs font-bold text-muted">({products.length})</span>
        </h3>
        {!loaded && <p className="mt-3 text-xs font-bold text-muted">Loading…</p>}
        {loaded && products.length === 0 && (
          <p className="mt-3 text-xs font-semibold text-muted">
            No products yet. Add the first one above and it goes live on the marketplace instantly.
          </p>
        )}
        <ul className="mt-2 divide-y divide-line">
          {products.map((p) => (
            <li key={p.id} className="flex flex-col gap-3 py-3 lg:flex-row lg:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <Thumb p={p} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-extrabold text-navy dark:text-snow">{p.name}</p>
                  <p className="truncate text-xs font-semibold text-muted">
                    {p.brand || "—"} · {p.category} · {p.finish} · {Number(p.sizeL)} L
                    {p.removedByAdmin ? " · removed by admin" : ""}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 lg:justify-end">
                <p className="text-xs font-extrabold tabular-nums text-saffron">
                  {inr(p.pricePaise)}
                  {p.mrpPaise > p.pricePaise && (
                    <span className="ml-1 font-bold text-muted line-through">{inr(p.mrpPaise)}</span>
                  )}
                </p>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => quickStock(p, -1)}
                    className="h-9 w-9 rounded-control border-2 border-line text-base font-black text-navy hover:border-saffron hover:text-saffron dark:text-snow"
                    aria-label={`Reduce stock of ${p.name}`}
                  >
                    −
                  </button>
                  <span className={`w-10 text-center text-sm font-extrabold tabular-nums ${p.stock === 0 ? "text-danger" : "text-navy dark:text-snow"}`}>
                    {p.stock}
                  </span>
                  <button
                    type="button"
                    onClick={() => quickStock(p, 1)}
                    className="h-9 w-9 rounded-control border-2 border-line text-base font-black text-navy hover:border-saffron hover:text-saffron dark:text-snow"
                    aria-label={`Add stock of ${p.name}`}
                  >
                    +
                  </button>
                </div>
                <span className={`rounded-pill border px-2.5 py-1 text-[10px] font-extrabold ${p.listed ? "border-neem text-neem" : "border-line text-muted"}`}>
                  {p.listed ? "live" : "hidden"}
                </span>
                {section === "catalog" && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => { setPhotoTarget(p.id); fileRef.current?.click(); }}
                      className="rounded-control border-2 border-line px-3 py-1.5 text-xs font-extrabold text-muted hover:border-saffron hover:text-saffron"
                    >
                      Photo
                    </button>
                    <button
                      type="button"
                      onClick={() => edit(p)}
                      className="rounded-control border-2 border-navy px-3 py-1.5 text-xs font-extrabold text-navy hover:bg-navy hover:text-onnavy dark:border-snow dark:text-snow"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={p.removedByAdmin}
                      onClick={() => void toggleListed(p)}
                      className="rounded-control border-2 border-line px-3 py-1.5 text-xs font-extrabold text-muted hover:border-saffron hover:text-saffron disabled:opacity-40"
                    >
                      {p.listed ? "Unlist" : "List"}
                    </button>
                    {confirmId === p.id ? (
                      <span className="flex items-center gap-2 rounded-control bg-danger/10 px-2 py-1">
                        <span className="text-[10px] font-black text-danger">Delete forever?</span>
                        <button
                          type="button"
                          onClick={() => void removeProduct(p)}
                          className="rounded-control bg-danger px-2.5 py-1 text-[10px] font-black text-snow"
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmId(null)}
                          className="rounded-control border border-line px-2.5 py-1 text-[10px] font-black text-muted"
                        >
                          No
                        </button>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmId(p.id)}
                        className="rounded-control border-2 border-line px-3 py-1.5 text-xs font-extrabold text-muted hover:border-danger hover:text-danger"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0] ?? null;
          e.target.value = "";
          if (f && photoTarget) void uploadPhoto(photoTarget, f);
          setPhotoTarget(null);
        }}
      />
    </div>
  );
}

function Thumb({ p }: { p: LiveProduct }) {
  const src = photoSrc(p);
  if (src) {
    return <img src={src} alt={p.name} loading="lazy" className="h-14 w-14 shrink-0 rounded-control border border-line object-cover" />;
  }
  return (
    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-control border border-line bg-chuna text-lg font-black text-muted">
      {(p.brand || p.name).charAt(0).toUpperCase()}
    </span>
  );
}

function Field({
  label, value, onChange, type = "text",
}: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="block">
      <span className="text-[10px] font-black uppercase tracking-wide text-muted">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 min-h-10 w-full rounded-control border-2 border-line bg-white px-3 text-xs font-bold text-navy dark:bg-transparent dark:text-snow"
      />
    </label>
  );
}

function Pick({
  label, value, options, onChange,
}: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-[10px] font-black uppercase tracking-wide text-muted">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 min-h-10 w-full rounded-control border-2 border-line bg-white px-3 text-xs font-bold capitalize text-navy dark:bg-navy dark:text-snow"
      >
        {options.map((o) => (
          <option key={o} value={o} className="capitalize">{o}</option>
        ))}
      </select>
    </label>
  );
}