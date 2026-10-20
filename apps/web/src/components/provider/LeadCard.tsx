/* LeadCard v1 — one lead, two decisions. Drag to accept (right) or pass (left),
   with visible buttons as well: a swipe-only interaction is banned by the
   accessibility mandate (Blueprint Ch. 23.3). */
"use client";

import { useRef, useState } from "react";
import { useI18n } from "@/i18n";
import type { ServiceRequest } from "@/lib/requests";

const EMOJI: Record<string, string> = {
  painting: "🎨",
  electrical: "⚡",
  plumbing: "🚿",
  carpentry: "🪚",
  cleaning: "🧽",
  waterproofing: "🛡️",
};

/** Past this many pixels the release commits instead of springing back. */
const THRESHOLD = 110;
const EXIT = 520;

type Props = {
  request: ServiceRequest;
  km: number;
  minsLeft: number | null;
  /** Stack position: 0 = the draggable top card. */
  depth: number;
  dragEnabled: boolean;
  onAccept: () => void;
  onDecline: () => void;
};

const chip = "rounded-pill border border-line bg-chuna px-2.5 py-1 text-xs font-bold text-navy";

export function LeadCard({ request, km, minsLeft, depth, dragEnabled, onAccept, onDecline }: Props) {
  const { lang, t } = useI18n();
  const [dragX, setDragX] = useState(0);
  const [leaving, setLeaving] = useState<"accept" | "decline" | null>(null);
  const [animateBack, setAnimateBack] = useState(false);
  const startX = useRef<number | null>(null);
  const pointerId = useRef<number | null>(null);
  const moved = useRef(false);

  const locale = lang === "hi" ? "hi-IN" : lang === "gu" ? "gu-IN" : "en-IN";
  const top = depth === 0;
  const canDrag = dragEnabled && top && !leaving;

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (!canDrag || e.button !== 0) return;
    startX.current = e.clientX;
    pointerId.current = e.pointerId;
    moved.current = false;
    setAnimateBack(false);
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!canDrag || startX.current === null) return;
    const dx = e.clientX - startX.current;
    if (Math.abs(dx) > 4) moved.current = true;
    setDragX(dx);
  }

  function finish(kind: "accept" | "decline") {
    setLeaving(kind);
    setDragX(kind === "accept" ? EXIT : -EXIT);
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate?.(12);
    window.setTimeout(kind === "accept" ? onAccept : onDecline, 190);
  }

  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (!canDrag || startX.current === null) return;
    const dx = e.clientX - startX.current;
    startX.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    if (dx > THRESHOLD) {
      finish("accept");
      return;
    }
    if (dx < -THRESHOLD) {
      finish("decline");
      return;
    }
    setAnimateBack(true);
    setDragX(0);
    window.setTimeout(() => setAnimateBack(false), 280);
  }

  const rotate = Math.max(-11, Math.min(11, dragX / 24));
  const acceptGlow = Math.min(0.5, Math.max(0, dragX / 240));
  const declineGlow = Math.min(0.5, Math.max(0, -dragX / 240));
  const urgent = minsLeft !== null && minsLeft <= 5;

  const transform = leaving
    ? `translate3d(${dragX}px, 0, 0) rotate(${rotate}deg) scale(0.96)`
    : `translate3d(${dragX}px, 0, 0) rotate(${rotate}deg) scale(${1 - depth * 0.04})`;

  return (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      style={{
        transform,
        transition: animateBack || leaving ? "transform 260ms cubic-bezier(0.34, 1.56, 0.64, 1)" : "none",
        opacity: leaving ? 0 : 1 - depth * 0.18,
        touchAction: canDrag ? "pan-y" : "auto",
        cursor: canDrag ? "grab" : "default",
      }}
      className="relative select-none rounded-card border border-line bg-white p-5 shadow-card"
    >
      {/* Decision tints */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-card bg-neem transition-opacity"
        style={{ opacity: acceptGlow }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-card bg-danger transition-opacity"
        style={{ opacity: declineGlow }}
      />

      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="text-2xl">
              {EMOJI[request.category] ?? "🛠️"}
            </span>
            <div>
              <h3 className="font-extrabold text-navy">{t(`sk.${request.category}`)}</h3>
              <p className="text-xs font-semibold text-muted">
                {request.city} · {request.zone} · {t("pd.distance", { km: km.toFixed(1) })}
              </p>
            </div>
          </div>
          {minsLeft !== null && (
            <span
              className={`rounded-pill px-2.5 py-1 text-xs font-black ${
                urgent ? "bg-danger/15 text-danger" : "bg-haldi/20 text-navy"
              }`}
            >
              ⏱ {t("pd.timer", { mins: Math.max(0, minsLeft) })}
            </span>
          )}
        </div>

        {request.description && (
          <p className="mt-3 text-sm text-ink">
            {request.description.length > 130 ? `${request.description.slice(0, 130)}…` : request.description}
          </p>
        )}

        <div className="mt-3 flex flex-wrap gap-2">
          <span className={chip}>💰 {t("pd.budgetHint")}: {t(`bud.${request.budget}`)}</span>
          <span className={chip}>{request.material ? `🧱 ${t("pd.materialInc")}` : `🧱 ${t("pd.customerMat")}`}</span>
          <span className={chip}>{request.date
            ? `📅 ${t("pd.slotOn", {
                date: new Date(`${request.date}T00:00:00`).toLocaleDateString(locale, { day: "numeric", month: "short" }),
              })}`
            : `📅 ${t("pd.anyDate")}`}</span>
          <span className={chip}>🕒 {t(`slot.${request.slot}`)}</span>
          {request.photos.length > 0 && <span className={chip}>📷 {t("pd.photosN", { count: request.photos.length })}</span>}
        </div>

        <p className="mt-3 text-xs font-semibold text-muted">
          🔒 {request.customer.split(" ")[0]} · {t("pd.addressHidden")}
        </p>

        {top && dragEnabled && (
          <p className="mt-3 text-center text-xs font-semibold text-muted">↔ {t("pd.swipeHint")}</p>
        )}

        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={() => {
              if (moved.current) {
                moved.current = false;
                return;
              }
              finish("accept");
            }}
            className="min-h-12 flex-1 rounded-control bg-saffron px-4 py-3 text-sm font-extrabold text-white transition-transform hover:-translate-y-0.5 hover:shadow-lift"
          >
            ✓ {t("pd.yes")}
          </button>
          <button
            type="button"
            onClick={() => {
              if (moved.current) {
                moved.current = false;
                return;
              }
              onDecline();
            }}
            className="min-h-12 rounded-control border-2 border-line px-4 py-3 text-sm font-extrabold text-muted transition-colors hover:border-danger hover:text-danger"
          >
            {t("pd.notNow")}
          </button>
        </div>
      </div>
    </div>
  );
}