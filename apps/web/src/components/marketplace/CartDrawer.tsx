import { STORES } from "@/lib/marketplace";
import { Icon } from "@/components/Icons";
import { useI18n } from "@/i18n";
import type { CartLine } from "./MarketplaceBrowser";

export function CartDrawer({
  open, lines, onClose, onQty, onRemove, onPlace,
}: {
  open: boolean; lines: CartLine[]; onClose: () => void;
  onQty: (key: string, d: number) => void; onRemove: (key: string) => void; onPlace: () => void;
}) {
  const { t } = useI18n();
  const subtotal = lines.reduce((a, l) => a + l.price * l.qty, 0);
  const delivery = subtotal === 0 || subtotal >= 2000 ? 0 : 79;
  const gst = Math.round((subtotal * 18) / 118);
  const total = subtotal + delivery;
  const groups = STORES.map((s) => ({ s, items: lines.filter((l) => l.storeId === s.id) })).filter((g) => g.items.length);
  const kitItems = lines.filter((l) => l.storeId === "kit");
  return (
    <>
      <div className={`mk-scrim ${open ? "" : "hidden"}`} onClick={onClose} aria-hidden="true" />
      <aside className={`mk-drawer ${open ? "open" : ""}`} aria-label={t("mk.cart.title")}>
        <div className="flex items-center justify-between border-b border-line p-4">
          <h2 className="flex items-center gap-2 text-lg font-black text-navy dark:text-snow">
            <Icon name="cart" className="h-5 w-5 text-saffron" /> {t("mk.cart.title")}
            <span className="rounded-pill bg-saffron/10 px-2 py-0.5 text-xs font-black text-saffron">{lines.reduce((a, l) => a + l.qty, 0)}</span>
          </h2>
          <button type="button" onClick={onClose} aria-label={t("mk.close")} className="flex h-9 w-9 items-center justify-center rounded-pill border border-line text-muted transition-colors hover:border-saffron hover:text-saffron">
            <Icon name="close" className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {lines.length === 0 && <p className="py-10 text-center text-sm text-muted">{t("mk.cart.empty")}</p>}
          {kitItems.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-saffron">{t("mk.calc.kit")}</p>
              <ul className="mt-2 space-y-2">{kitItems.map((l) => <Line key={l.key} l={l} onQty={onQty} onRemove={onRemove} />)}</ul>
            </div>
          )}
          {groups.map(({ s, items }) => (
            <div key={s.id} className="mb-4">
              <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-muted">
                <Icon name="store" className="h-3.5 w-3.5 text-saffron" /> {s.n}
                <span className="font-bold normal-case tracking-normal text-muted">· {s.km} km · {s.km <= 3 ? t("mk.today") : t("mk.tomorrow")}</span>
              </p>
              <ul className="mt-2 space-y-2">{items.map((l) => <Line key={l.key} l={l} onQty={onQty} onRemove={onRemove} />)}</ul>
            </div>
          ))}
        </div>
        <div className="border-t border-line p-4">
          <dl className="space-y-1.5 text-sm">
            <div className="flex justify-between"><dt className="text-muted">{t("mk.cart.subtotal")}</dt><dd className="font-extrabold text-ink dark:text-snow">₹{subtotal.toLocaleString("en-IN")}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">{t("mk.cart.delivery")}</dt><dd className="font-extrabold text-ink dark:text-snow">{delivery === 0 ? t("mk.cart.free") : `₹${delivery}`}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">{t("mk.cart.gst")}</dt><dd className="font-extrabold text-ink dark:text-snow">₹{gst.toLocaleString("en-IN")}</dd></div>
            <div className="flex justify-between border-t border-line pt-2 text-base"><dt className="font-black text-ink dark:text-snow">{t("mk.cart.total")}</dt><dd className="font-black text-ink dark:text-snow">₹{total.toLocaleString("en-IN")}</dd></div>
          </dl>
          <p className={`mt-2 text-xs font-bold ${subtotal >= 2000 ? "text-[#0e9f8a]" : "text-saffron"}`}>
            {subtotal >= 2000 ? `🎉 ${t("mk.cart.unlocked")}` : subtotal > 0 ? t("mk.cart.hint", { x: (2000 - subtotal).toLocaleString("en-IN") }) : ""}
          </p>
          <button type="button" disabled={lines.length === 0} onClick={onPlace} className="mt-3 min-h-12 w-full rounded-control bg-saffron px-6 py-3 text-sm font-extrabold text-snow transition-colors hover:bg-[#a80036] disabled:opacity-40">
            {t("mk.cart.place")}
          </button>
          <p className="mt-2 flex items-start gap-1.5 text-xs text-muted"><Icon name="lock" className="mt-0.5 h-3.5 w-3.5 text-saffron" />{t("mk.cart.escrow")}</p>
        </div>
      </aside>
    </>
  );
}

function Line({ l, onQty, onRemove }: { l: CartLine; onQty: (k: string, d: number) => void; onRemove: (k: string) => void }) {
  const { t } = useI18n();
  return (
    <li className="rounded-card border border-line bg-white p-3 dark:bg-raatri">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-extrabold text-ink dark:text-snow">{l.title}</p>
          <p className="text-xs text-muted">{l.meta}</p>
        </div>
        <button type="button" onClick={() => onRemove(l.key)} aria-label={t("mk.remove")} className="text-muted transition-colors hover:text-saffron">
          <Icon name="close" className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="flex items-center gap-2 rounded-control border border-line px-1.5 py-1">
          <button type="button" onClick={() => onQty(l.key, -1)} aria-label="−" className="h-6 w-6 rounded-[6px] text-sm font-black text-ink hover:bg-chuna dark:text-snow">−</button>
          <b className="w-5 text-center text-sm text-ink dark:text-snow">{l.qty}</b>
          <button type="button" onClick={() => onQty(l.key, 1)} aria-label="+" className="h-6 w-6 rounded-[6px] text-sm font-black text-ink hover:bg-chuna dark:text-snow">+</button>
        </span>
        <b className="text-sm font-black text-ink dark:text-snow">₹{(l.price * l.qty).toLocaleString("en-IN")}</b>
      </div>
    </li>
  );
}