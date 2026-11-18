/* ChatHub — every conversation this partner is part of (accepted jobs,
   interested leads, quoted requests) in a list + window layout. The message
   surface itself is the shared ChatPanel, so provider and customer see the
   exact same thread. */
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useI18n } from "@/i18n";
import { Icon } from "@/components/Icons";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { getRequests, onRequestsChange } from "@/lib/requests";
import type { ServiceRequest } from "@/lib/requests";
import { getThread, onChatsChange } from "@/lib/chats";
import { onPartnerChange, quotesFor } from "@/lib/partner";
import type { ProviderProfile } from "@/lib/providers";

export function ChatHub({ profile, initialId }: { profile: ProviderProfile; initialId: string | null }) {
  const { t } = useI18n();
  const [items, setItems] = useState<ServiceRequest[]>([]);
  const [selected, setSelected] = useState<string | null>(initialId);
  const [q, setQ] = useState("");

  const reload = useCallback(() => {
    setItems(
      getRequests().filter(
        (r) =>
          (r.status === "interested" || r.status === "accepted" || r.status === "completed") &&
          (r.acceptedBy === profile.id ||
            r.leads?.[profile.id]?.status === "interested" ||
            quotesFor(r.id).length > 0),
      ),
    );
  }, [profile.id]);

  useEffect(() => {
    reload();
    const offR = onRequestsChange(reload);
    const offC = onChatsChange(reload);
    const offP = onPartnerChange(reload);
    return () => { offR(); offC(); offP(); };
  }, [reload]);

  /* A deep link (from a job card or lead) always wins over the old pick. */
  useEffect(() => {
    if (initialId) setSelected(initialId);
  }, [initialId]);

  const needle = q.trim().toLowerCase();
  const shown = useMemo(
    () => items.filter((r) => !needle || r.customer.toLowerCase().includes(needle)).sort((a, b) => b.at - a.at),
    [items, needle],
  );

  function lastLine(r: ServiceRequest): { text: string; time: string } {
    const msgs = getThread(r.id).messages;
    const last = msgs[msgs.length - 1];
    if (!last) return { text: t("pw.ch.noMsgs"), time: "" };
    const time = new Date(last.at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    if (last.kind === "quote") return { text: t("pw.ch.lastQuote"), time };
    return { text: last.text, time };
  }

  const active = shown.find((r) => r.id === selected) ?? null;

  const list = (
    <div className="overflow-hidden rounded-card border border-line bg-white shadow-card">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <b className="text-sm font-extrabold text-navy">{t("pw.ch.messages")}</b>
        <span className="rounded-pill bg-saffron/15 px-2.5 py-0.5 text-[11px] font-black text-saffron">
          {t("pw.ch.active", { n: shown.length })}
        </span>
      </div>
      <div className="border-b border-line p-3">
        <label className="flex min-h-10 items-center gap-2 rounded-control border-2 border-line bg-white px-3 focus-within:border-saffron">
          <Icon name="search" className="h-4 w-4 text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("pw.ch.search")}
            aria-label={t("pw.ch.search")}
            className="w-full bg-transparent py-1.5 text-sm font-bold text-navy outline-none"
          />
        </label>
      </div>
      {shown.length === 0 ? (
        <p className="p-6 text-center text-sm font-bold text-muted">{t("pw.ch.empty")}</p>
      ) : (
        <ul className="divide-y divide-line">
          {shown.map((r) => {
            const l = lastLine(r);
            return (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => setSelected(r.id)}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-chuna ${selected === r.id ? "bg-chuna" : ""}`}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-pill bg-saffron/15 text-xs font-black text-saffron">
                    {r.customer.split(" ").map((x) => x[0]).slice(0, 2).join("").toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <b className="block truncate text-sm font-extrabold text-navy">{r.customer}</b>
                    <span className="block truncate text-xs font-semibold text-muted">{l.text}</span>
                  </span>
                  <span className="shrink-0 text-[11px] font-bold text-muted">{l.time}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );

  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.16em] text-saffron">{t("pw.ch.eyebrow")}</p>
      <h2 className="mt-1 mb-4 text-2xl font-black tracking-[-0.02em] text-navy">{t("pw.ch.h")}</h2>

      <div className="grid items-start gap-4 lg:grid-cols-[320px_1fr]">
        <div className={active ? "hidden lg:block" : ""}>{list}</div>
        <div className={active ? "" : "hidden lg:block"}>
          {active ? (
            <div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="mb-3 flex min-h-10 items-center gap-1.5 rounded-control border-2 border-line px-3 py-2 text-xs font-extrabold text-navy lg:hidden"
              >
                <Icon name="arrowLeft" className="h-4 w-4" />{t("pw.ch.back")}
              </button>
              <div className="rounded-card border border-line bg-white shadow-card">
                <div className="flex items-center gap-3 border-b border-line px-4 py-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-pill bg-chuna text-[11px] font-black text-navy">
                    {active.customer.split(" ").map((x) => x[0]).slice(0, 2).join("").toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <b className="block truncate text-sm font-extrabold text-navy">{active.customer}</b>
                    <span className="block text-xs font-semibold text-muted">{t("pw.ch.job", { id: active.id })}</span>
                  </div>
                </div>
                <ChatPanel requestId={active.id} role="provider" myName={profile.name} />
              </div>
            </div>
          ) : (
            <div className="hidden rounded-card border-2 border-dashed border-line bg-white p-10 text-center lg:block">
              <Icon name="chat" className="mx-auto h-8 w-8 text-saffron" />
              <p className="mt-2 font-extrabold text-navy">{t("pw.ch.pick")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}