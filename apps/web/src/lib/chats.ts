/* Demo-phase chat store (localStorage). Production: Socket.IO rooms per request
   with the exact same message shape (Blueprint Ch. 14). */

export type ChatQuote = { labour: number; material: number; note: string; total: number };

export type ChatMessage = {
  id: string;
  from: "customer" | "provider";
  kind: "text" | "quote";
  text: string;
  quote?: ChatQuote;
  at: number;
};

export type ChatThread = { requestId: string; messages: ChatMessage[] };

const KEY = "gs_chats";
const CHANGE = "gs:chats-changed";

function emit() {
  window.dispatchEvent(new CustomEvent(CHANGE));
}

function save(threads: ChatThread[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(threads));
    emit();
  } catch {
    /* private mode */
  }
}

export function getThreads(): ChatThread[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ChatThread[]) : [];
  } catch {
    return [];
  }
}

export function getThread(requestId: string): ChatThread {
  return getThreads().find((t) => t.requestId === requestId) ?? { requestId, messages: [] };
}

export function sendMessage(requestId: string, from: "customer" | "provider", text: string): ChatMessage {
  const threads = getThreads();
  const thread = threads.find((t) => t.requestId === requestId);
  const msg: ChatMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    from,
    kind: "text",
    text,
    at: Date.now(),
  };
  if (thread) thread.messages = [...thread.messages, msg];
  else threads.push({ requestId, messages: [msg] });
  save(threads);
  return msg;
}

export function sendQuote(requestId: string, quote: ChatQuote): ChatMessage {
  const threads = getThreads();
  const thread = threads.find((t) => t.requestId === requestId);
  const msg: ChatMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    from: "provider",
    kind: "quote",
    text: "",
    quote,
    at: Date.now(),
  };
  if (thread) thread.messages = [...thread.messages, msg];
  else threads.push({ requestId, messages: [msg] });
  save(threads);
  return msg;
}

export function onChatsChange(cb: () => void) {
  const handler = () => cb();
  window.addEventListener(CHANGE, handler);
  /* Live cross-tab: browser fires `storage` in every OTHER tab on LS change. */
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(CHANGE, handler);
    window.removeEventListener("storage", handler);
  };
}