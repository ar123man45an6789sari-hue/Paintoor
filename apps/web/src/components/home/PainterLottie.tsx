/* PainterLottie v2 — designer-made painter (Lottie, 60fps, 3.5s loop) via
   lottie-web directly; JSON streams from /public (CDN-cached, bundle light).
   Recolored to Paintoor palette; reduced-motion = static frame. */
"use client";

import { useEffect, useRef } from "react";
import lottie from "lottie-web";

const REDUCED =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function PainterLottie() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const anim = lottie.loadAnimation({
      container: ref.current,
      renderer: "svg",
      loop: !REDUCED,
      autoplay: !REDUCED,
      path: "/painter.json",
    });
    return () => anim.destroy();
  }, []);
  return <div ref={ref} className="mx-auto aspect-square w-full max-w-[540px] origin-left scale-[1.05] md:scale-[1.85]" />;
}