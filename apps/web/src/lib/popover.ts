/* Only one header popover open at a time: opening any of them broadcasts
   a close event that every other popover listens for. */
const CLOSE = "paintoor:popover-close";

export function openPopover(id: string) {
  window.dispatchEvent(new CustomEvent(CLOSE, { detail: id }));
}

export function onPopoverClose(id: string, close: () => void) {
  const handler = (e: Event) => {
    if ((e as CustomEvent<string>).detail !== id) close();
  };
  window.addEventListener(CLOSE, handler);
  return () => window.removeEventListener(CLOSE, handler);
}