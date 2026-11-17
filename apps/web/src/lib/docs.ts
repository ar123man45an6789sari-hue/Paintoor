/* Customer dashboard — documents vault seeds (demo phase).

   Documents live in job-wise folders and a warranty never floats free:
   each warranty sits only inside the job folder it was issued for
   (terrace waterproofing -> 7 years, exterior texture -> 3 years).
   Production: the same shapes arrive from the documents API as signed
   PDFs; the demo downloads a plain-text receipt instead and says so. */

export type DocKind = "agreement" | "invoice" | "warranty";

export type VaultDoc = {
  id: string; // "AGR-2481-QT7M"
  kind: DocKind;
  meta: string; // one-line summary under the id
  years?: number; // warranty validity, only on warranty docs
};

export type VaultFolder = {
  jobId: string; // "PT-2481"
  title: string;
  when: string; // "Oct 2025"
  state: "live" | "done";
  docs: VaultDoc[];
};

export const VAULT_SEED: VaultFolder[] = [
  {
    jobId: "PT-2481",
    title: "2 BHK full home painting",
    when: "Oct 2025",
    state: "live",
    docs: [
      { id: "AGR-2481-QT7M", kind: "agreement", meta: "Signed 11 Oct · ₹25,287 total" },
      { id: "INV-2481", kind: "invoice", meta: "Advance 30% paid · balance on handover" },
    ],
  },
  {
    jobId: "PT-2290",
    title: "Terrace waterproofing",
    when: "Jul 2025",
    state: "done",
    docs: [
      { id: "AGR-2290-ML2P", kind: "agreement", meta: "Signed 02 Jul · ₹18,400 total" },
      { id: "INV-2290", kind: "invoice", meta: "Paid in full · 14 Jul" },
      { id: "WRN-2290-KP4R", kind: "warranty", meta: "Terrace membrane · Salim Pathan", years: 7 },
    ],
  },
  {
    jobId: "PT-2104",
    title: "Exterior texture repaint",
    when: "Mar 2025",
    state: "done",
    docs: [
      { id: "AGR-2104-RV6N", kind: "agreement", meta: "Signed 08 Mar · ₹12,900 total" },
      { id: "INV-2104", kind: "invoice", meta: "Paid in full · 21 Mar" },
      { id: "WRN-2104-MZ8T", kind: "warranty", meta: "Facade texture · Vikram Rathod", years: 3 },
    ],
  },
];