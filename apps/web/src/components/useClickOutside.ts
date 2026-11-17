/* useClickOutside — close a popover when the pointer lands anywhere else.

   The old trick was a full-screen scrim button, but the sticky header uses
   backdrop-blur, and a backdrop-filtered ancestor turns position:fixed into
   position:absolute relative to itself - so those scrims only ever covered
   the header strip and page clicks never closed anything. Watching the
   document works everywhere, on mouse and touch. */
"use client";

import { useEffect, type RefObject } from "react";

export function useClickOutside(
  ref: RefObject<HTMLElement | null>,
  active: boolean,
  onClose: () => void,
) {
  useEffect(() => {
    if (!active) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      const node = ref.current;
      if (node && !node.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
    };
  }, [ref, active, onClose]);
}