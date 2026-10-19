/* ChatPanel v1 — WhatsApp-style job chat with quote cards, hire sheet and the
   escrow advance (mock). Blueprint Ch. 14 + 09.6-09.8. */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "@/i18n";
import { getThread, onChatsChange, sendMessage, sendQuote } from "@/lib/chats";
import type { ChatMessage, ChatQuote } from "@/lib/chats";
import { getRequest, hireWithBooking, onRequestsChange } from "@/lib/requests";
import type { ServiceRequest } from "@/lib/requests";
import { pushNotification } from "@/lib/notifications";

type Role = "customer" | "provider";

export function ChatPanel({ requestId, role, myName }: { requestId: string; role: Role; myName: string }) {
  const { t } = useI18n();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [draft, setDraft] = useState("");
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [labour, setLabour] = useState("4000");
  const [material, setMaterial] = useState("2500");
  const [note, setNote] = useState("");
  const [hireOpen, setHireOpen] = useState(false);
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("m");
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  const reload = useCallback(() => {
    setMessages(getThread(requestId).messages);
    setRequest(getRequest(requestId) ?? null);
  }, [requestId]);

  useEffect(() => {
    reload();
    const offChat = onChatsChange(reload);
    const offReq = onRequestsChange(reload);
    return () => {
      offChat();
      offReq();
    };
  }, [reload]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest" });
  }, [messages.length]);

  const hired = request?.status === "accepted" || request?.status === "completed";
  const lastQuote = messages.slice().reverse().find((m) => m.kind === "quote");
  const canAccept = role === "customer" && request?.status === "interested" && !hired && Boolean(lastQuote);

  function send(text: string) {
    const clean = text.trim();
    if (!clean) return;
    sendMessage(requestId, role, clean);
    setDraft("");
  }

  function submitQuote() {
    const labourN = Math.max(0, Number(labour) || 0);
    const materialN = Math.max(0, Number(material) || 0);
    const quote: ChatQuote = { labour: labourN, material: materialN, note: note.trim(), total: labourN + materialN };
    sendQuote(requestId, quote);
    pushNotification({
      kind: "system",
      audience: "customer",
      titleKey: "notif.quote.title",
      bodyKey: "notif.quote.body",
      params: { name: myName, amount: quote.total.toLocaleString("en-IN") },
      requestId,
    });
    setQuoteOpen(false);
  }

  function pay() {
    const total = lastQuote?.quote?.total ?? 0;
    setPaying(true);
    window.setTimeout(() => {
      const updated = hireWithBooking(requestId, {
        date,
        slot,
        advance: Math.round(total * 0.3),
        total,
      });
      setPaying(false);
      setPaid(true);
      setHireOpen(false);
      if (updated) {
        pushNotification({
          kind: "system",
          audience: "provider",
          titleKey: "notif.hired.title",
          bodyKey: "notif.hired.body",
          params: { name: myName, otp: updated.jobOtp ?? "0000" },
          requestId,
        });
      }
    }, 1200);
  }

  const quick = role === "customer" ? ["chat.q1", "chat.q2"] : ["chat.p1", "chat.p2"];
  const inputClass = "w-full rounded-control border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-saffron";

  return (
    <div className="rounded-card border border-line bg-white p-4 shadow-card">
      <p className="text-xs font-black uppercase tracking-wider text-muted">💬 {t("chat.h")}</p>

      <div className="mt-3 max-h-72 space-y-2 overflow-y-auto pr-1">
        {messages.length === 0 && <p className="py-6 text-center text-sm text-muted">{t("chat.empty")}</p>}
        {messages.map((m) =>
          m.kind === "quote" && m.quote ? (
            <div key={m.id} className={`flex ${m.from === role ? "justify-end" : "justify-start"}`}>
              <div className="w-full max-w-[260px] rounded-sheet border border-line bg-chuna p-3">
                <p className="text-[11px] font-black uppercase tracking-wider text-saffron">🧾 {t("chat.quoteCard")}</p>
                <p className="mt-1 flex justify-between text-xs font-semibold text-ink">
                  <span>{t("chat.labour")}</span>
                  <span className="tabular-nums">₹{m.quote.labour.toLocaleString("en-IN")}</span>
                </p>
                <p className="flex justify-between text-xs font-semibold text-ink">
                  <span>{t("chat.material")}</span>
                  <span className="tabular-nums">₹{m.quote.material.toLocaleString("en-IN")}</span>
                </p>
                {m.quote.note && <p className="mt-1 text-[11px] text-muted">{m.quote.note}</p>}
                <p className="mt-1 flex justify-between border-t border-line pt-1 text-sm font-black text-navy">
                  <span>{t("chat.total")}</span>
                  <span className="tabular-nums">₹{m.quote.total.toLocaleString("en-IN")}</span>
                </p>
                {canAccept && m.id === lastQuote?.id && (
                  <button
                    type="button"
                    onClick={() => setHireOpen(true)}
                    className="mt-2 min-h-11 w-full rounded-control bg-saffron px-3 py-2 text-xs font-extrabold text-white hover:shadow-lift"
                  >
                    ✓ {t("chat.acceptQuote")}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div key={m.id} className={`flex ${m.from === role ? "justify-end" : "justify-start"}`}>
              <p
                className={`max-w-[75%] rounded-sheet px-3 py-2 text-sm font-semibold ${
                  m.from === role ? (role === "provider" ? "bg-neem text-white" : "bg-navy text-white") : "bg-chuna text-ink"
                }`}
              >
                {m.text}
              </p>
            </div>
          ),
        )}
        <div ref={endRef} />
      </div>

      {request?.jobOtp && (
        <p className="mt-3 rounded-control bg-haldi/20 px-3 py-2 text-xs font-extrabold text-navy">
          🔑 {t("chat.booked", { otp: request.jobOtp })}
        </p>
      )}
      {paid && <p className="mt-2 rounded-control bg-neem/10 px-3 py-2 text-xs font-semibold text-neem">🔒 {t("hire.done")}</p>}

      {hireOpen && lastQuote?.quote && (
        <div className="mt-3 rounded-control border border-line bg-chuna p-3">
          <p className="text-sm font-extrabold text-navy">📅 {t("hire.h")}</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs font-bold text-ink">{t("hire.date")}</span>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-bold text-ink">{t("hire.slot")}</span>
              <select value={slot} onChange={(e) => setSlot(e.target.value)} className={inputClass}>
                {["m", "a", "e", "f"].map((s) => (
                  <option key={s} value={s}>
                    {t(`slot.${s}`)}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="mt-2 space-y-1 text-xs font-semibold text-ink">
            <p className="flex justify-between">
              <span>{t("hire.total")}</span>
              <span className="tabular-nums">₹{lastQuote.quote.total.toLocaleString("en-IN")}</span>
            </p>
            <p className="flex justify-between">
              <span>{t("hire.advance")}</span>
              <span className="tabular-nums">₹{Math.round(lastQuote.quote.total * 0.3).toLocaleString("en-IN")}</span>
            </p>
            <p className="flex justify-between">
              <span>{t("hire.balLabel")}</span>
              <span className="tabular-nums">₹{Math.round(lastQuote.quote.total * 0.7).toLocaleString("en-IN")}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={pay}
            disabled={paying}
            className="mt-3 min-h-12 w-full rounded-control bg-neem px-3 py-3 text-sm font-extrabold text-white disabled:opacity-60"
          >
            {paying
              ? `🔒 ${t("hire.paying")}`
              : `🔒 ${t("hire.pay", { amount: Math.round(lastQuote.quote.total * 0.3).toLocaleString("en-IN") })}`}
          </button>
        </div>
      )}

      {role === "provider" && !hired &&
        (quoteOpen ? (
          <div className="mt-3 rounded-control border border-line bg-chuna p-3">
            <p className="text-sm font-extrabold text-navy">🧾 {t("chat.quoteBtn")}</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs font-bold text-ink">{t("chat.labour")} (₹)</span>
                <input type="number" min={0} value={labour} onChange={(e) => setLabour(e.target.value)} className={inputClass} />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-bold text-ink">{t("chat.material")} (₹)</span>
                <input type="number" min={0} value={material} onChange={(e) => setMaterial(e.target.value)} className={inputClass} />
              </label>
            </div>
            <label className="mt-2 block">
              <span className="mb-1 block text-xs font-bold text-ink">{t("chat.note")}</span>
              <input value={note} onChange={(e) => setNote(e.target.value)} className={inputClass} />
            </label>
            <p className="mt-2 flex justify-between text-sm font-black text-navy">
              <span>{t("chat.total")}</span>
              <span className="tabular-nums">₹{((Number(labour) || 0) + (Number(material) || 0)).toLocaleString("en-IN")}</span>
            </p>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={submitQuote}
                className="min-h-11 flex-1 rounded-control bg-saffron px-3 py-2 text-xs font-extrabold text-white"
              >
                {t("chat.quoteBtn")}
              </button>
              <button
                type="button"
                onClick={() => setQuoteOpen(false)}
                className="min-h-11 rounded-control border border-line px-3 py-2 text-xs font-extrabold text-muted"
              >
                {t("req.no")}
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setQuoteOpen(true)}
            className="mt-3 min-h-11 w-full rounded-control border-2 border-saffron px-3 py-2 text-xs font-extrabold text-saffron hover:bg-saffron hover:text-white"
          >
            🧾 {t("chat.quoteBtn")}
          </button>
        ))}

      <div className="mt-3 flex flex-wrap gap-2">
        {quick.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => send(t(k))}
            className="rounded-pill border border-line bg-chuna px-3 py-1.5 text-[11px] font-bold text-navy hover:border-saffron"
          >
            {t(k)}
          </button>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") send(draft);
          }}
          placeholder={t("chat.ph")}
          className={inputClass}
        />
        <button
          type="button"
          onClick={() => send(draft)}
          className="min-h-12 rounded-control bg-navy px-4 py-2 text-sm font-extrabold text-white hover:shadow-lift"
        >
          {t("chat.send")}
        </button>
      </div>
    </div>
  );
}