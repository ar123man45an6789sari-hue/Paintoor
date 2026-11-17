/* Customer dashboard — job history seeds (demo phase).

   The vault keeps 30 days of activity per the retention rule; anything
   older is archived automatically. The demo timeline is pinned to the
   live job's world (today = 16 Oct 2025) so the window is stable instead
   of drifting with the real clock. Entry copy stays English, like the
   other demo seeds — the packs translate the UI chrome around it. */

export type HistoryKind =
  | "post"
  | "visit"
  | "pay"
  | "doc"
  | "order"
  | "crew"
  | "progress"
  | "ext";

export type HistoryEntry = {
  id: string;
  at: string; // "2025-10-15" (ISO, local midnight)
  kind: HistoryKind;
  jobId: string;
  text: string;
};

export const DEMO_TODAY = "2025-10-16";
export const RETENTION_DAYS = 30;

export const HISTORY_SEED: HistoryEntry[] = [
  { id: "h1", at: "2025-10-15", kind: "progress", jobId: "PT-2481", text: "Final coat finished in the bedrooms — Ramesh Yadav." },
  { id: "h2", at: "2025-10-14", kind: "ext", jobId: "PT-2481", text: "Extension request approved — Salim Pathan, +1 day for putty drying." },
  { id: "h3", at: "2025-10-14", kind: "crew", jobId: "PT-2481", text: "Crew assigned — Vikram Rathod, exterior texture." },
  { id: "h4", at: "2025-10-13", kind: "pay", jobId: "PT-2481", text: "Mid-way milestone of ₹7,586 moved into escrow hold." },
  { id: "h5", at: "2025-10-12", kind: "order", jobId: "PT-2481", text: "Paint store order PT-ORD-482190 delivered to site." },
  { id: "h6", at: "2025-10-11", kind: "doc", jobId: "PT-2481", text: "Agreement AGR-2481-QT7M signed by both sides." },
  { id: "h7", at: "2025-10-10", kind: "pay", jobId: "PT-2481", text: "Advance of ₹7,586 released to the crew pool." },
  { id: "h8", at: "2025-09-28", kind: "visit", jobId: "PT-2481", text: "Site visit and measurements confirmed — 302, Shanti Residency." },
  { id: "h9", at: "2025-09-20", kind: "post", jobId: "PT-2481", text: "Job posted — 2 BHK full home painting." },
  /* Outside the 30-day window — the component archives it, never deletes. */
  { id: "h10", at: "2025-08-30", kind: "doc", jobId: "PT-2290", text: "Warranty WRN-2290-KP4R issued — terrace membrane, 7 years." },
];

/** True when the entry sits inside the retention window ending at `today`. */
export function withinRetention(e: HistoryEntry, today: string = DEMO_TODAY, days: number = RETENTION_DAYS): boolean {
  const t0 = new Date(`${today}T00:00:00`).getTime();
  const t1 = new Date(`${e.at}T00:00:00`).getTime();
  const diff = Math.round((t0 - t1) / 86_400_000);
  return diff >= 0 && diff <= days;
}