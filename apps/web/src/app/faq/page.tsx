/* FAQ page — full trilingual Q&A with category filters, plus a message-box
   preview: the chat UI is real, sending is not (feature lands later). */
"use client";

import { useState } from "react";
import { Logo } from "@/components/Logo";
import { Wordmark } from "@/components/Wordmark";
import { Icon } from "@/components/Icons";
import { useI18n } from "@/i18n";
import { FAQS, FAQ_CATS, FAQ_UI, type FaqCat } from "@/lib/faq";

export default function FaqPage() {
  const { lang } = useI18n();
  const ui = FAQ_UI[lang];
  const [cat, setCat] = useState<FaqCat | "all">("all");
  const [chatOpen, setChatOpen] = useState(false);

  const list = cat === "all" ? FAQS[lang] : FAQS[lang].filter((f) => f.cat === cat);

  return (
    <main className="bg-chuna px-5 py-16">
      <div className="mx-auto max-w-3xl">
        <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-saffron">FAQ</span>
        <h1 className="mt-2 text-3xl font-black text-navy md:text-4xl">{ui.h}</h1>
        <p className="mt-2 text-sm text-muted">{ui.sub}</p>

        {/* category filter */}
        <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label={ui.filterAll}>
          <button
            type="button"
            onClick={() => setCat("all")}
            className={`min-h-10 rounded-pill border px-4 text-xs font-extrabold transition-colors ${
              cat === "all" ? "border-saffron bg-saffron text-snow" : "border-line bg-white text-navy hover:border-saffron"
            }`}
          >
            {ui.filterAll}
          </button>
          {FAQ_CATS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCat(c)}
              className={`min-h-10 rounded-pill border px-4 text-xs font-extrabold transition-colors ${
                cat === c ? "border-saffron bg-saffron text-snow" : "border-line bg-white text-navy hover:border-saffron"
              }`}
            >
              {ui.cat[c]}
            </button>
          ))}
        </div>

        {/* filtered answers */}
        <div className="mt-6 space-y-4">
          {list.map((f) => (
            <article key={f.id} className="rounded-sheet border border-line bg-white p-5 shadow-card md:p-6">
              <span className="rounded-pill bg-chuna px-2.5 py-1 text-[11px] font-extrabold text-saffron">{ui.cat[f.cat]}</span>
              <h2 className="mt-2 text-base font-extrabold text-navy md:text-lg">{f.q}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink">{f.a}</p>
            </article>
          ))}
        </div>

        {/* ask-your-own-question box */}
        <div className="mt-10 rounded-sheet border-2 border-dashed border-saffron bg-white p-6 text-center shadow-card md:p-8">
          <h2 className="text-xl font-black text-navy md:text-2xl">{ui.askTitle}</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">{ui.askSub}</p>
          <button
            type="button"
            onClick={() => setChatOpen(true)}
            className="mt-5 min-h-12 rounded-control bg-saffron px-6 py-3 text-sm font-extrabold text-snow transition-shadow hover:shadow-lift"
          >
           <Icon name="chat" /> {ui.openChat}
          </button>
        </div>
      </div>

      {/* message-box preview modal */}
      {chatOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-raatri/60 p-4 sm:items-center" role="dialog" aria-modal="true" aria-label={"Paintoor " + ui.helpWord}>
          <button type="button" aria-label={ui.close} onClick={() => setChatOpen(false)} className="absolute inset-0 cursor-default" />
          <div className="relative flex h-[70vh] w-full max-w-md flex-col overflow-hidden rounded-sheet border border-line bg-white shadow-card">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <div className="flex items-center gap-2">
                <Logo className="h-6 w-6" />
                <span className="flex items-center gap-1 text-sm font-extrabold text-navy">
                  <Wordmark className="text-sm font-extrabold text-navy" />
                  {ui.helpWord}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setChatOpen(false)}
                aria-label={ui.close}
                className="flex h-9 w-9 items-center justify-center rounded-pill border border-line text-navy hover:border-saffron"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" className="h-4 w-4" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            <p className="border-b border-line bg-haldi/15 px-4 py-2 text-center text-[11px] font-extrabold text-ink">{ui.soon}</p>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              <div className="max-w-[85%] rounded-card rounded-bl-sm border border-line bg-chuna px-3 py-2 text-sm leading-relaxed text-ink">{ui.hello}</div>
            </div>
            <div className="border-t border-line p-3">
              <p className="mb-2 text-center text-[11px] font-semibold text-muted">{ui.soonSub}</p>
              <div className="flex gap-2">
                <input
                  disabled
                  placeholder={ui.inputPh}
                  className="min-h-11 flex-1 rounded-control border border-line bg-chuna px-3 text-sm outline-none disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  disabled
                  aria-label={ui.send}
                  className="flex min-h-11 items-center justify-center rounded-control bg-saffron px-4 text-snow opacity-50 disabled:cursor-not-allowed"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}