/* Phase 2 seed — fixture rows with FIXED ids so demo cutover (2.4–2.7) can
   reference stable uuids. Idempotent: safe to run twice (upserts).
   Run: npx prisma db seed   (or: npx tsx prisma/seed.ts) */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const UID = {
  customer: "11111111-1111-4111-8111-111111111101",
  partner: "11111111-1111-4111-8111-111111111102",
  shopkeeper: "11111111-1111-4111-8111-111111111103",
  admin: "11111111-1111-4111-8111-111111111104",
  partnerRow: "22222222-2222-4222-8222-222222222201",
  shop: "33333333-3333-4333-8333-333333333301",
  product1: "44444444-4444-4444-8444-444444444401",
  product2: "44444444-4444-4444-8444-444444444402",
  product3: "44444444-4444-4444-8444-444444444403",
  product4: "44444444-4444-4444-8444-444444444404",
  request: "55555555-5555-4555-8555-555555555501",
  job: "66666666-6666-4666-8666-666666666601",
  mile1: "77777777-7777-4777-8777-777777777701",
  mile2: "77777777-7777-4777-8777-777777777702",
  mile3: "77777777-7777-4777-8777-777777777703",
  order: "88888888-8888-4888-8888-888888888801",
  settle: "99999999-9999-4999-8999-999999999901",
  inc1: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa01",
  inc2: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa02",
};

async function main() {
  /* People */
  type SeedPerson = {
    id: string;
    phone: string;
    fullName: string;
    role: "customer" | "partner" | "shopkeeper" | "admin";
    kyc?: "unverified" | "pending" | "approved" | "rejected";
  };
  const people: SeedPerson[] = [
    { id: UID.customer, phone: "+919000000001", fullName: "Demo Customer", role: "customer" },
    { id: UID.partner, phone: "+919000000002", fullName: "Ramesh Yadav", role: "partner", kyc: "approved" },
    { id: UID.shopkeeper, phone: "+919000000003", fullName: "Dilip Bhai", role: "shopkeeper", kyc: "approved" },
    { id: UID.admin, phone: "+919000000004", fullName: "Paintoor Admin", role: "admin", kyc: "approved" },
  ];
  for (const p of people) {
    await db.profile.upsert({
      where: { id: p.id },
      update: {},
      create: { id: p.id, phone: p.phone, fullName: p.fullName, role: p.role, kycStatus: p.kyc ?? "unverified", city: "vadodara" },
    });
  }

  await db.partner.upsert({
    where: { id: UID.partnerRow },
    update: {},
    create: {
      id: UID.partnerRow,
      profileId: UID.partner,
      ratingAvg: 4.9,
      jobsDone: 212,
      experienceYears: 9,
      bio: "Full-home painting specialist, Alkapuri crew of 4.",
      skills: ["interior", "exterior", "waterproof"],
    },
  });

  await db.shop.upsert({
    where: { id: UID.shop },
    update: {},
    create: {
      id: UID.shop,
      ownerId: UID.shopkeeper,
      name: "Rang Paints & Hardware",
      address: "12, GIDC Road, Alkapuri",
      city: "vadodara",
      zone: "Alkapuri",
      gstin: "24ABCDE1234F1Z5",
      ratingAvg: 4.6,
      reviewCount: 318,
    },
  });

  for (const pr of [
    { id: UID.product1, brand: "Asian Paints", name: "Apex Ultima Protek 10L", category: "exterior", finish: "smooth", sizeL: 10, pricePaise: 418500, mrpPaise: 465000, stock: 14 },
    { id: UID.product2, brand: "Berger", name: "WeatherCoat Anti-Dust 10L", category: "exterior", finish: "matt", sizeL: 10, pricePaise: 389000, mrpPaise: 432000, stock: 9 },
    { id: UID.product3, brand: "Nerolac", name: "Impression Ultra HD 5L", category: "interior", finish: "silk", sizeL: 5, pricePaise: 315000, mrpPaise: 349000, stock: 21 },
    { id: UID.product4, brand: "Asian Paints", name: "Trucare Wall Putty 20kg", category: "primer", finish: "base", sizeL: 20, pricePaise: 88500, mrpPaise: 99000, stock: 40 },
  ]) {
    await db.product.upsert({
      where: { id: pr.id },
      update: {},
      create: { ...pr, shopId: UID.shop },
    });
  }

  /* One open request + one live job with the seeded escrow split */
  await db.serviceRequest.upsert({
    where: { id: UID.request },
    update: {},
    create: {
      id: UID.request,
      customerId: UID.customer,
      acceptedPartnerId: UID.partner,
      city: "vadodara",
      zone: "Alkapuri",
      category: "interior",
      description: "2 BHK full home painting, walls + ceilings.",
      budgetPaise: 2600000,
      materialNeeded: true,
      status: "accepted",
    },
  });

  await db.requestLead.upsert({
    where: { requestId_partnerId: { requestId: UID.request, partnerId: UID.partner } },
    update: {},
    create: { requestId: UID.request, partnerId: UID.partner, status: "accepted" },
  });

  await db.job.upsert({
    where: { id: UID.job },
    update: {},
    create: {
      id: UID.job,
      code: "PT-2481",
      requestId: UID.request,
      customerId: UID.customer,
      partnerId: UID.partner,
      addressLabel: "302, Shanti Residency, Alkapuri",
      city: "vadodara",
      totalPaise: 2528700,
      day: 3,
      totalDays: 5,
      pct: 58,
      startedAt: new Date("2026-10-12"),
      endsAt: new Date("2026-10-17"),
      status: "live",
    },
  });

  for (const m of [
    { id: UID.mile1, seq: 1, labelKey: "cd.esc.m1", pct: 30, amountPaise: 758600, state: "released" as const, releasedAt: new Date("2026-10-13") },
    { id: UID.mile2, seq: 2, labelKey: "cd.esc.m2", pct: 30, amountPaise: 758600, state: "held" as const, releasedAt: null },
    { id: UID.mile3, seq: 3, labelKey: "cd.esc.m3", pct: 40, amountPaise: 1011500, state: "pending" as const, releasedAt: null },
  ]) {
    await db.jobMilestone.upsert({
      where: { id: m.id },
      update: {},
      create: { ...m, jobId: UID.job },
    });
  }

  /* One delivered shop order + its settlement */
  await db.shopOrder.upsert({
    where: { id: UID.order },
    update: {},
    create: {
      id: UID.order,
      shopId: UID.shop,
      buyerId: UID.partner,
      jobId: UID.job,
      zone: "Alkapuri",
      totalPaise: 507000,
      status: "delivered",
      createdAt: new Date("2026-10-12T09:30:00Z"),
    },
  });
  await db.shopOrderItem.upsert({
    where: { orderId_productId: { orderId: UID.order, productId: UID.product3 } },
    update: {},
    create: { orderId: UID.order, productId: UID.product3, qty: 1 },
  });
  await db.shopOrderItem.upsert({
    where: { orderId_productId: { orderId: UID.order, productId: UID.product4 } },
    update: {},
    create: { orderId: UID.order, productId: UID.product4, qty: 1 },
  });
  await db.settlement.upsert({
    where: { id: UID.settle },
    update: {},
    create: { id: UID.settle, shopId: UID.shop, label: "Order 8801 · T+1 settlement", amountPaise: 507000, at: new Date("2026-10-14") },
  });

  /* Two incidents for the admin queue + the two demo banners */
  for (const i of [
    { id: UID.inc1, kind: "fraud" as const, subject: "Suresh K. (partner)", detail: "Three customers report advance taken, then unreachable for 9 days." },
    { id: UID.inc2, kind: "pricing" as const, subject: "WeatherCoat 10L (shop listing)", detail: "Listed 38% above the marketplace average for the same pack." },
  ]) {
    await db.incident.upsert({ where: { id: i.id }, update: {}, create: i });
  }
  for (const b of [
    { id: "announce", live: true },
    { id: "festival", live: false },
  ]) {
    await db.banner.upsert({ where: { id: b.id }, update: { live: b.live }, create: b });
  }

  console.log("🌱 Paintoor seed complete: 4 profiles, 1 partner, 1 shop, 4 products, 1 request, 1 job + 3 milestones, 1 order, 1 settlement, 2 incidents, 2 banners.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());