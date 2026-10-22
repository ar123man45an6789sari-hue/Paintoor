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