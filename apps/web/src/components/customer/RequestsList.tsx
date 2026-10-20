/* RequestsList v4 — Open / Matched / Completed groups with job chat, booked
   OTP chip and post-job review. Cancel flow + locale dates stay from S9. */
"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/i18n";
import { cancelRequest, getRequests, onRequestsChange, reviewRequest } from "@/lib/requests";
import type { ServiceRequest } from "@/lib/requests";
import { pushNotification } from "@/lib/notifications";
import { getSession } from "@/lib/session";
import { ChatPanel } from "@/components/chat/ChatPanel";

const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

function Stars({ value, onPick }: { value: number; onPick: (n: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          aria-label={`${n}`}
          onClick={() => onPick(n)}
          className={`text-xl transition-transform hover:scale-110 ${n <= value ? "" : "opacity-25"}`}
        >
          ⭐
        </button>
      ))}
    </div>
  );
}

function RequestCard({
  r,
  myName,
  confirmId,
  setConfirmId,
}: {
  r: ServiceRequest;
  myName: string;
  confirmId: string | null;
  setConfirmId: (id: string | null) => void;
}) {
  const { lang, t } = useI18n();
  const [chatOpen, setChatOpen] = useState(false);
  const [stars, setStars] = useState(0);
  const locale = lang === "hi" ? "hi-IN" : lang === "gu" ? "gu-IN" : "en-IN";
  const matched = r.status === "interested" || r.status === "accepted";
  const done = r.status === "completed";

  return (
    <article className="rounded-card border border-line bg-white p-5 shadow-card">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-extrabold text-navy">
          {t(`sk.${r.category}`)}
          {matched && r.acceptedName ? ` · ${t("req.with", { name: r.acceptedName })}` : ""}
        </h3>
        <span
          className={`rounded-pill px-3 py-1 text-xs font-black ${
            done ? "bg-neem/15 text-neem" : matched ? "bg-saffron/15 text-saffron" : "bg-neem/15 text-neem"
          }`}
        >
          {done ? t("req.group.done") : matched ? t("req.group.matched") : t("req.open")}
        </span>
      </div>
      <p className="mt-1 text-xs text-muted">
        {r.city} · {cap(r.zone)} ·{" "}
        {r.date
          ? new Date(`${r.date}T00:00:00`).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" })
          : "—"}{" "}
        · {t(`slot.${r.slot}`)} · {t(`bud.${r.budget}`)}
        {r.material ? ` · ${t("wiz.mat")}` : ""}
      </p>
      {r.description && <p className="mt-2 text-sm text-ink">{r.description}</p>}
      {r.photos.length > 0 && (
        <p className="mt-2">
          <span className="rounded-pill border border-line bg-chuna px-3 py-1 text-xs font-bold text-navy">
            📷 {r.photos.length} {t("req.photos")}
          </span>
        </p>
      )}
      {matched && r.acceptedName && (
        <p className="mt-3 rounded-control bg-haldi/15 px-3 py-2 text-xs font-semibold text-ink">
          🔔 {t("req.talkNext", { name: r.acceptedName })}
        </p>
      )}
      {r.jobOtp && (
        <p className="mt-2 rounded-control bg-haldi/20 px-3 py-2 text-xs font-extrabold text-navy">
          🔑 {t("chat.booked", { otp: r.jobOtp })}
          {r.dateBooked ? ` · 📅 ${r.dateBooked} · ${t(`slot.${r.slotBooked ?? r.slot}`)}` : ""}
        </p>
      )}

      {done && (
        <div className="mt-3 rounded-control bg-chuna px-3 py-2">
          {r.rating ? (
            <p className="text-xs font-extrabold text-neem">✅ {t("req.reviewed", { n: r.rating })}</p>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-extrabold text-navy">{t("rev.h")}</span>
              <Stars value={stars} onPick={setStars} />
              <button
                type="button"
                disabled={stars === 0}
                onClick={() => {
                  reviewRequest(r.id, stars);
                  pushNotification({
                    kind: "system",
                    audience: "provider",
                    titleKey: "notif.review.title",
                    bodyKey: "notif.review.body",
                    params: { n: stars, category: t(`sk.${r.category}`) },
                    requestId: r.id,
                  });
                }}
                className="min-h-10 rounded-control bg-neem px-3 py-1.5 text-xs font-extrabold text-snow disabled:opacity-40"
              >
                {t("rev.submit")}
              </button>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {(matched || done) && (
          <button
            type="button"
            onClick={() => setChatOpen((v) => !v)}
            className="rounded-control border-2 border-navy px-3 py-1.5 text-xs font-extrabold text-navy hover:bg-navy hover:text-onnavy"
          >
            💬 {t("chat.open")}
          </button>
        )}
        {!done &&
          (confirmId === r.id ? (
            <div className="flex flex-wrap items-center gap-2 rounded-control bg-danger/10 px-3 py-2">
              <span className="text-sm font-extrabold text-danger">{t("req.confirmQ")}</span>
              <button
                type="button"
                onClick={() => {
                  cancelRequest(r.id);
                  setConfirmId(null);
                }}
                className="rounded-control bg-danger px-3 py-1.5 text-xs font-extrabold text-snow"
              >
                {t("req.yes")}
              </button>
              <button
                type="button"
                onClick={() => setConfirmId(null)}
                className="rounded-control border border-line px-3 py-1.5 text-xs font-extrabold text-muted hover:text-navy"
              >
                {t("req.no")}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmId(r.id)}
              className="rounded-control border-2 border-line px-3 py-1.5 text-xs font-extrabold text-muted hover:border-danger hover:text-danger"
            >
              {t("req.cancel")}
            </button>
          ))}
      </div>

      {chatOpen && (
        <div className="mt-4">
          <ChatPanel requestId={r.id} role="customer" myName={myName} />
        </div>
      )}
    </article>
  );
}

export function RequestsList({ onPost }: { onPost?: () => void }) {
  const { t } = useI18n();
  const [items, setItems] = useState<ServiceRequest[]>([]);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const myName = typeof window !== "undefined" ? (getSession()?.name ?? "Guest") : "Guest";

  useEffect(() => {
    setItems(getRequests());
    return onRequestsChange(() => setItems(getRequests()));
  }, []);

  const newestFirst = items.slice().reverse();
  const open = newestFirst.filter((r) => r.status === "open");
  const matched = newestFirst.filter((r) => r.status === "interested" || r.status === "accepted");
  const done = newestFirst.filter((r) => r.status === "completed");

  if (open.length === 0 && matched.length === 0 && done.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-line bg-white p-6 text-center text-muted">
        {t("req.empty")}
        {onPost && (
          <button
            type="button"
            onClick={onPost}
            className="mt-4 min-h-12 rounded-control bg-saffron px-5 py-2.5 text-sm font-extrabold text-snow hover:shadow-lift"
          >
            📝 {t("dash.tab.post")}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="rounded-control border-2 border-line px-3 py-1.5 text-xs font-extrabold text-muted hover:border-navy hover:text-navy">
        💡 {t("req.next")}
      </p>

      {open.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-[0.14em] text-muted">
            {t("req.group.open")} ({open.length})
          </h3>
          {open.map((r) => (
            <RequestCard key={r.id} r={r} myName={myName} confirmId={confirmId} setConfirmId={setConfirmId} />
          ))}
        </section>
      )}

      {matched.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-[0.14em] text-saffron">
            {t("req.group.matched")} ({matched.length})
          </h3>
          {matched.map((r) => (
            <RequestCard key={r.id} r={r} myName={myName} confirmId={confirmId} setConfirmId={setConfirmId} />
          ))}
        </section>
      )}

      {done.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-[0.14em] text-neem">
            {t("req.group.done")} ({done.length})
          </h3>
          {done.map((r) => (
            <RequestCard key={r.id} r={r} myName={myName} confirmId={confirmId} setConfirmId={setConfirmId} />
          ))}
        </section>
      )}
    </div>
  );
}