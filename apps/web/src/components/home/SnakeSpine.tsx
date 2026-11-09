/* SnakeSpine — scroll-painted zigzag roadmap. One continuous line snakes down
   the middle with six numbered stops on its crests; the line fills with
   magenta paint as the visitor scrolls and a small glowing brush head travels
   along it. Cards sit beside the line, alternating left and right. Geometry is
   computed from the live layout (never eyeballed), scroll writes straight to
   the DOM via refs (no per-frame setState), and everything degrades gracefully
   under prefers-reduced-motion or with JS disabled. */
"use client";
import { useEffect, useRef } from "react";
import { useI18n } from "@/i18n";

const STEPS = [1, 2, 3, 4, 5, 6];

export function SnakeSpine() {
  const { t } = useI18n();
  const rootRef = useRef<HTMLElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLOListElement>(null);
  const baseRef = useRef<SVGPathElement>(null);
  const paintRef = useRef<SVGPathElement>(null);
  const measureRef = useRef<SVGPathElement>(null);
  const brushRef = useRef<HTMLSpanElement>(null);
  const nodeRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lensRef = useRef<number[]>([]);
  const totalRef = useRef(0);

  useEffect(() => {
    const root = rootRef.current;
    const wrap = wrapRef.current;
    if (!root || !wrap) return;
    /* Progressive enhancement: cards only animate once JS is alive. */
    root.classList.add("js");

    /* Read a custom property, resolving BOTH px and % (--cx is 50% on
       desktop, 30px on mobile). */
    const readNum = (name: string, fallback: number, pctOf: number) => {
      const raw = getComputedStyle(root).getPropertyValue(name).trim();
      if (!raw) return fallback;
      if (raw.endsWith("%")) return (parseFloat(raw) / 100) * pctOf;
      return parseFloat(raw) || fallback;
    };

    /* Reduced motion is re-read live, so flipping the OS setting mid-session
       takes effect without a reload. */
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduced = mq.matches;
    const onMotionPref = () => {
      reduced = mq.matches;
      onScroll();
    };

    const onScroll = () => {
      const paint = paintRef.current;
      const base = baseRef.current;
      const brush = brushRef.current;
      if (!paint || !base) return;
      const box = wrap.getBoundingClientRect();
      let p = (window.innerHeight - box.top) / (box.height + window.innerHeight * 0.25);
      p = Math.max(0, Math.min(1, p));
      if (reduced) p = 1;
      const total = totalRef.current;
      paint.style.strokeDasharray = `${total}`;
      paint.style.strokeDashoffset = `${total * (1 - p)}`;
      lensRef.current.forEach((L, i) => {
        const on = total * p >= L - 2;
        nodeRefs.current[i]?.classList.toggle("on", on);
        cardRefs.current[i]?.classList.toggle("on", on);
      });
      if (brush) {
        if (reduced || p <= 0 || p >= 1) {
          brush.style.opacity = "0";
        } else {
          const pt = base.getPointAtLength(total * p);
          brush.style.opacity = "1";
          brush.style.left = `${pt.x}px`;
          brush.style.top = `${pt.y}px`;
        }
      }
    };

    const layout = () => {
      const grid = gridRef.current;
      const base = baseRef.current;
      const paint = paintRef.current;
      const measure = measureRef.current;
      if (!grid || !base || !paint || !measure) return;
      const box = wrap.getBoundingClientRect();
      const cx = readNum("--cx", box.width / 2, box.width);
      const amp = readNum("--amp", 80, box.width);
      const band = readNum("--band", 300, box.width);
      const node = readNum("--node", 46, box.width);
      const gap = readNum("--gap", 20, box.width);
      const H = box.height;

      const items = Array.from(grid.children) as HTMLElement[];
      const pts = items.map((el, i) => {
        const r = el.getBoundingClientRect();
        return { x: cx + amp * (i % 2 === 0 ? -1 : 1), y: r.top - box.top + r.height / 2 };
      });
      if (pts.length === 0) return;

      const lead = Math.min(80, H * 0.05);
      const tail = lead;
      const segs: string[] = [];
      segs.push(`M ${cx} ${Math.max(0, pts[0].y - lead)}`);
      segs.push(
        `C ${cx} ${pts[0].y - lead * 0.45}, ${pts[0].x} ${pts[0].y - lead * 0.55}, ${pts[0].x} ${pts[0].y}`,
      );
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i];
        const b = pts[i + 1];
        const mid = (a.y + b.y) / 2;
        segs.push(`C ${a.x} ${mid}, ${b.x} ${mid}, ${b.x} ${b.y}`);
      }
      const last = pts[pts.length - 1];
      segs.push(
        `C ${last.x} ${last.y + tail * 0.55}, ${cx} ${H - tail * 0.45}, ${cx} ${Math.min(H, last.y + tail)}`,
      );

      /* lens[i] = path length at node i, measured segment-by-segment on a
         throwaway path (skip the final tail segment). */
      const lens: number[] = [];
      for (let i = 0; i < pts.length; i++) {
        measure.setAttribute("d", segs.slice(0, i + 2).join(" "));
        lens.push(measure.getTotalLength());
      }
      const d = segs.join(" ");
      base.setAttribute("d", d);
      paint.setAttribute("d", d);
      measure.setAttribute("d", d);
      totalRef.current = measure.getTotalLength();
      lensRef.current = lens;

      /* Dashed connector length so it lands exactly on the node edge. */
      root.style.setProperty("--conn", `${Math.max(0, gap + band / 2 - amp - node / 2)}px`);

      pts.forEach((p, i) => {
        const n = nodeRefs.current[i];
        if (n) {
          n.style.left = `${p.x}px`;
          n.style.top = `${p.y}px`;
        }
      });
      onScroll();
    };

    let ticking = false;
    const req = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        onScroll();
      });
    };

    layout();
    mq.addEventListener("change", onMotionPref);
    window.addEventListener("scroll", req, { passive: true });
    window.addEventListener("resize", layout);
    window.addEventListener("load", layout);
    const ro = new ResizeObserver(() => layout());
    ro.observe(root);
    return () => {
      mq.removeEventListener("change", onMotionPref);
      window.removeEventListener("scroll", req);
      window.removeEventListener("resize", layout);
      window.removeEventListener("load", layout);
      ro.disconnect();
    };
  }, []);

  return (
    <section id="how" ref={rootRef} className="snake">
      <div className="snake-head">
        <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-saffron">
          {t("sn.eyebrow")}
        </span>
        <h2 className="mt-2 text-3xl font-black text-navy md:text-4xl dark:text-snow">{t("sn.h")}</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-muted md:text-base">{t("sn.p")}</p>
      </div>

      <div ref={wrapRef} className="snake-wrap">
        <svg className="snake-svg" aria-hidden="true" focusable="false">
          <defs>
            <linearGradient id="snakeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" className="snake-stop-a" />
              <stop offset="55%" className="snake-stop-b" />
              <stop offset="100%" className="snake-stop-a" />
            </linearGradient>
          </defs>
          <path ref={baseRef} className="snake-base" fill="none" />
          <path ref={measureRef} fill="none" stroke="none" />
          <path ref={paintRef} className="snake-paint" fill="none" />
        </svg>

        <ol ref={gridRef} className="snake-grid">
          {STEPS.map((n, i) => (
            <li key={n} className="snake-step" style={{ gridRow: i + 1 }}>
              <div
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                className="snake-card"
              >
                <span className="snake-tag">{t(`sn${n}.t`)}</span>
                <h4 className="snake-h">{t(`sn${n}.h`)}</h4>
                <p className="snake-p">{t(`sn${n}.p`)}</p>
                <p className="snake-m">
                  <i aria-hidden="true" />
                  {t(`sn${n}.m`)}
                </p>
              </div>
            </li>
          ))}
        </ol>

        {STEPS.map((n) => (
          <span
            key={n}
            ref={(el) => {
              nodeRefs.current[n - 1] = el;
            }}
            className="snake-node"
            aria-hidden="true"
          >
            {String(n).padStart(2, "0")}
          </span>
        ))}

        <span ref={brushRef} className="snake-brush" aria-hidden="true" />
      </div>
    </section>
  );
}