/* Customer dashboard — job domain model and demo seeds.

   One job carries many crews: a single painter does not paint the whole
   house. Each crew owns its day-by-day log; overall progress is global
   because every crew on a job shares the same start date.

   Demo phase: seeds below, mutation helpers pure so the board component
   owns state. Production: the same shapes arrive from the jobs API. */

export type DayUpdate = {
  n: string; // "Day 1"
  d: string; // "12 Oct"
  done: boolean;
  cur: boolean; // the current day
  note: string; // crew's update text
  shots: string[]; // site photo paths
  voice?: { dur: string; src?: string }; // demo renders waveform + timer only
};

export type CrewAssignment = {
  id: string;
  crewId: string;
  name: string;
  photo: string;
  rating: number; // 4.9
  jobsDone: number; // 212
  experience: string; // "10 yr"
  scope: string; // "Interior — living & bedroom"
  day: number; // this crew's current day
  totalDays: number;
  pct: number; // this crew's own progress
  amount: number; // 9400
  payoutId: string; // "PT-CREW-2481"
  bankLabel: string; // "HDFC ••••4417"
  days: DayUpdate[];
};

export type Job = {
  id: string;
  title: string;
  addressLabel: string;
  city: string;
  total: number;
  day: number; // overall current day
  totalDays: number;
  pct: number; // overall project progress (global)
  startedAt: string;
  endsAt: string;
  crews: CrewAssignment[];
  status: "live" | "done";
};

export type ExtensionRequest = {
  id: string;
  crewId: string;
  crewName: string;
  extraDays: number;
  note: string;
  state: "open" | "approved" | "declined";
};

/* ------------------------------------------------------------------ seeds */

const day = (
  n: string,
  d: string,
  state: "done" | "cur" | "next",
  note: string,
  shots: string[],
  voice?: { dur: string },
): DayUpdate => ({
  n,
  d,
  done: state === "done",
  cur: state === "cur",
  note,
  shots,
  voice: voice ? { dur: voice.dur } : undefined,
});

export const SEED_JOB: Job = {
  id: "PT-2481",
  title: "2 BHK full home painting",
  addressLabel: "302, Shanti Residency, Alkapuri",
  city: "Vadodara",
  total: 25287,
  day: 3,
  totalDays: 5,
  pct: 58,
  startedAt: "12 Oct",
  endsAt: "17 Oct",
  status: "live",
  crews: [
    {
      id: "c1",
      crewId: "ramesh",
      name: "Ramesh Yadav",
      photo: "/crew/ramesh.jpg",
      rating: 4.9,
      jobsDone: 212,
      experience: "10 yr",
      scope: "Interior — living & bedroom",
      day: 3,
      totalDays: 5,
      pct: 60,
      amount: 9400,
      payoutId: "PT-CREW-2481",
      bankLabel: "HDFC ••••4417",
      days: [
        day("Day 1", "12 Oct", "done", "Furniture masked, old paint stripped.", ["/jobs/day1-strip.jpg"]),
        day("Day 2", "13 Oct", "done", "Second putty coat, sanding done.", ["/jobs/day2-putty.jpg"], { dur: "0:24" }),
        day("Day 3", "14 Oct", "cur", "First coat on the living room, bedrooms tomorrow.", ["/jobs/day3-firstcoat.jpg"]),
        day("Day 4", "15 Oct", "next", "", []),
        day("Day 5", "17 Oct", "next", "", []),
      ],
    },
    {
      id: "c2",
      crewId: "salim",
      name: "Salim Pathan",
      photo: "/crew/salim.jpg",
      rating: 4.8,
      jobsDone: 176,
      experience: "9 yr",
      scope: "Waterproofing — 2 bathrooms & terrace",
      day: 3,
      totalDays: 4,
      pct: 75,
      amount: 8900,
      payoutId: "PT-CREW-2482",
      bankLabel: "SBI ••••8830",
      days: [
        day("Day 1", "12 Oct", "done", "Terrace cleaned, primer applied.", ["/jobs/waterproofing.jpg"]),
        day("Day 2", "13 Oct", "done", "Crack filling and first membrane coat.", ["/jobs/waterproofing.jpg"]),
        day("Day 3", "14 Oct", "cur", "Sealing the bathroom walls.", []),
        day("Day 4", "15 Oct", "next", "", []),
      ],
    },
    {
      id: "c3",
      crewId: "irfan",
      name: "Irfan Shaikh",
      photo: "/crew/irfan.jpg",
      rating: 4.6,
      jobsDone: 98,
      experience: "5 yr",
      scope: "Wood & metal — 4 doors, 6 windows",
      day: 2,
      totalDays: 3,
      pct: 66,
      amount: 4600,
      payoutId: "PT-CREW-2483",
      bankLabel: "Axis ••••2214",
      days: [
        day("Day 1", "12 Oct", "done", "Old enamel scraped and sanded.", ["/jobs/woodwork.jpg"]),
        day("Day 2", "13 Oct", "cur", "Undercoat on two doors.", ["/jobs/woodwork.jpg"], { dur: "0:31" }),
        day("Day 3", "14 Oct", "next", "", []),
      ],
    },
    {
      id: "c4",
      crewId: "vikram",
      name: "Vikram Rathod",
      photo: "/crew/vikram.jpg",
      rating: 4.9,
      jobsDone: 64,
      experience: "6 yr",
      scope: "Accent wall — living room texture",
      day: 1,
      totalDays: 2,
      pct: 50,
      amount: 2387,
      payoutId: "PT-CREW-2484",
      bankLabel: "ICICI ••••6602",
      days: [
        day("Day 1", "12 Oct", "cur", "Texture base ready, pattern tomorrow.", ["/jobs/texture.jpg"]),
        day("Day 2", "13 Oct", "next", "", []),
      ],
    },
  ],
};

export const SEED_EXTENSION: ExtensionRequest = {
  id: "ext1",
  crewId: "salim",
  crewName: "Salim Pathan",
  extraDays: 1,
  note: "The terrace held moisture — one more day so the coat cures fully.",
  state: "open",
};

/* --------------------------------------------------------------- helpers */

/** en-IN grouping for demo amounts: 25287 -> "₹25,287". */
export function inr(n: number): string {
  return "₹" + n.toLocaleString("en-IN");
}

/**
 * Approving an extension grows ONLY that crew's schedule (4 -> 5 days);
 * the job's overall timeline is untouched.
 */
export function approveExtension(job: Job, crewId: string, extraDays: number): Job {
  return {
    ...job,
    crews: job.crews.map((c) =>
      c.crewId === crewId
        ? {
            ...c,
            totalDays: c.totalDays + extraDays,
            days: [
              ...c.days,
              ...Array.from({ length: extraDays }, (_, i) =>
                day(`Day ${c.totalDays + i + 1}`, "—", "next", "", []),
              ),
            ],
          }
        : c,
    ),
  };
}

export type JobStepState = "done" | "cur" | "next";

/** The five-step timeline; state derives from job status. */
export function jobTimeline(job: Job): { key: string; state: JobStepState }[] {
  return [
    { key: "t.req", state: "done" },
    { key: "t.assign", state: "done" },
    { key: "t.start", state: "done" },
    { key: "t.prog", state: job.status === "live" ? "cur" : "done" },
    { key: "t.hand", state: job.status === "live" ? "next" : "done" },
  ];
}