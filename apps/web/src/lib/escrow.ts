/* Customer dashboard — escrow domain model and demo seeds.

   Money never moves on its own: every release goes through the customer's
   OTP confirmation (the demo accepts any six digits). "Held" is every
   milestone that has not been released yet — held plus pending.

   Demo phase: the seed mirrors the live PT-2481 job numbers.
   Production: the same shapes arrive from the escrow API. */

export type MilestoneState = "released" | "held" | "pending";

export type EscrowMilestone = {
  id: string;
  key: string; // i18n label key
  pct: number; // 30
  amount: number; // 7586
  state: MilestoneState;
};

export type EscrowAccount = {
  jobId: string; // "PT-2481"
  total: number; // 25287
  milestones: EscrowMilestone[];
};

/** The three actions that require an OTP confirmation. */
export type OtpMode = "release" | "refund" | "dispute";

export const SEED_ESCROW: EscrowAccount = {
  jobId: "PT-2481",
  total: 25287,
  milestones: [
    { id: "m1", key: "cd.esc.m1", pct: 30, amount: 7586, state: "released" },
    { id: "m2", key: "cd.esc.m2", pct: 30, amount: 7586, state: "held" },
    { id: "m3", key: "cd.esc.m3", pct: 40, amount: 10115, state: "pending" },
  ],
};

/** Held = everything not released yet (held + pending milestones). */
export function heldOf(a: EscrowAccount): number {
  return a.milestones.filter((m) => m.state !== "released").reduce((s, m) => s + m.amount, 0);
}

/** The three protection rules, rendered as numbered rows. */
export const ESCROW_RULE_KEYS = ["cd.esc.r1", "cd.esc.r2", "cd.esc.r3"] as const;