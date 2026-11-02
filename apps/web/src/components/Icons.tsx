import type { ReactNode } from "react";

/* Client icon set as inline SVG — no asset files, no 404s, dark-mode safe.
   Shapes traced from the client-provided PNGs (pin / account / plus). */

export function PinIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2a7.6 7.6 0 0 0-7.6 7.6c0 5.2 6.3 11.6 7 12.3.3.3.9.3 1.2 0 .7-.7 7-7.1 7-12.3A7.6 7.6 0 0 0 12 2Zm0 11a3.4 3.4 0 1 1 0-6.8 3.4 3.4 0 0 1 0 6.8Z"
        fill="#e00048"
      />
    </svg>
  );
}

/** Clean stroked magnifier — the standard search glyph real product sites
 *  use; replaces the old emoji artwork. */
export function SearchIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="10.8" cy="10.8" r="6.3" />
      <line x1="15.6" y1="15.6" x2="20.5" y2="20.5" />
    </svg>
  );
}

export function AccountIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <circle cx="12" cy="7.5" r="4.8" />
      <path d="M3.2 19.6c.5-4 4.3-6.6 8.8-6.6 1.1 0 2.2.15 3.2.45a6.4 6.4 0 0 0-.55 2.6c0 1.5.5 2.9 1.4 4H4c-.5 0-.85-.25-.8-.45Z" />
      <circle cx="17.8" cy="16.8" r="5.4" />
      <path d="M16.9 14.2h1.8v1.7h1.7v1.8h-1.7v1.7h-1.8v-1.7h-1.7v-1.8h1.7Z" fill="rgb(var(--c-surface))" />
    </svg>
  );
}

export function PlusIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M10 4.2a2 2 0 0 1 4 0V10h5.8a2 2 0 0 1 0 4H14v5.8a2 2 0 0 1-4 0V14H4.2a2 2 0 0 1 0-4H10Z" />
    </svg>
  );
}

/* ---------------------------------------------------------------------------
   Icon — the generic stroke-icon system for the rest of the site.
   Every emoji-as-icon is being replaced by one of these: inline SVG in
   currentColor, so it inherits the text colour, scales with the font and
   stays correct in dark mode. No emoji, no icon fonts, no asset requests.

   Usage:
     <Icon name="bell" />                        // inline with text
     <Icon name="bell" className="h-5 w-5" />    // explicit box
   All shapes are drawn on a 24x24 grid with round caps.
   ------------------------------------------------------------------------- */
export type IconName =
  | "home" | "wrench" | "store" | "bell" | "serviceBell" | "phone" | "mail" | "globe" | "key"
  | "sun" | "moon" | "target" | "palette" | "chat" | "close" | "check" | "checkCircle"
  | "arrowRight" | "arrowLeft" | "note" | "search" | "clipboard" | "mapPin" | "star" | "rupee"
  | "wallet" | "calendar" | "clock" | "timer" | "camera" | "lock" | "shield" | "box" | "cart"
  | "truck" | "user" | "users" | "sparkle" | "toolbox" | "eye" | "download" | "save" | "brush"
  | "eraser" | "undo" | "redo" | "refresh" | "minus" | "plus" | "play" | "chart" | "doc"
  | "briefcase" | "bulb" | "receipt" | "brick" | "layers"
  | "bolt" | "droplet" | "hammer" | "spray" | "arrows";

const SHAPES: Record<IconName, ReactNode> = {
  home: <><path d="M3 10.6 12 3l9 7.6" /><path d="M5.6 9.6V21h12.8V9.6" /><path d="M9.8 21v-5.8h4.4V21" /></>,
  wrench: <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9l-3.8 3.8Z" />,
  store: <><path d="M4.4 9.6 6 4h12l1.6 5.6" /><path d="M4.4 9.6a2.6 2.6 0 0 0 5.1 0 2.6 2.6 0 0 0 5 0 2.6 2.6 0 0 0 5.1 0" /><path d="M6 12.4V21h12v-8.6" /><path d="M10 21v-5h4v5" /></>,
  bell: <><path d="M18 8.5a6 6 0 1 0-12 0c0 6.5-2.5 8.5-2.5 8.5h17S18 15 18 8.5Z" /><path d="M13.7 20.5a2 2 0 0 1-3.4 0" /></>,
  serviceBell: <><path d="M5 18h14" /><path d="M12 5.5a6.5 6.5 0 0 1 6.5 6.5v6h-13v-6A6.5 6.5 0 0 1 12 5.5Z" /><path d="M12 2.5v3" /></>,
  phone: <path d="M22 16.9v2.6a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h2.6a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.7a16 16 0 0 0 6 6l1.1-1.1a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z" />,
  mail: <><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m2.5 6.5 9.5 6.5 9.5-6.5" /></>,
  globe: <><circle cx="12" cy="12" r="9.5" /><path d="M2.5 12h19" /><path d="M12 2.5a15 15 0 0 1 0 19 15 15 0 0 1 0-19Z" /></>,
  key: <><circle cx="7.5" cy="15.5" r="4.5" /><path d="m10.7 12.3 8.3-8.3" /><path d="m16.5 4.5 3 3L22 5l-3-3" /><path d="m14 7 2.5 2.5" /></>,
  sun: <><circle cx="12" cy="12" r="4.5" /><path d="M12 1.5v3M12 19.5v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M1.5 12h3M19.5 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" /></>,
  moon: <path d="M21 13.2A9.2 9.2 0 1 1 10.8 3a7.2 7.2 0 0 0 10.2 10.2Z" />,
  target: <><circle cx="12" cy="12" r="9.5" /><circle cx="12" cy="12" r="5.5" /><circle cx="12" cy="12" r="1.6" /></>,
  palette: <><path d="M12 2.5a9.5 9.5 0 0 0 0 19c1.6 0 2.4-1.1 1.9-2.3-.6-1.3.3-2.4 1.7-2.4h1.9a4 4 0 0 0 4-4c0-5.8-4.3-10.3-9.5-10.3Z" /><circle cx="7.8" cy="11.8" r="1.1" /><circle cx="10.8" cy="7.6" r="1.1" /><circle cx="15.4" cy="8.6" r="1.1" /></>,
  chat: <path d="M21 14.5a2.5 2.5 0 0 1-2.5 2.5H8l-4.5 4V5.5A2.5 2.5 0 0 1 6 3h12.5A2.5 2.5 0 0 1 21 5.5Z" />,
  close: <path d="M18 6 6 18M6 6l12 12" />,
  check: <path d="M20 6.5 9.5 17 4 11.5" />,
  checkCircle: <><circle cx="12" cy="12" r="9.5" /><path d="m8 12.3 2.7 2.7L16 9.7" /></>,
  arrowRight: <path d="M4.5 12h15m-6-6 6 6-6 6" />,
  arrowLeft: <path d="M19.5 12h-15m6-6-6 6 6 6" />,
  note: <><path d="M12.5 20.5H20" /><path d="M16.4 3.6a2.1 2.1 0 0 1 3 3L7.5 18.5l-4 1 1-4Z" /></>,
  search: <><circle cx="11" cy="11" r="7.5" /><path d="m20.5 20.5-4.2-4.2" /></>,
  clipboard: <><rect x="8" y="2.5" width="8" height="4" rx="1.2" /><path d="M16 4.5h2a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2h2" /><path d="M8.5 12h7M8.5 16h4.5" /></>,
  mapPin: <><path d="M20 10.2c0 5.8-8 11.8-8 11.8s-8-6-8-11.8a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></>,
  star: <path d="m12 2.8 2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.7l-5.9 3.1 1.2-6.5L2.5 9.7l6.6-.9Z" />,
  rupee: <path d="M6.5 3.5h11M6.5 8h11M6.5 12.5h5.2a4.6 4.6 0 0 0 0-9M11 12.5l7 8" />,
  wallet: <><path d="M3.5 7.5A2 2 0 0 1 5.5 5.5h12v2.5" /><path d="M3.5 7.5v9.9a2 2 0 0 0 2 2h14.9a1.6 1.6 0 0 0 1.6-1.6v-6.1a1.6 1.6 0 0 0-1.6-1.6H5.5a2 2 0 0 1-2-2.1Z" /><circle cx="17" cy="14" r="1.2" /></>,
  calendar: <><rect x="3" y="4.5" width="18" height="17" rx="2" /><path d="M16 2.5v4M8 2.5v4M3 10.5h18" /></>,
  clock: <><circle cx="12" cy="12" r="9.5" /><path d="M12 6.5V12l3.5 2" /></>,
  timer: <><circle cx="12" cy="13.5" r="8" /><path d="M12 13.5v-4.5M9.5 2.5h5" /></>,
  camera: <><path d="M22.5 19a2 2 0 0 1-2 2h-17a2 2 0 0 1-2-2V8.5a2 2 0 0 1 2-2h3.6l1.8-3h6.2l1.8 3h3.6a2 2 0 0 1 2 2Z" /><circle cx="12" cy="13" r="4" /></>,
  lock: <><rect x="3.5" y="10.5" width="17" height="11" rx="2" /><path d="M7.5 10.5V7a4.5 4.5 0 0 1 9 0v3.5" /></>,
  shield: <><path d="M12 21.5s8-3.8 8-9.8V5.2L12 2.5 4 5.2v6.5c0 6 8 9.8 8 9.8Z" /><path d="m8.8 11.8 2.3 2.3 4.1-4.4" /></>,
  box: <><path d="M21 8.2v7.6a2 2 0 0 1-1 1.7l-7 4a2 2 0 0 1-2 0l-7-4a2 2 0 0 1-1-1.7V8.2a2 2 0 0 1 1-1.7l7-4a2 2 0 0 1 2 0l7 4a2 2 0 0 1 1 1.7Z" /><path d="m3.4 7.4 8.6 5 8.6-5M12 21.4v-9" /></>,
  cart: <><circle cx="9.5" cy="20" r="1.6" /><circle cx="17.5" cy="20" r="1.6" /><path d="M2.5 3.5h2.6l2.7 11.4a2 2 0 0 0 2 1.6h7.3a2 2 0 0 0 2-1.6L21 7H6" /></>,
  truck: <><path d="M1.5 5.5h13v11h-13z" /><path d="M14.5 9h4l3 3v4.5h-7" /><circle cx="6" cy="18.5" r="1.9" /><circle cx="17.5" cy="18.5" r="1.9" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4.5 21c0-4 3.4-6.2 7.5-6.2s7.5 2.2 7.5 6.2" /></>,
  users: <><circle cx="9.5" cy="8" r="3.8" /><path d="M2.5 20.8c0-3.8 3.1-5.9 7-5.9s7 2.1 7 5.9" /><path d="M16.5 4.4a3.8 3.8 0 0 1 0 7.4M18 14.6c2 .9 3.5 2.6 3.5 5" /></>,
  sparkle: <><path d="m10.5 2.8 1.9 5.1 5.1 1.9-5.1 1.9-1.9 5.1-1.9-5.1-5.1-1.9 5.1-1.9Z" /><path d="m18.4 14.6.8 2.1 2.1.8-2.1.8-.8 2.1-.8-2.1-2.1-.8 2.1-.8Z" /></>,
  toolbox: <><rect x="2" y="7.5" width="20" height="13" rx="2" /><path d="M9 7.5v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M2 13.5h20M10 13.5v3h4v-3" /></>,
  eye: <><path d="M1.8 12S5.6 5 12 5s10.2 7 10.2 7-3.8 7-10.2 7S1.8 12 1.8 12Z" /><circle cx="12" cy="12" r="3.2" /></>,
  download: <><path d="M12 3.5v12m0 0 4.5-4.5M12 15.5 7.5 11" /><path d="M4 20.5h16" /></>,
  save: <><path d="M19.5 21.5h-15a2 2 0 0 1-2-2v-15a2 2 0 0 1 2-2h11l5 5v12a2 2 0 0 1-2 2Z" /><path d="M17 21.5v-8H7v8M7 2.5v5h7.5" /></>,
  brush: <><path d="m14.2 3.8 6 6-8.4 8.4a2.1 2.1 0 0 1-3-3Z" /><path d="M9.4 14.6 3 21c1.5 1 3.6.8 4.9-.5 1.2-1.2 1.4-3 .4-4.4Z" /></>,
  eraser: <><path d="M20.5 20.5H9.8l-6-6a2 2 0 0 1 0-2.8L13.3 2.2a2 2 0 0 1 2.8 0l4.9 4.9a2 2 0 0 1 0 2.8L13.6 17" /><path d="m8.2 8.2 7.6 7.6" /></>,
  undo: <><path d="M9 14.5 4 9.5l5-5" /><path d="M4 9.5h10a6 6 0 0 1 0 12h-3" /></>,
  redo: <><path d="m15 14.5 5-5-5-5" /><path d="M20 9.5H10a6 6 0 0 0 0 12h3" /></>,
  refresh: <><path d="M21 12a9 9 0 1 1-2.9-6.6" /><path d="M21 3.5v5h-5" /></>,
  minus: <path d="M5.5 12h13" />,
  plus: <path d="M12 5.5v13M5.5 12h13" />,
  play: <path d="m7.5 4.5 12 7.5-12 7.5Z" />,
  chart: <><path d="M3.5 20.5h17" /><path d="M6.5 20.5V11M11.5 20.5V4.5M16.5 20.5v-6.5" /></>,
  doc: <><rect x="4" y="2.5" width="16" height="19" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></>,
  briefcase: <><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2M2 13h20" /></>,
  bulb: <><path d="M9 18h6M10 21h4" /><path d="M12 3a6 6 0 0 0-3.4 10.9c.6.5.9 1.2 1 2h4.8c.1-.8.4-1.5 1-2A6 6 0 0 0 12 3Z" /></>,
  receipt: <><path d="M6 2.5h12v19l-3-1.8-3 1.8-3-1.8-3 1.8Z" /><path d="M9 8h6M9 12h6" /></>,
  brick: <><rect x="2.5" y="5.5" width="19" height="13" rx="1" /><path d="M2.5 10h19M2.5 14.5h19M9 5.5v4.5M15.5 10v4.5M9 14.5v4" /></>,
  layers: <><path d="m12 2.8 9 4.7-9 4.7-9-4.7Z" /><path d="m3 12.5 9 4.7 9-4.7M3 17l9 4.7 9-4.7" /></>,
  bolt: <path d="M13.8 2 4.5 13.4h6.2L10.2 22l9.3-11.4h-6.2Z" />,
  droplet: <path d="M12 2.6s6.4 6.9 6.4 11.1a6.4 6.4 0 0 1-12.8 0C5.6 9.5 12 2.6 12 2.6Z" />,
  hammer: <><path d="m14.6 6.4 3 3" /><path d="M14.2 2.6 21.4 9.8l-2.6 2.6-7.2-7.2z" /><path d="m12.4 7.6-8.8 8.8a2.1 2.1 0 0 0 3 3l8.8-8.8" /></>,
  spray: <><rect x="8.5" y="8.5" width="7" height="13" rx="2" /><path d="M10.5 8.5V5h3v3.5M18 4h.01M20.5 6.5h.01M18 9h.01" /></>,
  arrows: <path d="M4 9h16m-4-4 4 4-4 4M20 15H4m4-4-4 4 4 4" />,
};

export function Icon({
  name,
  className = "h-[1.05em] w-[1.05em] align-[-0.18em] shrink-0",
  strokeWidth = 1.8,
}: {
  name: IconName;
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {SHAPES[name]}
    </svg>
  );
}