/* Customer dashboard — crew chat store (localStorage, demo phase).

   Distinct from lib/chats.ts, which backs provider request threads
   (gs_chats): these threads are keyed by crew id on the live job.
   Production: Socket.IO rooms per crew with the same message shape.

   Demo honesty: crew replies come from canned pools and delivery ticks
   advance on timers owned by ChatPanel. No network is involved. */

export type DashMsgKind = "text" | "photo" | "voice";

export type DashMsg = {
  id: string;
  from: "me" | "crew";
  kind: DashMsgKind;
  text: string; // body text, or caption under a photo
  photo?: string; // /jobs path or uploaded data URL
  dur?: string; // voice note length, "0:24"
  at: number; // epoch millis
  tick: 0 | 1 | 2; // own-message delivery state; crew messages land at 2
};

type Store = Record<string, DashMsg[]>; // crewId -> messages

const KEY = "pt_dash_chats_v1";
const EVENT = "pt:dashchat";
const MIN = 60_000;

/* Canned crew replies, rotated per thread. Kept in English on purpose:
   the packs translate UI chrome, not demo conversation content. */
const CREW_REPLIES: Record<string, string[]> = {
  c1: [
    "Noted sir, I will share the evening photo.",
    "Living room first coat is drying fast, second coat tomorrow.",
    "No problem sir, we will manage.",
  ],
  c2: [
    "Thank you sir. Putty needs full drying before the next coat.",
    "Terrace section is done, moving to the bathroom wall.",
    "Sure sir, I will update you by evening.",
  ],
  c3: [
    "Undercoat finished on two doors, sanding in progress.",
    "Bringing the enamel colour samples today — will send a photo.",
    "Yes sir, gloss finish as discussed.",
  ],
  c4: [
    "Texture pattern starts tomorrow morning sir.",
    "Base coat is even, no touch-up needed.",
    "Will send the design photo before starting.",
  ],
};
const GENERIC_REPLIES = ["Okay sir.", "Noted, thank you.", "Will update you soon."];

function read(): Store {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Store) : {};
  } catch {
    return {};
  }
}

function write(s: Store) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
    window.dispatchEvent(new CustomEvent(EVENT));
  } catch {
    /* private mode — in-memory only for this tab */
  }
}

function msg(from: DashMsg["from"], kind: DashMsgKind, text: string, at: number, extra?: Partial<DashMsg>): DashMsg {
  return {
    id: `dm_${at}_${Math.random().toString(36).slice(2, 6)}`,
    from,
    kind,
    text,
    at,
    tick: 2, // seeded history is always delivered + read
    ...extra,
  };
}

/** Seed the four crew threads on first use — call once after mount. */
export function ensureSeeded(): void {
  if (localStorage.getItem(KEY)) return;
  const now = Date.now();
  const s: Store = {
    c1: [
      msg("crew", "text", "Good morning sir. Starting the living room first coat today.", now - 200 * MIN),
      msg("me", "text", "Great. Please share a photo by evening.", now - 190 * MIN),
      msg("crew", "photo", "First coat done on the living room wall.", now - 120 * MIN, { photo: "/jobs/day3-firstcoat.jpg" }),
      msg("crew", "voice", "", now - 100 * MIN, { dur: "0:24" }),
    ],
    c2: [
      msg("crew", "text", "Sir, bedroom ceiling putty needs one more day to dry. Sending an extension request.", now - 320 * MIN),
      msg("me", "text", "Okay, I will check the request and approve.", now - 300 * MIN),
      msg("crew", "text", "Thank you sir.", now - 295 * MIN),
    ],
    c3: [
      msg("me", "text", "How is the woodwork undercoat going?", now - 150 * MIN),
      msg("crew", "text", "Two doors done, remaining two tomorrow.", now - 140 * MIN),
      msg("crew", "photo", "Undercoat finish on door number two.", now - 130 * MIN, { photo: "/jobs/woodwork.jpg" }),
    ],
    c4: [
      msg("crew", "text", "Texture base is ready sir. Pattern starts tomorrow morning.", now - 90 * MIN),
    ],
  };
  write(s);
}

export function getMsgs(crewId: string): DashMsg[] {
  const s = read();
  return s[crewId] ?? [];
}

/** Append one message. Own messages start at tick 0; ChatPanel advances them. */
export function sendMsg(
  crewId: string,
  m: { from: DashMsg["from"]; kind: DashMsgKind; text: string; photo?: string; dur?: string },
): DashMsg {
  const s = read();
  const at = Date.now();
  const full: DashMsg = {
    id: `dm_${at}_${Math.random().toString(36).slice(2, 6)}`,
    from: m.from,
    kind: m.kind,
    text: m.text,
    photo: m.photo,
    dur: m.dur,
    at,
    tick: m.from === "me" ? 0 : 2,
  };
  s[crewId] = [...(s[crewId] ?? []), full];
  write(s);
  return full;
}

/** Canned crew reply, rotating through the pool for that thread. */
export function crewReply(crewId: string): DashMsg {
  const pool = CREW_REPLIES[crewId] ?? GENERIC_REPLIES;
  const s = read();
  const count = (s[crewId] ?? []).filter((m) => m.from === "crew").length;
  return sendMsg(crewId, { from: "crew", kind: "text", text: pool[count % pool.length] });
}

export function setTick(crewId: string, id: string, tick: 0 | 1 | 2): void {
  const s = read();
  const list = s[crewId];
  if (!list) return;
  s[crewId] = list.map((m) => (m.id === id ? { ...m, tick } : m));
  write(s);
}

export function onDashChatChange(cb: () => void): () => void {
  const handler = () => cb();
  window.addEventListener(EVENT, handler);
  window.addEventListener("storage", handler); // live cross-tab sync
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}